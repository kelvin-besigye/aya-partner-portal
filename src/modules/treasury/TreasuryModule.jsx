/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: TreasuryModule.jsx
 * * DESCRIPTION:
 * The Master Orchestrator for the entire Treasury ecosystem. 
 * Binds the Network Bridge to the UI Primitives, manages the Sovereign 
 * Time Machine state, and controls the kinetic workspace layouts.
 * * WORLD-CLASS PHYSICS:
 * 1. KINETIC WORKSPACE: When the TransactionDock opens, the main viewport 
 * fluidly recalculates its width to prevent the matrix from being hidden 
 * behind the overlay (on Desktop).
 * 2. HYDRATION ENGINE: Uses a `useCallback` driven synchronization loop 
 * that perfectly respects the temporal filters and prevents race conditions.
 * 3. GRACEFUL DEGRADATION: On tablets and mobile, the layout automatically 
 * transitions from a side-by-side push to a modal takeover for the Inspector.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, ShieldCheck, ServerCrash } from 'lucide-react';

// --- LIVE WIRES (Data & Dictionary) ---
import { treasuryService } from './data/treasury.service';
import { TREASURY_TIME_PERIODS } from './data/treasury.dictionary';

// --- ATOMIC COMPONENTS ---
import TreasuryMetrics from './components/layout/TreasuryMetrics';
import TimeFilterEngine from './components/layout/TimeFilterEngine';
import LedgerRegistry from './components/ledger/LedgerRegistry';
import TransactionDock from './components/inspector/TransactionDock';

