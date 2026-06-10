/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: RouteVelocityChart.jsx
 * * DESCRIPTION:
 * The apex visualizer for Passenger Intent. Renders a native, CSS-driven 
 * horizontal bar chart comparing search volumes across all active network routes.
 * * WORLD-CLASS PHYSICS:
 * 1. RELATIVE SCALING: The #1 most searched route is always 100% width on the chart. 
 * Every subsequent route scales its visual bar relative to that alpha route, 
 * making discrepancies instantly obvious to the human eye.
 * 2. KINETIC REVEAL: Bars use a `cubic-bezier` transition so they smoothly "grow" 
 * into place when the data hydrates.
 * 3. ALPHA HIGHLIGHTING: The top-ranking route is chemically altered to glow 
 * with the Brand Primary color and a Flame icon, instantly drawing the operator's attention.
 */

import React, { useMemo } from 'react';
import { 
    TrendingUp, MapPin, Activity, 
    Flame, ArrowRight, BarChart3
} from 'lucide-react';

const RouteVelocityChart = ({ intentData, isLoading = false }) => {
    // 1. Data Fallbacks
    const safeData = intentData || { totalSearches: 0, topRoutes: [], actionableSurge: null };
    const { totalSearches, topRoutes } = safeData;

    // 2. Mathematical Anchor (Find the highest volume to scale the bars correctly)
    const maxVolume = useMemo(() => {
        if (!topRoutes || topRoutes.length === 0) return 1;
        return Math.max(...topRoutes.map(route => route.volume));
    }, [topRoutes]);

    // ========================================================================
    // 3. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="forensics-card velocity-chassis">
                <div className="card-header skeleton-pulse">
                    <div className="skeleton-icon" />
                    <div className="skeleton-text w-30" />
                </div>
                <div className="velocity-body">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-row skeleton-pulse">
                            <div className="skeleton-text w-20 mb-8" />
                            <div className="skeleton-bar" style={{ width: `${100 - (i * 15)}%` }} />
                        </div>
                    ))}
                </div>
                <style>{`
                    .skeleton-pulse { animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-icon { width: 16px; height: 16px; border-radius: 4px; background: var(--bg-input); }
                    .skeleton-text { height: 14px; background: var(--bg-input); border-radius: 4px; }
                    .skeleton-row { margin-bottom: 24px; }
                    .skeleton-bar { height: 24px; background: var(--bg-input); border-radius: 6px; }
                    .w-20 { width: 20%; } .w-30 { width: 30%; } .mb-8 { margin-bottom: 8px; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 4. THE RENDER ENGINE
    // ========================================================================
    return (
        <div className="forensics-card velocity-chassis">
            
            {/* --- HEADER --- */}
            <div className="card-header">
                <div className="header-titles">
                    <TrendingUp size={16} className="text-brand" />
                    <h3>Network Demand Velocity</h3>
                </div>
                <div className="total-metrics">
                    <span className="metric-value">{totalSearches.toLocaleString()}</span>
                    <span className="metric-label">Active Searches</span>
                </div>
            </div>

            {/* --- BODY (The Scrollable Chart Matrix) --- */}
            <div className="velocity-body">
                
                {/* ZERO STATE */}
                {topRoutes.length === 0 ? (
                    <div className="empty-chart-state">
                        <BarChart3 size={32} className="text-muted" />
                        <h4>No Demand Signals Detected</h4>
                        <p>There is insufficient search volume in the selected timeframe to generate velocity metrics.</p>
                    </div>
                ) : (
                    /* NATIVE BAR CHART */
                    <div className="native-bar-chart">
                        {topRoutes.map((route, index) => {
                            const isAlpha = index === 0;
                            // Math: How wide should this bar be relative to the highest route?
                            const relativeWidth = (route.volume / maxVolume) * 100;

                            return (
                                <div key={route.routeCode} className={`chart-row ${isAlpha ? 'alpha-row' : ''}`}>
                                    
                                    {/* ROW HEADER (Origin -> Destination) */}
                                    <div className="row-header">
                                        <div className="route-identity">
                                            {isAlpha ? (
                                                <Flame size={14} className="text-brand pulse-icon" />
                                            ) : (
                                                <span className="rank-number">{index + 1}</span>
                                            )}
                                            <span className="origin">{route.origin}</span>
                                            <ArrowRight size={12} className="text-muted" />
                                            <span className="destination">{route.destination}</span>
                                        </div>
                                        <div className="route-stats">
                                            <span className="volume-count">{route.volume}</span>
                                            <span className="percentage-share text-muted">{route.percentage}% share</span>
                                        </div>
                                    </div>

                                    {/* ROW BAR (The Visual Data) */}
                                    <div className="bar-track">
                                        <div 
                                            className="bar-fill"
                                            style={{ 
                                                width: `${relativeWidth}%`,
                                                backgroundColor: isAlpha ? 'var(--brand-primary)' : 'var(--bg-input)'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- CONTEXT FOOTER --- */}
            <div className="card-footer">
                <Activity size={14} className="text-muted" />
                <p>Chart scales relatively to the highest-demand route. Prioritize fleet deployment on routes marked with the <strong>Alpha Surge</strong> indicator.</p>
            </div>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- BASE CHASSIS --- */
                .velocity-chassis {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    max-height: 500px; /* Prevents card from growing infinitely */
                }

                /* --- HEADER --- */
                .card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-canvas);
                    flex-shrink: 0;
                }
                .header-titles { display: flex; align-items: center; gap: 10px; }
                .header-titles h3 { margin: 0; font-size: 14px; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .total-metrics { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
                .metric-value { font-family: monospace; font-size: 18px; font-weight: 900; color: var(--text-main); line-height: 1; letter-spacing: -0.5px; }
                .metric-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

                /* --- BODY (Scrollable Data) --- */
                .velocity-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto; /* Internal scrolling if there are many routes */
                }

                /* Custom Scrollbar for the Chart Body */
                .velocity-body::-webkit-scrollbar { width: 6px; }
                .velocity-body::-webkit-scrollbar-track { background: transparent; }
                .velocity-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

                /* --- NATIVE BAR CHART --- */
                .native-bar-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .chart-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .chart-row:hover .origin, .chart-row:hover .destination { color: var(--brand-primary); }
                .chart-row:hover .bar-fill { filter: brightness(1.1); }

                /* Row Header (Text & Math) */
                .row-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .route-identity {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .rank-number {
                    font-size: 11px; font-weight: 900; color: var(--text-muted);
                    width: 16px; text-align: center;
                }
                .origin, .destination {
                    font-size: 13px; font-weight: 800; color: var(--text-main);
                    transition: color 0.2s;
                }

                .route-stats {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                .volume-count { font-family: monospace; font-size: 14px; font-weight: 900; color: var(--text-main); }
                .percentage-share { font-size: 11px; font-weight: 700; width: 60px; text-align: right; }

                /* Bar Track (Visuals) */
                .bar-track {
                    width: 100%;
                    height: 12px;
                    background: var(--bg-canvas);
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid var(--border-subtle);
                }
                .bar-fill {
                    height: 100%;
                    border-radius: 0 6px 6px 0;
                    /* Kinetic Animation: Fills from left to right smoothly */
                    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
                }

                /* The Alpha Route Overrides */
                .alpha-row .origin, .alpha-row .destination { font-size: 15px; color: var(--brand-primary); }
                .alpha-row .volume-count { color: var(--brand-primary); font-size: 16px; }
                .alpha-row .bar-track { height: 16px; border-color: rgba(206, 172, 92, 0.3); }

                /* --- ZERO STATE --- */
                .empty-chart-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    text-align: center; padding: 40px 20px; height: 100%;
                }
                .empty-chart-state h4 { margin: 16px 0 8px 0; font-size: 16px; font-weight: 900; color: var(--text-main); }
                .empty-chart-state p { margin: 0; font-size: 13px; color: var(--text-muted); max-width: 300px; line-height: 1.5; }

                /* --- FOOTER --- */
                .card-footer {
                    padding: 16px 24px; background: var(--bg-input); border-top: 1px solid var(--border-subtle);
                    display: flex; align-items: flex-start; gap: 12px; flex-shrink: 0;
                }
                .card-footer p { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.4; }
                .card-footer strong { color: var(--text-main); font-weight: 800; }

                /* --- UTILS --- */
                .text-brand { color: var(--brand-primary); }
                .text-muted { color: var(--text-muted); }
                .pulse-icon { animation: subtlePulse 2s infinite ease-in-out; }
                
                @keyframes subtlePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.9); }
                }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 640px) {
                    .velocity-chassis { max-height: 400px; }
                    .row-header { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .route-stats { width: 100%; justify-content: space-between; padding-left: 24px; }
                    .percentage-share { text-align: left; }
                }
            `}</style>
        </div>
    );
};

export default RouteVelocityChart;