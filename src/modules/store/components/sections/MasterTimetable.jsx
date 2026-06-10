/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Vaults
 * File: MasterTimetable.jsx
 * * DESCRIPTION:
 * The Master Display Grid for the Partner's automated dispatch schedules.
 * Renders the deeply purified payload from `adaptMasterTimetable()`, flattening 
 * Schedules -> Routes -> Bus Configs into a single crash-proof view.
 * * WORLD-CLASS PHYSICS:
 * 1. AUTOMATION RULE CARDS: Visualizes the exact temporal trigger (e.g., 'Weekly on Mon, Wed')
 * alongside the geographical and hardware targets.
 * 2. CONTROLLED WRITE ISOLATION: The "Modify Schedule" button safely intercepts 
 * clicks to launch the Change Request Engine without misfiring the deep-inspector.
 * 3. KINETIC HOVER PHYSICS: Hardware-accelerated lifts and dynamic shadowing 
 * provide tactile B2B feedback for high-density dispatch screens.
 */

import React from 'react';
import { 
    CalendarClock, MapPin, Navigation, Clock, 
    Repeat, Bus, FileEdit, ArrowRight, ShieldCheck, 
    CalendarDays, AlertTriangle
} from 'lucide-react';
import StoreAssetBadge from '../interactive/StoreAssetBadge';

// ========================================================================
// 1. VISUAL HELPER: FREQUENCY ICON MAPPING
// ========================================================================
const getFrequencyIcon = (freqType) => {
    switch (freqType) {
        case 'DAILY': return Repeat;
        case 'WEEKLY': return CalendarDays;
        case 'MONTHLY': return CalendarClock;
        case 'ONCE': default: return Clock;
    }
};