const TreasuryModule = () => {
    // ========================================================================
    // 1. SYSTEM CONTEXT & STATE
    // ========================================================================
    const { tenant } = useAuth();

    // Temporal State
    const [activePeriod, setActivePeriod] = useState('THIS_MONTH');
    const [customRange, setCustomRange] = useState(null);

    // Financial State
    const [transactions, setTransactions] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [systemError, setSystemError] = useState(null);

    // Inspector State
    const [inspectedTransaction, setInspectedTransaction] = useState(null);

    // ========================================================================
    // 2. THE NETWORK SYNCHRONIZATION LOOP
    // ========================================================================
    const synchronizeLedger = useCallback(async (isSilentRefresh = false) => {
        if (!tenant?.id) return;

        if (!isSilentRefresh) {
            setIsLoading(true);
        }
        setSystemError(null);

        try {
            // 1. Hit the Sovereign Vault
            const response = await treasuryService.fetchLedger(tenant.id, activePeriod, customRange);

            if (response.success) {
                // 2. Hydrate State
                setTransactions(response.data.transactions);
                setMetrics(response.data.metrics);
                
                // If a transaction was being inspected, and the data refreshed, 
                // we should update the inspected object to its latest version
                if (inspectedTransaction) {
                    const updatedTx = response.data.transactions.find(t => t.id === inspectedTransaction.id);
                    if (updatedTx) setInspectedTransaction(updatedTx);
                }
            } else {
                setSystemError(response.error);
            }
        } catch (error) {
            setSystemError('CRITICAL: Failed to establish secure connection to the financial ledger.');
        } finally {
            setIsLoading(false);
        }
    }, [tenant?.id, activePeriod, customRange, inspectedTransaction]);

    // Auto-Sync when Time Filters or Tenant Identity changes
    useEffect(() => {
        synchronizeLedger();
    }, [synchronizeLedger]);

    // ========================================================================
    // 3. EVENT DISPATCHERS
    // ========================================================================
    const handleFilterChange = (periodId, range) => {
        // Close inspector when time-traveling to prevent viewing orphaned data
        setInspectedTransaction(null);
        setActivePeriod(periodId);
        setCustomRange(range);
    };

    const handleManualRefresh = () => {
        synchronizeLedger(true); // Silent refresh, doesn't blank the screen
    };

    // Resolves the exact human-readable label for the active period (for the Export Engine)
    const activePeriodLabel = useMemo(() => {
        if (activePeriod === 'CUSTOM') return 'Custom_Audit_Range';
        const config = TREASURY_TIME_PERIODS.find(p => p.id === activePeriod);
        return config ? config.label : 'Financial_Ledger';
    }, [activePeriod]);

    // ========================================================================
    // 4. THE MASTER RENDERER
    // ========================================================================
    
    // FATAL ERROR STATE: If the vault is unreachable
    if (systemError) {
        return (
            <div className="treasury-fatal-error">
                <ServerCrash size={48} className="text-danger" />
                <h2>Ledger Synchronization Failed</h2>
                <p>{systemError}</p>
                <button onClick={() => synchronizeLedger(false)} className="retry-btn">
                    <RefreshCw size={16} /> Attempt Re-Connection
                </button>
            </div>
        );
    }

    return (
        <div className={`treasury-master-chassis ${inspectedTransaction ? 'inspector-engaged' : ''}`}>
            
            {/* --- GLOBAL COMMAND RIBBON --- */}
            <header className="treasury-global-ribbon">
                <div className="ribbon-identity">
                    <ShieldCheck size={24} className="text-brand" />
                    <div className="ribbon-titles">
                        <h1>Financial Treasury</h1>
                        <span>Immutable Reconciled Ledger</span>
                    </div>
                </div>
                
                <div className="ribbon-actions">
                    <button 
                        className="manual-sync-btn" 
                        onClick={handleManualRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'spin-anim' : ''} />
                        <span>Force Sync</span>
                    </button>
                </div>
            </header>

            {/* --- THE KINETIC WORKSPACE --- */}
            <div className="treasury-kinetic-workspace">
                
                {/* LEFT: THE FINANCIAL DATA COLUMN */}
                <div className="data-viewport">
                    
                    {/* 1. High-Command Telemetry */}
                    <TreasuryMetrics 
                        metrics={metrics} 
                        isLoading={isLoading} 
                    />

                    {/* 2. The Time Machine */}
                    <TimeFilterEngine 
                        activePeriod={activePeriod}
                        customRange={customRange}
                        onFilterChange={handleFilterChange}
                        isLoading={isLoading}
                    />

                    {/* 3. The Interactive Matrix */}
                    <LedgerRegistry 
                        transactions={transactions}
                        isLoading={isLoading}
                        activePeriodLabel={activePeriodLabel}
                        onInspectTransaction={setInspectedTransaction}
                    />

                </div>

                {/* RIGHT: THE DEEP INSPECTOR DOCK */}
                {/* It handles its own internal 'isOpen' check to render */}
                <TransactionDock 
                    transaction={inspectedTransaction}
                    isOpen={!!inspectedTransaction}
                    onClose={() => setInspectedTransaction(null)}
                />

            </div>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- ROOT CHASSIS --- */
                .treasury-master-chassis {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    background: var(--bg-canvas);
                    position: relative;
                    overflow: hidden; /* Prevents double scrollbars */
                }

                /* --- GLOBAL COMMAND RIBBON --- */
                .treasury-global-ribbon {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 32px;
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    flex-shrink: 0;
                    z-index: 50;
                }

                .ribbon-identity { display: flex; align-items: center; gap: 16px; }
                .ribbon-titles { display: flex; flex-direction: column; gap: 4px; }
                .ribbon-titles h1 { margin: 0; font-size: 20px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .ribbon-titles span { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

                .manual-sync-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 16px; background: var(--bg-input);
                    border: 1px solid var(--border-subtle); border-radius: 10px;
                    color: var(--text-main); font-size: 13px; font-weight: 700;
                    cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .manual-sync-btn:hover:not(:disabled) {
                    background: var(--bg-surface);
                    border-color: var(--brand-primary);
                    color: var(--brand-primary);
                    box-shadow: 0 4px 12px rgba(206, 172, 92, 0.1);
                }
                .manual-sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                /* --- KINETIC WORKSPACE --- */
                .treasury-kinetic-workspace {
                    display: flex;
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                .data-viewport {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    transition: padding-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow-y: auto; /* Allows the entire left side to scroll natively */
                }

                /* Workspace Compression Physics */
                /* When the dock opens on Desktop, we add 440px of padding to the right 
                   so the matrix compresses perfectly instead of being covered up */
                .inspector-engaged .data-viewport {
                    padding-right: 440px; 
                }

                /* --- FATAL ERROR STATE --- */
                .treasury-fatal-error {
                    height: 100%; width: 100%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; text-align: center;
                    background: var(--bg-canvas); padding: 40px;
                }
                .treasury-fatal-error h2 { font-size: 24px; font-weight: 900; color: var(--text-main); margin: 24px 0 8px 0; }
                .treasury-fatal-error p { color: var(--text-muted); max-width: 400px; line-height: 1.5; margin-bottom: 32px; }
                .retry-btn {
                    display: flex; align-items: center; gap: 8px; padding: 14px 24px;
                    background: var(--text-main); color: var(--bg-surface);
                    border: none; border-radius: 12px; font-size: 14px; font-weight: 800;
                    cursor: pointer; transition: 0.2s;
                }
                .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

                /* --- ANIMATIONS & UTILS --- */
                .text-brand { color: var(--brand-primary); }
                .text-danger { color: var(--status-danger); }
                .spin-anim { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1200px) {
                    /* On smaller laptops, the dock is 400px, so compress less */
                    .inspector-engaged .data-viewport { padding-right: 400px; }
                }

                @media (max-width: 1024px) {
                    /* On Tablets, we abandon workspace compression and let the Dock 
                       act as a standard overlay to save space */
                    .inspector-engaged .data-viewport {
                        padding-right: 0; 
                        filter: blur(4px); /* Blur the background while inspector is open */
                        pointer-events: none; /* Disable background interaction */
                        opacity: 0.6;
                    }
                }

                @media (max-width: 768px) {
                    /* Mobile Adjustments */
                    .treasury-global-ribbon {
                        flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px;
                    }
                    .ribbon-actions, .manual-sync-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default TreasuryModule;