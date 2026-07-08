import React from 'react';
import { CircleDot, Info, CheckCircle2, AlertTriangle, DoorOpen, Lock, Wrench } from 'lucide-react';
import { SEAT_STATES, SEAT_DICTIONARY } from '../../data/seat.dictionary';

/**
 * SEAT MATRIX (Partner Portal — Dispatch Engine) — Schema v3 / Chassis Grammar v5
 * ------------------------------------------------------------------
 * REWRITTEN per Phase 1.5's shape-diff checklist. The old local
 * `buildChassisRows()` (~90 lines) is deleted entirely (Amendment 9).
 *
 * `schedule.layoutConfig` now arrives ALREADY RESOLVED — it is the
 * output of `resolveEffectiveLayout()`, called inside
 * `manifest.adapters.js`'s `adaptScheduleToManifest()`, not by this
 * component. This component is a pure renderer of `layoutConfig.rows[]`.
 *
 * Booking-state layering via SEAT_DICTIONARY is preserved exactly as
 * before — each bookable slot's derived key (see `seatKeyFor` below) is
 * used to look up its current status in `schedule.seat_matrix_state`.
 *
 * v5 changes (File 12, "worldclass dictionary pass"):
 *
 *   -  DELETED slot handling: an admin-deleted slot renders invisible,
 *      grid-preserving, non-clickable. Resets to SEAT only via admin's
 *      "Reset Manual Edits". This is the File 11 piece that got folded
 *      into File 12.
 *
 *   -  Dictionary is now byte-identical across admin/partner/consumer
 *      (see seat.dictionary.js sync-rule header). The colors rendered
 *      here are the EXACT same hex values consumers see when they
 *      load the same booking — partner and customer can no longer
 *      disagree on "what does a booked seat look like".
 *
 * v3 unchanges preserved: dictionary-driven visuals, two calling
 * conventions (schedule prop or flat props), SEAT_DICTIONARY legend.
 */

// ── Derive a display label from a v5 slot — prefers positional slot.label ──
const seatLabelFor = (slot) => {
  if (slot.type === 'SEAT' || slot.type === 'RESERVED') {
    return slot.label || slot.custom_label || (slot.number != null ? String(slot.number) : '');
  }
  if (slot.type === 'CONDUCTOR') return slot.conductor_label || '';
  if (slot.type === 'EMPTY_ZONE') return slot.empty_zone_label || '';
  return '';
};

// ── The key into seat_matrix_state — numeric/custom label string,
// preserved for backward compatibility with existing booked seats ──
const seatKeyFor = (slot) => seatLabelFor(slot);

const isBookable = (slot) => slot.type === 'SEAT'; // RESERVED is numbered but NOT bookable

// Sort a row's slots into ordered LEFT / MIDDLE / RIGHT groups.
const groupSlots = (row) => {
  const left   = row.slots.filter((s) => s.side === 'LEFT').sort((a, b) => a.position - b.position);
  const middle = row.slots.filter((s) => s.side === 'MIDDLE').sort((a, b) => a.position - b.position);
  // RIGHT side: position 0 = window-most = outer/rightmost physical seat.
  // Descending order matches seat.engine.js's numbering direction — see
  // that file's walkInOrder for the full explanation.
  const right  = row.slots.filter((s) => s.side === 'RIGHT').sort((a, b) => b.position - a.position);
  return { left, middle, right };
};

