/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / Interactive
 * File: SeatMatrix.jsx
 * * DESCRIPTION:
 * The interactive digital twin of the physical bus layout. 
 * Reads the strict 4-state SEAT_DICTIONARY to render realtime 
 * financial and dispatch availability.
 * * PHYSICS:
 * Dynamically generates seating grids (2x2, 2x1, etc.).
 * Fully responsive: scales down on small screens, scrolls smoothly 
 * on massive configurations (e.g., 70+ seater buses).
 */

import React, { useMemo } from 'react';
import { CircleDot, Info, CheckCircle2, AlertTriangle, Armchair } from 'lucide-react';
import { SEAT_STATES, SEAT_DICTIONARY } from '../../data/seat.dictionary';

// ========================================================================
// HELPER PHYSICS: BUS GRID GENERATOR
// ========================================================================
/**
 * Real-world buses don't have perfect grids. This intelligent engine 
 * generates a structured array representing physical seat locations.
 */
const generateBusChassis = (capacity = 60, layoutType = '2x2') => {
    let leftSide = 2;
    let rightSide = 2;

    if (layoutType === '2x1') { leftSide = 2; rightSide = 1; }
    if (layoutType === '1x2') { leftSide = 1; rightSide = 2; }
    if (layoutType === '1x1') { leftSide = 1; rightSide = 1; }

    const rows = [];
    let currentSeatNumber = 1;

    // Build the rows until we hit capacity
    while (currentSeatNumber <= capacity) {
        const row = [];
        
        // 1. Left Column(s)
        for (let l = 0; l < leftSide; l++) {
            if (currentSeatNumber <= capacity) row.push(currentSeatNumber++);
            else row.push(null); // Empty physical space if capacity reached
        }
        
        // 2. The Aisle (Always present in standard buses)
        row.push('AISLE');
        
        // 3. Right Column(s)
        for (let r = 0; r < rightSide; r++) {
            if (currentSeatNumber <= capacity) row.push(currentSeatNumber++);
            else row.push(null);
        }
        
        rows.push(row);
    }

    return rows;
};

// ========================================================================
// THE NODE: INDIVIDUAL SEAT PHYSICS
// ========================================================================
const SeatNode = ({ seatId, seatStateObj, onSeatClick, isLocked }) => {
    // If the seat doesn't physically exist in this slot, render empty space
    if (!seatId || seatId === 'AISLE') {
        return <div className={`seat-node ${seatId === 'AISLE' ? 'aisle' : 'empty-space'}`} />;
    }

    // Determine State (Fallback to AVAILABLE if not in matrix)
    const status = seatStateObj?.status || SEAT_STATES.AVAILABLE;
    const dictionaryRule = SEAT_DICTIONARY[status];
    
    // An operator cannot click a seat if the market is closed (locked) OR if the dictionary forbids it
    const isInteractive = dictionaryRule.canOperatorMutate && !isLocked;

    return (
        <button
            className={`seat-node state-${status.toLowerCase()} ${isInteractive ? 'interactive' : 'locked'}`}
            style={{
                backgroundColor: dictionaryRule.color,
                borderColor: dictionaryRule.borderColor,
                color: dictionaryRule.textColor,
            }}
            onClick={(e) => {
                if (isInteractive) onSeatClick(seatId, status, e.currentTarget);
            }}
            title={`${dictionaryRule.label} - Seat ${seatId}`}
        >
            <span className="seat-number">{seatId}</span>
            {/* Visual Indicators for specific states */}
            {status === SEAT_STATES.BOOKED_AYABUS && <CheckCircle2 size={10} className="seat-icon" />}
            {status === SEAT_STATES.LOCKED_PENDING && <AlertTriangle size={10} className="seat-icon" />}
        </button>
    );
};

