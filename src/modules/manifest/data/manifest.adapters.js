import { resolveEffectiveLayout, migrateV2ToV3 } from '../engines/seat.engine';

/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Translator) — Schema v3
 * ------------------------------------------------------------------
 * File: manifest.adapters.js
 *
 * CHANGE (Chassis Grammar v3):
 * - layoutConfig is no longer the raw layout_config_snapshot. It is now
 *   the fully RESOLVED effective layout for this specific schedule/date —
 *   snapshot merged with today's daily_overrides via
 *   resolveEffectiveLayout(). SeatMatrix.jsx consumes this directly and
 *   never calls resolveEffectiveLayout itself (see Phase 1.5 shape-diff
 *   checklist).
 * - Legacy v2 snapshots (schema_version !== 3) are transparently migrated
 *   via migrateV2ToV3 before resolution, so old bus_configs never crash
 *   SeatMatrix even if a Partner never re-saved them under v3.
 * - layoutConfig fallback changed from '2x2' (string, v2-era bug) to a
 *   safe empty resolved layout — { rows: [] } — so SeatMatrix always
 *   receives an array to map over, never undefined.
 */

// ========================================================================
// 1. SCHEDULE ADAPTER (Database → Departure Board UI)
// ========================================================================
export const adaptScheduleToManifest = (dbSchedule, targetDate) => {
    if (!dbSchedule) return null;

    try {
        const route  = dbSchedule.routes      || {};
        const config = route.bus_configs || {};

        // --- CHASSIS RESOLUTION PIPELINE ---
        const rawSnapshot = config.layout_config || {};
        const v3Snapshot = (rawSnapshot.schema_version === 3 && Array.isArray(rawSnapshot.rows))
            ? rawSnapshot
            : migrateV2ToV3(rawSnapshot);

        const dailyOverrides = dbSchedule.daily_overrides || {};
        const resolvedLayout = resolveEffectiveLayout(v3Snapshot, dailyOverrides, targetDate);

        return {
            // --- CORE IDENTITY ---
            id:          dbSchedule.id,
            baseRouteId: route.id    || null,
            routeCode:   route.route_code || 'TBA',
            route_code:  route.route_code || 'TBA',

            // --- TEMPORAL PHYSICS ---
            departureDate:  targetDate,
            departure_date: targetDate,
            departureTime:  route.departure_time || '00:00:00',
            departure_time: route.departure_time || '00:00:00',

            // --- GEOGRAPHY ---
            originCity:       route.origin_city       || 'Unknown',
            destinationCity:  route.destination_city  || 'Unknown',
            origin_city:      route.origin_city       || 'Unknown',
            destination_city: route.destination_city  || 'Unknown',

            // --- FINANCIAL LEDGER ---
            ticketPrice:  Number(route.price_ticket) || 0,
            price_ticket: Number(route.price_ticket) || 0,

            // --- SCHEDULE STATE ---
            status:        dbSchedule.status         || 'PENDING',
            frequencyType: dbSchedule.frequency_type || 'UNKNOWN',
            frequency_type: dbSchedule.frequency_type || 'UNKNOWN',

            // --- FLEET ASSETS ---
            busClass: config.bus_class || 'Standard',

            // FIX (v3): layoutConfig is now the fully RESOLVED effective
            // layout for targetDate — snapshot + daily_overrides merged.
            // SeatMatrix.jsx renders this directly; it never resolves
            // anything itself. Falls back to an empty-but-valid shape so
            // SeatMatrix's `.rows.map()` never throws on a broken record.
            layoutConfig: resolvedLayout || { schema_version: 3, rows: [], entries: [], outOfServiceSlotIds: [] },

            seatMatrixState: dbSchedule.seat_matrix_state || {},
            seat_matrix_state: dbSchedule.seat_matrix_state || {},

            bus_configs: config, // raw fallback for deep UI inspections
        };
    } catch (error) {
        console.error('🚨 [Manifest Adapter] Hydration failed for schedule:', error);
        return null;
    }
};

// ========================================================================
// 2. PASSENGER TICKET ADAPTER (Database → Passenger Ledger UI)
// ========================================================================
export const adaptTicketToLedger = (dbTicket) => {
    if (!dbTicket) return null;

    try {
        return {
            id:         dbTicket.id,
            seatNumber: dbTicket.seat_number,
            seat_number: dbTicket.seat_number,

            passengerName:  dbTicket.passenger_name  || 'Anonymous',
            passenger_name: dbTicket.passenger_name  || 'Anonymous',

            passengerPhone:  dbTicket.passenger_phone || 'N/A',
            passenger_phone: dbTicket.passenger_phone || 'N/A',

            status:        dbTicket.status         || 'AVAILABLE',
            paymentStatus: dbTicket.payment_status || 'UNPAID',
            payment_status: dbTicket.payment_status || 'UNPAID',

            farePaid:  Number(dbTicket.fare_paid) || 0,
            fare_paid: Number(dbTicket.fare_paid) || 0,

            createdAt:  dbTicket.created_at,
            created_at: dbTicket.created_at,
        };
    } catch (error) {
        console.error('🚨 [Ticket Adapter] Parse failure:', error);
        return null;
    }
};

// ========================================================================
// 3. OPERATIONAL PULSE ADAPTER (Dashboard Analytics)
// ========================================================================
export const adaptOperationalPulse = (dbSchedules) => {
    if (!Array.isArray(dbSchedules)) {
        return { activeTrips: 0, pendingApprovals: 0, fleetActive: false };
    }

    const activeTrips      = dbSchedules.filter(s => s.status === 'ACTIVE').length;
    const pendingApprovals = dbSchedules.filter(s => s.status === 'PENDING_APPROVAL').length;

    return {
        activeTrips,
        pendingApprovals,
        fleetActive: activeTrips > 0,
    };
};
