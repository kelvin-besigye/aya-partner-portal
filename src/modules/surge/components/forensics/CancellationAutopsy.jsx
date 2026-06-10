/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: CancellationAutopsy.jsx
 * * DESCRIPTION:
 * The Friction Diagnostics panel. Visualizes exactly WHY revenue was lost 
 * (Cancellation Reasons) and WHAT assets were affected (Bus Classes).
 * * WORLD-CLASS PHYSICS:
 * 1. NATIVE SVG DONUT ENGINE: Generates flawless, interactive pie charts 
 * using raw stroke-dasharray mathematics. Zero external dependencies, 
 * perfectly responsive, and naturally respects Light/Dark DOM modes.
 * 2. PERFECT RETENTION STATE: If there are 0 cancellations, it renders a 
 * "Zero Friction" success state to positively reinforce the operator.
 * 3. KINETIC LEGEND: Hovering over the legend metrics subtly highlights 
 * the exact data row, creating a tactile B2B data-prospecting experience.
 */

import React from 'react';
import { 
    PieChart, ShieldAlert, Activity, 
    CheckCircle2, AlertTriangle, Bus 
} from 'lucide-react';

// ========================================================================
// 1. NATIVE SVG DONUT COMPONENT (The Zero-Dependency Chart Engine)
// ========================================================================
const SovereignDonut = ({ data, total }) => {
    let currentOffset = 25; // Starts the SVG circle exactly at 12 o'clock

    return (
        <div className="sovereign-donut-container">
            <svg viewBox="0 0 42 42" className="donut-svg">
                {/* Background Ring */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--bg-input)" strokeWidth="4"></circle>
                
                {/* Data Arcs */}
                {data.map((slice, index) => {
                    // SVG Math: r=15.915 gives exactly a 100-unit circumference.
                    const percent = parseFloat(slice.percentage);
                    if (percent === 0) return null;
                    
                    const offset = currentOffset;
                    currentOffset -= percent; // Shift the starting point for the next arc
                    
                    return (
                        <circle 
                            key={index}
                            cx="21" cy="21" r="15.91549430918954" 
                            fill="transparent" 
                            stroke={slice.config.color} 
                            strokeWidth="4"
                            strokeDasharray={`${percent} ${100 - percent}`}
                            strokeDashoffset={offset}
                            className="donut-arc"
                        ></circle>
                    );
                })}
            </svg>
            <div className="donut-center-telemetry">
                <span className="donut-total">{total}</span>
                <span className="donut-label">Lost</span>
            </div>
        </div>
    );
};

