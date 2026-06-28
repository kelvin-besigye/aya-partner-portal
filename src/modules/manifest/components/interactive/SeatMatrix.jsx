import React, { useMemo } from 'react';
import { CircleDot, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SEAT_STATES, SEAT_DICTIONARY } from '../../data/seat.dictionary';

/**
 * SEAT MATRIX (Partner Portal — Dispatch Engine)
 * ------------------------------------------------------------------
 * Ported to the PROVEN v2 buildChassisRows algorithm. Identical signature
 * to Admin ChassisCanvas.jsx — same source of truth, same layout_config.
 *
 * The booking-state layering via SEAT_DICTIONARY is preserved — each
 * bookable slot's label (e.g. '1A', 'M', 'SS1') is used as the key into
 * schedule.seat_matrix_state to look up its current status.
 *
 * v2 fields read: driver_position, entrance_side, entrance_row,
 *                 bench_position, conductor_count, has_invalid_seat
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * THE PROVEN ALGORITHM (v2) — IDENTICAL to Admin's ChassisCanvas.jsx.
 * Keep these two implementations in lockstep when tweaking the grammar.
 */
export function buildChassisRows(layout) {
  const {
    total_rows        = 11,
    cols_left         = 2,
    cols_right        = 3,
    has_rear_bench    = true,
    bench_position    = 'MIDDLE',
    driver_position   = 'RIGHT',
    entrance_side     = 'NONE',
    entrance_row      = 1,
    front_rows        = [],
    conductor_count   = 0,
    conductor_side    = 'LEFT',
    has_invalid_seat  = false,
    invalid_seat_side = 'LEFT',
  } = layout || {};

  const rows = [];
  let rowNumber = 1;
  let conductorCounter = 0;

  const isEntranceRow = (r) => entrance_side !== 'NONE' && r === entrance_row;
  const isDriverRow   = (r) => r === 1;

  for (const row of front_rows) {
    const leftArr  = Array.isArray(row.left)  ? row.left  : [];
    const rightArr = Array.isArray(row.right) ? row.right : [];

    const labelSlot = (slot) => {
      if (slot.type === 'SEAT') {
        const idx = (side, target) => {
          const arr = side === 'left' ? leftArr : rightArr;
          return arr.slice(0, arr.indexOf(target)).filter(s => s.type === 'SEAT').length;
        };
        return {
          type: 'SEAT',
          label: `${rowNumber}${ALPHABET[
            (slot === leftArr.find(s => s === slot)
              ? idx('left', slot)
              : idx('right', slot))] || '?'}`,
          bookable: true,
        };
      }
      if (slot.type === 'CONDUCTOR') {
        conductorCounter++;
        return { type: 'CONDUCTOR', label: `SS${conductorCounter}`, bookable: false };
      }
      if (slot.type === 'DRIVER')  return { type: 'DRIVER',  label: null, bookable: false };
      if (slot.type === 'ENTRY')   return { type: 'ENTRY',   label: 'E',  bookable: false };
      if (slot.type === 'INVALID') return { type: 'INVALID', label: '1X', bookable: false };
      return { type: 'UNKNOWN', label: '?', bookable: false };
    };

    rows.push({
      left:    leftArr.map(labelSlot),
      middle:  [{ type: 'AISLE', label: null, bookable: false }],
      right:   rightArr.map(labelSlot),
      isFrontRow: true,
      isBench: false,
      isDriverRow: true,
      isEntranceRow: false,
    });
    rowNumber++;
  }

  const startRow = front_rows.length > 0 ? front_rows.length + 1 : 1;
  const totalToRender = Math.max(startRow - 1, total_rows);

  for (let r = startRow; r <= totalToRender; r++) {
    const isLast = r === totalToRender;
    const isBench = isLast && has_rear_bench;
    const isDriverR   = isDriverRow(r);
    const isEntranceR = isEntranceRow(r);
    const isCollision = isDriverR && isEntranceR;

    const left = [];
    const right = [];
    const middle = [];

    // LEFT
    if (isCollision && entrance_side === 'LEFT') {
      left.push({ type: 'DRIVER', label: null, bookable: false });
    } else if (isCollision && entrance_side !== 'LEFT') {
      left.push({ type: 'ENTRY', label: 'E', bookable: false });
    } else if (isDriverR && driver_position === 'LEFT') {
      left.push({ type: 'DRIVER', label: null, bookable: false });
    } else if (isEntranceR && entrance_side === 'LEFT') {
      left.push({ type: 'ENTRY', label: 'E', bookable: false });
    } else if (r === 1 && front_rows.length === 0) {
      if (conductor_side === 'LEFT' && conductor_count > 0) {
        const maxC = Math.min(conductor_count, cols_left);
        for (let i = 0; i < maxC; i++) {
          left.push({ type: 'CONDUCTOR', label: `SS${++conductorCounter}`, bookable: false });
        }
      }
      if (has_invalid_seat && invalid_seat_side === 'LEFT' && left.length < cols_left) {
        left.push({ type: 'INVALID', label: '1X', bookable: false });
      }
      let letterIdx = left.filter(s => s.type === 'SEAT').length;
      while (left.length < cols_left) {
        left.push({ type: 'SEAT', label: `${rowNumber}${ALPHABET[letterIdx] || '?'}`, bookable: true });
        letterIdx++;
      }
    } else {
      for (let c = 0; c < cols_left; c++) {
        left.push({ type: 'SEAT', label: `${rowNumber}${ALPHABET[c] || '?'}`, bookable: true });
      }
    }

    // RIGHT
    if (isCollision && entrance_side === 'RIGHT') {
      right.push({ type: 'DRIVER', label: null, bookable: false });
    } else if (isCollision && entrance_side !== 'RIGHT') {
      right.push({ type: 'ENTRY', label: 'E', bookable: false });
    } else if (isDriverR && driver_position === 'RIGHT') {
      right.push({ type: 'DRIVER', label: null, bookable: false });
    } else if (isEntranceR && entrance_side === 'RIGHT') {
      right.push({ type: 'ENTRY', label: 'E', bookable: false });
    } else if (r === 1 && front_rows.length === 0) {
      if (conductor_side === 'RIGHT' && conductor_count > 0) {
        const maxC = Math.min(conductor_count, cols_right);
        for (let i = 0; i < maxC; i++) {
          right.push({ type: 'CONDUCTOR', label: `SS${++conductorCounter}`, bookable: false });
        }
      }
      if (has_invalid_seat && invalid_seat_side === 'RIGHT' && right.length < cols_right) {
        right.push({ type: 'INVALID', label: '1X', bookable: false });
      }
      let letterIdx = right.filter(s => s.type === 'SEAT').length;
      while (right.length < cols_right) {
        right.push({ type: 'SEAT', label: `${rowNumber}${ALPHABET[letterIdx] || '?'}`, bookable: true });
        letterIdx++;
      }
    } else {
      for (let c = 0; c < cols_right; c++) {
        right.push({ type: 'SEAT', label: `${rowNumber}${ALPHABET[c] || '?'}`, bookable: true });
      }
    }

    // MIDDLE
    if (isBench && bench_position === 'MIDDLE') {
      middle.push({ type: 'REAR_MIDDLE', label: 'M', bookable: true });
    } else if (isBench && bench_position === 'RIGHT') {
      right.length = 0;
      right.push({ type: 'REAR_MIDDLE', label: 'M', bookable: true });
      middle.push({ type: 'AISLE', label: null, bookable: false });
    } else {
      middle.push({ type: 'AISLE', label: null, bookable: false });
    }

    rows.push({
      left,
      middle,
      right,
      isFrontRow: r === 1 && front_rows.length === 0,
      isBench,
      isDriverRow: isDriverR,
      isEntranceRow: isEntranceR,
      rowNumber,
    });
    rowNumber++;
  }

  return rows;
}

