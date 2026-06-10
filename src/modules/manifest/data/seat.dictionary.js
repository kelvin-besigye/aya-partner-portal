/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Physics Engine)
 * ------------------------------------------------------------------
 * Module: Manifest Data Layer
 * File: seat.dictionary.js
 * * DESCRIPTION:
 * Defines the strict 4-state state machine for seat inventory.
 * Guarantees zero financial contamination between AyaBus digital sales
 * and Partner physical park sales.
 */

export const SEAT_STATES = {
    AVAILABLE: 'AVAILABLE',
    BOOKED_AYABUS: 'BOOKED_AYABUS',
    LOCKED_PENDING: 'LOCKED_PENDING',
    UNAVAILABLE: 'UNAVAILABLE' // Used for Walk-ins, Maintenance, or T-4 Cutoff
};

export const SEAT_DICTIONARY = {
    [SEAT_STATES.AVAILABLE]: {
        label: 'Available',
        code: 0,
        // UI uses CSS variables to ensure Light/Dark mode compatibility
        color: 'var(--bg-input)', 
        borderColor: 'var(--border-subtle)',
        textColor: 'var(--text-main)',
        canOperatorMutate: true, // Operator CAN change this to UNAVAILABLE
        financialValue: true
    },
    [SEAT_STATES.BOOKED_AYABUS]: {
        label: 'AyaBus Passenger',
        code: 1,
        color: 'var(--status-success)', // E.g., Green
        borderColor: 'var(--status-success)',
        textColor: '#FFFFFF',
        canOperatorMutate: false, // Operator CANNOT steal an AyaBus seat
        financialValue: true
    },
    [SEAT_STATES.LOCKED_PENDING]: {
        label: 'Payment Pending',
        code: 2,
        color: 'var(--status-warning)', // E.g., Yellow
        borderColor: 'var(--status-warning)',
        textColor: '#000000',
        canOperatorMutate: false, // Locked by system during Mobile Money entry
        financialValue: false
    },
    [SEAT_STATES.UNAVAILABLE]: {
        label: 'Park Sale / Blocked',
        code: 3,
        color: 'var(--bg-surface)', // E.g., Dark Grey
        borderColor: 'var(--text-muted)',
        textColor: 'var(--text-muted)',
        canOperatorMutate: true, // Operator CAN revert this back to AVAILABLE if a park walk-in cancels
        financialValue: false // Excluded from AyaBus Treasury splits
    }
};

/**
 * Determines if a seat transition is mathematically legal.
 */
export const isTransitionLegal = (currentState, requestedState) => {
    if (currentState === SEAT_STATES.BOOKED_AYABUS) return false; // Immutable by operator
    if (currentState === SEAT_STATES.LOCKED_PENDING) return false; // Immutable by operator
    return true;
};