/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: treasury.dictionary.js
 * * DESCRIPTION:
 * The absolute source of truth for all financial taxonomies. 
 * Defines how money moves, how statuses are visualized, and how 
 * time periods are mathematically filtered.
 * * WORLD-CLASS PHYSICS:
 * 1. MATHEMATICAL IMPACT: Every transaction type carries an `operator` 
 * (+ or -) and an `impact` flag (CREDIT/DEBIT) so the UI can auto-format 
 * colors (Green for Inflow, Red for Outflow).
 * 2. IMMUTABILITY: Sealed via Object.freeze() to prevent memory/state corruption.
 * 3. FALLBACK SAFETY: `getTreasuryStatusConfig` guarantees the UI will never 
 * white-screen if the database returns an unexpected or legacy status string.
 */

import { 
    CheckCircle2, Clock, Landmark, CreditCard, 
    RefreshCcw, AlertTriangle, ArrowDownRight, ArrowUpRight, 
    Activity, Calendar, PieChart, ShieldCheck, Ticket,
    Banknote, FileWarning, Lock
} from 'lucide-react';

// ========================================================================
// 1. TRANSACTION TAXONOMY (The Nature of the Entry)
// ========================================================================
/**
 * Defines every possible reason a ledger entry exists.
 * Controls the mathematical sign and the iconography of the row.
 */
export const TREASURY_TRANSACTION_TYPES = Object.freeze({
    TICKET_SALE: {
        id: 'TICKET_SALE',
        label: 'Passenger Ticket Fare',
        impact: 'CREDIT',
        operator: '+',
        color: 'var(--status-success)', // Green inflow
        Icon: Ticket,
        description: 'Gross revenue generated from a successful passenger booking.'
    },
    CANCELLATION_CLAWBACK: {
        id: 'CANCELLATION_CLAWBACK',
        label: 'Cancellation Deduction',
        impact: 'DEBIT',
        operator: '-',
        color: 'var(--status-danger)', // Red outflow
        Icon: RefreshCcw,
        description: 'Automated deduction recovering funds from a previously cancelled and refunded ticket.'
    },
    PLATFORM_COMMISSION: {
        id: 'PLATFORM_COMMISSION',
        label: 'AyaBus Platform Fee',
        impact: 'DEBIT',
        operator: '-',
        color: 'var(--text-muted)', // Neutral outflow
        Icon: PieChart,
        description: 'The agreed operational commission deducted by the AyaBus platform.'
    },
    GATEWAY_FEE: {
        id: 'GATEWAY_FEE',
        label: 'Payment Gateway Fee',
        impact: 'DEBIT',
        operator: '-',
        color: 'var(--text-muted)', 
        Icon: CreditCard,
        description: 'Standard processing fees levied by Mobile Money or Card networks.'
    },
    PAYOUT_SETTLEMENT: {
        id: 'PAYOUT_SETTLEMENT',
        label: 'Bank/Wallet Settlement',
        impact: 'SETTLEMENT',
        operator: '', // No mathematical sign in the list, it's a transfer event
        color: 'var(--brand-primary)', // Brand Gold
        Icon: Landmark,
        description: 'Bulk wire transfer of net revenues to the registered corporate account.'
    },
    MANUAL_ADJUSTMENT: {
        id: 'MANUAL_ADJUSTMENT',
        label: 'Auditor Adjustment',
        impact: 'VARIABLE', // Can be + or -
        operator: '±',
        color: 'var(--status-warning)', 
        Icon: FileWarning,
        description: 'A manual ledger correction applied by the AyaBus Audit Citadel.'
    }
});

// ========================================================================
// 2. SETTLEMENT STATUSES (The State of the Money)
// ========================================================================
/**
 * Defines the physical location or state of the funds.
 * Controls the StatusBadges in the ledger and inspector.
 */
