/**
 * 👑 AYABUS SEAT ENGINE (Sovereign Chassis Algorithm) — Schema v3
 * ------------------------------------------------------------------
 * File: seat.engine.js
 *
 * THIS FILE HAS 3 BYTE-IDENTICAL COPIES IN THE CODEBASE:
 *   - admin-cockpit/src/modules/bus-config/engines/seat.engine.js
 *   - partner-portal/src/modules/manifest/engines/seat.engine.js
 *   - consumer-web/src/modules/booking/engines/seat.engine.js
 *
 * SYNC RULE (AyaBus_Chassis_V3_Directory.md): if you change this file in
 * one app, change it in all three. A diff between any two copies means a
 * bug exists in at least one of them. There is no shared package in this
 * monorepo (confirmed — Amendment 2), so this duplication is intentional
 * and must be maintained by hand.
 *
 * ------------------------------------------------------------------
 * WHAT THIS FILE IS
 * ------------------------------------------------------------------
 * The single source of truth for the AyaBus chassis grammar. Every other
 * file that used to hand-roll its own `buildChassisRows()` (Admin's
 * ChassisCanvas.jsx, Partner's SeatMatrix.jsx, Consumer's ChassisGrid.jsx)
 * now imports its layout logic from here instead. Zero algorithm
 * duplication anywhere in the product.
 *
 * ------------------------------------------------------------------
 * DATA SHAPE (layout_config, schema_version 3)
 * ------------------------------------------------------------------
 * {
 *   schema_version: 3,
 *   total_rows: number,                 // 5–20
 *   driver_position: 'LEFT' | 'RIGHT',
 *   bench_position: 'MIDDLE',           // fixed — no other value exists in v3
 *   entries: [ { id, row, side } ],      // 0..MAX_ENTRIES
 *   rows: [
 *     {
 *       row_number: number,
 *       mode: 'STANDARD' | 'BENCH',
 *       cols_left: number,
 *       cols_right: number,
 *       bench_seat_count: number,        // only meaningful when mode === 'BENCH'
 *       slots: [
 *         {
 *           id: string,                  // stable UUID, survives renumbering
 *           side: 'LEFT' | 'RIGHT' | 'MIDDLE',
 *           position: number,            // 0 = window-most, increasing → aisle
 *           type: 'SEAT' | 'CONDUCTOR' | 'RESERVED' | 'DRIVER' | 'ENTRY' | 'EMPTY_ZONE',
 *           number: number | null,       // LEGACY (Chassis Grammar v3+) — null; was sequential integer
 *           label: string | null,        // POSITIONAL (Chassis Grammar v4+) — e.g. "1A", "12C", stable across edits
 *           conductor_label: string | null,
 *           custom_label: string | null,
 *           empty_zone_label: string | null,
 *         }
 *       ]
 *     }
 *   ],
 *   total_seats: number,
 *   total_conductors: number,
 * }
 *
 * NOTE: There is no AISLE slot type. The middle aisle gap (Rule 3) is a
 * pure UI/CSS concern — the grid renders a visual gap between the LEFT
 * and RIGHT slot groups. Only the last BENCH row ever produces slots with
 * side 'MIDDLE'.
 */

// =====================================================================
// 0. INTERNAL HELPERS
// =====================================================================

/** Stable UUID generator. Uses crypto.randomUUID() where available. */
const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4-ish generator (non-crypto environments only).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const emptySlot = (overrides = {}) => ({
  id: makeId(),
  side: 'LEFT',
  position: 0,
  type: 'SEAT',
  number: null,
  label: null,            // Chassis Grammar v4 — positional id (e.g. "1A"); computed by renumberSeats
  conductor_label: null,
  custom_label: null,
  empty_zone_label: null,
  ...overrides,
});

/** Deep-clones a layout so engine functions never mutate their inputs. */
const cloneRows = (rows) => (rows || []).map((row) => ({
  ...row,
  slots: (row.slots || []).map((slot) => ({ ...slot })),
}));

/**
 * Walks every row in the canonical numbering order:
 * row_number ascending → LEFT (position asc) → MIDDLE (position asc,
 * bench rows only) → RIGHT (position asc).
 * Calls visitor(slot, row) for every slot in that order.
 */
