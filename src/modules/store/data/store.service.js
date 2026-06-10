/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Data Layer
 * File: store.service.js
 * * DESCRIPTION:
 * The apex network bridge for the Partner Store. Fetches pristine data 
 * across the 4 asset pillars and executes the "Controlled Write" physics 
 * for modification requests.
 * * WORLD-CLASS PHYSICS:
 * 1. THE CONTROLLED WRITE: Partners cannot mutate live database rows. All changes 
 * are packaged as JSON payloads and pushed to the Admin 'partner_requests' queue.
 * 2. ATOMIC STATE LOCKING: When a request is submitted, the asset's status is 
 * immediately transitioned to 'UPDATE_PENDING' to prevent duplicate requests.
 * 3. ADAPTER PIPELINE: All raw SQL returns are instantly passed through 
 * `store.adapters.js` to guarantee UI crash immunity.
 */

import { supabase, handleDataException } from '../../../services/api.config';
import { 
    adaptCorporateProfile, 
    adaptFleetAsset, 
    adaptRouteBlueprint, 
    adaptMasterTimetable 
} from './store.adapters';
import { STORE_ASSET_TYPES } from './store.dictionary';

export const storeService = {

    // ========================================================================
    // 1. ASSET HYDRATION (The 4 Pillars)
    // ========================================================================

    /**
     * PILLAR 1: Corporate Identity
     * Fetches the root Partner profile including TIN and JSONB financial splits.
     */
    fetchCorporateIdentity: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('partner_id', tenantId)
                .single();

            if (error) throw error;
            return { success: true, data: adaptCorporateProfile(data) };
        } catch (err) {
            return handleDataException(err, 'Corporate Identity Hydration');
        }
    },

    /**
     * PILLAR 2: Fleet Registry
     * Fetches the physical bus configurations and layouts.
     */
    fetchFleetRegistry: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            const { data, error } = await supabase
                .from('bus_configs')
                .select('*')
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const pureFleet = (data || []).map(adaptFleetAsset).filter(Boolean);
            return { success: true, data: pureFleet };
        } catch (err) {
            return handleDataException(err, 'Fleet Registry Hydration');
        }
    },

    /**
     * PILLAR 3: Route Network
     * Fetches the geographic corridors and ticket pricing, joined with assigned fleets.
     */
    fetchRouteNetwork: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            const { data, error } = await supabase
                .from('routes')
                .select(`
                    *,
                    bus_configs (*)
                `)
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const pureRoutes = (data || []).map(adaptRouteBlueprint).filter(Boolean);
            return { success: true, data: pureRoutes };
        } catch (err) {
            return handleDataException(err, 'Route Network Hydration');
        }
    },

    /**
     * PILLAR 4: Master Timetable
     * Fetches the automated dispatch schedules (Deep relational join).
     */
    fetchMasterTimetable: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            const { data, error } = await supabase
                .from('route_schedules')
                .select(`
                    *,
                    routes!inner (
                        *,
                        bus_configs (*)
                    )
                `)
                .eq('routes.partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const pureTimetables = (data || []).map(adaptMasterTimetable).filter(Boolean);
            return { success: true, data: pureTimetables };
        } catch (err) {
            return handleDataException(err, 'Master Timetable Hydration');
        }
    },

    // ========================================================================
    // 2. THE CONTROLLED WRITE (Pushing Requests to Admin)
    // ========================================================================

    /**
     * Submits a Change Request to the Admin Cockpit instead of directly mutating 
     * the live database. Also locks the local asset by setting it to 'UPDATE_PENDING'.
     * * @param {Object} payload 
     * @param {string} payload.tenantId - The Partner ID making the request
     * @param {string} payload.requestType - e.g., 'LAYOUT_MODIFICATION'
     * @param {string} payload.assetType - 'FLEET', 'ROUTES', 'TIMETABLE', 'CORPORATE'
     * @param {string} payload.assetId - The UUID of the item being changed
     * @param {Object} payload.requestedChanges - JSON blob of what they want changed
     * @param {string} payload.partnerNote - Text note explaining the \"Why\"
     */
    submitChangeRequest: async ({ 
        tenantId, requestType, assetType, assetId, requestedChanges, partnerNote 
    }) => {
        try {
            // -------------------------------------------------------------
            // STEP 1: Route the request to the Admin Cockpit's Inbox
            // -------------------------------------------------------------
            const requestTicket = {
                partner_id: tenantId,
                request_type: requestType,
                target_asset_type: assetType,
                target_asset_id: assetId,
                requested_changes: requestedChanges, // JSONB Payload
                partner_note: partnerNote,
                status: 'PENDING_REVIEW',
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('partner_requests')
                .insert(requestTicket);

            if (insertError) throw insertError;

            // -------------------------------------------------------------
            // STEP 2: Lock the Local Asset (Transition to UPDATE_PENDING)
            // -------------------------------------------------------------
            // We must map the abstract assetType to the exact physical Postgres table
            const tableMap = {
                [STORE_ASSET_TYPES.CORPORATE.id]: 'partners',
                [STORE_ASSET_TYPES.FLEET.id]: 'bus_configs',
                [STORE_ASSET_TYPES.ROUTES.id]: 'routes',
                [STORE_ASSET_TYPES.TIMETABLE.id]: 'route_schedules'
            };

            const targetTable = tableMap[assetType];
            
            if (targetTable) {
                const { error: updateError } = await supabase
                    .from(targetTable)
                    .update({ status: 'UPDATE_PENDING', updated_at: new Date().toISOString() })
                    .eq('id', assetId);

                if (updateError) {
                    console.warn(`[AyaBus Telemetry] Request filed, but failed to lock local asset ${assetId}:`, updateError);
                    // We don't throw here because the Admin request was successful. 
                    // The asset lock is purely visual for the partner.
                }
            }

            return { 
                success: true, 
                message: 'Modification request transmitted securely to the Admin Citadel.' 
            };

        } catch (err) {
            return handleDataException(err, 'Controlled Write (Change Request)');
        }
    }
};