// ========================================================================
// 2. MAIN AUTOPSY CHASSIS
// ========================================================================
const CancellationAutopsy = ({ frictionData, isLoading = false }) => {
    // 1. Data Fallbacks
    const safeData = frictionData || { totalCancellations: 0, reasons: [], classes: [] };
    const { totalCancellations, reasons, classes } = safeData;

    // ========================================================================
    // 3. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="forensics-card autopsy-chassis">
                <div className="card-header skeleton-pulse">
                    <div className="skeleton-icon" />
                    <div className="skeleton-text w-30" />
                </div>
                <div className="autopsy-grid">
                    <div className="autopsy-column skeleton-pulse">
                        <div className="skeleton-donut" />
                        <div className="skeleton-list">
                            <div className="skeleton-list-item" /><div className="skeleton-list-item w-80" />
                        </div>
                    </div>
                </div>
                <style>{`
                    .skeleton-pulse { animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-icon { width: 16px; height: 16px; border-radius: 4px; background: var(--bg-input); }
                    .skeleton-text { height: 14px; background: var(--bg-input); border-radius: 4px; }
                    .skeleton-donut { width: 140px; height: 140px; border-radius: 50%; border: 16px solid var(--bg-input); margin: 0 auto; }
                    .skeleton-list-item { height: 24px; background: var(--bg-input); border-radius: 6px; margin-bottom: 12px; }
                    .w-30 { width: 30%; } .w-80 { width: 80%; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 4. THE RENDER ENGINE
    // ========================================================================
    return (
        <div className="forensics-card autopsy-chassis">
            
            {/* --- HEADER --- */}
            <div className="card-header">
                <div className="header-titles">
                    <Activity size={16} className="text-danger" />
                    <h3>Friction & Cancellation Autopsy</h3>
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="autopsy-body">
                
                {/* ZERO FRICTION SUCCESS STATE */}
                {totalCancellations === 0 ? (
                    <div className="perfect-retention-state">
                        <div className="retention-icon-ring">
                            <CheckCircle2 size={32} className="text-success" />
                        </div>
                        <h4>Perfect Passenger Retention</h4>
                        <p>No cancellations recorded in the active temporal period. The operational network is running with zero friction.</p>
                    </div>
                ) : (
                    /* THE DIAGNOSTIC GRID */
                    <div className="autopsy-grid">
                        
                        {/* LEFT: THE 'WHY' (Reasons) */}
                        <div className="autopsy-column">
                            <div className="column-title">
                                <ShieldAlert size={14} className="text-muted" />
                                <span>Why Passengers Abort</span>
                            </div>
                            
                            <SovereignDonut data={reasons} total={totalCancellations} />
                            
                            <div className="telemetry-legend">
                                {reasons.map((item, idx) => {
                                    const Icon = item.config.Icon || AlertTriangle;
                                    return (
                                        <div key={idx} className="legend-row">
                                            <div className="legend-identity">
                                                <div className="color-dot" style={{ backgroundColor: item.config.color }} />
                                                <Icon size={14} className="text-muted" />
                                                <span className="legend-label">{item.config.label}</span>
                                            </div>
                                            <div className="legend-metrics">
                                                <span className="metric-count">{item.count}</span>
                                                <span className="metric-percent">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: THE 'WHAT' (Bus Classes) */}
                        <div className="autopsy-column border-left-split">
                            <div className="column-title">
                                <Bus size={14} className="text-muted" />
                                <span>Affected Assets</span>
                            </div>
                            
                            <SovereignDonut data={classes} total={totalCancellations} />
                            
                            <div className="telemetry-legend">
                                {classes.map((item, idx) => {
                                    const Icon = item.config.Icon || Bus;
                                    return (
                                        <div key={idx} className="legend-row">
                                            <div className="legend-identity">
                                                <div className="color-dot" style={{ backgroundColor: item.config.color }} />
                                                <Icon size={14} className="text-muted" />
                                                <span className="legend-label">{item.config.label}</span>
                                            </div>
                                            <div className="legend-metrics">
                                                <span className="metric-count">{item.count}</span>
                                                <span className="metric-percent">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- BASE CHASSIS --- */
                /* Inherits .forensics-card and .card-header from SeatPreferenceGrid globally or structurally */
                .autopsy-chassis {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-canvas);
                }
                .header-titles { display: flex; align-items: center; gap: 10px; }
                .header-titles h3 { margin: 0; font-size: 14px; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }

                /* --- AUTOPSY GRID --- */
                .autopsy-body { padding: 24px; }
                .autopsy-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }
                .border-left-split {
                    padding-left: 32px;
                    border-left: 1px dashed var(--border-subtle);
                }

                .column-title {
                    display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px;
                    font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;
                }

                /* --- NATIVE SVG DONUT --- */
                .sovereign-donut-container {
                    position: relative; width: 140px; height: 140px; margin: 0 auto 32px auto;
                }
                .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); /* Start at 12 o'clock naturally */ }
                .donut-arc {
                    transition: stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .donut-arc:hover { stroke-width: 5; filter: brightness(1.2); cursor: crosshair; }

                .donut-center-telemetry {
                    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
                }
                .donut-total { font-family: monospace; font-size: 28px; font-weight: 900; color: var(--text-main); letter-spacing: -1px; line-height: 1; }
                .donut-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

                /* --- KINETIC LEGEND --- */
                .telemetry-legend { display: flex; flex-direction: column; gap: 12px; }
                .legend-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 8px 12px; border-radius: 8px; border: 1px solid transparent;
                    background: var(--bg-canvas); transition: all 0.2s; cursor: default;
                }
                .legend-row:hover { background: var(--bg-input); border-color: var(--border-strong); transform: translateX(2px); }
                
                .legend-identity { display: flex; align-items: center; gap: 10px; }
                .color-dot { width: 8px; height: 8px; border-radius: 50%; }
                .legend-label { font-size: 13px; font-weight: 700; color: var(--text-main); }

                .legend-metrics { display: flex; align-items: center; gap: 12px; }
                .metric-count { font-size: 13px; font-weight: 800; color: var(--text-main); }
                .metric-percent { font-family: monospace; font-size: 12px; font-weight: 700; color: var(--text-muted); width: 40px; text-align: right; }

                /* --- SUCCESS STATE --- */
                .perfect-retention-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px;
                }
                .retention-icon-ring {
                    width: 72px; height: 72px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); border: 1px dashed rgba(34, 197, 94, 0.3);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
                }
                .perfect-retention-state h4 { margin: 0 0 8px 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .perfect-retention-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* --- UTILS --- */
                .text-danger { color: var(--status-danger); }
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1024px) {
                    .autopsy-grid { grid-template-columns: 1fr; gap: 40px; }
                    .border-left-split { padding-left: 0; border-left: none; padding-top: 40px; border-top: 1px dashed var(--border-subtle); }
                }
            `}</style>
        </div>
    );
};

export default CancellationAutopsy;