// ── SEAT NODE ──
const SeatNode = ({ slot, seatStateObj, onSeatClick, isLocked }) => {
  // Non-bookable cells
  if (!slot.bookable) {
    if (slot.type === 'AISLE') return <div className="seat-node aisle" />;
    if (slot.type === 'DRIVER') {
      return (
        <div className="seat-node non-bookable" title="Driver">
          <CircleDot size={16} />
        </div>
      );
    }
    if (slot.type === 'CONDUCTOR') {
      return (
        <div className="seat-node non-bookable" title={`Conductor ${slot.label}`}>
          <span className="seat-number" style={{ fontSize: '10px' }}>{slot.label}</span>
        </div>
      );
    }
    if (slot.type === 'ENTRY') {
      return (
        <div className="seat-node entry-zone" title="Entrance / Door">
          <span className="seat-number" style={{ fontSize: '9px', color: 'var(--status-success, #22C55E)' }}>E</span>
        </div>
      );
    }
    if (slot.type === 'INVALID') {
      return (
        <div className="seat-node non-bookable" title="Invalid / Wheelchair">
          <span className="seat-number" style={{ fontSize: '9px' }}>1X</span>
        </div>
      );
    }
    return <div className="seat-node empty-space" />;
  }

  const seatId = slot.label;
  const status = seatStateObj?.status || SEAT_STATES.AVAILABLE;
  const rule   = SEAT_DICTIONARY[status] || SEAT_DICTIONARY[SEAT_STATES.AVAILABLE];
  const isInteractive = rule.canOperatorMutate && !isLocked;

  return (
    <button
      className={`seat-node state-${status.toLowerCase()} ${isInteractive ? 'interactive' : 'seat-locked'}`}
      style={{
        backgroundColor: rule.color,
        borderColor:     rule.borderColor,
        color:           rule.textColor,
      }}
      onClick={(e) => {
        if (isInteractive) onSeatClick(seatId, status, e.currentTarget);
      }}
      title={`${rule.label} — Seat ${seatId}`}
    >
      <span className="seat-number">{seatId}</span>
      {slot.type === 'REAR_MIDDLE' && <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, opacity: 0.7 }}>M</span>}
      {status === SEAT_STATES.BOOKED_AYABUS  && <CheckCircle2 size={10} className="seat-icon" />}
      {status === SEAT_STATES.LOCKED_PENDING && <AlertTriangle size={10} className="seat-icon" />}
    </button>
  );
};

