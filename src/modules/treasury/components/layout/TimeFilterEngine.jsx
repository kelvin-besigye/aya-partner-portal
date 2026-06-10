/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: TimeFilterEngine.jsx
 * * DESCRIPTION:
 * The apex temporal control bar. Allows operators to slice their financial 
 * data across predefined epochs or exact custom date ranges.
 * * WORLD-CLASS PHYSICS:
 * 1. OMNI-DIRECTIONAL PILL TRACK: Uses native kinetic scrolling (`overflow-x: auto`) 
 * with hidden scrollbars. On mobile, the operator can swipe left/right through 
 * the periods without compressing the layout.
 * 2. INTEGRATED CUSTOM RANGE PORTAL: When "CUSTOM" is selected, a beautiful, 
 * z-indexed popover emerges containing strict native date pickers. 
 * 3. STATE SYNCHRONIZATION: Perfectly respects `isLoading` to disable clicks 
 * while the network bridge is fetching, preventing race conditions or DB spam.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, Filter, Clock } from 'lucide-react';
import { TREASURY_TIME_PERIODS } from '../../data/treasury.dictionary';

const TimeFilterEngine = ({ 
    activePeriod, 
    customRange, 
    onFilterChange, 
    isLoading 
}) => {
    // --- LOCAL STATE FOR CUSTOM PORTAL ---
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [localStart, setLocalStart] = useState(customRange?.startDate || '');
    const [localEnd, setLocalEnd] = useState(customRange?.endDate || '');

    // --- KINETIC TRACK REFERENCE ---
    const trackRef = useRef(null);

    // ========================================================================
    // 1. KINETIC SCROLL CENTERING
    // ========================================================================
    // Automatically scrolls the active pill into view when mounted or changed
    useEffect(() => {
        if (trackRef.current) {
            const activePill = trackRef.current.querySelector('.filter-pill.active');
            if (activePill) {
                activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activePeriod]);

    // ========================================================================
    // 2. EVENT DISPATCHERS
    // ========================================================================
    const handlePillClick = (periodId) => {
        if (isLoading) return;

        if (periodId === 'CUSTOM') {
            setIsCustomOpen(!isCustomOpen);
        } else {
            setIsCustomOpen(false);
            onFilterChange(periodId, null);
        }
    };

    const handleApplyCustomRange = () => {
        if (!localStart || !localEnd) return; // Prevent empty dispatches
        
        setIsCustomOpen(false);
        onFilterChange('CUSTOM', { startDate: localStart, endDate: localEnd });
    };

    // ========================================================================
    // 3. THE RENDER ENGINE
    // ========================================================================
    return (
        <div className="time-filter-chassis">
            
            {/* --- LEFT: THE KINETIC PILL TRACK --- */}
            <div className="pill-track-wrapper">
                <div className="track-icon">
                    <Filter size={16} color="var(--text-muted)" />
                </div>
                
                <div className="pill-track" ref={trackRef}>
                    {TREASURY_TIME_PERIODS.map((period) => {
                        const isActive = activePeriod === period.id;
                        
                        return (
                            <button
                                key={period.id}
                                className={`filter-pill ${isActive ? 'active' : ''}`}
                                onClick={() => handlePillClick(period.id)}
                                disabled={isLoading}
                                title={period.label}
                            >
                                {period.id === 'CUSTOM' && <Calendar size={14} />}
                                <span>{period.shortLabel}</span>
                                {period.id === 'CUSTOM' && <ChevronDown size={14} className={`custom-chevron ${isCustomOpen ? 'open' : ''}`} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- RIGHT: TELEMETRY INDICATOR (Desktop Only) --- */}
            <div className="telemetry-indicator">
                {isLoading ? (
                    <span className="sync-text pulse"><Clock size={14} className="ayabus-spin" /> Recalculating...</span>
                ) : (
                    <span className="sync-text">Ledger Synced</span>
                )}
            </div>

            {/* =========================================
                4. CUSTOM RANGE PORTAL (Absolute Overlay)
            ========================================= */}
            {isCustomOpen && (
                <>
                    {/* Invisible backdrop to click-to-close */}
                    <div className="custom-backdrop" onClick={() => setIsCustomOpen(false)} />
                    
                    <div className="custom-range-portal">
                        <div className="portal-header">
                            <span className="portal-title">Define Custom Audit Range</span>
                            <button className="portal-close" onClick={() => setIsCustomOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="portal-body">
                            <div className="date-input-group">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    value={localStart}
                                    onChange={(e) => setLocalStart(e.target.value)}
                                    max={localEnd || undefined}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    value={localEnd}
                                    onChange={(e) => setLocalEnd(e.target.value)}
                                    min={localStart || undefined}
                                />
                            </div>
                        </div>

                        <div className="portal-footer">
                            <button 
                                className="apply-range-btn"
                                onClick={handleApplyCustomRange}
                                disabled={!localStart || !localEnd || isLoading}
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                .time-filter-chassis {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 32px;
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    position: relative;
                    z-index: 40;
                }

                /* --- PILL TRACK --- */
                .pill-track-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                    min-width: 0; /* Critical for Flexbox truncation */
                }

                .track-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: var(--bg-input);
                    border-radius: 8px;
                    flex-shrink: 0;
                }

                .pill-track {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    overflow-x: auto;
                    overscroll-behavior-x: contain;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 4px; /* Room for focus rings */
                    scrollbar-width: none; /* Firefox */
                }
                .pill-track::-webkit-scrollbar { display: none; } /* Chrome/Safari */

                /* --- FILTER PILLS --- */
                .filter-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--border-subtle);
                    border-radius: 100px;
                    color: var(--text-muted);
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                }

                .filter-pill:hover:not(:disabled) {
                    background: var(--bg-input);
                    color: var(--text-main);
                    border-color: var(--border-strong);
                }

                .filter-pill.active {
                    background: var(--brand-primary);
                    border-color: var(--brand-primary);
                    color: #FFFFFF;
                    box-shadow: 0 4px 12px rgba(206, 172, 92, 0.2);
                }

                .filter-pill:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .custom-chevron { transition: transform 0.2s; }
                .custom-chevron.open { transform: rotate(180deg); }

                /* --- TELEMETRY --- */
                .telemetry-indicator { flex-shrink: 0; margin-left: 24px; }
                .sync-text { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .sync-text.pulse { color: var(--brand-primary); }

                /* --- CUSTOM RANGE PORTAL --- */
                .custom-backdrop {
                    position: fixed; inset: 0; z-index: 90;
                }

                .custom-range-portal {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 250px; /* Offset to align roughly with the CUSTOM pill */
                    width: 320px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-strong);
                    border-radius: 16px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.1);
                    z-index: 100;
                    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .portal-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
                }
                .portal-title { font-size: 13px; font-weight: 900; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                .portal-close { background: var(--bg-input); border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .portal-close:hover { background: var(--border-strong); color: var(--text-main); }

                .portal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
                .date-input-group { display: flex; flex-direction: column; gap: 8px; }
                .date-input-group label { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .date-input-group input {
                    width: 100%; padding: 12px 16px; background: var(--bg-canvas);
                    border: 1px solid var(--border-strong); border-radius: 10px;
                    color: var(--text-main); font-size: 14px; font-weight: 600; font-family: inherit;
                    transition: all 0.2s;
                }
                .date-input-group input:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(206, 172, 92, 0.1); }
                /* Dark mode calendar icon fix for native inputs */
                [data-theme="dark"] .date-input-group input::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }

                .portal-footer { padding: 16px 20px; background: var(--bg-input); border-top: 1px solid var(--border-subtle); }
                .apply-range-btn {
                    width: 100%; padding: 12px; background: var(--text-main); color: var(--bg-surface);
                    border: none; border-radius: 10px; font-size: 14px; font-weight: 800; cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .apply-range-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .apply-range-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                /* --- ANIMATIONS --- */
                @keyframes popIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .ayabus-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- MOBILE RESPONSIVE DEGRADATION --- */
                @media (max-width: 768px) {
                    .time-filter-chassis { padding: 12px 16px; }
                    .telemetry-indicator { display: none; } /* Hide text on mobile to give track full width */
                    
                    .custom-range-portal {
                        position: fixed;
                        top: auto; bottom: 0; left: 0; right: 0; width: 100%;
                        border-radius: 20px 20px 0 0; border: none;
                        box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
                        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                }
            `}</style>
        </div>
    );
};

export default TimeFilterEngine;