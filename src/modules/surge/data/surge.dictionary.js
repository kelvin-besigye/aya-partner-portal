/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: surge.dictionary.js
 * * DESCRIPTION:
 * The absolute source of truth for all Consumer Telemetry taxonomies.
 * Maps raw strings from the 3 master Postgres pipelines (Searches, Bookings, 
 * Cancellations) into strict, immutable UI configurations.
 * * WORLD-CLASS PHYSICS:
 * 1. VISUAL HIERARCHY: Every data point carries specific CSS variables 
 * (`var(--status-danger)`, etc.) and Lucide icons to instantly render charts.
 * 2. IMMUTABILITY: Sealed via Object.freeze() to prevent memory/state corruption 
 * during heavy data aggregation loops.
 * 3. CRASH IMMUNITY: Exported resolver functions guarantee the UI charts will 
 * never white-screen if the database returns an unexpected string.
 */

import { 
    TrendingUp, Zap, AlertTriangle, LifeBuoy, 
    CreditCard, Smartphone, Banknote, MapPin,
    Clock, RefreshCcw, XCircle, ShieldAlert,
    UserX, Compass, Map, Star, ShieldCheck
} from 'lucide-react';

// ========================================================================
// 1. SIGNAL TAXONOMY (The AI Triggers)
// ========================================================================
/**
 * Defines the classification of a Surge Event for the Actionable Alert Feed.
 */
export const SURGE_SIGNAL_TYPES = Object.freeze({
    'SEARCH_SPIKE': {
        id: 'SEARCH_SPIKE',
        label: 'Massive Search Volume',
        description: 'High intent detected with low remaining network capacity.',
        color: 'var(--status-success)',
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        Icon: TrendingUp
    },
    'VELOCITY_SPIKE': {
        id: 'VELOCITY_SPIKE',
        label: 'Rapid Booking Velocity',
        description: 'Tickets are selling out exponentially faster than historical averages.',
        color: 'var(--brand-primary)',
        bgOpacity: 'rgba(206, 172, 92, 0.1)',
        Icon: Zap
    },
    'SEAT_EXHAUSTION': {
        id: 'SEAT_EXHAUSTION',
        label: 'Premium Seat Exhaustion',
        description: 'Specific seat classes (e.g., VIP/Window) are entirely sold out.',
        color: 'var(--status-warning)',
        bgOpacity: 'rgba(245, 158, 11, 0.1)',
        Icon: AlertTriangle
    },
    'STRANDED_PASSENGERS': {
        id: 'STRANDED_PASSENGERS',
        label: 'Competitor Failure',
        description: 'High cancellation rates detected from rival operators on this route.',
        color: 'var(--status-danger)',
        bgOpacity: 'rgba(239, 68, 68, 0.1)',
        Icon: LifeBuoy
    },
    'UNKNOWN': {
        id: 'UNKNOWN',
        label: 'Unclassified Anomaly',
        description: 'System detected unusual metric deviation.',
        color: 'var(--text-muted)',
        bgOpacity: 'var(--bg-input)',
        Icon: Compass
    }
});

// ========================================================================
// 2. CONVERSION TAXONOMY (Preferences & Payments)
// ========================================================================

export const SEAT_TYPES = Object.freeze({
    'WINDOW': { id: 'WINDOW', label: 'Window Seat', color: 'var(--brand-primary)', Icon: Map },
    'AISLE': { id: 'AISLE', label: 'Aisle Seat', color: 'var(--text-main)', Icon: Compass },
    'UNKNOWN': { id: 'UNKNOWN', label: 'Any Seat', color: 'var(--text-muted)', Icon: MapPin }
});

export const SEAT_POSITIONS = Object.freeze({
    'FRONT': { id: 'FRONT', label: 'Front Rows', weight: 3 },
    'MID': { id: 'MID', label: 'Middle Rows', weight: 2 },
    'BACK': { id: 'BACK', label: 'Back Rows', weight: 1 },
    'UNKNOWN': { id: 'UNKNOWN', label: 'Unspecified', weight: 0 }
});

export const PAYMENT_METHODS = Object.freeze({
    'MTN_MOMO': { id: 'MTN_MOMO', label: 'MTN Mobile Money', color: '#FFCC00', Icon: Smartphone },
    'AIRTEL_MONEY': { id: 'AIRTEL_MONEY', label: 'Airtel Money', color: '#FF0000', Icon: Smartphone },
    'VISA': { id: 'VISA', label: 'Visa Card', color: '#1A1F71', Icon: CreditCard },
    'MASTERCARD': { id: 'MASTERCARD', label: 'Mastercard', color: '#EB001B', Icon: CreditCard },
    'CASH_AGENT': { id: 'CASH_AGENT', label: 'Agent Cash', color: 'var(--status-success)', Icon: Banknote },
    'UNKNOWN': { id: 'UNKNOWN', label: 'Unknown Gateway', color: 'var(--text-muted)', Icon: CreditCard }
});

export const BUS_CLASSES = Object.freeze({
    'EXECUTIVE': { id: 'EXECUTIVE', label: 'Executive Class', color: 'var(--brand-primary)', Icon: Star },
    'ORDINARY': { id: 'ORDINARY', label: 'Ordinary Class', color: 'var(--text-main)', Icon: ShieldCheck },
    'VIP': { id: 'VIP', label: 'VIP Sleeper', color: '#8B5CF6', Icon: Star }, // Deep Purple for VIP
    'UNKNOWN': { id: 'UNKNOWN', label: 'Standard', color: 'var(--text-muted)', Icon: ShieldCheck }
});

