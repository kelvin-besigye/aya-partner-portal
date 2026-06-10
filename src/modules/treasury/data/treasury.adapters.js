/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: treasury.adapters.js
 * * DESCRIPTION:
 * The apex purification pipeline for all financial data. It intercepts 
 * raw Postgres returns, applies the Master Dictionary taxonomies, standardizes 
 * currency formats, and calculates aggregate telemetry metrics.
 * * WORLD-CLASS PHYSICS:
 * 1. ZERO-CRASH GUARANTEE: Uses strict `safeNum` and `safeStr` parsing. If the 
 * database unexpectedly drops a column or returns null, the UI will not crash.
 * 2. AUTOMATIC SIGNAGE: Injects the proper mathematical operator (+/-) directly 
 * into the formatted display string based on the transaction type's DNA.
 * 3. METRIC AGGREGATOR: A built-in reduction engine that instantly calculates 
 * the Gross, Deductions, and Net Revenue for the Top Ribbon Telemetry.
 */

import { 
    getTransactionConfig, 
    getTreasuryStatusConfig 
} from './treasury.dictionary';

// ========================================================================\
// 1. DEFENSIVE UTILITIES & FORMATTERS
// ========================================================================\

const safeStr = (val, fallback = '') => (val && typeof val === 'string' ? val.trim() : fallback);
const safeNum = (val, fallback = 0) => (isNaN(Number(val)) ? fallback : Number(val));
const safeJSON = (val) => {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch (e) { return {}; }
};

/**
 * Enterprise Currency Formatter
 * Standardizes all financial displays to Ugandan Shillings without decimals.
 * @param {number} amount - The raw integer value
 * @returns {string} e.g., "1,500,000"
 */
export const formatUGX = (amount) => {
    const validAmount = safeNum(amount);
    return new Intl.NumberFormat('en-UG', { 
        style: 'decimal', 
        maximumFractionDigits: 0 
    }).format(validAmount);
};

/**
 * Enterprise Timestamp Formatter
 * Converts ISO strings into highly readable ledger dates.
 * @param {string} isoString - e.g., "2024-03-14T15:30:00Z"
 * @returns {Object} { date: "14 Mar 2024", time: "15:30" }
 */
export const formatLedgerDate = (isoString) => {
    if (!isoString) return { date: 'Unknown Date', time: '--:--' };
    try {
        const dateObj = new Date(isoString);
        return {
            date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj),
            time: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(dateObj)
        };
    } catch (e) {
        return { date: 'Invalid Date', time: '--:--' };
    }
};

// ========================================================================\
// 2. LEDGER TRANSACTION ADAPTER (The Row Purifier)
// ========================================================================\

/**
 * Transforms a raw Supabase ledger row into a perfectly typed UI object.
 * @param {Object} dbRow - The raw snake_case database object.
 * @returns {Object} The purified camelCase UI object.
 */
export const adaptLedgerTransaction = (dbRow) => {
    if (!dbRow) return null;

    try {
        // 1. Resolve Taxonomies
        const transactionConfig = getTransactionConfig(dbRow.transaction_type);
        const statusConfig = getTreasuryStatusConfig(dbRow.status);

        // 2. Parse Raw Data
        const rawAmount = safeNum(dbRow.amount);
        const temporalData = formatLedgerDate(dbRow.created_at);
        const metadata = safeJSON(dbRow.metadata);

        // 3. Construct Display Amount (Injects the operator e.g., "+ UGX 50,000")
        const formattedBaseAmount = formatUGX(rawAmount);
        const displayAmount = transactionConfig.operator 
            ? `${transactionConfig.operator} UGX ${formattedBaseAmount}`
            : `UGX ${formattedBaseAmount}`;

        // 4. Return the Immutable UI Object
        return {
            id: safeStr(dbRow.id, 'temp-id'),
            referenceId: safeStr(dbRow.reference_id, 'N/A'), // Links back to the original Ticket or Payout
            
            // Financials
            rawAmount,
            displayAmount,
            
            // Taxonomies (The Dictionary Configs)
            type: transactionConfig,
            status: statusConfig,
            
            // Time & Audit
            createdAt: dbRow.created_at,
            displayDate: temporalData.date,
            displayTime: temporalData.time,

            // Deep Context (Extracted from metadata JSONB)
            passengerName: safeStr(metadata.passenger_name, 'Walk-in Passenger'),
            routeCode: safeStr(metadata.route_code, 'Unknown Route'),
            settlementBank: safeStr(metadata.bank_name, null),
            settlementAccountMasked: metadata.account_last_four ? `•••• ${metadata.account_last_four}` : null
        };
    } catch (error) {
        console.error("[AyaBus Treasury] Failed to adapt ledger transaction:", error);
        return null;
    }
};

// ========================================================================\
// 3. TELEMETRY AGGREGATOR (The Dashboard Calculator)
// ========================================================================\

/**
 * Calculates the top-level metrics for the Telemetry Ribbon by iterating 
 * over the purified ledger transactions.
 * @param {Array} purifiedTransactions - Array of objects returned by adaptLedgerTransaction
 * @returns {Object} The calculated totals for the top cards.
 */
export const adaptTreasuryMetrics = (purifiedTransactions = []) => {
    const defaultMetrics = {
        grossRevenue: { raw: 0, display: '0' },
        platformFees: { raw: 0, display: '0' },
        cancellations: { raw: 0, display: '0' },
        netSettled: { raw: 0, display: '0' },
        pendingClearance: { raw: 0, display: '0' }
    };

    if (!Array.isArray(purifiedTransactions) || purifiedTransactions.length === 0) {
        return defaultMetrics;
    }

    const totals = purifiedTransactions.reduce((acc, tx) => {
        // Skip invalid rows
        if (!tx || !tx.type || !tx.status) return acc;

        const amount = tx.rawAmount;

        // 1. Calculate Gross Revenue (Only Successful Ticket Sales)
        if (tx.type.id === 'TICKET_SALE' && tx.status.code !== 'FAILED_PAYOUT') {
            acc.grossRevenue += amount;
            
            // Track funds that haven't hit the master account yet
            if (tx.status.code === 'PENDING_CLEARANCE') {
                acc.pendingClearance += amount;
            }
        }

        // 2. Calculate Platform & Gateway Fees
        if (tx.type.id === 'PLATFORM_COMMISSION' || tx.type.id === 'GATEWAY_FEE') {
            acc.platformFees += amount;
        }

        // 3. Calculate Cancellations
        if (tx.type.id === 'CANCELLATION_CLAWBACK') {
            acc.cancellations += amount;
        }

        // 4. Calculate Net Settled (Actual money sent to partner's bank)
        if (tx.type.id === 'PAYOUT_SETTLEMENT' && tx.status.code === 'SETTLED') {
            acc.netSettled += amount;
        }

        return acc;
    }, { 
        grossRevenue: 0, 
        platformFees: 0, 
        cancellations: 0, 
        netSettled: 0, 
        pendingClearance: 0 
    });

    // Format the final output for the UI
    return {
        grossRevenue: { raw: totals.grossRevenue, display: formatUGX(totals.grossRevenue) },
        platformFees: { raw: totals.platformFees, display: formatUGX(totals.platformFees) },
        cancellations: { raw: totals.cancellations, display: formatUGX(totals.cancellations) },
        netSettled: { raw: totals.netSettled, display: formatUGX(totals.netSettled) },
        pendingClearance: { raw: totals.pendingClearance, display: formatUGX(totals.pendingClearance) }
    };
};