const walkInOrder = (rows, visitor) => {
  const sorted = [...rows].sort((a, b) => a.row_number - b.row_number);
  for (const row of sorted) {
    const left   = row.slots.filter((s) => s.side === 'LEFT').sort((a, b) => a.position - b.position);
    const middle = row.slots.filter((s) => s.side === 'MIDDLE').sort((a, b) => a.position - b.position);
    // RIGHT side: position 0 = window-most = the OUTER/rightmost physical
    // seat. Visually scanning a row left-to-right, you reach the
    // aisle-adjacent right-side seat FIRST and the window seat LAST — the
    // opposite of position order. So RIGHT must walk in DESCENDING
    // position order to produce correct left-to-right seat numbering and
    // correct left-to-right rendering (both consume this same order).
    const right  = row.slots.filter((s) => s.side === 'RIGHT').sort((a, b) => b.position - a.position);
    for (const slot of [...left, ...middle, ...right]) visitor(slot, row);
  }
};

/** Compacts positions on one side of one row to 0..n-1, no gaps. */
const compactSide = (row, side) => {
  const onSide = row.slots
    .filter((s) => s.side === side)
    .sort((a, b) => a.position - b.position);
  onSide.forEach((slot, idx) => { slot.position = idx; });
};

// =====================================================================
// 0a. columnLetter — positional identifier helper (Chassis Grammar v4)
// =====================================================================
/**
 * Computes the column letter (A, B, C, ...) for a slot at the given
 * (side, position) within a row. Letters continue across the LEFT/MIDDLE/
 * RIGHT zones so a row reads as one logical sequence:
 *
 *   LEFT    A, B, C, ...        (max 3 per side)
 *   MIDDLE  continues from LEFT (bench seats only)
 *   RIGHT   continues from MIDDLE (or LEFT if no bench in this row)
 *
 * @param {'LEFT'|'RIGHT'|'MIDDLE'} side
 * @param {number} position   0 = window-most seat on that side
 * @param {object} row        the row the slot lives in (for cols_left + middleCount)
 * @returns {string} a single uppercase letter (e.g. 'A', 'D')
 */
export const columnLetter = (side, position, row) => {
  const colsLeft = row?.cols_left ?? 0;
  // LEFT: position 0 -> A, 1 -> B, ...
  if (side === 'LEFT') return String.fromCharCode(65 + position);
  // MIDDLE: continues where LEFT ended
  if (side === 'MIDDLE') return String.fromCharCode(65 + colsLeft + position);
  // RIGHT: continues where MIDDLE (or LEFT, if no bench in this row) ended
  const middleCount = (row?.slots || []).filter((s) => s.side === 'MIDDLE').length;
  const offset = colsLeft + middleCount + position;
  return String.fromCharCode(65 + offset);
};

// =====================================================================
// 1. renumberSeats — the sequencing authority (Chassis Grammar v4)
// =====================================================================
/**
 * Re-walks all rows in canonical order and assigns a POSITIONAL `label`
 * to every SEAT and RESERVED slot ("1A", "1B", ..., "12C"). The label is
 * derived from (row_number, side, position) so it remains stable across
 * edits — adding, removing, or converting a slot in another position
 * cannot shift this slot's identity.
 *
 * The legacy `number` field is preserved as null (kept on the slot shape
 * for adapter back-compat — read paths just see "no number" and fall
 * through to `label`).
 *
 * Conductor SS labels are independently re-sequenced in the same walk
 * order (SS1 = first CONDUCTOR slot encountered top-to-bottom).
 * Pure function — does not mutate its input.
 */
export function renumberSeats(rows) {
  const next = cloneRows(rows);

  let conductorCounter = 0;

  walkInOrder(next, (slot, row) => {
    if (slot.type === 'SEAT' || slot.type === 'RESERVED') {
      // Positional identity — `${row.row_number}${columnLetter(...)}`.
      // Computed live from row+side+position, so it never drifts from
      // the slot's actual position even if intermediate edits shift it.
      slot.label = `${row.row_number}${columnLetter(slot.side, slot.position, row)}`;
      slot.number = null;            // legacy sequential int — null in v4
      slot.conductor_label = null;
    } else if (slot.type === 'CONDUCTOR') {
      conductorCounter += 1;
      slot.label = null;
      slot.number = null;
      slot.conductor_label = `SS${conductorCounter}`;
    } else {
      // DRIVER, ENTRY, EMPTY_ZONE — none of these get a positional label.
      slot.label = null;
      slot.number = null;
      slot.conductor_label = null;
    }
  });

  return next;
}

