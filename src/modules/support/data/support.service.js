/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: support.service.js
 *
 * FIXES APPLIED:
 * 1. fetchActiveTickets: Now separates ACTIVE tickets (PENDING, PROCESSING)
 *    from RESOLVED/REJECTED history. Returns both so the UI can show
 *    "Open Requests" and "Past Requests" separately without two DB calls.
 * 2. fetchActiveTickets: Now explicitly maps admin_response so partners
 *    can see Admin feedback on their resolved/rejected requests.
 * 3. calculateSupportMetrics: No changes needed — already correctly
 *    counts PENDING, PROCESSING, RESOLVED, REJECTED.
 */

import { supabase, handleDataException } from '../../../services/api.config';

export const supportService = {

    // ========================================================================
    // 1. MUTATION ENGINE (Submitting Requests)
    // ========================================================================

    /**
     * Transmits a new request from the Partner to the Admin Cockpit.
     * Handles optional document uploads atomically.
     *
     * @param {string} tenantId - The authenticated Partner UUID (tenant.id)
     * @param {Object} payload - { requestType, priority, description }
     * @param {File|null} attachedFile - Optional physical file (PDF/JPG)
     */
    submitRequest: async (tenantId, payload, attachedFile = null) => {
        if (!tenantId) return { success: false, error: 'SECURITY_FAULT: Missing Tenant Identity.' };
        if (!payload.requestType || !payload.description) {
            return { success: false, error: 'VALIDATION_FAULT: Incomplete request payload.' };
        }

        try {
            let documentUrl = null;

            // STEP A: Upload file if provided
            if (attachedFile) {
                const fileExt = attachedFile.name.split('.').pop();
                const safeFileName = `${Date.now()}_${tenantId.substring(0, 8)}.${fileExt}`;
                const filePath = `support_docs/${safeFileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('partner_documents')
                    .upload(filePath, attachedFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw new Error(`Document Upload Failed: ${uploadError.message}`);

                const { data: urlData } = supabase.storage
                    .from('partner_documents')
                    .getPublicUrl(filePath);

                documentUrl = urlData.publicUrl;
            }

            // STEP B: Insert the request record
            const { data, error } = await supabase
                .from('partner_requests')
                .insert({
                    partner_id: tenantId,
                    request_type: payload.requestType,
                    priority: payload.priority || 'NORMAL',
                    description: payload.description,
                    document_url: documentUrl,
                    status: 'PENDING'
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };

        } catch (err) {
            return handleDataException(err, 'Support Hub Transmission');
        }
    },

    // ========================================================================
    // 2. RETRIEVAL ENGINE
    // ========================================================================

    /**
     * Fetches ALL support requests for this partner split into two buckets:
     * - active: PENDING and PROCESSING tickets (open requests)
     * - history: RESOLVED and REJECTED tickets (past requests with Admin feedback)
     *
     * FIX: Previously fetched everything with no filter, causing resolved tickets
     * to pile up in the active view forever.
     * FIX: Now explicitly maps admin_response so partners can read Admin feedback.
     *
     * @param {string} tenantId - The authenticated Partner UUID (tenant.id)
     * @returns {Promise<Object>} { success: true, data: { active: [], history: [] } }
     */
    fetchActiveTickets: async (tenantId) => {
        if (!tenantId) return { success: false, error: 'SECURITY_FAULT: Missing Tenant Identity.' };

        try {
            const { data, error } = await supabase
                .from('partner_requests')
                .select(`
                    id,
                    request_type,
                    priority,
                    urgency,
                    status,
                    description,
                    partner_note,
                    target_asset_type,
                    document_url,
                    admin_response,
                    created_at,
                    updated_at
                `)
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const allTickets = data || [];

            // Split into active and history buckets
            const active = allTickets.filter(t =>
                t.status === 'PENDING' || t.status === 'PROCESSING'
            );

            const history = allTickets.filter(t =>
                t.status === 'RESOLVED' || t.status === 'REJECTED'
            );

            // Map each ticket to a clean UI-ready object
            const mapTicket = (ticket) => ({
                id: ticket.id,
                requestType: ticket.request_type,
                priority: ticket.priority || 'NORMAL',
                urgency: ticket.urgency || 'NORMAL',
                status: ticket.status,
                // Show description or partner_note — whichever has content
                description: ticket.description || ticket.partner_note || 'No description provided.',
                targetAssetType: ticket.target_asset_type,
                documentUrl: ticket.document_url,
                // Admin feedback — only populated after resolution
                adminResponse: ticket.admin_response || null,
                hasAdminResponse: !!ticket.admin_response,
                createdAt: ticket.created_at,
                updatedAt: ticket.updated_at
            });

            return {
                success: true,
                data: allTickets.map(mapTicket), // Full list for metrics calculation
                active: active.map(mapTicket),   // Open requests only
                history: history.map(mapTicket)  // Resolved/Rejected with Admin feedback
            };

        } catch (err) {
            return handleDataException(err, 'Support Ticket Retrieval');
        }
    },

    // ========================================================================
    // 3. TELEMETRY AGGREGATION (For the Support Ribbon)
    // ========================================================================

    /**
     * Calculates high-level metrics for the SupportRibbon component.
     * Pass the full `data` array from fetchActiveTickets.
     *
     * @param {Array} rawTickets - Full ticket array from fetchActiveTickets
     * @returns {Object} { total, pending, processing, resolved, requiresAction }
     */
    calculateSupportMetrics: (rawTickets = []) => {
        const total = rawTickets.length;
        let pending = 0;
        let processing = 0;
        let resolved = 0;
        let requiresAction = 0;

        rawTickets.forEach(ticket => {
            const status = (ticket.status || ticket.status)?.toUpperCase();
            if (status === 'PENDING') pending++;
            else if (status === 'PROCESSING') processing++;
            else if (status === 'RESOLVED' || status === 'REJECTED') resolved++;

            // Flag critical open tickets that need immediate partner attention
            if (ticket.priority === 'CRITICAL' && status !== 'RESOLVED' && status !== 'REJECTED') {
                requiresAction++;
            }

            // Also flag tickets where Admin has responded but partner hasn't seen
            if (ticket.admin_response && status === 'RESOLVED') {
                // Resolved with feedback — partner should read this
                requiresAction++;
            }
        });

        return {
            total,
            pending,
            processing,
            resolved,
            requiresAction
        };
    }
};
