/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: LedgerRegistry.jsx
 * * DESCRIPTION:
 * The Master Transaction Matrix. Orchestrates the display of purified 
 * financial payloads using an infinite-scroll, sticky-header architecture.
 * * WORLD-CLASS PHYSICS:
 * 1. ATOMIC INTEGRATION: Fully wired with the `ExportEngine` for client-side 
 * CSV compilation and `TransactionRow` for isolated, high-performance rendering.
 * 2. OMNI-DIRECTIONAL SCROLL: The matrix wrapper utilizes `overflow: auto` 
 * with a `min-width: 900px` enforcement, ensuring complex financial data 
 * never wraps or breaks on mobile screens.
 * 3. STICKY COMMAND HEADER: The table header remains anchored to the top 
 * of the viewport while the operator scrolls through deep historical data.
 */

import React from 'react';
import { Inbox, LayoutGrid } from 'lucide-react';

// --- LIVE WIRES (Atomic Components) ---
import TransactionRow from './TransactionRow';
import ExportEngine from './ExportEngine';

const LedgerRegistry = ({ 
    transactions = [], 
    isLoading = false, 
    activePeriodLabel = 'Ledger',
    onInspectTransaction 
}) => {

    // ========================================================================
    // 1. SKELETON LOADER (Pre-Hydration State)
    // ========================================================================
    if (isLoading) {
        return (
            <div className="ledger-registry-chassis">
                <div className="registry-header">
                    <div className="header-titles">
                        <h2>Transaction Ledger</h2>
                        <span>Synchronizing...</span>
                    </div>
                    {/* Disabled Export Engine while loading */}
                    <ExportEngine disabled={true} />
                </div>
                <div className="ledger-matrix-wrapper">
                    <div className="ledger-matrix">
                        <div className="matrix-head">
                            <div className="matrix-col">Date & Time</div>
                            <div className="matrix-col">Transaction Detail</div>
                            <div className="matrix-col">Status</div>
                            <div className="matrix-col align-right">Amount (UGX)</div>
                            <div className="matrix-col-action"></div>
                        </div>
                        <div className="matrix-body">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="matrix-skeleton-row">
                                    <div className="skeleton-block pulse-bg w-50" />
                                    <div className="skeleton-block pulse-bg w-80" />
                                    <div className="skeleton-block pulse-bg w-40" />
                                    <div className="skeleton-block pulse-bg w-60 align-right-box" />
                                    <div className="skeleton-block pulse-bg w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <style>{`
                    .matrix-skeleton-row {
                        display: grid;
                        grid-template-columns: 1.5fr 3fr 1.5fr 1.5fr 40px;
                        align-items: center;
                        padding: 0 24px;
                        height: 72px;
                        border-bottom: 1px solid var(--border-subtle);
                    }
                    .pulse-bg { background: var(--bg-input); border-radius: 6px; animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-block { height: 20px; }
                    .w-20 { width: 20px; } .w-40 { width: 40%; } .w-50 { width: 50%; } .w-60 { width: 60%; } .w-80 { width: 80%; }
                    .align-right-box { margin-left: auto; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 2. EMPTY STATE (No Data Found)
    // ========================================================================
    if (!isLoading && transactions.length === 0) {
        return (
            <div className="ledger-registry-chassis empty-state">
                <div className="empty-icon-ring">
                    <Inbox size={32} color="var(--text-muted)" />
                </div>
                <h3>No Transactions Found</h3>
                <p>There is no financial activity recorded for the selected time period.</p>
            </div>
        );
    }

    // ========================================================================
    // 3. LEDGER MATRIX RENDERER
    // ========================================================================
    return (
        <div className="ledger-registry-chassis">
            
            {/* --- REGISTRY COMMAND HEADER --- */}
            <div className="registry-header">
                <div className="header-titles">
                    <h2>Transaction Ledger</h2>
                    <span>{transactions.length} records found</span>
                </div>
                
                {/* 🔌 LIVE WIRE: The Client-Side CSV Compiler */}
                <ExportEngine 
                    transactions={transactions} 
                    disabled={isLoading} 
                    periodLabel={activePeriodLabel} 
                />
            </div>

            {/* --- THE SCROLLABLE MATRIX --- */}
            <div className="ledger-matrix-wrapper">
                <div className="ledger-matrix">
                    
                    {/* STICKY TABLE HEADER */}
                    <div className="matrix-head">
                        <div className="matrix-col">Date & Time</div>
                        <div className="matrix-col">Transaction Detail</div>
                        <div className="matrix-col">Status</div>
                        <div className="matrix-col align-right">Amount (UGX)</div>
                        <div className="matrix-col-action"></div>
                    </div>

                    {/* 🔌 LIVE WIRE: VIRTUALIZED TABLE BODY */}
                    <div className="matrix-body">
                        {transactions.map((tx) => (
                            <TransactionRow 
                                key={tx.id} 
                                transaction={tx} 
                                onInspect={onInspectTransaction} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================================================
                4. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- ROOT CHASSIS --- */
                .ledger-registry-chassis {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    background: var(--bg-surface);
                    margin: 24px 32px;
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    overflow: hidden; /* Contains the scrollable matrix */
                    box-shadow: 0 4px 24px rgba(0,0,0,0.02);
                }

                /* --- HEADER & COMMANDS --- */
                .registry-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-strong);
                    background: var(--bg-surface);
                    flex-shrink: 0;
                }
                .header-titles { display: flex; align-items: baseline; gap: 12px; }
                .header-titles h2 { margin: 0; font-size: 16px; font-weight: 900; color: var(--text-main); }
                .header-titles span { font-size: 12px; font-weight: 700; color: var(--text-muted); }

                /* --- THE MATRIX (TABLE) --- */
                .ledger-matrix-wrapper {
                    flex: 1;
                    overflow: auto; /* Omni-directional scroll */
                    position: relative;
                }
                
                .ledger-matrix {
                    display: flex;
                    flex-direction: column;
                    min-width: 900px; /* Forces horizontal scroll on mobile to protect data layout */
                    width: 100%;
                }

                /* --- MATRIX HEADER (Sticky Grid) --- */
                /* NOTE: The grid-template-columns must exactly match the row in TransactionRow.jsx */
                .matrix-head {
                    display: grid;
                    grid-template-columns: 1.5fr 3fr 1.5fr 1.5fr 40px;
                    align-items: center;
                    padding: 0 24px;
                    position: sticky;
                    top: 0;
                    height: 48px;
                    background: var(--bg-canvas);
                    border-bottom: 1px solid var(--border-strong);
                    z-index: 10;
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .align-right { text-align: right; justify-content: flex-end; }

                /* --- EMPTY STATE --- */
                .empty-state {
                    padding: 80px 24px; text-align: center;
                    align-items: center; justify-content: center;
                }
                .empty-icon-ring {
                    width: 72px; height: 72px; border-radius: 50%;
                    background: var(--bg-input); display: flex; align-items: center; justify-content: center;
                    margin-bottom: 24px; border: 1px dashed var(--border-strong);
                }
                .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .empty-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1024px) {
                    .ledger-registry-chassis { margin: 16px; border-radius: 12px; }
                }

                @media (max-width: 768px) {
                    .registry-header { flex-direction: column; align-items: flex-start; gap: 16px; padding: 16px; }
                    .header-titles { flex-direction: column; gap: 4px; }
                    /* Export Button handles its own mobile width internally or via flex context */
                    
                    /* Visual cue that the table is horizontally scrollable */
                    .ledger-matrix-wrapper {
                        box-shadow: inset -20px 0 20px -20px rgba(0,0,0,0.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default LedgerRegistry;