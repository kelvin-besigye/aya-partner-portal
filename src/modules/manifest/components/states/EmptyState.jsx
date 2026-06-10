/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / States
 * File: EmptyState.jsx
 * * DESCRIPTION:
 * The operational fallback interface displayed when no fleet schedules 
 * are active for the queried date. It provides the dispatcher with 
 * context, the current operational date, and direct links to the 
 * Fleet Planner or Concierge Desk.
 * * PHYSICS:
 * Responsive, hardware-accelerated fade-in, and respects all global
 * Light/Dark mode CSS variables.
 */

import React from 'react';
import { CalendarX, Bus, ArrowRight, Headset, CalendarDays } from 'lucide-react';

const EmptyManifestState = ({ 
    currentDate = new Date(), 
    onNavigateToPlanner, 
    onRequestSupport 
}) => {
    
    // Format the date so the dispatcher is absolutely sure which day they are looking at
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(currentDate);

    return (
        <div className="empty-manifest-root">
            <div className="empty-content-wrapper">
                
                {/* 1. VISUAL ANCHOR */}
                <div className="icon-constellation">
                    <div className="icon-ring outer-ring">
                        <div className="icon-ring inner-ring">
                            <CalendarX size={48} strokeWidth={1.5} className="primary-icon" />
                        </div>
                    </div>
                    {/* Floating secondary indicator */}
                    <div className="floating-badge">
                        <Bus size={12} color="var(--bg-surface)" />
                    </div>
                </div>

                {/* 2. OPERATIONAL CONTEXT */}
                <div className="text-payload">
                    <h2 className="empty-heading">No Active Departures</h2>
                    <p className="empty-subtext">
                        There are no AyaBus fleet schedules assigned to your manifest for the current operational window.
                    </p>
                    
                    <div className="date-verification-badge">
                        <CalendarDays size={14} />
                        <span>Manifest Date: <strong>{formattedDate}</strong></span>
                    </div>
                </div>

                {/* 3. FUTURE-PROOF ACTIONS */}
                <div className="action-matrix">
                    <button 
                        className="action-card primary-action"
                        onClick={onNavigateToPlanner}
                    >
                        <div className="card-icon"><CalendarDays size={18} /></div>
                        <div className="card-text">
                            <strong>View Master Schedules</strong>
                            <span>Check your weekly automated routes</span>
                        </div>
                        <ArrowRight size={16} className="arrow-indicator" />
                    </button>

                    <button 
                        className="action-card secondary-action"
                        onClick={onRequestSupport}
                    >
                        <div className="card-icon"><Headset size={18} /></div>
                        <div className="card-text">
                            <strong>Report a Scheduling Error</strong>
                            <span>Contact the AyaBus Concierge</span>
                        </div>
                        <ArrowRight size={16} className="arrow-indicator" />
                    </button>
                </div>

            </div>

            {/* --- INJECTED PHYSICS STYLESHEET --- */}
            <style>{`
                .empty-manifest-root {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 500px;
                    width: 100%;
                    background: var(--bg-surface);
                    border: 1px dashed var(--border-strong);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    animation: subtleFadeIn 0.5s ease-out forwards;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .empty-content-wrapper {
                    max-width: 500px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                /* --- ICON CONSTELLATION --- */
                .icon-constellation {
                    position: relative;
                    margin-bottom: 24px;
                }

                .icon-ring {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .outer-ring {
                    width: 100px;
                    height: 100px;
                    background: rgba(206, 172, 92, 0.05); /* Very subtle brand tint */
                    border: 1px solid rgba(206, 172, 92, 0.1);
                }

                .inner-ring {
                    width: 72px;
                    height: 72px;
                    background: var(--bg-canvas);
                    border: 1px solid var(--border-subtle);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.05);
                }

                .primary-icon {
                    color: var(--text-muted);
                }

                .floating-badge {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 28px;
                    height: 28px;
                    background: var(--text-main);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid var(--bg-surface);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                /* --- TEXT PAYLOAD --- */
                .text-payload {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .empty-heading {
                    font-size: 22px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -0.5px;
                    margin-bottom: 8px;
                }

                .empty-subtext {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-muted);
                    line-height: 1.5;
                    max-width: 400px;
                    margin-bottom: 20px;
                }

                .date-verification-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--text-main);
                }
                .date-verification-badge strong {
                    color: var(--brand-primary);
                    font-weight: 800;
                }

                /* --- ACTION MATRIX --- */
                .action-matrix {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }

                .action-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                    padding: 16px;
                    background: var(--bg-canvas);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .action-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    border-color: var(--border-strong);
                }

                .action-card:hover .arrow-indicator {
                    transform: translateX(4px);
                    color: var(--brand-primary);
                }

                .card-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: var(--bg-input);
                    color: var(--text-main);
                }

                .primary-action:hover .card-icon { background: rgba(206, 172, 92, 0.1); color: var(--brand-primary); }
                .secondary-action:hover .card-icon { background: var(--bg-surface); color: var(--text-main); }

                .card-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .card-text strong {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .card-text span {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .arrow-indicator {
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                /* --- ANIMATIONS --- */
                @keyframes subtleFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* --- RESPONSIVE PHYSICS --- */
                @media (max-width: 600px) {
                    .empty-manifest-root {
                        padding: 16px;
                        border: none;
                        background: transparent;
                    }
                    .empty-heading { font-size: 20px; }
                    .action-card { padding: 12px; }
                }
            `}</style>
        </div>
    );
};

export default EmptyManifestState;