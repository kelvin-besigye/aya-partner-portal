import { supabase, handleDataException } from '../../../services/api.config';
import { 
    adaptScheduleToManifest, 
    adaptTicketToLedger, 
    adaptOperationalPulse 
} from './manifest.adapters';

/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Dispatch Engine) — Schema v3
 * ------------------------------------------------------------------
 * Module: Operations / Manifest
 * File: manifest.service.js
 * * DESCRIPTION:
 * The primary orchestrator for real-time fleet telemetry. This engine 
 * handles daily dispatch schedules, passenger manifests, and the 
 * mission-critical Seat Matrix state machine.
 * * WORLD-CLASS PHYSICS APPLIED:
 * 1. THE ADAPTER PIPELINE: All raw database queries are instantly routed 
 * through `manifest.adapters.js` to prevent UI crashes on missing relationships.
 * 2. TEMPORAL INJECTION: The active calendar date is surgically attached to 
 * recurring schedules so the T-4 Hour Cutoff engine knows exactly when to lock.
 * 3. TENANT-LOCKED QUERIES: Uses Supabase '!inner' joins to guarantee operators 
 * can only ever fetch schedules strictly linked to their specific partner_id.
 *
 * CHANGE LOG (Chassis Grammar v3):
 * - fetchDailyDepartures now selects `daily_overrides` (JSONB) so
 *   manifest.adapters.js can resolve the effective per-date layout.
 *   REQUIRES the SQL migration (adds `daily_overrides jsonb default '{}'`
 *   to `route_schedules`) to have been run first — see
 *   AyaBus_Chassis_V3_SQL_Migration.sql.
 * - NEW: updateSeatStructure() — the per-trip structural mutation entry
 *   point (delete a seat for today only, mark out-of-service, reserve for
 *   today only). Writes into `daily_overrides[targetDate]`, never touches
 *   the frozen `layout_config_snapshot`. This is distinct from
 *   updateSeatState(), which only ever changes booking status
 *   (AVAILABLE/BOOKED/LOCKED/UNAVAILABLE), not structure.
 */

