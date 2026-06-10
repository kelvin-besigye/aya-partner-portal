/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: TransactionRow.jsx
 * * DESCRIPTION:
 * The atomic UI primitive for a single ledger entry. Renders purified 
 * transaction payloads with strict visual hierarchy and kinetic hover physics.
 * * WORLD-CLASS PHYSICS:
 * 1. DYNAMIC COLOR METRICS: Automatically applies the exact hue (Green/Red/Grey) 
 * to the mathematical amount and iconography based on the Dictionary DNA.
 * 2. INTELLIGENT CONTEXT RESOLUTION: The secondary detail line dynamically 
 * builds a contextual string (Passenger names, Bank masks, Reference IDs) 
 * so the operator never has to click just to see what a fee was for.
 * 3. KINETIC INTERACTIVITY: Features a micro-scale transition (`scale(0.998)`) 
 * and a sliding chevron that intuitively signals "Click to Inspect".
 */

import React, { useMemo } from 'react';
import { FileText, Clock, ChevronRight } from 'lucide-react';

const TransactionRow = ({ transaction, onInspect }) => {
    // Failsafe: Do not render if the transaction object is malformed
    if (!transaction || !transaction.type || !transaction.status) return null;

    // 1. Resolve Iconography safely (Fallback to generic icons if missing)
    const TypeIcon = transaction.type.Icon || FileText;
    const StatusIcon = transaction.status.Icon || Clock;

    // 2. Intelligent Context Resolver
    // Builds the secondary gray text under the main transaction label
    const contextualDetail = useMemo(() => {
        switch (transaction.type.id) {
            case 'TICKET_SALE':
                return `Passenger: ${transaction.passengerName} • Route: ${transaction.routeCode}`;
            case 'PAYOUT_SETTLEMENT':
                return `Bank: ${transaction.settlementBank} ${transaction.settlementAccountMasked}`;
            case 'CANCELLATION_CLAWBACK':
                return `Ref: ${transaction.referenceId.substring(0, 8).toUpperCase()}...`;
            case 'PLATFORM_COMMISSION':
            case 'GATEWAY_FEE':
                return `Automated Processing Deduction`;
            default:
                return `System Log: ${transaction.id.substring(0, 8)}`;
        }
    }, [transaction]);

    // ========================================================================
    // 3. ROW RENDERER
    // ========================================================================
    return (
        <div 
            className="matrix-row interactive-row"
            onClick={() => onInspect && onInspect(transaction)}
        >
            {/* COLUMN 1: TEMPORAL (Date & Time) */}
            <div className="matrix-cell col-date">
                <span className="cell-primary">{transaction.displayDate}</span>
                <span className="cell-secondary">{transaction.displayTime}</span>
            </div>

            {/* COLUMN 2: IDENTITY & CONTEXT */}
            <div className="matrix-cell col-detail">
                <div className="detail-lockup">
                    <div 
                        className="detail-icon" 
                        style={{ 
                            color: transaction.type.color, 
                            backgroundColor: `color-mix(in srgb, ${transaction.type.color} 15%, transparent)` 
                        }}
                    >
                        <TypeIcon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="detail-text">
                        <span className="cell-primary">{transaction.type.label}</span>
                        <span className="cell-secondary">{contextualDetail}</span>
                    </div>
                </div>
            </div>

            {/* COLUMN 3: STATE (Status Badge) */}
            <div className="matrix-cell col-status">
                <div 
                    className="status-pill" 
                    style={{ 
                        color: transaction.status.color, 
                        backgroundColor: transaction.status.bgOpacity 
                    }}
                >
                    <StatusIcon 
                        size={14} 
                        strokeWidth={2.5}
                        className={transaction.status.isPulsing ? 'status-pulse' : ''} 
                    />
                    <span>{transaction.status.label}</span>
                </div>
            </div>

            {/* COLUMN 4: MATHEMATICAL VALUE (+/- Amount) */}
            <div className="matrix-cell col-amount align-right">
                <span 
                    className="cell-primary tx-amount" 
                    style={{ color: transaction.type.color }}
                >
                    {transaction.displayAmount}
                </span>
            </div>

            {/* COLUMN 5: KINETIC ACTION (Chevron) */}
            <div className="matrix-cell matrix-col-action">
                <ChevronRight size={18} className="row-chevron text-muted" />
            </div>

            {/* ========================================================================
                4. ISOLATED CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- ROW CHASSIS --- */
                /* Note: The grid-template-columns must exactly match the header in LedgerRegistry.jsx */
                .matrix-row {
                    display: grid;
                    grid-template-columns: 1.5fr 3fr 1.5fr 1.5fr 40px;
                    align-items: center;
                    padding: 0 24px;
                    height: 72px;
                    border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-surface);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .matrix-row:last-child { border-bottom: none; }

                /* --- INTERACTIVITY --- */
                .interactive-row { cursor: pointer; }
                .interactive-row:hover {
                    background: var(--bg-input);
                    transform: scale(0.998); /* Micro-lift for tactile feedback */
                }

                .row-chevron { transition: transform 0.2s, color 0.2s; }
                .interactive-row:hover .row-chevron {
                    transform: translateX(4px);
                    color: var(--brand-primary);
                }

                /* --- MATRIX CELLS --- */
                .matrix-cell { display: flex; flex-direction: column; gap: 4px; }
                .align-right { text-align: right; justify-content: flex-end; align-items: flex-end; }
                
                .cell-primary { font-size: 14px; font-weight: 800; color: var(--text-main); }
                .cell-secondary { font-size: 12px; font-weight: 600; color: var(--text-muted); }

                /* Detail Lockup (Icon + Text) */
                .detail-lockup { display: flex; align-items: center; gap: 16px; }
                .detail-icon { 
                    width: 36px; height: 36px; border-radius: 10px; 
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
                }
                .detail-text { display: flex; flex-direction: column; gap: 2px; }

                /* Status Pill */
                .status-pill {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 12px; border-radius: 100px;
                    font-size: 11px; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 0.5px; width: max-content;
                }

                /* Amount Specific Typography */
                .tx-amount { 
                    font-family: monospace; 
                    font-size: 16px; 
                    font-weight: 900; 
                    letter-spacing: -0.5px; 
                }

                /* --- ANIMATIONS --- */
                .status-pulse { animation: statusPulse 2s infinite ease-in-out; }
                @keyframes statusPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
                .text-muted { color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default TransactionRow;