// ── MAIN ──
const SeatMatrix = ({ schedule, onSeatActionRequest, isCutoffLocked }) => {
  const layoutConfig  = schedule?.layoutConfig  || {};
  const matrixState   = schedule?.seat_matrix_state || {};

  const colsLeft  = layoutConfig.cols_left  ?? 2;
  const colsRight = layoutConfig.cols_right ?? 2;

  const chassisRows = useMemo(
    () => buildChassisRows(layoutConfig),
    [layoutConfig]
  );

  const gridTemplate =
    `${'1fr '.repeat(colsLeft)}44px ${'1fr '.repeat(colsRight)}`.trim();

  return (
    <div className="seat-matrix-engine">

      {/* LEGEND */}
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
            {chassisRows.map((row, rowIdx) => {
              const allSlots = [...row.left, ...row.middle, ...row.right];
              return (
                <div
                  key={`row-${rowIdx}`}
                  className="seating-row"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {allSlots.map((slot, si) => (
                    <SeatNode
                      key={si}
                      slot={slot}
                      seatStateObj={matrixState[slot.label]}
                      onSeatClick={onSeatActionRequest}
                      isLocked={isCutoffLocked}
                    />
                  ))}
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
        .seat-node.empty-space { border: none; background: transparent; box-shadow: none; pointer-events: none; }
        .seat-node.non-bookable { background: var(--bg-input); border-color: var(--text-main); color: var(--text-main); cursor: default; opacity: 0.7; }
        .seat-node.entry-zone { background: rgba(34,197,94,0.07); border-color: var(--status-success, #22C55E); border-left-width: 4px; cursor: default; }
        .seat-node.interactive { cursor: pointer; }
        .seat-node.interactive:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); filter: brightness(1.1); }
        .seat-node.interactive:active { transform: translateY(1px); }
        .seat-node.seat-locked { cursor: not-allowed; opacity: 0.8; }
        .seat-icon { position: absolute; top: -6px; right: -6px; background: inherit; border-radius: 50%; padding: 2px; box-sizing: content-box; border: 2px solid var(--bg-surface); }

        .cabin-rear { height: 16px; border-top: 2px solid var(--border-subtle); margin-top: 8px; }
      `}</style>
    </div>
  );
};

export default SeatMatrix;