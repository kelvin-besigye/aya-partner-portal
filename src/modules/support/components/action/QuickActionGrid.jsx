/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: QuickActionGrid.jsx
 * * DESCRIPTION:
 * The primary tactile interface for the Maker-Checker workflow.
 * Renders massive, high-visibility action cards mapped directly 
 * from the Support Dictionary. Replaces complex navigation with 
 * a single, frictionless click.
 * * WORLD-CLASS PHYSICS:
 * 1. DICTIONARY MAPPING: Natively loops through `SUPPORT_REQUEST_TYPES` 
 * to automatically inherit the exact colors, icons, and labels defined in the DNA.
 * 2. THE SOS OVERRIDE: The 'BREAKDOWN' card receives special CSS treatment 
 * (`.critical-card`), giving it a pulsating red aura and distinct border 
 * to separate it from standard operational requests.
 * 3. KINETIC HOVER: Features a micro-interaction where the Chevron arrow 
 * slides to the right on hover, psychologically encouraging the user to click.
 */

import React from 'react';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import { SUPPORT_REQUEST_TYPES } from '../../data/support.dictionary';

const QuickActionGrid = ({ onRequestOpen }) => {
    
    // We filter out 'GENERAL' and 'FINANCIAL_DISPUTE' for this specific grid 
    // to keep the focus purely on physical B2B Operations (Routes, Buses, SOS).
    // The other types can be accessed via a secondary button if needed, 
    // but these 4 are the highest volume actions.
    const primaryActions = [
        SUPPORT_REQUEST_TYPES['ROUTE_ADD'],
        SUPPORT_REQUEST_TYPES['FLEET_ADD'],
        SUPPORT_REQUEST_TYPES['SCHEDULE_CHANGE'],
        SUPPORT_REQUEST_TYPES['BREAKDOWN']
    ];

    return (
        <div className="quick-action-chassis">
            
            <div className="section-header">
                <h3>Operational Requests</h3>
                <p>Select an action to securely transmit a request to the L9 Admin Cockpit.</p>
            </div>

            <div className="action-grid">
                {primaryActions.map((action) => {
                    // Safety check in case the dictionary is missing an entry
                    if (!action) return null;

                    const Icon = action.Icon || ShieldAlert;
                    const isCritical = action.id === 'BREAKDOWN';

                    return (
                        <button 
                            key={action.id}
                            className={`action-card ${isCritical ? 'critical-card' : ''}`}
                            onClick={() => onRequestOpen && onRequestOpen(action.id)}
                            aria-label={`Open request form for ${action.label}`}
                        >
                            <div className="card-content">
                                <div 
                                    className="icon-vault"
                                    style={{ 
                                        backgroundColor: action.bgOpacity, 
                                        color: action.color 
                                    }}
                                >
                                    <Icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="text-vault">
                                    <span className="action-label">{action.label}</span>
                                    <span className="action-desc">{action.description}</span>
                                </div>
                            </div>
                            <div className="card-arrow text-muted">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ========================================================================
                WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- BASE CHASSIS --- */
                .quick-action-chassis { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 20px; 
                    width: 100%;
                }
                
                /* --- HEADER --- */
                .section-header h3 { 
                    margin: 0 0 6px 0; 
                    font-size: 16px; 
                    font-weight: 900; 
                    color: var(--text-main); 
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .section-header p { 
                    margin: 0; 
                    font-size: 13px; 
                    color: var(--text-muted); 
                    line-height: 1.5;
                }

                /* --- BENTO GRID --- */
                .action-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                /* --- TACTILE CARDS --- */
                .action-card {
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between;
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-subtle);
                    padding: 24px 20px; 
                    border-radius: 16px; 
                    cursor: pointer; 
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    outline: none;
                }

                .action-card:hover, .action-card:focus-visible {
                    border-color: var(--border-strong);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.04);
                    background: var(--bg-canvas); /* Slight shift on hover */
                }

                .card-content { 
                    display: flex; 
                    align-items: center; 
                    gap: 16px; 
                }
                
                .icon-vault {
                    width: 56px; 
                    height: 56px; 
                    border-radius: 14px;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }

                .action-card:hover .icon-vault {
                    transform: scale(1.05);
                }

                .text-vault { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 4px; 
                }
                .action-label { 
                    font-size: 16px; 
                    font-weight: 900; 
                    color: var(--text-main); 
                    letter-spacing: -0.3px;
                }
                .action-desc { 
                    font-size: 12px; 
                    font-weight: 600;
                    color: var(--text-muted); 
                    line-height: 1.4; 
                    max-width: 220px;
                }

                /* Kinetic Arrow */
                .card-arrow { 
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: transparent;
                }
                .action-card:hover .card-arrow { 
                    transform: translateX(4px); 
                    color: var(--text-main); 
                    background: var(--bg-input);
                }

                /* --- SOS CRITICAL OVERRIDE --- */
                .critical-card { 
                    border-color: rgba(239, 68, 68, 0.3); 
                    background: linear-gradient(145deg, var(--bg-surface) 0%, rgba(239, 68, 68, 0.03) 100%); 
                }
                .critical-card:hover, .critical-card:focus-visible { 
                    border-color: var(--status-danger); 
                    box-shadow: 0 12px 32px rgba(239, 68, 68, 0.12); 
                    background: linear-gradient(145deg, var(--bg-surface) 0%, rgba(239, 68, 68, 0.06) 100%);
                }
                .critical-card .action-label { 
                    color: var(--status-danger); 
                }
                .critical-card:hover .card-arrow {
                    color: var(--status-danger);
                    background: rgba(239, 68, 68, 0.1);
                }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1024px) { 
                    .action-grid { 
                        grid-template-columns: 1fr; 
                    } 
                }

                @media (max-width: 640px) {
                    .action-card {
                        padding: 16px;
                    }
                    .icon-vault {
                        width: 48px;
                        height: 48px;
                    }
                    .action-desc {
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default QuickActionGrid;