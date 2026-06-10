/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Master Controller
 * File: PartnerStoreModule.jsx
 * * DESCRIPTION:
 * The apex orchestration matrix for the Partner Asset Ecosystem. 
 * Manages the data hydration bridge, the kinetic workspace layout, 
 * and the secure "Controlled Write" modification workflow.
 * * WORLD-CLASS UPGRADES:
 * 1. THE UUID FIX: Hardwired `tenantId` to specifically extract the UUID (`tenant.id`), 
 * bypassing the short-code mismatch that caused the Postgres 500 Fault.
 * 2. KINETIC GRID WORKSPACE: The viewport now uses a dynamic CSS Grid transition. 
 * When the Inspector opens, the vault mathematically scales down to fit, preventing 
 * horizontal overflow and ensuring X/Y scroll perfection.
 * 3. HYDRATION MULTIPLEXING: Retains massive JSONB payloads in a secure 
 * local cache, meaning switching between 100 routes and 50 buses is instant.
 * 4. FULL COMPONENT WIRING: All UI primitives (Badges, Docks, Tabs) and the 
 * 4 Vaults are explicitly connected to the Sovereign Data Layer.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Loader2, AlertTriangle, RefreshCw, Server, 
    ShieldCheck, Database, CheckCircle2 
} from 'lucide-react';

// --- CONTEXT & API ---
import { useAuth } from '../../context/AuthContext';
import { storeService } from './data/store.service';
import { STORE_ASSET_TYPES } from './data/store.dictionary';

// --- ECOSYSTEM PRIMITIVES ---
import StoreTabBar from './components/layout/StoreTabBar';
import StoreInspectorDock from './components/layout/StoreInspectorDock';
import ChangeRequestEngine from './components/interactive/ChangeRequestEngine';

// --- THE 4 DATA VAULTS ---
import CorporateIdentity from './components/sections/CorporateIdentity';
import FleetRegistry from './components/sections/FleetRegistry';
import RouteNetwork from './components/sections/RouteNetwork';
import MasterTimetable from './components/sections/MasterTimetable';