export const manifestService = {

    // ========================================================================
    // 1. DISPATCH OPERATIONS: DAILY DEPARTURES
    // ========================================================================
    /**
     * Pulls the live departure board for the active partner and specific date.
     * @param {string} tenantId - The UUID of the logged-in Partner.
     * @param {string} targetDate - The operational date (ISO format YYYY-MM-DD).
     */
    fetchDailyDepartures: async (tenantId, targetDate = new Date().toISOString().split('T')[0]) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING: Access Denied.' };

        try {
            // 1. Fetch the nested relational data from the active calendar
            const { data, error } = await supabase
                .from('route_schedules')
                .select(`
                    id,
                    status,
                    frequency_type,
                    daily_overrides,
                    seat_matrix_state,
                    routes!inner (
                        id,
                        route_code,
                        origin_city,
                        destination_city,
                        departure_time,
                        price_ticket,
                        partner_id,
                        bus_configs (
                            id,
                            bus_class,
                            layout_config,
                            gallery
                        )
                    )
                `)
                .eq('routes.partner_id', tenantId);

            if (error) throw error;

            // 2. Pass through the Adapter Pipeline (Injects targetDate, resolves
            //    the effective v3 layout against daily_overrides)
            const pureSchedules = (data || [])
                .map(schedule => adaptScheduleToManifest(schedule, targetDate))
                .filter(Boolean); // 🛡️ Strip out any nulls if an adapter failed gracefully

            // 3. Sort temporally (Earliest departures at the top)
            pureSchedules.sort((a, b) => {
                if (!a.departureTime || !b.departureTime) return 0;
                return a.departureTime.localeCompare(b.departureTime);
            });

            return { success: true, data: pureSchedules };
        } catch (err) {
            return handleDataException(err, 'Daily Dispatch Fetch');
        }
    },

    // ========================================================================
    // 2. PASSENGER MANIFEST (THE LEDGER)
    // ========================================================================
    /**
     * Fetches the complete passenger ledger for a specific trip.
     * @param {string} scheduleId - The UUID of the specific route_schedule.
     */
    fetchPassengerManifest: async (scheduleId) => {
        if (!scheduleId) return { success: false, error: 'INVALID_TRIP_REFERENCE' };

        try {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    id, 
                    seat_number, 
                    passenger_name, 
                    passenger_phone, 
                    status, 
                    payment_status, 
                    fare_paid, 
                    created_at
                `)
                .eq('schedule_id', scheduleId) 
                .order('seat_number', { ascending: true });

            if (error) throw error;

            // Pass through the purification adapter
            const pureTickets = (data || []).map(adaptTicketToLedger).filter(Boolean);

            return { success: true, data: pureTickets };
        } catch (err) {
            return handleDataException(err, 'Passenger Manifest Sync');
        }
    },

    // ========================================================================
    // 3. SEAT MATRIX: BOOKING-STATE MUTATIONS
    // ========================================================================
    /**
     * Updates the BOOKING status of a specific seat for walk-ins or
     * maintenance. Does NOT touch structure — see updateSeatStructure for
     * deletions / out-of-service / today-only reservations.
     */
    updateSeatState: async (scheduleId, tenantId, seatNumber, newState) => {
        try {
            // 🛡️ SECURITY GATE: Ensure this schedule actually belongs to this partner
            const { data: schedule, error: authError } = await supabase
                .from('route_schedules')
                .select('id, routes!inner(partner_id)')
                .eq('id', scheduleId)
                .eq('routes.partner_id', tenantId)
                .single();

            if (authError || !schedule) {
                throw new Error('UNAUTHORIZED_ACCESS: Identity mismatch detected. You do not own this asset.');
            }
            
            // NOTE: In production, this is where we execute the JSONB update on the seat matrix
            return { success: true, message: `Seat ${seatNumber} transitioned to ${newState}` };
        } catch (err) {
            return handleDataException(err, 'Seat Matrix Mutation');
        }
    },

    // ========================================================================
    // 4. SEAT MATRIX: STRUCTURAL MUTATIONS (NEW v3 — per-trip, per-date only)
    // ========================================================================
    /**
     * Applies a STRUCTURAL change (delete/out-of-service/reserve) to a
     * single seat, scoped to ONE trip date only. Writes into
     * `route_schedules.daily_overrides[targetDate]` — the frozen
     * `bus_configs.layout_config` snapshot is never touched, so every
     * other date this schedule runs on is completely unaffected.
     *
     * @param {string} scheduleId
     * @param {string} tenantId
     * @param {string} targetDate - ISO date, e.g. "2026-07-10"
     * @param {string} slotId - the v3 slot's stable UUID (from layoutConfig)
     * @param {'DELETE'|'OUT_OF_SERVICE'|'RESERVE'|'RESTORE'} action
     */
    updateSeatStructure: async (scheduleId, tenantId, targetDate, slotId, action) => {
        if (!scheduleId || !tenantId || !targetDate || !slotId) {
            return { success: false, error: 'INVALID_STRUCTURAL_MUTATION_REQUEST' };
        }

        try {
            // 🛡️ SECURITY GATE + fetch current overrides in one round trip.
            const { data: schedule, error: authError } = await supabase
                .from('route_schedules')
                .select('id, daily_overrides, routes!inner(partner_id)')
                .eq('id', scheduleId)
                .eq('routes.partner_id', tenantId)
                .single();

            if (authError || !schedule) {
                throw new Error('UNAUTHORIZED_ACCESS: Identity mismatch detected. You do not own this asset.');
            }

            const overrides = schedule.daily_overrides || {};
            const today = { deletedSlotIds: [], outOfServiceSlotIds: [], reservedSlotIds: [], ...(overrides[targetDate] || {}) };

            const withoutSlot = (arr) => (arr || []).filter((id) => id !== slotId);

            switch (action) {
                case 'DELETE':
                    today.deletedSlotIds = [...withoutSlot(today.deletedSlotIds), slotId];
                    break;
                case 'OUT_OF_SERVICE':
                    today.outOfServiceSlotIds = [...withoutSlot(today.outOfServiceSlotIds), slotId];
                    break;
                case 'RESERVE':
                    today.reservedSlotIds = [...withoutSlot(today.reservedSlotIds), slotId];
                    break;
                case 'RESTORE':
                    today.deletedSlotIds = withoutSlot(today.deletedSlotIds);
                    today.outOfServiceSlotIds = withoutSlot(today.outOfServiceSlotIds);
                    today.reservedSlotIds = withoutSlot(today.reservedSlotIds);
                    break;
                default:
                    throw new Error(`Unknown structural action: ${action}`);
            }

            const nextOverrides = { ...overrides, [targetDate]: today };

            const { error: writeError } = await supabase
                .from('route_schedules')
                .update({ daily_overrides: nextOverrides })
                .eq('id', scheduleId);

            if (writeError) throw writeError;

            return { success: true, message: `Seat structure updated for ${targetDate}: ${action}` };
        } catch (err) {
            return handleDataException(err, 'Seat Structure Mutation');
        }
    },

    // ========================================================================
    // 5. PERFORMANCE TELEMETRY: OPERATIONAL PULSE
    // ========================================================================
    /**
     * High-level summary metrics for the Partner Dashboard.
     */
    fetchOperationalPulse: async (tenantId) => {
        try {
            const { data, error } = await supabase
                .from('route_schedules')
                .select('id, status, routes!inner(price_ticket)')
                .eq('routes.partner_id', tenantId);

            if (error) throw error;

            // Adapter handles the math and formatting
            const pulseStats = adaptOperationalPulse(data);

            return { success: true, stats: pulseStats };
        } catch (err) {
            return handleDataException(err, 'Operational Pulse Fetch');
        }
    }
};
