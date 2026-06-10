/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: MarketRibbon.jsx
 * * DESCRIPTION:
 * The apex Telemetry Ribbon for the Market Forensics module.
 * Aggregates the absolute totals from the 3 Telemetry Pipelines 
 * (Intent, Conversion, Friction) into an instantly readable executive summary.
 * * WORLD-CLASS PHYSICS:
 * 1. THE AI SURGE DETECTOR: The 4th "Alpha Card" dynamically calculates the 
 * ratio between Searches (Intent) and Bookings (Conversion). If intent is 
 * massively outpacing bookings, it triggers a visual "Surge Detected" state.
 * 2. KINETIC SKELETON: Seamlessly transitions from pulsing wireframes 
 * to solid data without a single pixel of layout shift.
 * 3. HIERARCHICAL COLOR CODING: Green for Intent, Brand/Gold for Conversions, 
 * Red for Friction (Cancellations), instantly communicating network health.
 */

import React from 'react';
import { 
    Globe2, CheckCircle2, ShieldAlert, 
    Activity, Flame, Zap
} from 'lucide-react';

const MarketRibbon = ({ intelligence, isLoading = false }) => {

    // ========================================================================
    // 1. DATA HYDRATION & SAFETY (CRASH-PROOF)
    // ========================================================================
    // Using Optional Chaining (?.) to guarantee the DOM never crashes, 
    // even if the database returns null for a specific pipeline.
    const searches = intelligence?.intent?.totalSearches || 0;
    const bookings = intelligence?.conversion?.totalBookings || 0;
    const cancellations = intelligence?.friction?.totalCancellations || 0;

    // Mathematical Surge Detection (Is demand vastly exceeding fulfilled bookings?)
    // In a real system, > 2.0 (twice as many searches as tickets sold) is a severe surge.
    const demandRatio = bookings > 0 ? (searches / bookings) : searches;
    const isSurging = demandRatio >= 2.0 && searches > 50; 

    // ========================================================================
    // 2. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="market-ribbon-chassis">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="telemetry-card skeleton-card">
                        <div className="skeleton-header">
                            <div className="skeleton-icon pulse-bg" />
                            <div className="skeleton-title pulse-bg" />
                        </div>
                        <div className="skeleton-value pulse-bg" />
                        <div className="skeleton-footer pulse-bg" />
                    </div>
                ))}
                <style>{`
                    .skeleton-card { border-color: var(--border-subtle) !important; box-shadow: none !important; }
                    .pulse-bg { background: var(--bg-input); border-radius: 4px; animation: pulseFade 1.5s infinite ease-in-out; }
                    .skeleton-icon { width: 32px; height: 32px; border-radius: 8px; }
                    .skeleton-title { width: 50%; height: 14px; margin-left: 12px; }
                    .skeleton-value { width: 40%; height: 32px; margin-top: 16px; margin-bottom: 12px; }
                    .skeleton-footer { width: 70%; height: 12px; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 3. THE RENDER ENGINE
    // ========================================================================
    return (
        <div className="market-ribbon-chassis">
            
            {/* CARD 1: MARKET INTENT (Searches) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--status-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                        <Globe2 size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Network Intent</span>
                </div>
                <div className="card-value success-tint">
                    {searches.toLocaleString()}
                </div>
                <div className="card-footer">
                    <Activity size={14} className="text-success" />
                    <span>Total active passenger searches</span>
                </div>
            </div>

            {/* CARD 2: NETWORK CONVERSIONS (Bookings) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--brand-primary)', backgroundColor: 'rgba(206, 172, 92, 0.1)' }}>
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Captured Conversions</span>
                </div>
                <div className="card-value brand-tint">
                    {bookings.toLocaleString()}
                </div>
                <div className="card-footer">
                    <Zap size={14} className="text-brand" />
                    <span>Successfully ticketed passengers</span>
                </div>
            </div>

            {/* CARD 3: MARKET FRICTION (Cancellations) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--status-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <ShieldAlert size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Market Friction</span>
                </div>
                <div className="card-value error-tint">
                    {cancellations.toLocaleString()}
                </div>
                <div className="card-footer">
                    <ShieldAlert size={14} className="text-danger" />
                    <span>Abandoned trips or cancellations</span>
                </div>
            </div>

            {/* CARD 4: OVERALL HEALTH (The Alpha Indicator) */}
            <div className={`telemetry-card alpha-card ${isSurging ? 'is-surging' : 'is-stable'}`}>
                <div className="card-header">
                    <div className="card-icon-wrapper alpha-icon">
                        {isSurging ? <Flame size={18} strokeWidth={2.5} /> : <Activity size={18} strokeWidth={2.5} />}
                    </div>
                    <span className="card-title alpha-title">System Status</span>
                </div>
                <div className="card-value alpha-value">
                    {isSurging ? 'Surge Detected' : 'Network Stable'}
                </div>
                <div className="card-footer alpha-footer">
                    <div className="live-indicator">
                        <div className={`status-dot ${isSurging ? 'pulse-surge' : 'pulse-stable'}`} />
                        <span>Demand is {isSurging ? 'outpacing' : 'matching'} capacity</span>
                    </div>
                </div>
            </div>

            {/* ========================================================================
                4. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- GRID LAYOUT --- */
                .market-ribbon-chassis {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    padding: 24px 32px;
                    background: var(--bg-canvas);
                    min-width: 0; 
                }

                /* --- CARD CHASSIS --- */
                .telemetry-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .telemetry-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.03);
                    border-color: var(--border-strong);
                }

                /* --- CARD INTERNALS --- */
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .card-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-title {
                    font-size: 13px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .card-value {
                    font-family: monospace;
                    font-size: 32px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -1px;
                    margin-bottom: 16px;
                    line-height: 1;
                }

                /* Typographic Tints */
                .success-tint { color: var(--status-success); }
                .brand-tint { color: var(--brand-primary); }
                .error-tint { color: var(--status-danger); }

                /* --- CARD FOOTER --- */
                .card-footer {
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-subtle);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                /* --- THE ALPHA CARD (Dynamic AI Status) --- */
                .alpha-card.is-surging {
                    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(206, 172, 92, 0.05) 100%);
                    border-color: rgba(206, 172, 92, 0.4);
                }
                .alpha-card.is-stable {
                    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(34, 197, 94, 0.03) 100%);
                    border-color: rgba(34, 197, 94, 0.2);
                }

                .alpha-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

                .alpha-card.is-surging .alpha-icon { background: var(--brand-primary); color: #FFF; box-shadow: 0 4px 12px rgba(206, 172, 92, 0.3); }
                .alpha-card.is-stable .alpha-icon { background: var(--status-success); color: #FFF; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2); }

                .alpha-title { color: var(--text-main); }
                .alpha-value { font-family: inherit; font-size: 24px; letter-spacing: -0.5px; }
                .alpha-card.is-surging .alpha-value { color: var(--brand-primary); }
                .alpha-card.is-stable .alpha-value { color: var(--status-success); }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-canvas);
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: 1px dashed var(--border-strong);
                    width: 100%;
                    color: var(--text-main);
                    font-weight: 700;
                }

                /* Pulsing Dots */
                .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .pulse-surge { background: var(--brand-primary); animation: glowSurge 1.5s infinite; }
                .pulse-stable { background: var(--status-success); animation: glowStable 2s infinite; }

                @keyframes glowSurge {
                    0% { box-shadow: 0 0 0 0 rgba(206, 172, 92, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(206, 172, 92, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(206, 172, 92, 0); }
                }
                @keyframes glowStable {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                /* --- UTILITIES --- */
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                .text-brand { color: var(--brand-primary); }
                .text-danger { color: var(--status-danger); }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1400px) {
                    .card-value { font-size: 28px; }
                    .alpha-value { font-size: 22px; }
                    .market-ribbon-chassis { padding: 20px 24px; gap: 16px; }
                }

                @media (max-width: 1024px) {
                    /* Tablet: 2x2 Grid */
                    .market-ribbon-chassis { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    /* Mobile: 1x4 Stack, Alpha card moves to top */
                    .market-ribbon-chassis { grid-template-columns: 1fr; padding: 16px; }
                    .alpha-card { order: -1; }
                }
            `}</style>
        </div>
    );
};

export default MarketRibbon;