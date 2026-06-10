/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Vaults
 * File: RouteNetwork.jsx
 * * DESCRIPTION:
 * The Master Display Grid for the Partner's geographical corridors. 
 * Renders the purified payload from `adaptRouteBlueprint()` (Cities, Fares, Times).
 * * WORLD-CLASS PHYSICS:
 * 1. JOURNEY BLUEPRINT CARDS: Ticket-style layouts that visually map the 
 * vector from Origin to Destination with temporal telemetry (Duration).
 * 2. FINANCIAL CLARITY: Auto-formats the UGX currency and splits the view 
 * between the assigned Fleet Hardware and the Ticket Price.
 * 3. CONTROLLED WRITE ISOLATION: The "Modify Price" button intercepts clicks 
 * using `e.stopPropagation()` to safely launch the Change Request Engine.
 */

import React from 'react';
import { 
    Map, MapPin, Navigation, Clock, Banknote, 
    FileEdit, ArrowRight, Ticket, Bus, ShieldCheck
} from 'lucide-react';
import StoreAssetBadge from '../interactive/StoreAssetBadge';

// ========================================================================
// 1. DEFENSIVE FORMATTING
// ========================================================================
const formatMoney = (amount) => {
    if (isNaN(amount) || amount === null) return '0';
    return new Intl.NumberFormat('en-UG', { 
        style: 'decimal', 
        maximumFractionDigits: 0 
    }).format(amount);
};

