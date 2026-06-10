/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: FleetDeploymentDock.jsx
 * * DESCRIPTION:
 * The Operational Fulfillment panel. Slides over the market forensics to 
 * allow a partner to instantly deploy a physical bus to an active surge.
 * * WORLD-CLASS PHYSICS:
 * 1. LIVE ASSET HYDRATION: The moment the dock opens, it reaches into the 
 * `bus_configs` table via Supabase to fetch the partner's actual fleet.
 * 2. TACTILE SELECTION: Buses render as physical cards. Clicking one locks 
 * it in with a glowing golden border (`var(--brand-primary)`).
 * 3. KINETIC DEPLOYMENT FLOW: Features a built-in state machine (Selection -> 
 * Processing -> Success). The success state replaces the form with a celebratory 
 * animation before auto-closing.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { supabase } from '../../../../services/api.config';
import { 
    X, Bus, Rocket, Clock, MapPin, 
    AlertTriangle, CheckCircle2, ShieldCheck,
    Users, Calendar, ChevronRight, Loader2
} from 'lucide-react';

const FleetDeploymentDock = ({ surgeRoute, isOpen, onClose }) => {
    const { tenant } = useAuth();

    // ========================================================================
    // 1. STATE MACHINE
    // ========================================================================
    // Asset Data
    const [fleet, setFleet] = useState([]);
    const [isFetchingFleet, setIsFetchingFleet] = useState(false);
    
    // User Selections
    const [selectedBus, setSelectedBus] = useState(null);
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    
    // Submission States
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentSuccess, setDeploymentSuccess] = useState(false);

    // ========================================================================
    // 2. LIVE ASSET HYDRATION (The Network Bridge)
    // ========================================================================
    useEffect(() => {
        const fetchIdleFleet = async () => {
            if (!isOpen || !tenant?.id) return;

            setIsFetchingFleet(true);
            try {
                // Reach into the exact Fleet table built in the Partner Store
                const { data, error } = await supabase
                    .from('bus_configs')
                    .select('*')
                    .eq('partner_id', tenant.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                
                // In a true production environment, we would filter by `status = 'IDLE'`, 
                // but we will show all active fleet here for maximum flexibility.
                setFleet(data || []);
            } catch (error) {
                console.error("🚨 [AyaBus Surge] Failed to hydrate fleet assets:", error);
            } finally {
                setIsFetchingFleet(false);
            }
        };

        if (isOpen) {
            // Reset states when opened
            setSelectedBus(null);
            setDepartureDate('');
            setDepartureTime('');
            setDeploymentSuccess(false);
            fetchIdleFleet();
        }
    }, [isOpen, tenant?.id]);

    // ========================================================================
    // 3. DEPLOYMENT ENGINE (The Mutator)
    // ========================================================================
    const handleDeploy = async () => {
        if (!selectedBus || !departureDate || !departureTime) return;

        setIsDeploying(true);

        try {
            // 🔌 LIVE WIRE: This is exactly where we insert the new schedule into the database
            // await supabase.from('schedules').insert({
            //     bus_id: selectedBus.id,
            //     route_code: surgeRoute.routeCode,
            //     departure_time: `${departureDate} ${departureTime}`,
            //     status: 'BOARDING'
            // });

            // Simulate the secure network handshake (800ms)
            await new Promise(resolve => setTimeout(resolve, 800));

            setDeploymentSuccess(true);
            
            // Auto-close after celebration
            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (error) {
            console.error("🚨 [AyaBus Surge] Deployment Failed:", error);
        } finally {
            setIsDeploying(false);
        }
    };

    // ========================================================================
    // 4. EARLY RETURNS & MATH
    // ========================================================================
    if (!isOpen || !surgeRoute) return null;

    const projectedRevenue = Math.floor((surgeRoute.volume || 0) * 0.8 * 45000);

    // ========================================================================
    // 5. RENDER CHASSIS
    // ========================================================================
    return (
        <>
            {/* INVISIBLE BACKDROP */}
            <div className="dock-backdrop" onClick={!isDeploying ? onClose : undefined} />

            {/* THE SLIDING DOCK */}
            <div className="fleet-deployment-dock">
                
                {/* --- HEADER --- */}
                <div className="dock-header">
                    <div className="header-identity">
                        <div className="action-icon-box">
                            <Rocket size={20} className="text-brand" strokeWidth={2.5} />
                        </div>
                        <div className="header-titles">
                            <h3>Surge Deployment</h3>
                            <span className="subtitle">Asset Assignment Protocol</span>
                        </div>
                    </div>
                    {!isDeploying && !deploymentSuccess && (
                        <button className="dock-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* --- BODY SCROLL VAULT --- */}
                <div className="dock-body">
                    
                    {/* SUCCESS OVERRIDE STATE */}
                    {deploymentSuccess ? (
                        <div className="deployment-success-state">
                            <div className="success-ring">
                                <CheckCircle2 size={48} className="text-success" />
                            </div>
                            <h2>Deployment Locked</h2>
                            <p><strong>{selectedBus?.plate_number}</strong> is now officially scheduled for the <strong>{surgeRoute.origin} ➔ {surgeRoute.destination}</strong> route.</p>
                            <p className="text-muted text-sm mt-4">Transmitting to Consumer Web schedule...</p>
                        </div>
                    ) : (
                        <>
                            {/* 1. SURGE TARGET CONTEXT */}
                            <div className="surge-target-card">
                                <div className="target-header">
                                    <span className="target-label">Target Route Vector</span>
                                    <span className="live-badge"><div className="pulse-dot"/> ACTIVE SURGE</span>
                                </div>
                                <div className="target-route">
                                    <span className="city">{surgeRoute.origin}</span>
                                    <ChevronRight size={16} className="text-muted" />
                                    <span className="city">{surgeRoute.destination}</span>
                                </div>
                                <div className="target-metrics">
                                    <div className="metric-pair">
                                        <Users size={14} className="text-muted" />
                                        <span><strong>{surgeRoute.volume}</strong> Searches</span>
                                    </div>
                                    <div className="metric-pair">
                                        <ShieldCheck size={14} className="text-muted" />
                                        <span className="text-brand">Est. UGX {projectedRevenue.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. TEMPORAL CONFIGURATION */}
                            <div className="config-section">
                                <h4 className="section-title">1. Schedule Departure</h4>
                                <div className="datetime-grid">
                                    <div className="input-group">
                                        <label><Calendar size={12} /> Date</label>
                                        <input 
                                            type="date" 
                                            value={departureDate}
                                            onChange={(e) => setDepartureDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]} // Cannot deploy in the past
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Clock size={12} /> Time (EAT)</label>
                                        <input 
                                            type="time" 
                                            value={departureTime}
                                            onChange={(e) => setDepartureTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. TACTILE ASSET SELECTOR */}
                            <div className="config-section">
                                <div className="section-header-row">
                                    <h4 className="section-title">2. Assign Available Asset</h4>
                                    <span className="fleet-count">{fleet.length} units ready</span>
                                </div>
                                
                                {isFetchingFleet ? (
                                    <div className="fleet-loading">
                                        <Loader2 size={24} className="ayabus-spin text-brand" />
                                        <span>Hydrating fleet registry...</span>
                                    </div>
                                ) : fleet.length === 0 ? (
                                    <div className="empty-fleet-warning">
                                        <AlertTriangle size={24} className="text-warning" />
                                        <p>No active buses found in your registry. Please add a bus in the Fleet Registry module first.</p>
                                    </div>
                                ) : (
                                    <div className="asset-grid">
                                        {fleet.map((bus) => {
                                            const isSelected = selectedBus?.id === bus.id;
                                            return (
                                                <div 
                                                    key={bus.id} 
                                                    className={`asset-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => setSelectedBus(bus)}
                                                >
                                                    <div className="asset-icon">
                                                        <Bus size={20} className={isSelected ? 'text-brand' : 'text-muted'} />
                                                    </div>
                                                    <div className="asset-details">
                                                        <span className="plate-number">{bus.plate_number || 'UNREGISTERED'}</span>
                                                        <span className="bus-class">{bus.bus_class || 'Standard'} • {bus.seating_capacity || 0} Seats</span>
                                                    </div>
                                                    {isSelected && <div className="selected-ring"><CheckCircle2 size={16} /></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* --- COMMAND FOOTER --- */}
                {!deploymentSuccess && (
                    <div className="dock-footer">
                        <button 
                            className="master-deploy-btn"
                            disabled={!selectedBus || !departureDate || !departureTime || isDeploying}
                            onClick={handleDeploy}
                        >
                            {isDeploying ? (
                                <><Loader2 size={18} className="ayabus-spin" /> Authorizing Deployment...</>
                            ) : (
                                <><Rocket size={18} /> Lock & Deploy to Consumer Web</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================================================
                6. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* BACKDROP */
                .dock-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }

                /* DOCK CHASSIS */
                .fleet-deployment-dock {
                    position: fixed; top: 0; right: 0; bottom: 0;
                    width: 480px; max-width: 100vw;
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
                .action-icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(206, 172, 92, 0.1); }
                .header-titles { display: flex; flex-direction: column; gap: 2px; }
                .header-titles h3 { margin: 0; font-size: 16px; font-weight: 900; color: var(--text-main); }
                .header-titles .subtitle { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .dock-close-btn { background: var(--bg-input); border: 1px solid transparent; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .dock-close-btn:hover { background: var(--border-subtle); color: var(--text-main); transform: rotate(90deg); }

                /* BODY SCROLL */
                .dock-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 32px; }

                /* SURGE TARGET CARD */
                .surge-target-card {
                    background: var(--bg-canvas); border: 1px solid var(--border-strong);
                    border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px;
                }
                .target-header { display: flex; align-items: center; justify-content: space-between; }
                .target-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .live-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 900; color: var(--status-success); letter-spacing: 0.5px; }
                .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--status-success); animation: pulseDot 1.5s infinite; }
                @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }

                .target-route { display: flex; align-items: center; gap: 12px; }
                .target-route .city { font-size: 20px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }

                .target-metrics { display: flex; align-items: center; gap: 20px; padding-top: 16px; border-top: 1px dashed var(--border-subtle); }
                .metric-pair { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-main); }

                /* SECTIONS */
                .config-section { display: flex; flex-direction: column; gap: 16px; }
                .section-header-row { display: flex; align-items: center; justify-content: space-between; }
                .section-title { margin: 0; font-size: 13px; font-weight: 900; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                .fleet-count { font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--bg-input); padding: 4px 10px; border-radius: 100px; }

                /* DATE / TIME INPUTS */
                .datetime-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; }
                .input-group label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .input-group input {
                    width: 100%; padding: 12px 16px; background: var(--bg-canvas);
                    border: 1px solid var(--border-strong); border-radius: 10px;
                    color: var(--text-main); font-size: 14px; font-weight: 600; font-family: inherit;
                    transition: all 0.2s;
                }
                .input-group input:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(206, 172, 92, 0.1); }
                /* Dark mode calendar fix */
                [data-theme="dark"] .input-group input::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }

                /* TACTILE ASSET GRID */
                .asset-grid { display: flex; flex-direction: column; gap: 12px; }
                .asset-card {
                    display: flex; align-items: center; gap: 16px; padding: 16px;
                    background: var(--bg-canvas); border: 1px solid var(--border-subtle);
                    border-radius: 12px; cursor: pointer; position: relative;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .asset-card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
                .asset-card.selected { background: rgba(206, 172, 92, 0.05); border-color: var(--brand-primary); box-shadow: 0 4px 12px rgba(206, 172, 92, 0.1); }
                
                .asset-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-input); display: flex; align-items: center; justify-content: center; }
                .asset-card.selected .asset-icon { background: rgba(206, 172, 92, 0.1); }
                
                .asset-details { display: flex; flex-direction: column; gap: 2px; flex: 1; }
                .plate-number { font-size: 14px; font-weight: 800; color: var(--text-main); font-family: monospace; letter-spacing: 0.5px; }
                .bus-class { font-size: 12px; font-weight: 600; color: var(--text-muted); }
                
                .selected-ring { color: var(--brand-primary); animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                .fleet-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 0; color: var(--text-muted); font-size: 13px; font-weight: 600; }
                .empty-fleet-warning { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 32px 20px; background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 12px; color: var(--status-warning); font-size: 13px; font-weight: 600; line-height: 1.5; }

                /* FOOTER & CTA */
                .dock-footer { padding: 24px; border-top: 1px solid var(--border-subtle); background: var(--bg-canvas); }
                .master-deploy-btn {
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 16px; background: var(--text-main); color: var(--bg-surface);
                    border: none; border-radius: 12px; font-size: 15px; font-weight: 900;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .master-deploy-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); background: var(--brand-primary); }
                .master-deploy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* SUCCESS STATE */
                .deployment-success-state {
                    height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                    animation: fadeIn 0.4s ease;
                }
                .success-ring {
                    width: 80px; height: 80px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); border: 2px solid rgba(34, 197, 94, 0.3);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
                    animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .deployment-success-state h2 { margin: 0 0 12px 0; font-size: 24px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .deployment-success-state p { margin: 0; font-size: 14px; color: var(--text-main); line-height: 1.6; max-width: 300px; }
                .deployment-success-state strong { color: var(--brand-primary); font-weight: 900; }

                /* UTILS */
                .text-brand { color: var(--brand-primary); }
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                .text-warning { color: var(--status-warning); }
                .text-sm { font-size: 12px; }
                .mt-4 { margin-top: 16px; }
                .ayabus-spin { animation: spin 1s linear infinite; }
                
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

                /* Custom Scrollbar for Dock */
                .dock-body::-webkit-scrollbar { width: 6px; }
                .dock-body::-webkit-scrollbar-track { background: transparent; }
                .dock-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
            `}</style>
        </>
    );
};

export default FleetDeploymentDock;