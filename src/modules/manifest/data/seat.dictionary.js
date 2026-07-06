/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Physics Engine) — Schema v3
 * ------------------------------------------------------------------
 * Module: Manifest Data Layer
 * File: seat.dictionary.js
 *
 * DESCRIPTION:
 * Defines the strict state machine for seat inventory. Guarantees zero
 * financial contamination between AyaBus digital sales and Partner
 * physical park sales.
 *
 * CHANGE (v3, Rule 21): added OUT_OF_SERVICE — a distinct state from
 * UNAVAILABLE. UNAVAILABLE means "sold at the park counter, not via
 * AyaBus" (still a real, occupied seat on this trip). OUT_OF_SERVICE
 * means "this physical seat is broken/removed for this specific trip"
 * (e.g. a torn seat, a mechanical fault) — it is never sellable by
 * either party, on this trip only. Distinguishing the two matters for
 * Partner reporting: UNAVAILABLE contributes to walk-in revenue
 * tracking; OUT_OF_SERVICE explicitly does not and should be excluded
 * from capacity utilization calculations.
 */

export const SEAT_STATES = {
    AVAILABLE: 'AVAILABLE',
    BOOKED_AYABUS: 'BOOKED_AYABUS',
    LOCKED_PENDING: 'LOCKED_PENDING',
    UNAVAILABLE: 'UNAVAILABLE',       // Walk-ins / park sale, on this trip
    OUT_OF_SERVICE: 'OUT_OF_SERVICE', // Physically unusable, on this trip only (NEW v3)
};

export const SEAT_DICTIONARY = {
    [SEAT_STATES.AVAILABLE]: {
        label: 'Available',
        code: 0,
        color: 'var(--bg-input)',
        borderColor: 'var(--border-subtle)',
        textColor: 'var(--text-main)',
        canOperatorMutate: true, // Operator CAN change this to UNAVAILABLE or OUT_OF_SERVICE
        financialValue: true,
    },
    [SEAT_STATES.BOOKED_AYABUS]: {
        label: 'AyaBus Passenger',
        code: 1,
        color: 'var(--status-success)',
        borderColor: 'var(--status-success)',
        textColor: '#FFFFFF',
        canOperatorMutate: false, // Operator CANNOT steal an AyaBus seat
        financialValue: true,
    },
    [SEAT_STATES.LOCKED_PENDING]: {
        label: 'Payment Pending',
        code: 2,
        color: 'var(--status-warning)',
        borderColor: 'var(--status-warning)',
        textColor: '#000000',
        canOperatorMutate: false, // Locked by system during Mobile Money entry
        financialValue: false,
    },
    [SEAT_STATES.UNAVAILABLE]: {
        label: 'Park Sale / Blocked',
        code: 3,
        color: 'var(--bg-surface)',
        borderColor: 'var(--text-muted)',
        textColor: 'var(--text-muted)',
        canOperatorMutate: true, // Operator CAN revert this back to AVAILABLE if a park walk-in cancels
        financialValue: false,  // Excluded from AyaBus Treasury splits
    },
    [SEAT_STATES.OUT_OF_SERVICE]: {
        label: 'Out of Service',
        code: 4,
        color: 'color-mix(in srgb, var(--status-error) 12%, var(--bg-surface))',
        borderColor: 'var(--status-error)',
        textColor: 'var(--status-error)',
        canOperatorMutate: true, // Operator CAN revert this back to AVAILABLE once repaired
        financialValue: false,  // Excluded from AyaBus Treasury splits AND capacity utilization
    },
};

/**
 * Determines if a seat transition is mathematically legal.
 */
export const isTransitionLegal = (currentState, requestedState) => {
    if (currentState === SEAT_STATES.BOOKED_AYABUS) return false;  // Immutable by operator
    if (currentState === SEAT_STATES.LOCKED_PENDING) return false; // Immutable by operator
    return true;
};
