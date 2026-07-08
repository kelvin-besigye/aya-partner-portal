/**
 * 👑 AYABUS SEAT DICTIONARY (Sovereign Booking State Authority) — Chassis Grammar v5
 * ------------------------------------------------------------------
 * File: seat.dictionary.js
 *
 * THIS FILE HAS 3 BYTE-IDENTICAL COPIES IN THE CODEBASE:
 *   - admin-cockpit/src/modules/bus-config/data/seat.dictionary.js
 *   - partner-portal/src/modules/manifest/data/seat.dictionary.js
 *   - consumer-web/src/modules/booking/data/seat.dictionary.js
 *
 * SYNC RULE (AyaBus_Chassis_V3_Directory.md + Chassis Grammar v5):
 * if you change this file in one app, change it in all three.
 *
 * A safety-net script `tools/check-dictionary-sync.js` is provided that
 * compares the three copies and fails CI if they drift — mirroring the
 * pattern set by `tools/check-engine-sync.js` for seat.engine.js.
 *
 * ------------------------------------------------------------------
 * PURPOSE
 * ------------------------------------------------------------------
 * Defines the strict state machine for seat inventory. Guarantees zero
 * financial contamination between AyaBus digital sales and Partner
 * physical park sales.
 *
 *   AVAILABLE       — bookable; operator may mutate to UNAVAILABLE or
 *                     OUT_OF_SERVICE for the active trip.
 *   BOOKED_AYABUS   — sold via AyaBus App. Operator MUST NOT mutate this
 *                     (doubles-booking prevention). Financial value: yes.
 *   LOCKED_PENDING  — reserved while a Mobile Money confirmation is in
 *                     flight. Operator MUST NOT mutate. Financial: no.
 *   UNAVAILABLE     — sold at the physical park counter (walk-in /
 *                     VIP) — still a real, occupied seat on this trip.
 *                     Operator CAN revert to AVAILABLE if a walk-in
 *                     cancels. Financial: no (excluded from AyaBus
 *                     Treasury splits).
 *   OUT_OF_SERVICE  — this physical seat is broken/removed for this
 *                     specific trip. Never sellable, by either party,
 *                     on this trip only. Operator CAN revert once
 *                     repaired. Financial: no (excluded from both
 *                     Treasury splits AND capacity utilization).
 *
 * This file pairs with `tools/check-dictionary-sync.js` (which
 * complements `tools/check-engine-sync.js`):
 *   - seat.engine.js      → slot TYPES (structural, who-checks-what)
 *   - seat.dictionary.js  → booking STATES (per-trip runtime)
 *
 * The two files are intentionally separate so that structural changes
 * (e.g. a new slot type in a future v6) can land without disturbing
 * runtime state visuals, and vice-versa.
 */

/**
 * CHANGE HISTORY (v3 → v5)
 *   v3: added OUT_OF_SERVICE — distinct from UNAVAILABLE so Partner
 *       reporting can distinguish "walk-in sold" from "physical seat
 *       broken" (Rule 21).
 *   v5: promoted to 3 byte-identical copies across the apps. No content
 *       change vs. the prior partner-only copy. Sync-rule header added.
 *       Now consumed by partner SeatMatrix.jsx (already was), admin
 *       ChassisCanvas.jsx (future matrix-state overlays), and consumer
 *       ChassisGrid.jsx (refactored in v5 to read booking-state visuals
 *       from this dictionary instead of inline CSS classes).
 */

export const SEAT_STATES = {
    AVAILABLE: 'AVAILABLE',
    BOOKED_AYABUS: 'BOOKED_AYABUS',
    LOCKED_PENDING: 'LOCKED_PENDING',
    UNAVAILABLE: 'UNAVAILABLE',       // Walk-ins / park sale, on this trip
    OUT_OF_SERVICE: 'OUT_OF_SERVICE', // Physically unusable, on this trip only
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