const PartnerStoreModule = () => {
    // ========================================================================
    // 1. SYSTEM CHASSIS & IDENTITY (The UUID Fix)
    // ========================================================================
    const { tenant } = useAuth();
    
    // 🚨 SURGICAL FIX: We strictly extract the UUID to satisfy Postgres.
    // We explicitly ignore the short-code (e.g., 'KMTT') to prevent the 500 Fault.
    const tenantId = tenant?.id;

    // --- WORKSPACE STATE ---
    const [activeTab, setActiveTab] = useState(STORE_ASSET_TYPES.CORPORATE.id);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [modEngineConfig, setModEngineConfig] = useState({ isOpen: false, asset: null });

    // --- MULTIPLEX CACHE ---
    const [vaultCache, setVaultCache] = useState({
        [STORE_ASSET_TYPES.CORPORATE.id]: null,
        [STORE_ASSET_TYPES.FLEET.id]: null,
        [STORE_ASSET_TYPES.ROUTES.id]: null,
        [STORE_ASSET_TYPES.TIMETABLE.id]: null,
    });

    // --- TELEMETRY STATE ---
    const [isHydrating, setIsHydrating] = useState(true);
    const [systemFault, setSystemFault] = useState(null);
    const [lastSyncTime, setLastSyncTime] = useState(new Date());

    // ========================================================================
    // 2. SOVEREIGN HYDRATION ENGINE
    // ========================================================================
    const hydrateEcosystem = useCallback(async (tabTarget, forceBypassCache = false) => {
        if (!tenantId) {
            setSystemFault('IDENTITY_LOCK_CRITICAL: Cannot authenticate Partner UUID partition.');
            setIsHydrating(false);
            return;
        }
        
        // Zero-Latency Return: If data exists and we aren't forcing a refresh
        if (vaultCache[tabTarget] && !forceBypassCache) {
            setIsHydrating(false);
            return;
        }

        setIsHydrating(true);
        setSystemFault(null);

        let payloadResponse;
        switch (tabTarget) {
            case STORE_ASSET_TYPES.CORPORATE.id:
                payloadResponse = await storeService.fetchCorporateIdentity(tenantId);
                break;
            case STORE_ASSET_TYPES.FLEET.id:
                payloadResponse = await storeService.fetchFleetRegistry(tenantId);
                break;
            case STORE_ASSET_TYPES.ROUTES.id:
                payloadResponse = await storeService.fetchRouteNetwork(tenantId);
                break;
            case STORE_ASSET_TYPES.TIMETABLE.id:
                payloadResponse = await storeService.fetchMasterTimetable(tenantId);
                break;
            default:
                payloadResponse = { success: false, error: 'UNKNOWN_VAULT_TARGET' };
        }

        if (payloadResponse.success) {
            setVaultCache(prev => ({ ...prev, [tabTarget]: payloadResponse.data }));
            setLastSyncTime(new Date());
        } else {
            setSystemFault(payloadResponse.error || 'Failed to establish secure link with Sovereign DB.');
        }

        setIsHydrating(false);
    }, [tenantId, vaultCache]);

    // Initial Mount & Tab Switching Hook
    useEffect(() => {
        hydrateEcosystem(activeTab);
    }, [activeTab, hydrateEcosystem]);

    // ========================================================================
    // 3. LIVE WIRE INTERACTION LOGIC
    // ========================================================================
    const handleTabSwitch = (newTabId) => {
        if (activeTab === newTabId) return;
        setSelectedAsset(null); // Retract inspector dock when switching context
        setActiveTab(newTabId);
    };

    const handleInspectAsset = (asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseInspector = () => {
        setSelectedAsset(null);
    };

    const handleTriggerModification = (assetType, asset) => {
        // Normalizes the asset wrapper to ensure the Change Request Engine always has context
        const standardizedAsset = { ...asset, assetType };
        setModEngineConfig({ isOpen: true, asset: standardizedAsset });
    };

    const handleModificationSuccess = () => {
        // Purge cache for current tab and force a fresh pull from DB
        // to immediately reflect the 'UPDATE_PENDING' lock status.
        hydrateEcosystem(activeTab, true);
        setSelectedAsset(null); 
    };

    // ========================================================================
    // 4. VAULT RENDERER (Polymorphic Core)
    // ========================================================================
    const renderActiveVault = () => {
        const currentData = vaultCache[activeTab];

        if (isHydrating && !currentData) {
            return (
                <div className="telemetry-loading-state">
                    <div className="loader-ring">
                        <Loader2 size={40} className="ayabus-spin" color="var(--brand-primary)" />
                    </div>
                    <h3>Hydrating Vault Data</h3>
                    <p>Decrypting enterprise payloads and establishing database links...</p>
                </div>
            );
        }

        if (systemFault) {
            return (
                <div className="telemetry-fault-state">
                    <div className="fault-ring">
                        <AlertTriangle size={40} color="var(--status-error)" />
                    </div>
                    <h3>Synchronization Fault</h3>
                    <p>{systemFault}</p>
                    <button className="manual-override-btn" onClick={() => hydrateEcosystem(activeTab, true)}>
                        <RefreshCw size={16} /> Execute Manual Override
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case STORE_ASSET_TYPES.CORPORATE.id:
                return <CorporateIdentity profile={currentData} onRequestChange={(asset) => handleTriggerModification(STORE_ASSET_TYPES.CORPORATE.id, asset)} />;
            case STORE_ASSET_TYPES.FLEET.id:
                return <FleetRegistry fleet={currentData} onInspect={handleInspectAsset} onRequestChange={(asset) => handleTriggerModification(STORE_ASSET_TYPES.FLEET.id, asset)} />;
            case STORE_ASSET_TYPES.ROUTES.id:
                return <RouteNetwork routes={currentData} onInspect={handleInspectAsset} onRequestChange={(asset) => handleTriggerModification(STORE_ASSET_TYPES.ROUTES.id, asset)} />;
            case STORE_ASSET_TYPES.TIMETABLE.id:
                return <MasterTimetable schedules={currentData} onInspect={handleInspectAsset} onRequestChange={(asset) => handleTriggerModification(STORE_ASSET_TYPES.TIMETABLE.id, asset)} />;
            default:
                return null;
        }
    };

    // ========================================================================
    // 5. MASTER DOM ASSEMBLY
    // ========================================================================
    return (
        <div className="sovereign-store-module">
            
            {/* =========================================
                GLOBAL TELEMETRY RIBBON
            ========================================= */}
            <header className="store-global-ribbon">
                <div className="ribbon-identity">
                    <div className="ribbon-icon-wrapper">
                        <Database size={20} color="var(--brand-primary)" />
                    </div>
                    <div className="ribbon-titles">
                        <h1>Sovereign Asset Store</h1>
                        <span>Enterprise Fleet & Logic Management</span>
                    </div>
                </div>

                <div className="ribbon-telemetry">
                    <div className="sync-status">
                        <span className="sync-label">Last Sync:</span>
                        <span className="sync-time">{lastSyncTime.toLocaleTimeString()}</span>
                        {isHydrating ? (
                            <RefreshCw size={14} className="ayabus-spin text-muted" />
                        ) : (
                            <CheckCircle2 size={14} className="text-success" />
                        )}
                    </div>
                    
                    <button 
                        className="force-sync-btn"
                        onClick={() => hydrateEcosystem(activeTab, true)}
                        title="Force cache invalidation and re-sync"
                        disabled={isHydrating}
                    >
                        <RefreshCw size={14} className={isHydrating ? 'ayabus-spin' : ''} />
                        <span>Refresh Vault</span>
                    </button>
                </div>
            </header>

            {/* =========================================
                NAVIGATION MATRIX
            ========================================= */}
            <StoreTabBar activeTab={activeTab} onTabChange={handleTabSwitch} />

            {/* =========================================
                KINETIC WORKSPACE (CSS Grid Controlled)
            ========================================= */}
            <div className={`store-kinetic-workspace ${selectedAsset ? 'inspector-engaged' : ''}`}>
                
                {/* PRIMARY VAULT VIEWPORT */}
                <main className="vault-viewport">
                    <div className="vault-scroll-matrix">
                        {renderActiveVault()}
                    </div>
                </main>

                {/* SLIDING DEEP INSPECTOR DOCK */}
                {selectedAsset && (
                    <aside className="deep-inspector-dock">
                        <StoreInspectorDock 
                            selectedAsset={selectedAsset} 
                            onClose={handleCloseInspector}
                            onRequestChange={() => handleTriggerModification(activeTab, selectedAsset)}
                        />
                    </aside>
                )}
            </div>

            {/* =========================================
                SECURE MODIFICATION WIZARD (Z-INDEX: 9999)
            ========================================= */}
            <ChangeRequestEngine 
                isOpen={modEngineConfig.isOpen}
                onClose={() => setModEngineConfig({ isOpen: false, asset: null })}
                asset={modEngineConfig.asset}
                tenantId={tenantId}
                onSuccess={handleModificationSuccess}
            />

            {/* =========================================
                WORLD-CLASS CSS PHYSICS ENGINE
            ========================================= */}
            <style>{`
                /* ROOT CHASSIS */
                .sovereign-store-module {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    background: var(--bg-canvas);
                    overflow: hidden;
                    position: relative;
                }

                /* --- GLOBAL TELEMETRY RIBBON --- */
                .store-global-ribbon {
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
                .ribbon-icon-wrapper { width: 44px; height: 44px; background: rgba(206, 172, 92, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .ribbon-titles { display: flex; flex-direction: column; gap: 2px; }
                .ribbon-titles h1 { margin: 0; font-size: 20px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .ribbon-titles span { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .ribbon-telemetry { display: flex; align-items: center; gap: 24px; }
                .sync-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; background: var(--bg-input); padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border-subtle); }
                .sync-label { color: var(--text-muted); }
                .sync-time { color: var(--text-main); font-family: monospace; }
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                
                .force-sync-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 20px; border-radius: 10px;
                    background: transparent; border: 1px solid var(--border-strong);
                    color: var(--text-main); font-size: 13px; font-weight: 800;
                    cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .force-sync-btn:hover:not(:disabled) {
                    background: rgba(206, 172, 92, 0.1); border-color: var(--brand-primary); color: var(--brand-primary); box-shadow: 0 4px 12px rgba(206,172,92,0.1);
                }
                .force-sync-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* --- KINETIC WORKSPACE (The Core) --- */
                .store-kinetic-workspace {
                    display: grid;
                    /* Default: Vault takes 100%, Dock takes 0 */
                    grid-template-columns: 1fr 0px; 
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-canvas);
                    transition: grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .store-kinetic-workspace.inspector-engaged {
                    /* When engaged: Vault calculates space, Dock takes 460px */
                    grid-template-columns: 1fr 460px;
                }

                /* PRIMARY VIEWPORT: OMNI-DIRECTIONAL SCROLLING */
                .vault-viewport {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden; /* Force scroll handling to the inner matrix */
                    position: relative;
                    border-right: 1px solid transparent;
                    transition: border-color 0.4s ease;
                }

                .store-kinetic-workspace.inspector-engaged .vault-viewport {
                    border-right-color: var(--border-subtle);
                }

                .vault-scroll-matrix {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: auto; /* Absolute safety for wide horizontal data grids */
                    -webkit-overflow-scrolling: touch;
                }

                /* ENTERPRISE SCROLLBARS */
                .vault-scroll-matrix::-webkit-scrollbar { width: 8px; height: 8px; }
                .vault-scroll-matrix::-webkit-scrollbar-track { background: transparent; }
                .vault-scroll-matrix::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; border: 2px solid var(--bg-canvas); }
                .vault-scroll-matrix::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

                /* --- DEEP INSPECTOR DOCK --- */
                .deep-inspector-dock {
                    height: 100%;
                    background: var(--bg-surface);
                    overflow: hidden; /* Content inside the dock will handle its own scroll */
                    box-shadow: -12px 0 40px rgba(0,0,0,0.03);
                }

                /* --- LOADING & FAULT STATES --- */
                .telemetry-loading-state, .telemetry-fault-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; min-height: 400px; width: 100%; text-align: center; padding: 40px;
                    animation: fadeIn 0.4s ease;
                }
                .loader-ring, .fault-ring {
                    width: 80px; height: 80px; border-radius: 50%;
                    background: var(--bg-input); display: flex; align-items: center; justify-content: center;
                    margin-bottom: 24px; border: 1px dashed var(--border-strong);
                }
                .fault-ring { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }
                
                .telemetry-loading-state h3, .telemetry-fault-state h3 { margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: var(--text-main); }
                .telemetry-loading-state p, .telemetry-fault-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 450px; line-height: 1.6; }
                
                .manual-override-btn {
                    margin-top: 32px; display: flex; align-items: center; gap: 8px;
                    padding: 14px 28px; background: var(--bg-surface); border: 1px solid var(--border-strong);
                    border-radius: 12px; color: var(--text-main); font-size: 14px; font-weight: 800;
                    cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .manual-override-btn:hover { background: var(--bg-input); border-color: var(--brand-primary); color: var(--brand-primary); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.05); }

                /* ANIMATIONS */
                .ayabus-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================
                   RESPONSIVE DEGRADATION (Mobile & Tablet)
                ========================================= */
                @media (max-width: 1200px) {
                    .store-kinetic-workspace.inspector-engaged {
                        grid-template-columns: 1fr 400px; /* Compress dock slightly on small laptops */
                    }
                }

                @media (max-width: 1024px) {
                    /* On Tablet/Mobile, abandon Grid. Use Absolute positioning for the Dock to overlay the Vault */
                    .store-kinetic-workspace { display: flex; }
                    
                    .deep-inspector-dock {
                        position: absolute;
                        top: 0; right: 0; bottom: 0;
                        width: 400px;
                        transform: translateX(100%);
                        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        z-index: 40;
                    }

                    .store-kinetic-workspace.inspector-engaged .deep-inspector-dock {
                        transform: translateX(0);
                        box-shadow: -20px 0 80px rgba(0,0,0,0.2);
                    }

                    .store-kinetic-workspace.inspector-engaged .vault-viewport {
                        filter: blur(4px);
                        pointer-events: none; /* Disable background clicks */
                        opacity: 0.6;
                    }
                }

                @media (max-width: 768px) {
                    /* Mobile Adjustments */
                    .store-global-ribbon { flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px 20px; }
                    .ribbon-telemetry { width: 100%; justify-content: space-between; flex-wrap: wrap; }
                    .deep-inspector-dock { width: 100%; } /* Full screen takeover */
                }
            `}</style>
        </div>
    );
};

export default PartnerStoreModule;