// ========================================================================
// 2. MAIN COMPONENT
// ========================================================================
const RouteNetwork = ({ routes = [], onInspect, onRequestChange }) => {

    if (!routes || routes.length === 0) {
        return (
            <div className="vault-empty-state">
                <div className="empty-icon-ring">
                    <Map size={32} color="var(--text-muted)" />
                </div>
                <h3>No Route Corridors Found</h3>
                <p>There are currently no active or pending geographical routes registered to your corporate identity.</p>
            </div>
        );
    }

    return (
        <div className="routes-vault-chassis">
            
            {/* --- MASTER HEADER --- */}
            <header className="vault-header">
                <div className="header-identity">
                    <div className="vault-icon-box">
                        <Map size={24} color="var(--brand-primary)" />
                    </div>
                    <div className="vault-titles">
                        <h1>Route Network</h1>
                        <p>Geographical corridors, departure schedules, and ticket pricing.</p>
                    </div>
                </div>
                <div className="header-metrics">
                    <div className="metric-pill">
                        <span className="metric-val">{routes.length}</span>
                        <span className="metric-label">Total Routes</span>
                    </div>
                    <div className="metric-pill success">
                        <span className="metric-val">
                            {routes.filter(r => r.status === 'ACTIVE').length}
                        </span>
                        <span className="metric-label">Active</span>
                    </div>
                </div>
            </header>

            {/* --- MASONRY ASSET GRID --- */}
            <div className="routes-grid">
                {routes.map((route) => {
                    return (
                        <div 
                            key={route.id} 
                            className="route-blueprint-card"
                            onClick={() => onInspect && onInspect(route)}
                        >
                            {/* TOP: IDENTITY & STATUS */}
                            <div className="blueprint-header">
                                <div className="route-identity">
                                    <div className="route-icon-wrapper">
                                        <Ticket size={16} />
                                    </div>
                                    <span className="route-code">{route.routeCode}</span>
                                </div>
                                <div className="route-actions">
                                    <StoreAssetBadge status={route.status} size="sm" showLabel={false} />
                                    <button 
                                        className="blueprint-modify-btn"
                                        title="Request Fare or Stop Modification"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRequestChange('ROUTES', route); 
                                        }}
                                    >
                                        <FileEdit size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* MIDDLE: THE GEOGRAPHICAL VECTOR */}
                            <div className="blueprint-vector-zone">
                                <div className="vector-node origin">
                                    <MapPin size={16} className="node-icon" />
                                    <span className="city-name">{route.originCity}</span>
                                    <span className="park-name">{route.departurePark}</span>
                                </div>

                                <div className="vector-path">
                                    <div className="path-line" />
                                    <div className="path-duration">
                                        <Clock size={12} />
                                        <span>{route.durationText}</span>
                                    </div>
                                    <div className="path-arrow">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>

                                <div className="vector-node destination">
                                    <Navigation size={16} className="node-icon" />
                                    <span className="city-name">{route.destinationCity}</span>
                                    <span className="park-name">Arrival Terminal</span>
                                </div>
                            </div>

                            {/* BOTTOM: TELEMETRY & FINANCIALS */}
                            <div className="blueprint-footer">
                                
                                {/* Departure Time */}
                                <div className="telemetry-block">
                                    <span className="telemetry-label">Departure</span>
                                    <span className="telemetry-val time">{route.departureTimeFormatted}</span>
                                </div>

                                {/* Assigned Fleet */}
                                <div className="telemetry-block">
                                    <span className="telemetry-label">Hardware</span>
                                    <div className="fleet-assignment">
                                        <Bus size={12} />
                                        <span className="telemetry-val">{route.assignedFleetClass}</span>
                                    </div>
                                </div>

                                {/* Financial Ledger */}
                                <div className="telemetry-block financial">
                                    <span className="telemetry-label">Customer Fare</span>
                                    <div className="fare-display">
                                        <span className="currency">UGX</span>
                                        <span className="amount">{formatMoney(route.totalFare)}</span>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .routes-vault-chassis {
                    padding: 32px;
                    max-width: 1400px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease;
                }

                /* HEADER PHYSICS */
                .vault-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle);
                }
                .header-identity { display: flex; align-items: center; gap: 20px; }
                .vault-icon-box {
                    width: 56px; height: 56px; background: rgba(206, 172, 92, 0.1);
                    border: 1px solid rgba(206, 172, 92, 0.3); border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                }
                .vault-titles h1 { margin: 0 0 4px 0; font-size: 28px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .vault-titles p { margin: 0; font-size: 14px; color: var(--text-muted); }

                .header-metrics { display: flex; gap: 12px; }
                .metric-pill {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 10px 16px; background: var(--bg-surface);
                    border: 1px solid var(--border-subtle); border-radius: 12px;
                }
                .metric-pill.success { background: rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.2); }
                .metric-val { font-size: 18px; font-weight: 900; color: var(--text-main); line-height: 1; margin-bottom: 4px; }
                .metric-pill.success .metric-val { color: var(--status-success); }
                .metric-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }

                /* GRID PHYSICS */
                .routes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 24px;
                }

                /* BLUEPRINT CARD (The Ticket) */
                .route-blueprint-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    cursor: pointer; display: flex; flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }
                .route-blueprint-card:hover {
                    border-color: var(--border-strong);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }

                /* HEADER ZONE */
                .blueprint-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 16px 20px; border-bottom: 1px dashed var(--border-subtle);
                    background: var(--bg-canvas); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                }
                .route-identity { display: flex; align-items: center; gap: 12px; }
                .route-icon-wrapper {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: var(--bg-input); color: var(--text-muted);
                    display: flex; align-items: center; justify-content: center;
                }
                .route-code { font-size: 16px; font-weight: 900; color: var(--text-main); font-family: monospace; letter-spacing: 1px; }
                
                .route-actions { display: flex; align-items: center; gap: 8px; }
                .blueprint-modify-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: transparent; border: 1px solid var(--border-subtle);
                    color: var(--text-muted); display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .blueprint-modify-btn:hover {
                    background: rgba(206, 172, 92, 0.1); color: var(--brand-primary);
                    border-color: var(--brand-primary);
                }

                /* GEOGRAPHICAL VECTOR ZONE */
                .blueprint-vector-zone {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 24px 20px;
                }
                .vector-node { display: flex; flex-direction: column; width: 100px; }
                .vector-node.origin { align-items: flex-start; text-align: left; }
                .vector-node.destination { align-items: flex-end; text-align: right; }
                
                .node-icon { color: var(--brand-primary); margin-bottom: 8px; }
                .city-name { font-size: 16px; font-weight: 900; color: var(--text-main); line-height: 1.2; margin-bottom: 4px; }
                .park-name { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

                .vector-path {
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    position: relative; padding: 0 16px;
                }
                .path-line {
                    position: absolute; top: 50%; left: 0; right: 0;
                    height: 2px; background: repeating-linear-gradient(90deg, var(--border-strong), var(--border-strong) 4px, transparent 4px, transparent 8px);
                    z-index: 1;
                }
                .path-duration {
                    display: flex; align-items: center; gap: 4px; padding: 4px 12px;
                    background: var(--bg-surface); border: 1px solid var(--border-subtle);
                    border-radius: 100px; font-size: 11px; font-weight: 800; color: var(--text-main);
                    z-index: 2; transform: translateY(-16px);
                }
                .path-arrow {
                    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
                    color: var(--border-strong); background: var(--bg-surface); z-index: 2;
                }

                /* FOOTER TELEMETRY */
                .blueprint-footer {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    padding: 16px 20px; background: var(--bg-input); border-top: 1px solid var(--border-subtle);
                    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
                }
                .telemetry-block { display: flex; flex-direction: column; gap: 4px; }
                .telemetry-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
                .telemetry-val { font-size: 13px; font-weight: 800; color: var(--text-main); }
                .telemetry-val.time { color: var(--brand-primary); font-family: monospace; font-size: 14px; }
                
                .fleet-assignment { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }

                .telemetry-block.financial { align-items: flex-end; text-align: right; }
                .fare-display { display: flex; align-items:baseline; gap: 4px; }
                .currency { font-size: 11px; font-weight: 800; color: var(--text-muted); }
                .amount { font-size: 18px; font-weight: 900; color: var(--status-success); font-family: monospace; line-height: 1; }

                /* EMPTY STATE */
                .vault-empty-state { padding: 80px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .empty-icon-ring { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px dashed var(--border-strong); }
                .vault-empty-state h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 900; color: var(--text-main); }
                .vault-empty-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* MOBILE RESPONSIVE DEGRADATION */
                @media (max-width: 768px) {
                    .routes-vault-chassis { padding: 16px; }
                    .vault-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .routes-grid { grid-template-columns: 1fr; }
                    .blueprint-vector-zone { padding: 20px 16px; }
                    .vector-node { width: 80px; }
                    .city-name { font-size: 14px; }
                    .blueprint-footer { flex-wrap: wrap; gap: 16px; }
                    .telemetry-block.financial { width: 100%; border-top: 1px dashed var(--border-subtle); padding-top: 12px; align-items: space-between; flex-direction: row; justify-content: space-between; }
                }
            `}</style>
        </div>
    );
};

export default RouteNetwork;