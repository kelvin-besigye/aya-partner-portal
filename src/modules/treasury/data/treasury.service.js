/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: treasury.service.js
 * * DESCRIPTION:
 * The apex network bridge for the Treasury Module. Securely reaches into 
 * the Supabase vault, applies strict temporal filters (Date Ranges), 
 * and immediately purifies the results through the Adapter pipeline.
 * * WORLD-CLASS PHYSICS:
 * 1. TENANT LOCKDOWN: Every query is hard-locked to the `tenantId`. Even if 
 * RLS failed (which it won't), the service physically prevents cross-tenant queries.
 * 2. TEMPORAL SLICING: Contains a highly optimized Time Machine (`resolveTimeFrame`) 
 * that instantly translates dictionary keys (e.g., 'THIS_WEEK') into strict ISO timestamps.
 * 3. ATOMIC RETURN SHAPE: Always returns a guaranteed structure containing both 
 * the raw `transactions` array and the calculated `metrics` object. 
 */

import { supabase, handleDataException } from '../../../services/api.config';
import { adaptLedgerTransaction, adaptTreasuryMetrics } from './treasury.adapters';

// ========================================================================
// 1. THE TIME MACHINE (Temporal Slicing Engine)
// ========================================================================
/**
 * Translates abstract period strings into exact mathematical Date ranges.
 * @param {string} periodId - From TREASURY_TIME_PERIODS (e.g., 'THIS_MONTH')
 * @param {Object} customRange - { startDate, endDate } for CUSTOM queries
 * @returns {Object|null} { start: ISOString, end: ISOString } or null for ALL_TIME
 */
const resolveTimeFrame = (periodId, customRange = null) => {
    const now = new Date();
    
    // Base resets for accurate midnight-to-midnight tracking
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (periodId) {
        case 'TODAY':
            return { start: startOfToday.toISOString(), end: endOfToday.toISOString() };
            
        case 'YESTERDAY': {
            const yesterday = new Date(startOfToday);
            yesterday.setDate(yesterday.getDate() - 1);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            return { start: yesterday.toISOString(), end: endOfYesterday.toISOString() };
        }
            
        case 'THIS_WEEK': {
            // Assumes Monday is the start of the business week
            const dayOfWeek = now.getDay() || 7; 
            const monday = new Date(startOfToday);
            monday.setDate(monday.getDate() - (dayOfWeek - 1));
            return { start: monday.toISOString(), end: endOfToday.toISOString() };
        }

        case 'LAST_WEEK': {
            const dayOfWeek = now.getDay() || 7;
            const lastMonday = new Date(startOfToday);
            lastMonday.setDate(lastMonday.getDate() - (dayOfWeek - 1) - 7);
            const lastSunday = new Date(lastMonday);
            lastSunday.setDate(lastSunday.getDate() + 6);
            lastSunday.setHours(23, 59, 59, 999);
            return { start: lastMonday.toISOString(), end: lastSunday.toISOString() };
        }
            
        case 'THIS_MONTH': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: startOfMonth.toISOString(), end: endOfToday.toISOString() };
        }

        case 'LAST_MONTH': {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return { start: startOfLastMonth.toISOString(), end: endOfLastMonth.toISOString() };
        }

        case 'THIS_QUARTER': {
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            const startOfQuarter = new Date(now.getFullYear(), quarterStartMonth, 1);
            return { start: startOfQuarter.toISOString(), end: endOfToday.toISOString() };
        }

        case 'FINANCIAL_YEAR': {
            // Assuming Financial Year aligns with Calendar Year for now
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return { start: startOfYear.toISOString(), end: endOfToday.toISOString() };
        }

        case 'CUSTOM': {
            if (customRange?.startDate && customRange?.endDate) {
                // Ensure the end date covers the full final day
                const end = new Date(customRange.endDate);
                end.setHours(23, 59, 59, 999);
                return { 
                    start: new Date(customRange.startDate).toISOString(), 
                    end: end.toISOString() 
                };
            }
            return null; // Fallback to ALL_TIME if custom range is missing
        }

        case 'ALL_TIME':
        default:
            return null; // Signals the query to drop date filters
    }
};

// ========================================================================
// 2. THE MASTER DATA LINK
// ========================================================================

export const treasuryService = {

    /**
     * Fetches and purifies the entire financial ledger for a specific period.
     * @param {string} tenantId - The Sovereign UUID of the logged-in Partner
     * @param {string} periodId - The Dictionary ID for the time filter (e.g., 'TODAY')
     * @param {Object} customRange - Optional { startDate, endDate }
     * @returns {Promise<Object>} { success: true, data: { transactions, metrics } }
     */
    fetchLedger: async (tenantId, periodId = 'THIS_MONTH', customRange = null) => {
        // 1. Pre-flight Security Check
        if (!tenantId) {
            return { success: false, error: 'SECURITY_FAULT: Cannot execute financial query without Tenant Identity.' };
        }

        try {
            // 2. Establish Time Boundaries
            const timeFrame = resolveTimeFrame(periodId, customRange);

            // 3. Construct Base Query
            let query = supabase
                .from('treasury_ledger')
                .select('*')
                .eq('partner_id', tenantId)
                .order('created_at', { ascending: false });

            // 4. Inject Temporal Slicing (if applicable)
            if (timeFrame) {
                query = query
                    .gte('created_at', timeFrame.start)
                    .lte('created_at', timeFrame.end);
            }

            // 5. Execute Network Request
            const { data, error } = await query;

            if (error) throw error;

            // 6. The Purification Pipeline
            // If the database is empty, return an empty array instead of null
            const rawTransactions = data || [];
            
            // Pass every raw row through the defensive adapter
            const purifiedTransactions = rawTransactions
                .map(adaptLedgerTransaction)
                .filter(Boolean); // Strips out any rows that failed parsing

            // 7. The Mathematical Aggregator
            // Calculate the 4 top-ribbon cards instantly using the purified data
            const calculatedMetrics = adaptTreasuryMetrics(purifiedTransactions);

            // 8. Return Atomic Payload
            return {
                success: true,
                data: {
                    transactions: purifiedTransactions,
                    metrics: calculatedMetrics,
                    queryTimeFrame: timeFrame // Return the exact timestamps used for UI context
                }
            };

        } catch (err) {
            return handleDataException(err, 'Treasury Ledger Synchronisation');
        }
    }

};