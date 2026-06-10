/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: TransactionDock.jsx
 * * DESCRIPTION:
 * The Deep-Inspector Panel for granular financial forensics. 
 * Slides out to reveal un-flattened relational data (Passengers, Banks, 
 * Hashes) without navigating away from the ledger matrix.
 * * WORLD-CLASS PHYSICS:
 * 1. POLYMORPHIC RENDERER: Intelligently morphs its "Context" section 
 * based on whether the transaction is a Ticket, Payout, or Fee.
 * 2. KINETIC SLIDE-OVER: Hardware-accelerated cubic-bezier entrance 
 * ensures a perfectly smooth 60fps glide.
 * 3. COPY-TO-CLIPBOARD: The Audit Hash (UUID) features a click-to-copy 
 * micro-interaction, saving operators from manually typing IDs into support tickets.
 * 4. SECURE HERO BANNER: The massive amount display is chemically tinted 
 * using `color-mix` to perfectly match the mathematical operator (Red/Green/Gold).
 */

import React, { useState } from 'react';
import { 
    X, User, Map, Clock, Calendar, Hash, 
    Landmark, ShieldCheck, AlertCircle, Copy, CheckCircle2,
    RefreshCcw, CreditCard, PieChart
} from 'lucide-react';

const TransactionDock = ({ transaction, isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    // 1. Defend against null renders
    if (!isOpen || !transaction) return null;

    // 2. Extract Dictionaries
    const { type, status } = transaction;
    const TypeIcon = type.Icon || PieChart;
    const StatusIcon = status.Icon || Clock;

    // 3. Clipboard Engine
    const handleCopyId = () => {
        navigator.clipboard.writeText(transaction.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ========================================================================
    // 4. POLYMORPHIC CONTEXT RENDERER
    // ========================================================================
    const renderDynamicContext = () => {
        switch (type.id) {
            case 'TICKET_SALE':
                return (
                    <div className="inspector-card">
                        <div className="card-header">
                            <User size={14} className="text-muted" />
                            <span>Passenger Telemetry</span>
                        </div>
                        <div className="data-grid">
                            <div className="data-pair">
                                <span className="data-label">Passenger Name</span>
                                <span className="data-value">{transaction.passengerName || 'Walk-in Customer'}</span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Route Vector</span>
                                <span className="data-value flex-align">
                                    <Map size={14} className="text-muted" /> 
                                    {transaction.routeCode || 'Unknown Route'}
                                </span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Ticket Reference</span>
                                <span className="data-value monospace">{transaction.referenceId !== 'N/A' ? transaction.referenceId.substring(0,8).toUpperCase() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'PAYOUT_SETTLEMENT':
                return (
                    <div className="inspector-card">
                        <div className="card-header">
                            <Landmark size={14} className="text-muted" />
                            <span>Settlement Routing</span>
                        </div>
                        <div className="data-grid">
                            <div className="data-pair">
                                <span className="data-label">Receiving Bank</span>
                                <span className="data-value">{transaction.settlementBank || 'Corporate Account'}</span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Account Number</span>
                                <span className="data-value monospace">{transaction.settlementAccountMasked || '•••• Unmasked'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'CANCELLATION_CLAWBACK':
                return (
                    <div className="inspector-card error-tint-card">
                        <div className="card-header">
                            <RefreshCcw size={14} className="text-danger" />
                            <span className="text-danger">Clawback Details</span>
                        </div>
                        <div className="data-grid">
                            <div className="data-pair">
                                <span className="data-label">Reason</span>
                                <span className="data-value">Passenger Refund Initiated</span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Original Ticket Ref</span>
                                <span className="data-value monospace text-danger">{transaction.referenceId !== 'N/A' ? transaction.referenceId.substring(0,8).toUpperCase() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'PLATFORM_COMMISSION':
            case 'GATEWAY_FEE':
                return (
                    <div className="inspector-card">
                        <div className="card-header">
                            <CreditCard size={14} className="text-muted" />
                            <span>Processing Context</span>
                        </div>
                        <div className="data-grid">
                            <div className="data-pair">
                                <span className="data-label">Fee Type</span>
                                <span className="data-value">{type.label}</span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Description</span>
                                <span className="data-value">{type.description}</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // ========================================================================
    // 5. RENDER CHASSIS
    // ========================================================================
    return (
        <>
            {/* INVISIBLE BACKDROP (Click to close) */}
            <div className="dock-backdrop" onClick={onClose} />

            {/* THE SLIDING DOCK */}
            <div className="transaction-inspector-dock">
                
                {/* --- DOCK COMMAND HEADER --- */}
                <div className="dock-header">
                    <div className="header-identity">
                        <div className="type-icon-box" style={{ color: type.color, backgroundColor: `color-mix(in srgb, ${type.color} 15%, transparent)` }}>
                            <TypeIcon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="header-titles">
                            <h3>{type.label}</h3>
                            <span className="subtitle">Transaction Dossier</span>
                        </div>
                    </div>
                    <button className="dock-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* --- THE SCROLLABLE VAULT --- */}
                <div className="dock-body">
                    
                    {/* 1. HERO BANNER (The Math) */}
                    <div className="hero-banner" style={{ backgroundColor: `color-mix(in srgb, ${type.color} 5%, var(--bg-surface))` }}>
                        <span className="hero-label">Processed Amount</span>
                        <div className="hero-amount" style={{ color: type.color }}>
                            {transaction.displayAmount}
                        </div>
                        <div className="status-badge" style={{ color: status.color, backgroundColor: status.bgOpacity, border: `1px solid color-mix(in srgb, ${status.color} 20%, transparent)` }}>
                            <StatusIcon size={14} className={status.isPulsing ? 'status-pulse' : ''} />
                            <span>{status.label}</span>
                        </div>
                    </div>

                    {/* 2. TEMPORAL DATA */}
                    <div className="inspector-card">
                        <div className="card-header">
                            <Calendar size={14} className="text-muted" />
                            <span>Temporal Signature</span>
                        </div>
                        <div className="data-grid dual-col">
                            <div className="data-pair">
                                <span className="data-label">System Date</span>
                                <span className="data-value">{transaction.displayDate}</span>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Exact Time (EAT)</span>
                                <span className="data-value">{transaction.displayTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. POLYMORPHIC CONTEXT */}
                    {renderDynamicContext()}

                    {/* 4. AUDIT TRAIL (System Immutable Data) */}
                    <div className="inspector-card audit-card">
                        <div className="card-header">
                            <ShieldCheck size={14} className="text-brand" />
                            <span className="text-brand">Citadel Audit Trail</span>
                        </div>
                        <div className="data-grid">
                            <div className="data-pair">
                                <span className="data-label">Immutable Database Hash</span>
                                <div className="hash-copy-box" onClick={handleCopyId}>
                                    <Hash size={14} className="text-muted" />
                                    <span className="monospace">{transaction.id}</span>
                                    {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} className="text-muted hover-icon" />}
                                </div>
                            </div>
                            <div className="data-pair">
                                <span className="data-label">Raw UTC Timestamp</span>
                                <span className="data-value monospace text-muted" style={{ fontSize: '11px' }}>{transaction.createdAt}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- DOCK FOOTER --- */}
                <div className="dock-footer">
                    <button className="support-btn">
                        <AlertCircle size={16} />
                        <span>Report Discrepancy</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================
                6. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* BACKDROP */
                .dock-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }

                /* DOCK CHASSIS */
                .transaction-inspector-dock {
                    position: fixed; top: 0; right: 0; bottom: 0;
                    width: 440px; max-width: 100vw;
                    background: var(--bg-surface);
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    z-index: 101;
                    display: flex; flex-direction: column;
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border-left: 1px solid var(--border-strong);
                }

                /* HEADER */
                .dock-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-canvas); }
                .header-identity { display: flex; align-items: center; gap: 16px; }
                .type-icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .header-titles { display: flex; flex-direction: column; gap: 2px; }
                .header-titles h3 { margin: 0; font-size: 16px; font-weight: 900; color: var(--text-main); }
                .header-titles .subtitle { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .dock-close-btn { background: var(--bg-input); border: 1px solid transparent; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .dock-close-btn:hover { background: var(--border-subtle); color: var(--text-main); transform: rotate(90deg); }

                /* BODY SCROLL */
                .dock-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

                /* HERO BANNER */
                .hero-banner { padding: 32px 24px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; border: 1px dashed var(--border-subtle); }
                .hero-label { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                .hero-amount { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px; }

                /* STATUS BADGE */
                .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-pulse { animation: statusPulse 2s infinite ease-in-out; }
                @keyframes statusPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }

                /* INSPECTOR CARDS */
                .inspector-card { background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; }
                .card-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); }
                
                .error-tint-card { background: rgba(239, 68, 68, 0.02); border-color: rgba(239, 68, 68, 0.2); }
                .audit-card { background: rgba(206, 172, 92, 0.03); border-color: rgba(206, 172, 92, 0.2); }

                /* DATA GRID */
                .data-grid { display: flex; flex-direction: column; gap: 16px; }
                .data-grid.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .data-pair { display: flex; flex-direction: column; gap: 4px; }
                .data-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .data-value { font-size: 14px; font-weight: 700; color: var(--text-main); line-height: 1.4; }
                .flex-align { display: flex; align-items: center; gap: 6px; }
                .monospace { font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: -0.2px; }

                /* HASH COPY BOX */
                .hash-copy-box { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border-strong); border-radius: 8px; cursor: pointer; transition: 0.2s; margin-top: 4px; }
                .hash-copy-box:hover { border-color: var(--brand-primary); }
                .hash-copy-box .hover-icon { opacity: 0; transition: 0.2s; }
                .hash-copy-box:hover .hover-icon { opacity: 1; color: var(--brand-primary); }

                /* FOOTER */
                .dock-footer { padding: 24px; border-top: 1px solid var(--border-subtle); background: var(--bg-canvas); }
                .support-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: transparent; border: 1px solid var(--border-strong); border-radius: 10px; color: var(--text-main); font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .support-btn:hover { background: var(--bg-input); border-color: var(--text-muted); }

                /* UTILS & ANIMATIONS */
                .text-muted { color: var(--text-muted); }
                .text-danger { color: var(--status-danger); }
                .text-brand { color: var(--brand-primary); }
                .text-success { color: var(--status-success); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

                /* CUSTOM SCROLLBAR FOR DOCK */
                .dock-body::-webkit-scrollbar { width: 6px; }
                .dock-body::-webkit-scrollbar-track { background: transparent; }
                .dock-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
            `}</style>
        </>
    );
};

export default TransactionDock;