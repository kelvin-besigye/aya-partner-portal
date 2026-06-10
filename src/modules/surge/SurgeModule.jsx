/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: SurgeModule.jsx
 * * DESCRIPTION:
 * The Master Orchestrator for the entire Surge & Market Intelligence ecosystem.
 * Binds the Telemetry Network Bridge to the UI Primitives and controls 
 * the kinetic workspace layouts (Bento-Box grid).
 * * WORLD-CLASS PHYSICS:
 * 1. BENTO-BOX GRID: Utilizes an advanced CSS Grid layout to perfectly pack 
 * the Action Feed, Velocity Chart, and Autopsy data into a highly readable 
 * dashboard that scales flawlessly across monitors.
 * 2. KINETIC COMPRESSION: When the DeploymentDock opens, the main viewport 
 * fluidly recalculates its width (`padding-right: 480px`) to prevent the 
 * data from being hidden behind the overlay.
 * 3. HYDRATION ENGINE: Uses a `useCallback` driven synchronization loop 
 * to fetch the 3 master pipelines simultaneously without race conditions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Radar, ServerCrash } from 'lucide-react';

// --- LIVE WIRES (Network Bridge) ---
import { surgeService } from './data/surge.service';

// --- ATOMIC COMPONENTS ---
import MarketRibbon from './components/layout/MarketRibbon';
import ActionableSurgeFeed from './components/action/ActionableSurgeFeed';
import RouteVelocityChart from './components/forensics/RouteVelocityChart';
import SeatPreferenceGrid from './components/forensics/SeatPreferenceGrid';
import CancellationAutopsy from './components/forensics/CancellationAutopsy';
import FleetDeploymentDock from './components/action/FleetDeploymentDock';