// =====================================================================
// 2. generateRowsFromSteppers — the ONLY place a grid is built from scratch
// =====================================================================
/**
 * @param {object} config
 * @param {number} config.total_rows
 * @param {number} config.cols_left        // bus-wide default, applied to every row
 * @param {number} config.cols_right       // bus-wide default, applied to every row
 * @param {'LEFT'|'RIGHT'} config.driver_position
 * @param {Array<{id?:string,row:number,side:'LEFT'|'RIGHT'}>} [config.entries]
 * @param {boolean} [config.has_rear_bench]
 * @param {number} [config.bench_seat_count]   // used only if has_rear_bench
 * @returns {object} full v3 layout_config (schema_version 3)
 */
export function generateRowsFromSteppers(config) {
  const {
    total_rows      = 11,
    cols_left       = 2,
    cols_right      = 3,
    driver_position = 'RIGHT',
    entries         = [],
    has_rear_bench  = true,
    bench_seat_count = 1,         // Chassis Grammar v4 default — was 3 (now matches single-curtain-row reality)
  } = config || {};

  const rows = [];

  // Reservations claim position 0 of a specific row+side (DRIVER, ENTRY).
  // First reservation registered for a given row+side wins; any conflicting
  // reservation is silently dropped here — validateLayout() is responsible
  // for surfacing the conflict to the operator, not this generator.
  const reservationsByRowSide = new Map(); // key `${row}:${side}` -> {type}

  const reserve = (row, side, type) => {
    const key = `${row}:${side}`;
    if (!reservationsByRowSide.has(key)) {
      reservationsByRowSide.set(key, type);
    }
  };

  // Driver — always row 1, on driver_position side (Rule 1).
  reserve(1, driver_position, 'DRIVER');

  // Entries — each claims position 0 of its row+side (Rule 2, Rule 7).
  for (const entry of entries) {
    reserve(entry.row, entry.side, 'ENTRY');
  }

  for (let r = 1; r <= total_rows; r += 1) {
    const isLastRow = r === total_rows;
    const mode = isLastRow && has_rear_bench ? 'BENCH' : 'STANDARD';

    const rowColsLeft  = cols_left;
    const rowColsRight = cols_right;

    const buildSide = (side, colCount) => {
      const slots = [];
      const reservedType = reservationsByRowSide.get(`${r}:${side}`);

      for (let pos = 0; pos < colCount; pos += 1) {
        if (pos === 0 && reservedType) {
          slots.push(emptySlot({ side, position: 0, type: reservedType }));
        } else {
          slots.push(emptySlot({ side, position: pos, type: 'SEAT' }));
        }
      }
      return slots;
    };

    const leftSlots  = buildSide('LEFT', rowColsLeft);
    const rightSlots = buildSide('RIGHT', rowColsRight);

    let middleSlots = [];
    if (mode === 'BENCH') {
      const count = Math.max(1, bench_seat_count || 1);
      middleSlots = Array.from({ length: count }, (_, i) =>
        emptySlot({ side: 'MIDDLE', position: i, type: 'SEAT' })
      );
    }

    rows.push({
      row_number: r,
      mode,
      cols_left: rowColsLeft,
      cols_right: rowColsRight,
      bench_seat_count: mode === 'BENCH' ? Math.max(1, bench_seat_count || 1) : 0,
      slots: [...leftSlots, ...middleSlots, ...rightSlots],
    });
  }

  const numberedRows = renumberSeats(rows);
  const totals = recalculateTotals(numberedRows);

  return {
    schema_version: 3,
    total_rows,
    driver_position,
    bench_position: 'MIDDLE',
    entries: entries.map((e) => ({ id: e.id || makeId(), row: e.row, side: e.side })),
    rows: numberedRows,
    total_seats: totals.total_seats,
    total_conductors: totals.total_conductors,
  };
}