const TREASURY_STATUS_DICTIONARY = {
    // --- INFLOW STATES ---
    'PENDING_CLEARANCE': {
        code: 'PENDING_CLEARANCE',
        label: 'Pending Gateway',
        theme: 'warning',
        color: 'var(--status-warning)',
        bgOpacity: 'rgba(245, 158, 11, 0.1)',
        Icon: Clock,
        isPulsing: true, // Indicates system is waiting on third-party (MTN/Airtel/Visa)
        tooltip: 'Funds held by the payment processor. Awaiting T+1 clearance.'
    },
    'CLEARED': {
        code: 'CLEARED',
        label: 'Funds Cleared',
        theme: 'success',
        color: 'var(--status-success)',
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        Icon: CheckCircle2,
        isPulsing: false,
        tooltip: 'Funds successfully secured in the AyaBus master treasury.'
    },
    
    // --- PAYOUT STATES ---
    'PROCESSING_PAYOUT': {
        code: 'PROCESSING_PAYOUT',
        label: 'Processing Transfer',
        theme: 'primary',
        color: 'var(--brand-primary)',
        bgOpacity: 'rgba(206, 172, 92, 0.1)',
        Icon: Activity,
        isPulsing: true, // Indicates active network transmission
        tooltip: 'Wire transfer to your registered account has been initiated.'
    },
    'SETTLED': {
        code: 'SETTLED',
        label: 'Settled to Bank',
        theme: 'success',
        color: 'var(--status-success)',
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        Icon: Landmark,
        isPulsing: false,
        tooltip: 'Transfer complete. Funds have landed in your corporate account.'
    },
    'FAILED_PAYOUT': {
        code: 'FAILED_PAYOUT',
        label: 'Transfer Bounced',
        theme: 'error',
        color: 'var(--status-error)',
        bgOpacity: 'rgba(239, 68, 68, 0.1)',
        Icon: AlertTriangle,
        isPulsing: false,
        tooltip: 'The destination bank rejected the transfer. Check your account details.'
    },

    // --- OUTFLOW / SYSTEM STATES ---
    'DEDUCTED': {
        code: 'DEDUCTED',
        label: 'Deducted',
        theme: 'neutral',
        color: 'var(--text-muted)',
        bgOpacity: 'var(--bg-input)',
        Icon: ArrowDownRight,
        isPulsing: false,
        tooltip: 'Fee or clawback successfully processed against gross revenue.'
    },
    'AUDIT_LOCKED': {
        code: 'AUDIT_LOCKED',
        label: 'Reconciled & Locked',
        theme: 'info',
        color: '#3B82F6', // Secure Blue
        bgOpacity: 'rgba(59, 130, 246, 0.1)',
        Icon: Lock,
        isPulsing: false,
        tooltip: 'Period closed by AyaBus Auditors. This transaction is immutable.'
    },
    
    // --- FALLBACK ---
    'UNKNOWN': {
        code: 'UNKNOWN',
        label: 'System Syncing',
        theme: 'neutral',
        color: 'var(--text-muted)',
        bgOpacity: 'var(--bg-input)',
        Icon: RefreshCcw,
        isPulsing: false,
        tooltip: 'Fetching latest state from the financial grid.'
    }
};

// ========================================================================
// 3. TEMPORAL FILTERS (The Time Machine)
// ========================================================================
/**
 * Configurations for the TimeFilterEngine. 
 * Provides strict keys to send to the PostgreSQL backend for data slicing.
 */
export const TREASURY_TIME_PERIODS = Object.freeze([
    { id: 'TODAY', label: "Today's Ledger", shortLabel: 'Today' },
    { id: 'YESTERDAY', label: 'Yesterday', shortLabel: 'Yesterday' },
    { id: 'THIS_WEEK', label: 'This Week (Mon-Sun)', shortLabel: 'This Week' },
    { id: 'LAST_WEEK', label: 'Last Week', shortLabel: 'Last Week' },
    { id: 'THIS_MONTH', label: 'Current Month', shortLabel: 'This Month' },
    { id: 'LAST_MONTH', label: 'Previous Month', shortLabel: 'Last Month' },
    { id: 'THIS_QUARTER', label: 'Current Quarter (Q)', shortLabel: 'This Quarter' },
    { id: 'LAST_QUARTER', label: 'Previous Quarter', shortLabel: 'Last Quarter' },
    { id: 'FINANCIAL_YEAR', label: 'Fiscal Year to Date', shortLabel: 'YTD' },
    { id: 'ALL_TIME', label: 'Lifetime Ledger', shortLabel: 'All Time' },
    { id: 'CUSTOM', label: 'Custom Date Range', shortLabel: 'Custom' }
]);

// ========================================================================
// 4. DEFENSIVE RESOLVERS (Crash Immunity)
// ========================================================================

/**
 * Safely resolves an asset status string to its UI configuration.
 * @param {string} rawStatus - The status string from the database.
 * @returns {Object} The complete visual configuration object.
 */
export const getTreasuryStatusConfig = (rawStatus) => {
    if (!rawStatus) return TREASURY_STATUS_DICTIONARY['UNKNOWN'];
    
    const normalizedStatus = rawStatus.toUpperCase().trim();
    return TREASURY_STATUS_DICTIONARY[normalizedStatus] || TREASURY_STATUS_DICTIONARY['UNKNOWN'];
};

/**
 * Safely resolves a transaction type.
 * @param {string} rawType - The transaction type from the database.
 * @returns {Object} The transaction configuration object.
 */
export const getTransactionConfig = (rawType) => {
    if (!rawType) return TREASURY_TRANSACTION_TYPES['MANUAL_ADJUSTMENT'];
    
    const normalizedType = rawType.toUpperCase().trim();
    return TREASURY_TRANSACTION_TYPES[normalizedType] || TREASURY_TRANSACTION_TYPES['MANUAL_ADJUSTMENT'];
};