// ========================================================================
// 3. FRICTION TAXONOMY (The Autopsy Data)
// ========================================================================
/**
 * Strict categorizations for why a passenger aborted their journey.
 * Used heavily in the CancellationAutopsy pie charts.
 */
export const CANCELLATION_REASONS = Object.freeze({
    'BUS_DELAYED_OVER_1HR': {
        id: 'BUS_DELAYED_OVER_1HR',
        label: 'Severe Departure Delay',
        category: 'OPERATIONAL_FAILURE',
        color: 'var(--status-danger)',
        Icon: Clock
    },
    'FOUND_CHEAPER_ALTERNATIVE': {
        id: 'FOUND_CHEAPER_ALTERNATIVE',
        label: 'Found Cheaper Bus',
        category: 'PRICE_FRICTION',
        color: 'var(--status-warning)',
        Icon: Banknote
    },
    'CHANGED_MIND_NO_TRAVEL': {
        id: 'CHANGED_MIND_NO_TRAVEL',
        label: 'Cancelled Trip Entirely',
        category: 'PASSENGER_CHOICE',
        color: 'var(--text-muted)',
        Icon: UserX
    },
    'BOOKED_WRONG_DATE': {
        id: 'BOOKED_WRONG_DATE',
        label: 'Booking Error (Wrong Date/Time)',
        category: 'USER_ERROR',
        color: '#3B82F6', // Blue
        Icon: RefreshCcw
    },
    'SCHEDULE_CHANGED': {
        id: 'SCHEDULE_CHANGED',
        label: 'Operator Changed Schedule',
        category: 'OPERATIONAL_FAILURE',
        color: 'var(--status-danger)',
        Icon: AlertTriangle
    },
    'PAYMENT_FAILED': {
        id: 'PAYMENT_FAILED',
        label: 'Gateway Timeout / Failure',
        category: 'TECHNICAL_FAILURE',
        color: '#8B5CF6', // Purple
        Icon: ShieldAlert
    },
    'UNKNOWN': {
        id: 'UNKNOWN',
        label: 'Unspecified Reason',
        category: 'UNKNOWN',
        color: 'var(--text-muted)',
        Icon: XCircle
    }
});

// ========================================================================
// 4. TEMPORAL TAXONOMY (Time-Series Axis)
// ========================================================================

export const DAYS_OF_WEEK = Object.freeze([
    { id: 'MONDAY', label: 'Monday', short: 'Mon' },
    { id: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
    { id: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
    { id: 'THURSDAY', label: 'Thursday', short: 'Thu' },
    { id: 'FRIDAY', label: 'Friday', short: 'Fri' },
    { id: 'SATURDAY', label: 'Saturday', short: 'Sat' },
    { id: 'SUNDAY', label: 'Sunday', short: 'Sun' }
]);

export const MONTHS_OF_YEAR = Object.freeze([
    { id: 'JANUARY', label: 'January', short: 'Jan' },
    { id: 'FEBRUARY', label: 'February', short: 'Feb' },
    { id: 'MARCH', label: 'March', short: 'Mar' },
    { id: 'APRIL', label: 'April', short: 'Apr' },
    { id: 'MAY', label: 'May', short: 'May' },
    { id: 'JUNE', label: 'June', short: 'Jun' },
    { id: 'JULY', label: 'July', short: 'Jul' },
    { id: 'AUGUST', label: 'August', short: 'Aug' },
    { id: 'SEPTEMBER', label: 'September', short: 'Sep' },
    { id: 'OCTOBER', label: 'October', short: 'Oct' },
    { id: 'NOVEMBER', label: 'November', short: 'Nov' },
    { id: 'DECEMBER', label: 'December', short: 'Dec' }
]);

// ========================================================================
// 5. DEFENSIVE RESOLVERS (The Crash Shields)
// ========================================================================

export const getSignalConfig = (rawSignal) => {
    if (!rawSignal) return SURGE_SIGNAL_TYPES['UNKNOWN'];
    const normalized = String(rawSignal).toUpperCase().trim();
    return SURGE_SIGNAL_TYPES[normalized] || SURGE_SIGNAL_TYPES['UNKNOWN'];
};

export const getCancelReasonConfig = (rawReason) => {
    if (!rawReason) return CANCELLATION_REASONS['UNKNOWN'];
    const normalized = String(rawReason).toUpperCase().trim();
    return CANCELLATION_REASONS[normalized] || CANCELLATION_REASONS['UNKNOWN'];
};

export const getPaymentMethodConfig = (rawMethod) => {
    if (!rawMethod) return PAYMENT_METHODS['UNKNOWN'];
    const normalized = String(rawMethod).toUpperCase().trim();
    return PAYMENT_METHODS[normalized] || PAYMENT_METHODS['UNKNOWN'];
};

export const getSeatTypeConfig = (rawType) => {
    if (!rawType) return SEAT_TYPES['UNKNOWN'];
    const normalized = String(rawType).toUpperCase().trim();
    return SEAT_TYPES[normalized] || SEAT_TYPES['UNKNOWN'];
};

export const getBusClassConfig = (rawClass) => {
    if (!rawClass) return BUS_CLASSES['UNKNOWN'];
    const normalized = String(rawClass).toUpperCase().trim();
    return BUS_CLASSES[normalized] || BUS_CLASSES['UNKNOWN'];
};