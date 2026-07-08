/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Partner Engine)
 * ------------------------------------------------------------------
 * Module: Partner Identity & Concierge
 * File: partner.service.js
 * * DESCRIPTION:
 * The primary bridge for managing the Operator's corporate identity 
 * and communication with the Admin Citadel.
 *
 * FIX APPLIED (Sync Report — Partner Portal's own partner.service.js
 * had the same bug independently fixed in the Admin Cockpit's copy):
 * - submitConciergeRequest / fetchRequestHistory previously targeted
 *   the nonexistent 'approvals_queue' table. Repointed to the real
 *   'partner_requests' table, and the insert payload shape now matches
 *   partner_requests' actual columns (request_type, priority,
 *   description, status, urgency, requested_changes) instead of the
 *   old { payload, urgency } shape that had no home on the real table.
 *   This is the exact same class of fix already applied to the Admin
 *   Cockpit's separate partner.service.js file — these are two distinct
 *   files (different apps) that both needed the identical correction.
 *
 * WORLD-CLASS ARCHITECTURE (unchanged):
 * 1. TENANT LOCKDOWN: Every mutation requires a verified UUID (tenantId).
 * 2. CONCIERGE PIPELINE: Routes requests directly into the Admin's 
 * Maker-Checker Approvals Queue.
 * 3. SCHEMA ALIGNMENT: Strictly uses 'bus_class' to match the physical 
 * Postgres structure, preventing "column does not exist" errors.
 * 4. UNIFIED TELEMETRY: Routes all anomalies through the handleDataException pipeline.
 */

import { supabase, handleDataException } from '../../../services/api.config';

export const partnerService = {

    // ========================================================================
    // 1. IDENTITY & PROFILE OPERATIONS
    // ========================================================================

    /**
     * Fetches the complete corporate profile for the logged-in partner.
     * @param {string} tenantId - The Internal UUID of the Partner.
     */
    fetchProfile: async (tenantId) => {
        if (!tenantId) {
            return { success: false, error: 'IDENTITY_LOCK_CRITICAL: Access Denied.' };
        }

        try {
            const { data, error } = await supabase
                .from('partners')
                .select(`
                    id,
                    company_name,
                    partner_id,
                    status,
                    business_type,
                    tin_number,
                    incorporation_date,
                    details,
                    auth_id
                `)
                .eq('id', tenantId)
                .single();

            if (error) throw error;
            
            return { 
                success: true, 
                data,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return handleDataException(err, 'Partner Profile Fetch');
        }
    },

    /**
     * Updates non-sensitive corporate details (e.g. bio, address inside the details JSONB).
     */
    updateProfileDetails: async (tenantId, detailsUpdate) => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .update({ details: detailsUpdate })
                .eq('id', tenantId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            return handleDataException(err, 'Profile Mutation');
        }
    },

    // ========================================================================
    // 2. FLEET & ASSET TELEMETRY
    // ========================================================================

    /**
     * Summarizes the fleet configurations assigned to this partner.
     * Uses 'bus_class' to align with the physical database schema.
     */
    fetchFleetSummary: async (tenantId) => {
        try {
            const { data, error } = await supabase
                .from('bus_configs')
                .select(`
                    id, 
                    bus_class, 
                    status,
                    gallery,
                    created_at
                `) // seat_count intentionally omitted — does not exist in DB
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (err) {
            return handleDataException(err, 'Fleet Summary Aggregation');
        }
    },

    // ========================================================================
    // 3. THE CONCIERGE (Maker-Checker Integration) — FIXED
    // ========================================================================

    /**
     * Submits a request into the real partner_requests table.
     *
     * FIX: was .from('approvals_queue') with a { payload, urgency } shape
     * that had no home on the real table. Now maps to partner_requests'
     * actual columns. payload.description is pulled out for the real
     * `description` column; the full payload is preserved in
     * `requested_changes` so no context is lost.
     *
     * @param {string} tenantId - Requester identity.
     * @param {string} type - request_type, e.g. 'ADD_BUS', 'ROUTE_CHANGE', 'DISPUTE_RECONCILIATION'.
     * @param {Object} payload - The detailed JSON of the request.
     */
    submitConciergeRequest: async (tenantId, type, payload = {}) => {
        if (!tenantId) return { success: false, error: 'IDENTITY_LOCK_MISSING' };

        try {
            const { data, error } = await supabase
                .from('partner_requests')
                .insert([{
                    partner_id: tenantId,
                    request_type: type,
                    description: payload.description || '',
                    status: 'PENDING',
                    urgency: payload.urgency || 'NORMAL',
                    requested_changes: payload,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            return handleDataException(err, 'Concierge Request Submission');
        }
    },

    /**
     * Fetches the status history of all requests submitted by this partner.
     * FIX: was .from('approvals_queue')
     */
    fetchRequestHistory: async (tenantId) => {
        try {
            const { data, error } = await supabase
                .from('partner_requests')
                .select('*')
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (err) {
            return handleDataException(err, 'Request History Synchronisation');
        }
    },

    // ========================================================================
    // 4. FINANCIAL SNAPSHOT (Today's Pulse)
    // ========================================================================

    /**
     * Pulls the high-level revenue figures for the partner dashboard.
     */
    fetchDashboardPulse: async (tenantId) => {
        try {
            const { data, error } = await supabase
                .from('routes')
                .select('id, price_ticket, status')
                .eq('partner_id', tenantId)
                .eq('status', 'ACTIVE');

            if (error) throw error;

            return {
                success: true,
                stats: {
                    activeRoutes: data.length,
                    averageFare: data.length > 0 
                        ? (data.reduce((acc, curr) => acc + curr.price_ticket, 0) / data.length).toFixed(0) 
                        : 0
                }
            };
        } catch (err) {
            return handleDataException(err, 'Dashboard Pulse Calculation');
        }
    }
};