// ── SEAT NODE ──
// benchCount: number of seats in the MIDDLE group (rear bench), used to
// render a "N×" corner badge only when count > 1.
const SeatNode = ({ slot, isBench, benchCount, seatStateObj, outOfService, onSeatClick, isLocked }) => {
  // ── DELETED (v5 NEW — File 12) ────────────────────────────────────
  // Admin-side permanent delete. Renders invisible, grid space
  // preserved, no click. The delete is reversible only via admin's
  // "Reset Manual Edits" button (after-render snapshot restore).
  if (slot.type === 'DELETED') {
    return <div className="seat-node deleted" aria-hidden="true" />;
  }

  // Non-bookable, non-numbered cells.
  if (slot.type === 'DRIVER') {
    return (
      <div className="seat-node non-bookable" title="Driver">
        <CircleDot size={16} />
      </div>
    );
  }
  if (slot.type === 'CONDUCTOR') {
    return (
      <div className="seat-node non-bookable" title={`Conductor ${slot.conductor_label}`}>
        <span className="seat-number" style={{ fontSize: '10px' }}>{slot.conductor_label}</span>
      </div>
    );
  }
  if (slot.type === 'ENTRY') {
    return (
      <div className="seat-node entry-zone" title="Entrance / Door">
        <DoorOpen size={14} color="var(--status-success, #22C55E)" />
      </div>
    );
  }
  if (slot.type === 'EMPTY_ZONE') {
    return (
      <div className="seat-node empty-zone" title={slot.empty_zone_label || 'Empty Zone'}>
        <span className="seat-number" style={{ fontSize: '8px' }}>{slot.empty_zone_label}</span>
      </div>
    );
  }
  if (slot.type === 'RESERVED') {
    return (
      <div className="seat-node non-bookable reserved" title={`Reserved Seat ${seatLabelFor(slot)}`}>
        <Lock size={12} />
        <span className="seat-number" style={{ fontSize: '9px' }}>{seatLabelFor(slot)}</span>
      </div>
    );
  }

  // Bookable SEAT — status-driven.
  const seatId = seatKeyFor(slot);
  const status = outOfService ? SEAT_STATES.OUT_OF_SERVICE : (seatStateObj?.status || SEAT_STATES.AVAILABLE);
  const rule   = SEAT_DICTIONARY[status] || SEAT_DICTIONARY[SEAT_STATES.AVAILABLE];
  const isInteractive = rule.canOperatorMutate && !isLocked;

  return (
    <button
      className={`seat-node state-${status.toLowerCase()} ${isBench ? 'is-bench' : ''} ${isInteractive ? 'interactive' : 'seat-locked'}`}
      style={{
        backgroundColor: rule.color,
        borderColor:     rule.borderColor,
        color:           rule.textColor,
      }}
      onClick={(e) => {
        if (isInteractive) onSeatClick(seatId, status, e.currentTarget, slot);
      }}
      title={`${rule.label} — Seat ${seatId}`}
    >
      <span className="seat-number">{seatId}</span>
      {/* "N×" badge only when bench has more than one seat */}
      {isBench && benchCount > 1 && (
        <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, opacity: 0.7 }}>
          {benchCount}×
        </span>
      )}
      {status === SEAT_STATES.BOOKED_AYABUS  && <CheckCircle2 size={10} className="seat-icon" />}
      {status === SEAT_STATES.LOCKED_PENDING && <AlertTriangle size={10} className="seat-icon" />}
      {status === SEAT_STATES.OUT_OF_SERVICE && <Wrench size={10} className="seat-icon" />}
    </button>
  );
};