// ========================================================================
// 2. MAIN COMPONENT
// ========================================================================
const MasterTimetable = ({ schedules = [], onInspect, onRequestChange }) => {

    // --- EMPTY STATE FALLBACK ---
    if (!schedules || schedules.length === 0) {
        return (
            <div className="vault-empty-state">
                <div className="empty-icon-ring">
                    <CalendarClock size={32} color="var(--text-muted)" />
                </div>
                <h3>No Automations Active</h3>
                <p>There are currently no active or pending automated dispatch schedules registered to your corporate identity.</p>
            </div>
        );
    }

    return (
        <div className="timetable-vault-chassis">
            
            {/* --- MASTER HEADER --- */}
            <header className="vault-header">
                <div className="header-identity">
                    <div className="vault-icon-box">
                        <CalendarClock size={24} color="var(--brand-primary)" />
                    </div>
                    <div className="vault-titles">
                        <h1>Master Timetable</h1>
                        <p>Automated dispatch logic, frequencies, and temporal configurations.</p>
                    </div>
                </div>
                <div className="header-metrics">
                    <div className="metric-pill">
                        <span className="metric-val">{schedules.length}</span>
                        <span className="metric-label">Automations</span>
                    </div>
                    <div className="metric-pill success">
                        <span className="metric-val">
                            {schedules.filter(s => s.status === 'ACTIVE').length}
                        </span>
                        <span className="metric-label">Running</span>
                    </div>
                </div>
            </header>

            {/* --- MASONRY ASSET GRID --- */}
            <div className="timetable-grid">
                {schedules.map((schedule) => {
                    const FreqIcon = getFrequencyIcon(schedule.frequencyType);

                    return (
                        <div 
                            key={schedule.id} 
                            className="automation-rule-card"
                            onClick={() => onInspect && onInspect(schedule)}
                        >
                            {/* TOP: FREQUENCY & STATUS */}
                            <div className="rule-header">
                                <div className="frequency-badge">
                                    <FreqIcon size={14} className="freq-icon" />
                                    <span>{schedule.humanFrequency}</span>
                                </div>
                                <div className="rule-actions">
                                    <StoreAssetBadge status={schedule.status} size="sm" showLabel={false} />
                                    <button 
                                        className="rule-modify-btn"
                                        title="Request Timing or Frequency Modification"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Safe isolation
                                            onRequestChange('TIMETABLE', schedule); 
                                        }}
                                    >
                                        <FileEdit size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* MIDDLE: THE GEOGRAPHICAL & HARDWARE TARGET */}
                            <div className="rule-body">
                                {/* Route Identity */}
                                <div className="target-identifier">
                                    <span className="target-label">Target Route:</span>
                                    <span className="target-code">{schedule.routeCode}</span>
                                </div>

                                {/* Geographical Vector */}
                                <div className="vector-miniature">
                                    <div className="node"><MapPin size={14} /> {schedule.originCity}</div>
                                    <ArrowRight size={14} className="vector-arrow" />
                                    <div className="node"><Navigation size={14} /> {schedule.destinationCity}</div>
                                </div>
                            </div>

                            {/* BOTTOM: TEMPORAL EXECUTION PARAMETERS */}
                            <div className="rule-footer">
                                
                                {/* Execution Time */}
                                <div className="execution-block">
                                    <span className="execution-label">Dispatch Time</span>
                                    <div className="execution-value time">
                                        <Clock size={12} />
                                        {schedule.departureTimeFormatted}
                                    </div>
                                </div>

                                {/* Assigned Hardware */}
                                <div className="execution-block">
                                    <span className="execution-label">Required Class</span>
                                    <div className="execution-value hardware">
                                        <Bus size={12} />
                                        {schedule.busClass}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .timetable-vault-chassis {
                    padding: 32px;
                    max-width: 1400px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease;
                }

                /* HEADER PHYSICS */
                .vault-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle);
                }
                .header-identity { display: flex; align-items: center; gap: 20px; }
                .vault-icon-box {
                    width: 56px; height: 56px; background: rgba(206, 172, 92, 0.1);
                    border: 1px solid rgba(206, 172, 92, 0.3); border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                }
                .vault-titles h1 { margin: 0 0 4px 0; font-size: 28px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .vault-titles p { margin: 0; font-size: 14px; color: var(--text-muted); }

                .header-metrics { display: flex; gap: 12px; }
                .metric-pill {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 10px 16px; background: var(--bg-surface);
                    border: 1px solid var(--border-subtle); border-radius: 12px;
                }
                .metric-pill.success { background: rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.2); }
                .metric-val { font-size: 18px; font-weight: 900; color: var(--text-main); line-height: 1; margin-bottom: 4px; }
                .metric-pill.success .metric-val { color: var(--status-success); }
                .metric-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }

                /* GRID PHYSICS */
                .timetable-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 24px;
                }

                /* AUTOMATION RULE CARD */
                .automation-rule-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    cursor: pointer; display: flex; flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }
                .automation-rule-card:hover {
                    border-color: var(--border-strong);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }

                /* HEADER ZONE (FREQUENCY) */
                .rule-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-canvas); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                }
                .frequency-badge { 
                    display: flex; align-items: center; gap: 8px; 
                    padding: 6px 12px; background: rgba(206, 172, 92, 0.1); 
                    border: 1px solid rgba(206, 172, 92, 0.2); border-radius: 100px; 
                    color: var(--brand-primary); font-size: 12px; font-weight: 900; letter-spacing: 0.5px; 
                }
                
                .rule-actions { display: flex; align-items: center; gap: 8px; }
                .rule-modify-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: transparent; border: 1px solid var(--border-subtle);
                    color: var(--text-muted); display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .rule-modify-btn:hover {
                    background: rgba(206, 172, 92, 0.1); color: var(--brand-primary);
                    border-color: var(--brand-primary);
                }

                /* BODY ZONE (TARGET ROUTE) */
                .rule-body {
                    display: flex; flex-direction: column; gap: 16px;
                    padding: 24px 20px;
                }
                .target-identifier { display: flex; align-items: center; gap: 8px; }
                .target-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .target-code { font-size: 14px; font-weight: 900; color: var(--text-main); font-family: monospace; letter-spacing: 1px; background: var(--bg-input); padding: 4px 8px; border-radius: 6px; }

                .vector-miniature {
                    display: flex; align-items: center; gap: 12px;
                    padding: 16px; background: var(--bg-input); border-radius: 12px;
                    border: 1px dashed var(--border-subtle);
                }
                .node { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: var(--text-main); }
                .node svg { color: var(--brand-primary); }
                .vector-arrow { color: var(--border-strong); }

                /* FOOTER ZONE (EXECUTION TIME) */
                .rule-footer {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 16px 20px; background: var(--bg-canvas); border-top: 1px solid var(--border-subtle);
                    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
                }
                .execution-block { display: flex; flex-direction: column; gap: 4px; }
                .execution-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
                
                .execution-value { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: var(--text-main); }
                .execution-value.time { color: var(--brand-primary); font-family: monospace; font-size: 15px; }
                .execution-value.hardware { color: var(--text-muted); }

                /* EMPTY STATE */
                .vault-empty-state { padding: 80px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .empty-icon-ring { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px dashed var(--border-strong); }
                .vault-empty-state h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 900; color: var(--text-main); }
                .vault-empty-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* MOBILE RESPONSIVE DEGRADATION */
                @media (max-width: 768px) {
                    .timetable-vault-chassis { padding: 16px; }
                    .vault-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .timetable-grid { grid-template-columns: 1fr; }
                    .vector-miniature { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .vector-arrow { display: none; }
                }
            `}</style>
        </div>
    );
};

export default MasterTimetable;