// =====================================================================
// 3. addSlot — insert a new slot, shifting siblings outward
// =====================================================================
/**
 * Inserts a new slot at `position` on `side` of `rowNumber`, shifting any
 * existing slots on that side at >= position outward by one. Calls
 * renumberSeats. Returns the updated rows array (does not mutate input).
 *
 * Chassis Grammar v4 invariant:
 *   Inserting at position 0 is forbidden if that row+side already has a
 *   DRIVER or ENTRY reservation — that would push the reservation
 *   outward (or end up behind the new seat), which a real bus can't do.
 *   Throws a clear error so the UI can surface an info-only state.
 */
export function addSlot(rows, rowNumber, side, position, type = 'SEAT') {
  const next = cloneRows(rows);
  const row = next.find((r) => r.row_number === rowNumber);
  if (!row) throw new Error(`addSlot: row ${rowNumber} not found`);

  // NEW (v4): block reservation collision at position 0.
  if (position === 0) {
    const reservation = row.slots.find(
      (s) => s.position === 0 && (s.type === 'DRIVER' || s.type === 'ENTRY')
    );
    if (reservation) {
      throw new Error(
        `addSlot: position 0 of row ${rowNumber} (${side}) is reserved by ${reservation.type}.`
      );
    }
  }

  // Shift existing slots on this side outward to make room.
  row.slots
    .filter((s) => s.side === side && s.position >= position)
    .forEach((s) => { s.position += 1; });

  row.slots.push(emptySlot({ side, position, type }));

  // Keep row's declared column count in sync if a bookable column grew.
  if (side === 'LEFT') row.cols_left = row.slots.filter((s) => s.side === 'LEFT').length;
  if (side === 'RIGHT') row.cols_right = row.slots.filter((s) => s.side === 'RIGHT').length;

  return renumberSeats(next);
}

// =====================================================================
// 4. removeSlot — remove by stable UUID, compact, renumber
// =====================================================================
/**
 * Removes the slot with the given stable id. Compacts the remaining
 * positions on that side to 0..n-1 (no gaps — Rule 5), then renumbers.
 * Throws if slotId is not found anywhere in rows. Returns updated rows.
 *
 * Chassis Grammar v4 invariant:
 *   DRIVER and ENTRY slots are PINNED — they cannot be removed via this
 *   path. They are managed exclusively via the Step 2 driver/entries
 *   steppers. Calling removeSlot on one throws a clear error so the UI
 *   can show an info-only state instead of offering a destructive
 *   delete button.
 */
export function removeSlot(rows, slotId) {
  const next = cloneRows(rows);
  let found = false;

  for (const row of next) {
    const idx = row.slots.findIndex((s) => s.id === slotId);
    if (idx !== -1) {
      const [removed] = row.slots.splice(idx, 1);
      // NEW (v4): refuse to remove pinned slots.
      if (removed.type === 'DRIVER' || removed.type === 'ENTRY') {
        throw new Error(
          `removeSlot: ${removed.type} slots are pinned — manage via stepper controls, not per-slot delete.`
        );
      }
      compactSide(row, removed.side);
      if (removed.side === 'LEFT') row.cols_left = row.slots.filter((s) => s.side === 'LEFT').length;
      if (removed.side === 'RIGHT') row.cols_right = row.slots.filter((s) => s.side === 'RIGHT').length;
      found = true;
      break;
    }
  }

  if (!found) throw new Error(`removeSlot: slot ${slotId} not found`);

  return renumberSeats(next);
}

// =====================================================================
// 5. convertSlotType — change a slot's type in place
// =====================================================================
/**
 * @param {Array} rows
 * @param {string} slotId
 * @param {'SEAT'|'CONDUCTOR'|'RESERVED'|'EMPTY_ZONE'} newType
 * @param {object} [options] - { label } used when newType === 'EMPTY_ZONE'
 * @returns {Array} updated rows
 *
 * DRIVER and ENTRY slots cannot be converted here — those positions are
 * managed exclusively via Step 2's driver/entries controls (see
 * SeatActionPopover's info-card-only behavior for these two types).
 */