// ── MAIN ──
// Accepts EITHER calling convention:
//   <SeatMatrix schedule={scheduleObj} onSeatActionRequest={fn} isCutoffLocked={bool} />
//   <SeatMatrix scheduleId={id} layoutConfig={obj} tenantId={id} seatMatrixState={obj} />
// The second form is how ManifestSlideOver.jsx actually calls this
// component today — supporting it directly here means the two files
// don't have to be kept in perfect sync by hand.
const SeatMatrix = ({
  schedule,
  scheduleId,
  layoutConfig: flatLayoutConfig,
  tenantId,
  seatMatrixState: flatSeatMatrixState,
  onSeatActionRequest,
  isCutoffLocked,
}) => {
  // Already-resolved effective layout — see header note. No local call to
  // resolveEffectiveLayout() here; that happens upstream in
  // manifest.adapters.js's adaptScheduleToManifest().
  const layoutConfig = schedule?.layoutConfig || flatLayoutConfig || { rows: [] };
  const matrixState  = schedule?.seat_matrix_state || flatSeatMatrixState || {};
  const outOfServiceSet = new Set(layoutConfig.outOfServiceSlotIds || []);

  const rows = Array.isArray(layoutConfig.rows) ? layoutConfig.rows : [];

  // Never crash on click if the caller hasn't wired a handler yet — log
  // once instead, so this is visible in dev without breaking the UI.
  const handleSeatClick = onSeatActionRequest || ((seatId) => {
    console.warn('[SeatMatrix] Seat', seatId, 'clicked, but no onSeatActionRequest handler was provided.');
  });

  return (
    <div className="seat-matrix-engine">

      {/* LEGEND — driven by SEAT_DICTIONARY. If you add a new state to
          the dictionary, the legend picks it up automatically. */}
      <div className="matrix-legend">
        <div className="legend-title">
          <Info size={14} /> Matrix Telemetry
        </div>
        <div className="legend-items">
          {Object.values(SEAT_DICTIONARY).map((rule) => (
            <div key={rule.code} className="legend-pill">
              <div
                className="legend-color-box"
                style={{ backgroundColor: rule.color, borderColor: rule.borderColor }}
              />
              <span>{rule.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHASSIS VIEWPORT */}
      <div className="chassis-viewport">
        <div className="bus-chassis">
          <div className="cabin-seating">
            {rows.map((row) => {
              const { left, middle, right } = groupSlots(row);
              const isBenchRow = row.mode === 'BENCH';
              const benchCount = middle.length;
              const gridTemplate = isBenchRow
                ? `${'1fr '.repeat(row.cols_left)}${'0.9fr '.repeat(Math.max(middle.length, 1))}${'1fr '.repeat(row.cols_right)}`.trim()
                : `${'1fr '.repeat(row.cols_left)}44px ${'1fr '.repeat(row.cols_right)}`.trim();

              const renderSlot = (slot, isBench = false) => (
                <SeatNode
                  key={slot.id}
                  slot={slot}
                  isBench={isBench}
                  benchCount={benchCount}
                  seatStateObj={matrixState[seatKeyFor(slot)]}
                  outOfService={outOfServiceSet.has(slot.id)}
                  onSeatClick={handleSeatClick}
                  isLocked={isCutoffLocked}
                />
              );

              return (
                <div
                  key={`row-${row.row_number}`}
                  className="seating-row"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {left.map((s) => renderSlot(s))}
                  {isBenchRow
                    ? middle.map((s) => renderSlot(s, true))
                    : <div className="seat-node aisle" />}
                  {right.map((s) => renderSlot(s))}
                </div>
              );
            })}
          </div>
          <div className="cabin-rear" />
        </div>
      </div>

      <style>{`
        .seat-matrix-engine { display: flex; flex-direction: column; height: 100%; gap: 24px; }
        .matrix-legend { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 16px; }
        .legend-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .legend-items { display: flex; flex-wrap: wrap; gap: 16px; }
        .legend-pill { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-main); }
        .legend-color-box { width: 14px; height: 14px; border-radius: 4px; border: 1px solid; }

        .chassis-viewport { flex: 1; overflow: auto; background: var(--bg-canvas); border-radius: var(--radius-lg, 12px); border: 1px solid var(--border-subtle); padding: 32px 16px; display: flex; justify-content: center; }
        .bus-chassis { background: var(--bg-surface); border: 2px solid var(--border-strong); border-radius: 40px 40px 16px 16px; padding: 16px; width: fit-content; box-shadow: 0 20px 40px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 24px; }

        .cabin-seating { display: flex; flex-direction: column; gap: 12px; padding: 0 16px; }
        .seating-row { display: grid; gap: 12px; justify-content: center; }

        .seat-node { width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; border: 2px solid; font-size: 14px; font-weight: 900; position: relative; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .seat-node.aisle { width: 32px; border: none; background: transparent; box-shadow: none; }

        /* DELETED (v5 NEW — File 12) — invisible, grid space preserved,
           no click, no legend item (since it's invisible to users). */
        .seat-node.deleted {
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          box-shadow: none;
          opacity: 0;
          pointer-events: none;
        }

        .seat-node.empty-zone { border: 2px dashed var(--border-subtle); background: transparent; box-shadow: none; color: var(--text-muted); }
        .seat-node.non-bookable { background: var(--bg-input); border-color: var(--text-main); color: var(--text-main); cursor: default; opacity: 0.7; }
        .seat-node.non-bookable.reserved { border-color: var(--status-warning, #F59E0B); color: var(--status-warning, #F59E0B); opacity: 1; gap: 1px; }
        .seat-node.entry-zone { background: rgba(34,197,94,0.07); border-color: var(--status-success, #22C55E); border-left-width: 4px; cursor: default; }
        .seat-node.is-bench { border-color: var(--status-warning, #F59E0B); }
        .seat-node.interactive { cursor: pointer; }
        .seat-node.interactive:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); filter: brightness(1.1); }
        .seat-node.interactive:active { transform: translateY(1px); }
        .seat-node.seat-locked { cursor: not-allowed; opacity: 0.8; }
        .seat-icon { position: absolute; top: -6px; right: -6px; background: inherit; border-radius: 50%; padding: 2px; box-sizing: content-box; border: 2px solid var(--bg-surface); }

        .cabin-rear { height: 16px; border-top: 2px solid var(--border-subtle); margin-top: 8px; }

        @media (prefers-reduced-motion: reduce) {
          .seat-node { transition: none !important; }
        }
      `}</style>
    </div>
  );
};

export default SeatMatrix;
