/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: SupportModule.jsx
 *
 * FIXES APPLIED:
 * 1. Added `activeTickets` state to store only PENDING/PROCESSING tickets.
 * 2. `synchronizeTickets` now reads `response.active` and `response.history`
 *    from the fixed support.service.js — resolved tickets no longer pile up
 *    in the active board.
 * 3. `ActiveTicketsBoard` now receives `activeTickets` instead of all `tickets`
 *    so the board only shows open requests.
 * 4. `SupportRibbon` still receives the full `tickets` array for accurate metrics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, LifeBuoy, ServerCrash } from 'lucide-react';

// --- LIVE WIRES (Network Bridge) ---
import { supportService } from './data/support.service';

// --- ATOMIC COMPONENTS ---
import SupportRibbon from './components/layout/SupportRibbon';
import QuickActionGrid from './components/action/QuickActionGrid';
import LiveCommLink from './components/action/LiveCommLink';
import ActiveTicketsBoard from './components/tracking/ActiveTicketsBoard';
import UniversalRequestDock from './components/forms/UniversalRequestDock';

const SupportModule = () => {
    // ========================================================================
    // 1. SYSTEM CONTEXT & STATE
    // ========================================================================
    const { tenant } = useAuth();

    // Full ticket list — used for metrics in SupportRibbon
    const [tickets, setTickets] = useState([]);

    // FIX: Separate active tickets (PENDING/PROCESSING only) for the board
    const [activeTickets, setActiveTickets] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [systemError, setSystemError] = useState(null);

    // Dock Controller State
    const [activeRequestType, setActiveRequestType] = useState(null);

    // ========================================================================
    // 2. THE NETWORK SYNCHRONIZATION LOOP
    // ========================================================================
    const synchronizeTickets = useCallback(async (isSilentRefresh = false) => {
        if (!tenant?.id) return;

        if (!isSilentRefresh) {
            setIsLoading(true);
        }
        setSystemError(null);

        try {
            const response = await supportService.fetchActiveTickets(tenant.id);

            if (response.success) {
                // Full list for the ribbon metrics
                setTickets(response.data);

                // FIX: Active-only list for the board
                // response.active = PENDING + PROCESSING only
                // response.history = RESOLVED + REJECTED (with admin feedback)
                setActiveTickets(response.active || []);
            } else {
                setSystemError(response.error);
            }
        } catch (error) {
            setSystemError('CRITICAL: Failed to establish secure connection to the L9 Dispatch servers.');
        } finally {
            setIsLoading(false);
        }
    }, [tenant?.id]);

    // Auto-Sync on Mount
    useEffect(() => {
        synchronizeTickets();
    }, [synchronizeTickets]);

    // ========================================================================
    // 3. EVENT DISPATCHERS
    // ========================================================================
    const handleManualRefresh = () => {
        synchronizeTickets(true);
    };

    const openRequestDock = (requestType) => {
        setActiveRequestType(requestType);
    };

    const closeRequestDock = () => {
        setActiveRequestType(null);
    };

    // ========================================================================
    // 4. THE MASTER RENDERER
    // ========================================================================

    // FATAL ERROR STATE
    if (systemError) {
        return (
            <div className="support-fatal-error">
                <ServerCrash size={48} className="text-danger" />
                <h2>Dispatch Connection Failed</h2>
                <p>{systemError}</p>
                <button onClick={() => synchronizeTickets(false)} className="retry-btn">
                    <RefreshCw size={16} /> Attempt Re-Connection
                </button>
            </div>
        );
    }

    return (
        <div className={`support-master-chassis ${activeRequestType ? 'dock-engaged' : ''}`}>

            {/* --- GLOBAL COMMAND RIBBON --- */}
            <header className="support-global-header">
                <div className="header-identity">
                    <div className="icon-vault">
                        <LifeBuoy size={24} className="text-brand" />
                    </div>
                    <div className="header-titles">
                        <h1>Concierge & Support Hub</h1>
                        <span>Maker-Checker Operational Desk</span>
                    </div>
                </div>

                <div className="header-actions">
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
            <div className="support-kinetic-workspace">

                <div className="data-viewport">
                    <div className="workspace-scroll-container">

                        {/* 1. Global Pulse — receives FULL ticket list for accurate metrics */}
                        <section className="telemetry-section">
                            <SupportRibbon
                                tickets={tickets}
                                isLoading={isLoading}
                            />
                        </section>

                        {/* 2. The Asymmetric Bento Grid */}
                        <div className="bento-grid">

                            {/* LEFT COLUMN: Actions & Hotlines */}
                            <div className="bento-col action-col">
                                <QuickActionGrid onRequestOpen={openRequestDock} />
                                <div className="spacer-24" />
                                <LiveCommLink />
                            </div>

                            {/* RIGHT COLUMN: Active Tickets Only */}
                            {/* FIX: passes activeTickets (open only) not full tickets array */}
                            <div className="bento-col tracking-col">
                                <ActiveTicketsBoard
                                    tickets={activeTickets}
                                    isLoading={isLoading}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* THE UNIVERSAL REQUEST DOCK */}
                <UniversalRequestDock
                    isOpen={!!activeRequestType}
                    requestType={activeRequestType}
                    onClose={closeRequestDock}
                    onSuccessTrigger={() => synchronizeTickets(true)}
                />

            </div>

            <style>{`
                .support-master-chassis {
                    display: flex; flex-direction: column; height: 100%; width: 100%;
                    background: var(--bg-canvas); position: relative; overflow: hidden;
                }
                .support-global-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 24px 32px; background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; z-index: 50;
                }
                .header-identity { display: flex; align-items: center; gap: 16px; }
                .icon-vault { width: 44px; height: 44px; border-radius: 12px; background: rgba(206, 172, 92, 0.1); display: flex; align-items: center; justify-content: center; }
                .header-titles { display: flex; flex-direction: column; gap: 2px; }
                .header-titles h1 { margin: 0; font-size: 20px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .header-titles span { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .manual-sync-btn {
                    display: flex; align-items: center; gap: 8px; padding: 10px 16px;
                    background: var(--bg-input); border: 1px solid var(--border-subtle);
                    border-radius: 10px; color: var(--text-main); font-size: 13px;
                    font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .manual-sync-btn:hover:not(:disabled) {
                    background: var(--bg-surface); border-color: var(--brand-primary);
                    color: var(--brand-primary); box-shadow: 0 4px 12px rgba(206, 172, 92, 0.1);
                }
                .manual-sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .support-kinetic-workspace { display: flex; flex: 1; position: relative; overflow: hidden; }
                .data-viewport {
                    flex: 1; display: flex; flex-direction: column;
                    transition: padding-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow-y: auto;
                }
                .workspace-scroll-container { padding-bottom: 40px; }
                .dock-engaged .data-viewport { padding-right: 500px; }
                .telemetry-section { padding: 24px 32px 0 32px; }
                .bento-grid { display: flex; gap: 32px; padding: 32px; align-items: flex-start; }
                .bento-col { display: flex; flex-direction: column; }
                .action-col { flex: 1; min-width: 0; }
                .tracking-col { flex: 1.2; min-width: 0; align-self: stretch; }
                .spacer-24 { height: 24px; }
                .support-fatal-error {
                    height: 100%; width: 100%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; text-align: center;
                    background: var(--bg-canvas); padding: 40px;
                }
                .support-fatal-error h2 { font-size: 24px; font-weight: 900; color: var(--text-main); margin: 24px 0 8px 0; }
                .support-fatal-error p { color: var(--text-muted); max-width: 400px; line-height: 1.5; margin-bottom: 32px; }
                .retry-btn {
                    display: flex; align-items: center; gap: 8px; padding: 14px 24px;
                    background: var(--text-main); color: var(--bg-surface);
                    border: none; border-radius: 12px; font-size: 14px; font-weight: 800;
                    cursor: pointer; transition: 0.2s;
                }
                .retry-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
                .text-brand { color: var(--brand-primary); }
                .text-danger { color: var(--status-danger); }
                .spin-anim { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media (max-width: 1400px) { .dock-engaged .data-viewport { padding-right: 480px; } }
                @media (max-width: 1024px) {
                    .bento-grid { flex-direction: column; }
                    .tracking-col { min-height: 600px; }
                    .dock-engaged .data-viewport { padding-right: 0; filter: blur(4px); pointer-events: none; opacity: 0.6; }
                }
                @media (max-width: 768px) {
                    .support-global-header { flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px; }
                    .header-actions, .manual-sync-btn { width: 100%; justify-content: center; }
                    .telemetry-section { padding: 20px 20px 0 20px; }
                    .bento-grid { padding: 20px; gap: 24px; }
                }
            `}</style>
        </div>
    );
};

export default SupportModule;