export function convertSlotType(rows, slotId, newType, options = {}) {
  const next = cloneRows(rows);
  let target = null;

  for (const row of next) {
    const slot = row.slots.find((s) => s.id === slotId);
    if (slot) { target = slot; break; }
  }

  if (!target) throw new Error(`convertSlotType: slot ${slotId} not found`);
  if (target.type === 'DRIVER' || target.type === 'ENTRY') {
    throw new Error(`convertSlotType: ${target.type} slots cannot be converted here`);
  }

  if (newType === 'CONDUCTOR') {
    const { total_conductors } = recalculateTotals(next);
    if (total_conductors >= MAX_CONDUCTORS_INTERNAL) {
      throw new Error(`convertSlotType: maximum ${MAX_CONDUCTORS_INTERNAL} conductors reached`);
    }
    target.type = 'CONDUCTOR';
    target.custom_label = null;
    target.empty_zone_label = null;
  } else if (newType === 'EMPTY_ZONE') {
    target.type = 'EMPTY_ZONE';
    target.empty_zone_label = options.label || 'Custom';
    target.custom_label = null;
  } else if (newType === 'RESERVED') {
    target.type = 'RESERVED';
    target.empty_zone_label = null;
  } else if (newType === 'SEAT') {
    target.type = 'SEAT';
    target.empty_zone_label = null;
  } else {
    throw new Error(`convertSlotType: unsupported newType "${newType}"`);
  }

  return renumberSeats(next);
}

// Internal mirror of bus.constants.MAX_CONDUCTORS so this engine has zero
// import dependency on the Admin app's constants file (Partner/Consumer
// copies must not import from Admin's data layer). Keep this value in
// lockstep with bus.constants.js MAX_CONDUCTORS by hand — both are 6.
const MAX_CONDUCTORS_INTERNAL = 6;

// =====================================================================
// 6. recalculateTotals
// =====================================================================
/** Returns { total_seats, total_conductors } counted from rows[]. */
export function recalculateTotals(rows) {
  let total_seats = 0;
  let total_conductors = 0;

  for (const row of rows || []) {
    for (const slot of row.slots || []) {
      if (slot.type === 'SEAT') total_seats += 1;
      if (slot.type === 'CONDUCTOR') total_conductors += 1;
    }
  }

  return { total_seats, total_conductors };
}

// =====================================================================
// 7. validateLayout
// =====================================================================
/**
 * Returns { valid: boolean, errors: string[] }.
 * Checks:
 *   - total_rows between 5 and 20
 *   - driver appears exactly once, in row 1
 *   - each entry sits at position 0 of its declared row+side
 *   - no two entries (or an entry + driver) claim the same row+side
 *   - conductor count <= 6
 *   - every row has cols_left >= 1 and cols_right >= 1
 *   - bench mode only ever appears on the last row
 */
