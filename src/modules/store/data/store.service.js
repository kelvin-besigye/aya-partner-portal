/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Data Layer
 * File: store.service.js
 *
 * FIXES APPLIED:
 * 1. fetchCorporateIdentity: Changed .eq('partner_id', tenantId) to .eq('id', tenantId)
 *    because tenantId from AuthContext is the UUID primary key, not the text code.
 * 2. fetchCorporateIdentity: Now joins partner_parks, partner_financials, partner_contacts
 *    so the Corporate Identity tab actually shows parks, financials and contacts.
 * 3. fetchFleetRegistry: Already correct (partner_id FK is UUID) — no change needed.
 * 4. fetchMasterTimetable: Fixed the filter — Supabase does not support
 *    .eq('routes.partner_id') on joined tables. Now fetches by route IDs instead.
 * 5. submitChangeRequest: Changed status from 'PENDING_REVIEW' to 'PENDING'
 *    to match the actual DB column default.
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
     * Fetches the root Partner profile including TIN, parks, financials and contacts.
     *
     * FIX: Query uses .eq('id', tenantId) — tenantId is the UUID primary key.
     * The 'partner_id' column is a human-readable text code (e.g. "ENTX"), not the UUID.
     * Also now joins the three child tables so they hydrate correctly in the UI.
     */
    fetchCorporateIdentity: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            const { data, error } = await supabase
                .from('partners')
                .select(`
                    *,
                    partner_parks (*),
                    partner_financials (*),
                    partner_contacts (*)
                `)
                .eq('id', tenantId)  // FIX: was .eq('partner_id', tenantId)
                .single();

            if (error) throw error;
            return { success: true, data: adaptCorporateProfile(data) };
        } catch (err) {
            return handleDataException(err, 'Corporate Identity Hydration');
        }
    },

    /**
     * PILLAR 2: Fleet Registry
     * Fetches bus configurations for this partner.
     * Correct as-is — partner_id on bus_configs is the UUID FK to partners.id
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
     * Fetches routes with their assigned bus config joined in.
     * Correct as-is — partner_id on routes is the UUID FK to partners.id
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
     * Fetches automated dispatch schedules with deep relational join.
     *
     * FIX: Supabase does not support .eq('routes.partner_id', tenantId) on joined tables.
     * Instead we first fetch the partner's route IDs, then filter schedules by those IDs.
     * This is a two-step approach but is reliable and crash-proof.
     */
    fetchMasterTimetable: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };
        try {
            // STEP 1: Get this partner's route IDs
            const { data: routeData, error: routeError } = await supabase
                .from('routes')
                .select('id')
                .eq('partner_id', tenantId);

            if (routeError) throw routeError;

            // If partner has no routes yet, return empty gracefully
            if (!routeData || routeData.length === 0) {
                return { success: true, data: [] };
            }

            const routeIds = routeData.map(r => r.id);

            // STEP 2: Fetch schedules for those routes with full join
            const { data, error } = await supabase
                .from('route_schedules')
                .select(`
                    *,
                    routes (
                        *,
                        bus_configs (*)
                    )
                `)
                .in('route_id', routeIds)
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
     * Submits a Change Request to the Admin Cockpit's partner_requests queue.
     * Also locks the local asset by transitioning it to 'UPDATE_PENDING'.
     *
     * FIX: status changed from 'PENDING_REVIEW' to 'PENDING' to match DB column default.
     */
    submitChangeRequest: async ({
        tenantId, requestType, assetType, assetId, requestedChanges, partnerNote
    }) => {
        try {
            // STEP 1: Insert into the Admin's request queue
            const requestTicket = {
                partner_id: tenantId,
                request_type: requestType,
                target_asset_type: assetType,
                target_asset_id: assetId,
                requested_changes: requestedChanges,
                partner_note: partnerNote,
                status: 'PENDING',  // FIX: was 'PENDING_REVIEW', DB expects 'PENDING'
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('partner_requests')
                .insert(requestTicket);

            if (insertError) throw insertError;

            // STEP 2: Lock the asset locally (visual feedback for the partner)
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
                    // Don't throw — the request was filed successfully.
                    // The lock is purely visual.
                    console.warn(`[AyaBus Telemetry] Request filed, but failed to lock asset ${assetId}:`, updateError);
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