const SurgeModule = () => {
    // ========================================================================
    // 1. SYSTEM CONTEXT & STATE
    // ========================================================================
    
    // Telemetry State
    const [intelligence, setIntelligence] = useState({
        intent: null,
        conversion: null,
        friction: null
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [systemError, setSystemError] = useState(null);

    // Deployment Dock State
    const [deployTarget, setDeployTarget] = useState(null);

    // ========================================================================
    // 2. THE NETWORK SYNCHRONIZATION LOOP
    // ========================================================================
    const synchronizeMarketData = useCallback(async (isSilentRefresh = false) => {
        if (!isSilentRefresh) {
            setIsLoading(true);
        }
        setSystemError(null);

        try {
            // Hit the Sovereign Bridge (Fetches all 3 pipelines concurrently)
            const response = await surgeService.fetchSurgeIntelligence();

            if (response.success) {
                setIntelligence(response.data);
            } else {
                setSystemError(response.error);
            }
        } catch (error) {
            setSystemError('CRITICAL: Failed to establish secure connection to the Market Telemetry pipelines.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-Sync on Mount
    useEffect(() => {
        synchronizeMarketData();
        
        // Optional: Set up a polling interval to refresh market data every 5 minutes
        // const interval = setInterval(() => synchronizeMarketData(true), 300000);
        // return () => clearInterval(interval);
    }, [synchronizeMarketData]);

    // ========================================================================
    // 3. EVENT DISPATCHERS
    // ========================================================================
    const handleManualRefresh = () => {
        synchronizeMarketData(true); // Silent refresh
    };

    const openDeploymentDock = (routeData) => {
        setDeployTarget(routeData);
    };

    const closeDeploymentDock = () => {
        setDeployTarget(null);
    };

    // ========================================================================
    // 4. THE MASTER RENDERER
    // ========================================================================
    
    // FATAL ERROR STATE: If the vault is unreachable
    if (systemError) {
        return (
            <div className="surge-fatal-error">
                <ServerCrash size={48} className="text-danger" />
                <h2>Telemetry Synchronization Failed</h2>
                <p>{systemError}</p>
                <button onClick={() => synchronizeMarketData(false)} className="retry-btn">
                    <RefreshCw size={16} /> Attempt Re-Connection
                </button>
            </div>
        );
    }

    return (
        <div className={`surge-master-chassis ${deployTarget ? 'dock-engaged' : ''}`}>
            
            {/* --- GLOBAL COMMAND RIBBON --- */}
            <header className="surge-global-ribbon">
                <div className="ribbon-identity">
                    <Radar size={24} className="text-brand radar-spin" />
                    <div className="ribbon-titles">
                        <h1>Surge Exchange</h1>
                        <span>Live Market Intelligence & Asset Deployment</span>
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
            <div className="surge-kinetic-workspace">
                
                {/* THE FINANCIAL DATA VIEWPORT */}
                <div className="data-viewport">
                    
                    <div className="workspace-scroll-container">
                        {/* 1. Global Pulse (Top Ribbon) */}
                        <MarketRibbon 
                            intelligence={intelligence} 
                            isLoading={isLoading} 
                        />

                        {/* 2. The Bento-Box Grid */}
                        <div className="bento-grid">
                            
                            {/* ROW 1: Action & Intent (Top Priority) */}
                            <div className="bento-row intent-row">
                                <div className="bento-cell action-feed-cell">
                                    <ActionableSurgeFeed 
                                        intentData={intelligence.intent}
                                        conversionData={intelligence.conversion}
                                        isLoading={isLoading}
                                        onDeployAsset={openDeploymentDock}
                                    />
                                </div>
                                <div className="bento-cell velocity-cell">
                                    <RouteVelocityChart 
                                        intentData={intelligence.intent}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>

                            {/* ROW 2: Deep Forensics (Analytics) */}
                            <div className="bento-row forensics-row">
                                <div className="bento-cell seat-cell">
                                    <SeatPreferenceGrid 
                                        seatHeatmap={intelligence.conversion?.seatHeatmap}
                                        totalBookings={intelligence.conversion?.totalBookings}
                                        isLoading={isLoading}
                                    />
                                </div>
                                <div className="bento-cell autopsy-cell">
                                    <CancellationAutopsy 
                                        frictionData={intelligence.friction}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT: THE DEEP INSPECTOR DOCK */}
                {/* It handles its own internal 'isOpen' check to render */}
                <FleetDeploymentDock 
                    surgeRoute={deployTarget}
                    isOpen={!!deployTarget}
                    onClose={closeDeploymentDock}
                />

            </div>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- ROOT CHASSIS --- */
                .surge-master-chassis {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    background: var(--bg-canvas);
                    position: relative;
                    overflow: hidden; /* Prevents double scrollbars */
                }

                /* --- GLOBAL COMMAND RIBBON --- */
                .surge-global-ribbon {
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
                .surge-kinetic-workspace {
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

                .workspace-scroll-container {
                    padding-bottom: 40px; /* Breathing room at bottom */
                }

                /* Workspace Compression Physics */
                /* When the dock opens on Desktop, we add 480px of padding to the right 
                   so the matrix compresses perfectly instead of being covered up */
                .dock-engaged .data-viewport {
                    padding-right: 480px; 
                }

                /* --- BENTO-BOX GRID --- */
                .bento-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding: 0 32px;
                }

                .bento-row {
                    display: flex;
                    gap: 24px;
                }

                /* Row 1: Action (Left 60%) + Velocity Chart (Right 40%) */
                .action-feed-cell { flex: 3; min-width: 0; }
                .velocity-cell { flex: 2; min-width: 0; }

                /* Row 2: Forensics 50/50 Split */
                .seat-cell { flex: 1; min-width: 0; }
                .autopsy-cell { flex: 1; min-width: 0; }

                /* --- FATAL ERROR STATE --- */
                .surge-fatal-error {
                    height: 100%; width: 100%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; text-align: center;
                    background: var(--bg-canvas); padding: 40px;
                }
                .surge-fatal-error h2 { font-size: 24px; font-weight: 900; color: var(--text-main); margin: 24px 0 8px 0; }
                .surge-fatal-error p { color: var(--text-muted); max-width: 400px; line-height: 1.5; margin-bottom: 32px; }
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
                .radar-spin { animation: spin 4s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1400px) {
                    /* On smaller laptops, switch Row 1 to 50/50 */
                    .action-feed-cell { flex: 1; }
                    .velocity-cell { flex: 1; }
                }

                @media (max-width: 1200px) {
                    /* Compress less for the dock */
                    .dock-engaged .data-viewport { padding-right: 440px; }
                }

                @media (max-width: 1024px) {
                    /* Tablets: Abandon Bento Row layout, stack everything vertically */
                    .bento-row { flex-direction: column; }
                    
                    /* Abandon workspace compression, let dock act as standard overlay */
                    .dock-engaged .data-viewport {
                        padding-right: 0; 
                        filter: blur(4px); 
                        pointer-events: none; 
                        opacity: 0.6;
                    }
                }

                @media (max-width: 768px) {
                    /* Mobile Adjustments */
                    .surge-global-ribbon {
                        flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px;
                    }
                    .ribbon-actions, .manual-sync-btn { width: 100%; justify-content: center; }
                    .bento-grid { padding: 0 16px; }
                }
            `}</style>
        </div>
    );
};

export default SurgeModule;