export function validateLayout(layout) {
  const errors = [];
  const rows = layout?.rows || [];

  if (!layout || rows.length === 0) {
    return { valid: false, errors: ['Layout has no rows.'] };
  }

  if (layout.total_rows < 5 || layout.total_rows > 20) {
    errors.push('Total rows must be between 5 and 20.');
  }

  // Driver check.
  const driverSlots = [];
  rows.forEach((row) => {
    row.slots.forEach((slot) => {
      if (slot.type === 'DRIVER') driverSlots.push({ row: row.row_number, side: slot.side, position: slot.position });
    });
  });
  if (driverSlots.length !== 1) {
    errors.push(`Expected exactly 1 driver slot, found ${driverSlots.length}.`);
  } else {
    const d = driverSlots[0];
    if (d.row !== 1) errors.push('Driver slot must be in row 1.');
    if (d.position !== 0) errors.push('Driver slot must be at position 0 (window-most).');
  }

  // Entry checks.
  const entrySlots = [];
  rows.forEach((row) => {
    row.slots.forEach((slot) => {
      if (slot.type === 'ENTRY') entrySlots.push({ row: row.row_number, side: slot.side, position: slot.position });
    });
  });
  entrySlots.forEach((e) => {
    if (e.position !== 0) errors.push(`Entry in row ${e.row} (${e.side}) must be at position 0.`);
  });
  const seenRowSide = new Set();
  [...driverSlots.map((d) => ({ ...d, kind: 'driver' })), ...entrySlots.map((e) => ({ ...e, kind: 'entry' }))]
    .forEach(({ row, side }) => {
      const key = `${row}:${side}`;
      if (seenRowSide.has(key)) {
        errors.push(`Row ${row} (${side}) has more than one driver/entry claiming position 0.`);
      }
      seenRowSide.add(key);
    });

  if ((layout.entries || []).length > 5) {
    errors.push('Maximum 5 entries allowed.');
  }

  // Conductor cap.
  const { total_conductors } = recalculateTotals(rows);
  if (total_conductors > MAX_CONDUCTORS_INTERNAL) {
    errors.push(`Maximum ${MAX_CONDUCTORS_INTERNAL} conductors allowed, found ${total_conductors}.`);
  }

  // Per-row column + bench checks.
  rows.forEach((row, idx) => {
    if (row.cols_left < 1) errors.push(`Row ${row.row_number}: cols_left must be at least 1.`);
    if (row.cols_right < 1) errors.push(`Row ${row.row_number}: cols_right must be at least 1.`);
    const isLast = idx === rows.length - 1;
    if (row.mode === 'BENCH' && !isLast) {
      errors.push(`Row ${row.row_number} is marked BENCH but is not the last row.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// =====================================================================
// 8. resolveEffectiveLayout — Partner daily overrides merged onto snapshot
// =====================================================================
/**
 * @param {object} snapshot - layout_config_snapshot (frozen v3 layout)
 * @param {object} dailyOverrides - route_schedules.daily_overrides JSONB
 * @param {string} dateString - ISO date, e.g. "2026-07-01"
 * @returns {object} effective layout for rendering — snapshot with today's
 *   deletions applied to the slot array, and reservedSlotIds flagged as
 *   type RESERVED for display. outOfServiceSlotIds are NOT mutated into
 *   the slot array — they're a seat_matrix_state concern (per-trip status)
 *   and are exposed separately as `outOfServiceSlotIds` on the return
 *   value so the caller can cross-reference them against seat_matrix_state.
 */
export function resolveEffectiveLayout(snapshot, dailyOverrides, dateString) {
  if (!snapshot) {
    return { schema_version: 3, total_rows: 0, driver_position: 'RIGHT', bench_position: 'MIDDLE', entries: [], rows: [], total_seats: 0, total_conductors: 0, outOfServiceSlotIds: [] };
  }

  // Defensive self-migration: if whatever called this skipped
  // migrateV2ToV3 (a bypassed adapter layer, a test harness feeding raw
  // data, a page still on old code), silently returning empty rows would
  // look exactly like "the chassis isn't rendering" with no error at all.
  // Self-heal here instead of trusting every caller to have migrated
  // first.
  const v3Snapshot = (snapshot.schema_version === 3 && Array.isArray(snapshot.rows))
    ? snapshot
    : migrateV2ToV3(snapshot);

  const todays = (dailyOverrides && dailyOverrides[dateString]) || {};
  const deletedSlotIds      = new Set(todays.deletedSlotIds || []);
  const outOfServiceSlotIds = todays.outOfServiceSlotIds || [];
  const reservedSlotIds     = new Set(todays.reservedSlotIds || []);

  let rows = cloneRows(v3Snapshot.rows || []);

  // Apply deletions.
  rows = rows.map((row) => ({
    ...row,
    slots: row.slots.filter((s) => !deletedSlotIds.has(s.id)),
  }));
  rows.forEach((row) => {
    compactSide(row, 'LEFT');
    compactSide(row, 'RIGHT');
    compactSide(row, 'MIDDLE');
    row.cols_left  = row.slots.filter((s) => s.side === 'LEFT').length;
    row.cols_right = row.slots.filter((s) => s.side === 'RIGHT').length;
  });

  // Apply reservations (display-only — does not touch the frozen snapshot).
  rows.forEach((row) => {
    row.slots.forEach((slot) => {
      if (reservedSlotIds.has(slot.id) && slot.type === 'SEAT') {
        slot.type = 'RESERVED';
      }
    });
  });

  rows = renumberSeats(rows);
  const totals = recalculateTotals(rows);

  return {
    schema_version: 3,
    total_rows: rows.length,
    driver_position: v3Snapshot.driver_position,
    bench_position: 'MIDDLE',
    entries: v3Snapshot.entries || [],
    rows,
    total_seats: totals.total_seats,
    total_conductors: totals.total_conductors,
    outOfServiceSlotIds, // caller cross-references against seat_matrix_state
  };
}

// =====================================================================
// 9. migrateV2ToV3 — legacy flat layout_config → v3 rows[].slots[]
// =====================================================================
/**
 * Converts the pre-v3 flat shape:
 *   { total_rows, cols_left, cols_right, has_rear_bench, bench_position,
 *     driver_position, entrance_side, entrance_row, front_rows,
 *     conductor_count, conductor_side, has_invalid_seat, invalid_seat_side }
 * into the explicit v3 { rows[].slots[] } shape. All slot IDs are freshly
 * generated stable UUIDs. Sequential numbers are assigned via
 * renumberSeats. front_rows (v2's legacy per-row override list) is
 * translated into ordinary v3 rows with the same slot composition.
 */
export function migrateV2ToV3(legacyLayout) {
  const legacy = legacyLayout || {};
  if (legacy.schema_version === 3 && Array.isArray(legacy.rows)) {
    // Already v3 — nothing to do.
    return legacy;
  }

  const {
    total_rows        = 11,
    cols_left         = 2,
    cols_right        = 3,
    has_rear_bench    = true,
    driver_position   = 'RIGHT',
    entrance_side     = 'NONE',
    entrance_row      = 1,
    front_rows        = [],
    conductor_count   = 0,
    conductor_side    = 'LEFT',
    has_invalid_seat  = false,
    invalid_seat_side = 'LEFT',
  } = legacy;

  const entries = entrance_side !== 'NONE'
    ? [{ id: makeId(), row: entrance_row, side: entrance_side }]
    : [];

  const rows = [];

  // Reservations: DRIVER (row 1) + the single legacy entry.
  const reservationsByRowSide = new Map();
  reservationsByRowSide.set(`1:${driver_position}`, 'DRIVER');
  if (entries.length > 0) {
    const key = `${entries[0].row}:${entries[0].side}`;
    if (!reservationsByRowSide.has(key)) reservationsByRowSide.set(key, 'ENTRY');
  }

  // Track how many legacy conductor / invalid seats still need placing —
  // legacy conductors/invalid seats only ever lived in row 1.
  let conductorsToPlace = conductor_count;
  let invalidToPlace = has_invalid_seat ? 1 : 0;

  const totalToRender = Math.max(front_rows.length, total_rows);

  for (let r = 1; r <= totalToRender; r += 1) {
    const isLast = r === totalToRender;
    const mode = isLast && has_rear_bench ? 'BENCH' : 'STANDARD';

    const buildSide = (side, colCount) => {
      const slots = [];
      const reservedType = reservationsByRowSide.get(`${r}:${side}`);

      for (let pos = 0; pos < colCount; pos += 1) {
        if (pos === 0 && reservedType) {
          slots.push(emptySlot({ side, position: 0, type: reservedType }));
          continue;
        }
        // Legacy row-1 conductor placement (matched original conductor_side).
        if (r === 1 && side === conductor_side && conductorsToPlace > 0) {
          slots.push(emptySlot({ side, position: pos, type: 'CONDUCTOR' }));
          conductorsToPlace -= 1;
          continue;
        }
        // Legacy row-1 invalid-seat → v3 RESERVED (closest v3 equivalent).
        if (r === 1 && side === invalid_seat_side && invalidToPlace > 0) {
          slots.push(emptySlot({ side, position: pos, type: 'RESERVED' }));
          invalidToPlace -= 1;
          continue;
        }
        slots.push(emptySlot({ side, position: pos, type: 'SEAT' }));
      }
      return slots;
    };

    const leftSlots  = buildSide('LEFT', cols_left);
    const rightSlots = buildSide('RIGHT', cols_right);

    let middleSlots = [];
    if (mode === 'BENCH') {
      middleSlots = [emptySlot({ side: 'MIDDLE', position: 0, type: 'SEAT' })];
    }

    rows.push({
      row_number: r,
      mode,
      cols_left,
      cols_right,
      bench_seat_count: mode === 'BENCH' ? 1 : 0,
      slots: [...leftSlots, ...middleSlots, ...rightSlots],
    });
  }

  const numberedRows = renumberSeats(rows);
  const totals = recalculateTotals(numberedRows);

  return {
    schema_version: 3,
    total_rows: totalToRender,
    driver_position,
    bench_position: 'MIDDLE',
    entries,
    rows: numberedRows,
    total_seats: totals.total_seats,
    total_conductors: totals.total_conductors,
  };
}