// ========================================================================
// MAIN COMPONENT: THE SEAT MATRIX
// ========================================================================
const SeatMatrix = ({ schedule, onSeatActionRequest, isCutoffLocked }) => {
    // 1. Extract Vehicle Telemetry
    const capacity = schedule?.total_capacity || 60;
    const layoutType = schedule?.vehicle?.seat_layout_type || '2x2';
    const matrixState = schedule?.seat_matrix_state || {};

    // 2. Generate the physical chassis grid (Memoized for high performance)
    const chassisGrid = useMemo(() => generateBusChassis(capacity, layoutType), [capacity, layoutType]);

    return (
        <div className="seat-matrix-engine">
            
            {/* --- TOP: THE DYNAMIC LEGEND --- */}
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

            {/* --- BODY: THE PHYSICAL BUS CHASSIS --- */}
            <div className="chassis-viewport">
                <div className="bus-chassis">
                    
                    {/* The Front Cabin (Driver Orientation) */}
                    <div className="cabin-front">
                        <div className="windshield" />
                        <div className="driver-zone">
                            <CircleDot size={24} color="var(--text-muted)" />
                            <span className="driver-label">Captain</span>
                        </div>
                        <div className="door-zone">Entrance</div>
                    </div>

                    {/* The Passenger Cabin */}
                    <div className="cabin-seating">
                        {chassisGrid.map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="seating-row">
                                {row.map((seatId, colIndex) => (
                                    <SeatNode 
                                        key={`seat-${rowIndex}-${colIndex}`}
                                        seatId={seatId}
                                        seatStateObj={matrixState[seatId]}
                                        onSeatClick={onSeatActionRequest}
                                        isLocked={isCutoffLocked}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* The Rear Engine/Boot space */}
                    <div className="cabin-rear"></div>
                </div>
            </div>

            {/* --- INJECTED PHYSICS STYLESHEET --- */}
            <style>{`
                .seat-matrix-engine {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    gap: 24px;
                }

                /* ==================== THE LEGEND ==================== */
                .matrix-legend {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: 16px;
                }
                .legend-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }
                .legend-items {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .legend-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .legend-color-box {
                    width: 14px;
                    height: 14px;
                    border-radius: 4px;
                    border: 1px solid;
                }

                /* ==================== THE VIEWPORT & CHASSIS ==================== */
                .chassis-viewport {
                    flex: 1;
                    overflow: auto; /* Handles massive buses natively */
                    background: var(--bg-canvas);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-subtle);
                    padding: 32px 16px;
                    display: flex;
                    justify-content: center; /* Centers the bus horizontally */
                }

                .bus-chassis {
                    background: var(--bg-surface);
                    border: 2px solid var(--border-strong);
                    border-radius: 40px 40px 16px 16px; /* Bus shape */
                    padding: 16px;
                    width: fit-content;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* --- FRONT CABIN --- */
                .cabin-front {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px 24px;
                    border-bottom: 2px dashed var(--border-subtle);
                    position: relative;
                }
                .windshield {
                    position: absolute;
                    top: -16px; left: 10%; right: 10%;
                    height: 8px;
                    background: var(--bg-input);
                    border-radius: 0 0 10px 10px;
                }
                .driver-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .driver-label { font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
                .door-zone {
                    font-size: 10px; font-weight: 800; color: var(--text-muted);
                    padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: 4px;
                }

                /* --- SEATING CABIN --- */
                .cabin-seating {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 0 16px;
                }
                .seating-row {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                /* --- SEAT NODES --- */
                .seat-node {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 2px solid;
                    font-size: 14px;
                    font-weight: 900;
                    position: relative;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                
                /* AISLE / EMPTY SPACE */
                .seat-node.aisle { width: 32px; border: none; background: transparent; box-shadow: none; }
                .seat-node.empty-space { border: none; background: transparent; box-shadow: none; pointer-events: none; }

                /* INTERACTIVITY PHYSICS */
                .seat-node.interactive { cursor: pointer; }
                .seat-node.interactive:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); filter: brightness(1.1); }
                .seat-node.interactive:active { transform: translateY(1px); }
                .seat-node.locked { cursor: not-allowed; opacity: 0.8; }

                /* ICONS ON SEATS */
                .seat-icon { position: absolute; top: -6px; right: -6px; background: inherit; border-radius: 50%; padding: 2px; box-sizing: content-box; border: 2px solid var(--bg-surface); }

                /* --- REAR CABIN --- */
                .cabin-rear { height: 16px; border-top: 2px solid var(--border-subtle); margin-top: 8px; }
            `}</style>
        </div>
    );
};

export default SeatMatrix;