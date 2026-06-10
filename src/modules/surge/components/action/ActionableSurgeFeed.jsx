/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: ActionableSurgeFeed.jsx
 * * DESCRIPTION:
 * The Action & Revenue layer. Reads the market forensics and generates 
 * high-priority deployment alerts. It merges Intent (Search Volume) and 
 * Conversion (Seat Preferences) into a single, undeniable Call to Action.
 * * WORLD-CLASS PHYSICS:
 * 1. ALPHA HIGHLIGHTING: The #1 surge route is elevated into a "Hero Card" 
 * with a dark/gold gradient, pulsing radar rings, and a massive CTA.
 * 2. SYNTHESIZED INSIGHTS: Natively reads the SeatPreference matrix and injects 
 * it into the text (e.g., "80% prefer Front-Row").
 * 3. KINETIC BUTTONS: The deployment buttons feature a micro-lift and a sliding 
 * rocket icon to psychologically encourage the click.
 */

import React from 'react';
import { 
    Rocket, Flame, Bus, 
    AlertCircle, CheckCircle2, TrendingUp,
    MapPin, ChevronRight, Zap
} from 'lucide-react';

const ActionableSurgeFeed = ({ 
    intentData, 
    conversionData, 
    isLoading = false, 
    onDeployAsset 
}) => {
    // 1. Defend the Render
    const safeIntent = intentData || { topRoutes: [], actionableSurge: null };
    const safeConversion = conversionData || { seatHeatmap: [] };
    
    const topRoutes = safeIntent.topRoutes.slice(0, 3); // Get Top 3 Surges
    const alphaSurge = safeIntent.actionableSurge;
    
    // Find the most requested seat type to make the alert hyper-specific
    const topSeatPreference = safeConversion.seatHeatmap.length > 0 
        ? safeConversion.seatHeatmap[0] 
        : null;

    // ========================================================================
    // 2. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="action-feed-chassis">
                <div className="skeleton-alpha-card skeleton-pulse" />
                <div className="secondary-feed">
                    <div className="skeleton-beta-card skeleton-pulse" />
                    <div className="skeleton-beta-card skeleton-pulse" />
                </div>
                <style>{`
                    .skeleton-pulse { animation: pulseFade 1.5s infinite ease-in-out; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; }
                    .skeleton-alpha-card { height: 280px; margin-bottom: 24px; }
                    .skeleton-beta-card { height: 140px; flex: 1; }
                    .secondary-feed { display: flex; gap: 24px; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 3. ZERO STATE
    // ========================================================================
    if (!alphaSurge) {
        return (
            <div className="action-feed-chassis empty-state">
                <div className="empty-ring">
                    <CheckCircle2 size={32} className="text-success" />
                </div>
                <h3>Network Fully Optimized</h3>
                <p>There are no unfulfilled demand spikes currently detected. All active passenger searches align with your deployed capacity.</p>
            </div>
        );
    }

    // ========================================================================
    // 4. THE RENDER ENGINE
    // ========================================================================
    
    // Abstract mathematical projection for B2B FOMO. 
    // Assumes an average ticket price of UGX 45,000 and 80% capture rate.
    const calculateProjectedValue = (volume) => {
        const projected = Math.floor(volume * 0.8 * 45000);
        return `UGX ${projected.toLocaleString()}`;
    };

    return (
        <div className="action-feed-chassis">
            
            {/* --- THE ALPHA SURGE (Hero Card) --- */}
            <div className="alpha-surge-card">
                
                {/* Background Radar Rings */}
                <div className="radar-ring ring-1" />
                <div className="radar-ring ring-2" />

                <div className="alpha-header">
                    <div className="urgency-badge">
                        <Flame size={14} />
                        <span>Critical Alpha Surge</span>
                    </div>
                    <span className="timestamp-live">
                        <div className="live-dot" /> LIVE TELEMETRY
                    </span>
                </div>

                <div className="alpha-body">
                    <div className="route-lockup">
                        <h2>{alphaSurge.origin} <ChevronRight size={20} className="text-brand mx-2" /> {alphaSurge.destination}</h2>
                        <div className="volume-tag">
                            <TrendingUp size={16} />
                            <span>{alphaSurge.volume} Unmatched Searches</span>
                        </div>
                    </div>

                    <div className="ai-insight-box">
                        <Zap size={18} className="text-brand flex-shrink-0" />
                        <p>
                            AyaBus detects a massive supply shortage for <strong>{alphaSurge.origin} to {alphaSurge.destination}</strong>. 
                            {topSeatPreference && ` Telemetry indicates ${topSeatPreference.percentage}% of passengers specifically want ${topSeatPreference.positionLabel} ${topSeatPreference.typeLabel}s.`}
                            Deploy an asset immediately to lock in a projected <strong>{calculateProjectedValue(alphaSurge.volume)}</strong>.
                        </p>
                    </div>
                </div>

                <div className="alpha-footer">
                    <button 
                        className="cta-deploy-btn alpha-btn"
                        onClick={() => onDeployAsset && onDeployAsset(alphaSurge)}
                    >
                        <Rocket size={18} className="rocket-icon" />
                        <span>Assign Idle Fleet & Capture</span>
                    </button>
                    <span className="fleet-hint">Takes 2 clicks to deploy</span>
                </div>
            </div>

            {/* --- THE SECONDARY FEED (Beta Surges) --- */}
            {topRoutes.length > 1 && (
                <div className="secondary-feed-grid">
                    {topRoutes.slice(1).map((route, idx) => (
                        <div key={route.routeCode} className="beta-surge-card">
                            <div className="beta-header">
                                <span className="beta-route">{route.origin} ➔ {route.destination}</span>
                                <span className="beta-volume">{route.volume} Searches</span>
                            </div>
                            <div className="beta-body">
                                <p>Secondary demand spike detected. Projected value: <strong>{calculateProjectedValue(route.volume)}</strong>.</p>
                            </div>
                            <button 
                                className="cta-deploy-btn beta-btn"
                                onClick={() => onDeployAsset && onDeployAsset(route)}
                            >
                                <Bus size={14} />
                                <span>Deploy Asset</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- CHASSIS --- */
                .action-feed-chassis {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* --- ALPHA SURGE CARD --- */
                .alpha-surge-card {
                    position: relative;
                    background: linear-gradient(145deg, var(--bg-surface) 0%, rgba(206, 172, 92, 0.08) 100%);
                    border: 1px solid var(--brand-primary);
                    border-radius: 20px;
                    padding: 32px;
                    overflow: hidden;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.05);
                }

                /* Radar Animations */
                .radar-ring {
                    position: absolute; top: -50px; right: -50px;
                    border-radius: 50%; border: 1px solid var(--brand-primary);
                    opacity: 0; pointer-events: none;
                }
                .ring-1 { width: 300px; height: 300px; animation: radarPulse 4s infinite linear; }
                .ring-2 { width: 500px; height: 500px; animation: radarPulse 4s infinite linear 2s; }
                
                @keyframes radarPulse {
                    0% { transform: scale(0.5); opacity: 0.3; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                /* Alpha Header */
                .alpha-header {
                    position: relative; z-index: 10;
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 24px;
                }
                .urgency-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: var(--brand-primary); color: #FFF;
                    padding: 6px 14px; border-radius: 100px;
                    font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;
                    box-shadow: 0 4px 12px rgba(206, 172, 92, 0.3);
                }
                .timestamp-live {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 10px; font-weight: 800; color: var(--status-success); letter-spacing: 1px;
                }
                .live-dot { width: 6px; height: 6px; background: var(--status-success); border-radius: 50%; animation: blink 1s infinite; }
                @keyframes blink { 50% { opacity: 0.3; } }

                /* Alpha Body */
                .alpha-body { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 20px; }
                .route-lockup { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
                .route-lockup h2 { margin: 0; font-size: 28px; font-weight: 900; color: var(--text-main); display: flex; align-items: center; letter-spacing: -1px; }
                .mx-2 { margin: 0 8px; }
                
                .volume-tag {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 8px 16px; background: var(--bg-canvas);
                    border: 1px solid var(--border-strong); border-radius: 8px;
                    color: var(--text-main); font-size: 14px; font-weight: 800;
                }

                .ai-insight-box {
                    display: flex; align-items: flex-start; gap: 12px;
                    background: rgba(255, 255, 255, 0.05); /* Respects dark mode naturally */
                    border-left: 3px solid var(--brand-primary);
                    padding: 16px 20px; border-radius: 0 12px 12px 0;
                }
                .ai-insight-box p { margin: 0; font-size: 14px; color: var(--text-main); line-height: 1.6; }
                .ai-insight-box strong { color: var(--brand-primary); font-weight: 900; }

                /* Alpha Footer & CTA */
                .alpha-footer {
                    position: relative; z-index: 10;
                    margin-top: 32px; display: flex; align-items: center; gap: 16px;
                }
                .cta-deploy-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .alpha-btn {
                    background: var(--text-main); color: var(--bg-surface);
                    padding: 16px 32px; border-radius: 12px;
                    font-size: 15px; font-weight: 900;
                }
                .alpha-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    background: var(--brand-primary);
                }
                .alpha-btn:hover .rocket-icon { transform: translateY(-4px) translateX(4px); }
                .rocket-icon { transition: transform 0.3s ease; }
                
                .fleet-hint { font-size: 12px; font-weight: 700; color: var(--text-muted); }

                /* --- SECONDARY FEED (BETA SURGES) --- */
                .secondary-feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .beta-surge-card {
                    background: var(--bg-surface); border: 1px solid var(--border-subtle);
                    border-radius: 16px; padding: 24px; display: flex; flex-direction: column;
                    transition: all 0.2s ease;
                }
                .beta-surge-card:hover { border-color: var(--border-strong); box-shadow: 0 8px 24px rgba(0,0,0,0.03); transform: translateY(-2px); }

                .beta-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .beta-route { font-size: 15px; font-weight: 800; color: var(--text-main); }
                .beta-volume { font-size: 11px; font-weight: 800; color: var(--status-success); background: rgba(34, 197, 94, 0.1); padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }

                .beta-body { margin-bottom: 20px; flex: 1; }
                .beta-body p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
                .beta-body strong { color: var(--text-main); font-weight: 800; }

                .beta-btn {
                    width: 100%; background: var(--bg-canvas); color: var(--text-main);
                    border: 1px solid var(--border-strong); padding: 12px; border-radius: 10px;
                    font-size: 13px; font-weight: 800;
                }
                .beta-btn:hover { background: var(--text-main); color: var(--bg-surface); }

                /* --- EMPTY STATE --- */
                .empty-state { align-items: center; text-align: center; padding: 60px 24px; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: 20px; }
                .empty-ring { width: 64px; height: 64px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
                .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .empty-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1024px) {
                    .secondary-feed-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 640px) {
                    .alpha-surge-card { padding: 24px; }
                    .route-lockup h2 { font-size: 20px; }
                    .alpha-footer { flex-direction: column; align-items: stretch; text-align: center; }
                    .fleet-hint { margin-top: 8px; }
                }
            `}</style>
        </div>
    );
};

export default ActionableSurgeFeed;