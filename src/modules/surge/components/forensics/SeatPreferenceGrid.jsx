/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: SeatPreferenceGrid.jsx
 * * DESCRIPTION:
 * A high-fidelity heatmap visualizing passenger spatial preferences.
 * Translates raw booking telemetry into a 3x2 matrix (Front/Mid/Back x Window/Aisle)
 * to immediately reveal premium seat demand.
 * * WORLD-CLASS PHYSICS:
 * 1. RELATIVE HEAT SCALING: Automatically finds the highest-demand zone 
 * and scales the opacity of all other zones against it, ensuring the matrix 
 * always shows a clear "Hot Zone" regardless of overall volume.
 * 2. KINETIC HOVER: Cells expand slightly and reveal deep data (exact counts) 
 * on hover, keeping the default view clean and strictly percentage-based.
 * 3. FALLBACK GENERATION: If a specific zone has 0 bookings, the matrix 
 * gracefully renders an empty cool zone rather than breaking the CSS Grid layout.
 */

import React, { useMemo } from 'react';
import { LayoutGrid, Flame, Users, Info } from 'lucide-react';

const SeatPreferenceGrid = ({ seatHeatmap = [], totalBookings = 0, isLoading = false }) => {

    // ========================================================================
    // 1. MATHEMATICAL ENGINE (Heat Scaling & Matrix Resolution)
    // ========================================================================
    const { maxCount, hotZoneId } = useMemo(() => {
        if (!seatHeatmap || seatHeatmap.length === 0) return { maxCount: 1, hotZoneId: null };
        
        // The array is already sorted by the adapter, but we use Math.max for absolute safety
        const highest = Math.max(...seatHeatmap.map(d => d.count));
        const hotZone = seatHeatmap.find(d => d.count === highest)?.id;
        
        return { maxCount: highest, hotZoneId: hotZone };
    }, [seatHeatmap]);

    // Helper to extract a specific cell's data, or return a 0-state fallback
    const getCellData = (position, type) => {
        const id = `${position}_${type}`;
        const found = seatHeatmap.find(d => d.id === id);
        if (found) return found;
        
        return {
            id,
            count: 0,
            percentage: '0.0',
            typeLabel: type === 'WINDOW' ? 'Window Seat' : 'Aisle Seat',
            positionLabel: position === 'FRONT' ? 'Front Rows' : position === 'MID' ? 'Middle Rows' : 'Back Rows',
            color: 'var(--text-muted)'
        };
    };

    // ========================================================================
    // 2. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="forensics-card">
                <div className="card-header skeleton-pulse">
                    <div className="skeleton-icon" />
                    <div className="skeleton-text w-40" />
                </div>
                <div className="matrix-chassis skeleton-pulse">
                    <div className="skeleton-box h-120" />
                </div>
                <style>{`
                    .skeleton-pulse { animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-icon { width: 16px; height: 16px; border-radius: 4px; background: var(--bg-input); }
                    .skeleton-text { height: 14px; background: var(--bg-input); border-radius: 4px; }
                    .skeleton-box { width: 100%; background: var(--bg-input); border-radius: 12px; }
                    .w-40 { width: 40%; } .h-120 { height: 200px; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 3. RENDER CHASSIS
    // ========================================================================
    
    // Define the rigid structural axes of the bus
    const POSITIONS = ['FRONT', 'MID', 'BACK'];
    const TYPES = ['WINDOW', 'AISLE'];

    return (
        <div className="forensics-card">
            
            {/* --- HEADER --- */}
            <div className="card-header">
                <div className="header-titles">
                    <LayoutGrid size={16} className="text-muted" />
                    <h3>Spatial Demand Matrix</h3>
                </div>
                {hotZoneId && (
                    <div className="hot-zone-badge">
                        <Flame size={12} className="text-brand" />
                        <span>High Premium Demand</span>
                    </div>
                )}
            </div>

            {/* --- MATRIX GRID --- */}
            <div className="matrix-chassis">
                
                {/* Top Headers (Window | Aisle) */}
                <div className="matrix-top-axis">
                    <div className="axis-spacer"></div>
                    {TYPES.map(type => (
                        <div key={type} className="axis-label-col">
                            {type === 'WINDOW' ? 'Window' : 'Aisle'}
                        </div>
                    ))}
                </div>

                {/* The Rows */}
                {POSITIONS.map(pos => (
                    <div key={pos} className="matrix-row">
                        {/* Left Header (Front | Mid | Back) */}
                        <div className="axis-label-row">
                            {pos === 'FRONT' ? 'Front' : pos === 'MID' ? 'Middle' : 'Back'}
                        </div>

                        {/* The Heat Cells */}
                        {TYPES.map(type => {
                            const cell = getCellData(pos, type);
                            const isHotZone = cell.id === hotZoneId && cell.count > 0;
                            
                            // Math: Calculate relative heat (0.0 to 1.0) against the maximum count.
                            // We add a minimum base opacity (0.05) so 0-count cells still have a slight background
                            const relativeHeat = cell.count > 0 ? (cell.count / maxCount) : 0;
                            const dynamicOpacity = Math.max(0.05, relativeHeat * 0.8); // Cap at 80% to keep text readable

                            return (
                                <div 
                                    key={cell.id} 
                                    className={`heat-cell ${isHotZone ? 'hot-zone' : ''}`}
                                    style={{
                                        backgroundColor: `rgba(206, 172, 92, ${dynamicOpacity})`,
                                        borderColor: isHotZone ? 'var(--brand-primary)' : 'transparent'
                                    }}
                                >
                                    {isHotZone && <Flame size={16} className="absolute-flame" />}
                                    
                                    <div className="cell-content">
                                        <span className="cell-percentage">{cell.percentage}%</span>
                                        <div className="cell-raw-data">
                                            <Users size={10} />
                                            <span>{cell.count} tickets</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* --- CONTEXT FOOTER --- */}
            <div className="card-footer">
                <Info size={14} className="text-muted" />
                <p>Base sample size: <strong>{totalBookings}</strong> recent bookings. Use this heatmap to optimize seating configurations and premium pricing.</p>
            </div>

            {/* ========================================================================
                4. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- FORENSICS CARD CHASSIS --- */
                .forensics-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .forensics-card:hover {
                    box-shadow: 0 12px 24px rgba(0,0,0,0.03);
                    border-color: var(--border-strong);
                }

                /* --- HEADER --- */
                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-canvas);
                }
                .header-titles {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .header-titles h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-main);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .hot-zone-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(206, 172, 92, 0.1);
                    padding: 6px 12px;
                    border-radius: 100px;
                    border: 1px solid rgba(206, 172, 92, 0.3);
                }
                .hot-zone-badge span {
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--brand-primary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* --- MATRIX CHASSIS --- */
                .matrix-chassis {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* Top Axis (Window / Aisle) */
                .matrix-top-axis {
                    display: grid;
                    grid-template-columns: 60px 1fr 1fr; /* 60px for the row label spacer */
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .axis-spacer { width: 100%; }
                .axis-label-col {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* Rows (Front / Mid / Back) */
                .matrix-row {
                    display: grid;
                    grid-template-columns: 60px 1fr 1fr;
                    gap: 12px;
                    align-items: center;
                }
                .axis-label-row {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-align: right;
                    padding-right: 8px;
                }

                /* --- HEAT CELLS --- */
                .heat-cell {
                    position: relative;
                    height: 64px;
                    border-radius: 10px;
                    border: 1px solid transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: crosshair;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }
                
                /* The specific "Alpha" cell */
                .hot-zone {
                    box-shadow: 0 4px 16px rgba(206, 172, 92, 0.2);
                    z-index: 2;
                }
                .absolute-flame {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    color: var(--brand-primary);
                    opacity: 0.2;
                    transform: scale(3);
                    z-index: 0;
                }

                .cell-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .cell-percentage {
                    font-size: 18px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -0.5px;
                }

                .cell-raw-data {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    opacity: 0.8;
                }

                /* Kinetic Hover Effect */
                .heat-cell:hover {
                    transform: scale(1.02);
                    border-color: var(--border-strong) !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                    z-index: 10;
                }
                .heat-cell:hover .cell-raw-data {
                    color: var(--text-main);
                    opacity: 1;
                }

                /* --- FOOTER --- */
                .card-footer {
                    padding: 16px 24px;
                    background: var(--bg-input);
                    border-top: 1px solid var(--border-subtle);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .card-footer p {
                    margin: 0;
                    font-size: 12px;
                    color: var(--text-muted);
                    line-height: 1.4;
                }
                .card-footer strong { color: var(--text-main); font-weight: 800; }

                /* --- UTILS --- */
                .text-muted { color: var(--text-muted); }
                .text-brand { color: var(--brand-primary); }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 768px) {
                    .matrix-chassis { padding: 16px; }
                    .heat-cell { height: 56px; }
                    .cell-percentage { font-size: 16px; }
                    .hot-zone-badge span { display: none; } /* Hide text, keep flame on mobile */
                    .hot-zone-badge { padding: 6px; border-radius: 50%; }
                }
            `}</style>
        </div>
    );
};

export default SeatPreferenceGrid;