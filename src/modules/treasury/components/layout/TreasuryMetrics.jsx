/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Treasury Engine)
 * ------------------------------------------------------------------
 * Module: Financial Ledger
 * File: TreasuryMetrics.jsx
 * * DESCRIPTION:
 * The apex Telemetry Ribbon. Visualizes the 4 core financial pillars: 
 * Gross Volume, Platform Fees, Clawbacks, and Net Settled Revenue.
 * * WORLD-CLASS PHYSICS:
 * 1. SKELETON MATRIX: If `isLoading` is true, the cards render a beautiful, 
 * shimmering skeleton wireframe instead of jumping or flashing zeros.
 * 2. HIERARCHICAL HIGHLIGHTING: The 'Net Settled' card is chemically altered 
 * to have a subtle AyaBus Gold background tint and heavier typography, drawing 
 * the operator's eye to their actual take-home pay.
 * 3. KINETIC HOVER: Each card features cubic-bezier lifts and dynamic shadow 
 * blooming to provide tactile B2B feedback.
 */

import React from 'react';
import { 
    Banknote, PieChart, RefreshCcw, 
    Landmark, TrendingUp, Clock, AlertTriangle
} from 'lucide-react';

const TreasuryMetrics = ({ metrics, isLoading }) => {
    
    // Fallback safeguard in case the network bridge drops
    const safeMetrics = metrics || {
        grossRevenue: { display: '0' },
        platformFees: { display: '0' },
        cancellations: { display: '0' },
        netSettled: { display: '0' },
        pendingClearance: { display: '0' }
    };

    // ========================================================================
    // 1. SKELETON LOADER (The Pre-Render Wireframe)
    // ========================================================================
    if (isLoading) {
        return (
            <div className="treasury-telemetry-ribbon">
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
                    .skeleton-title { width: 40%; height: 14px; margin-left: 12px; }
                    .skeleton-value { width: 70%; height: 32px; margin-top: 16px; margin-bottom: 12px; }
                    .skeleton-footer { width: 50%; height: 12px; }
                    @keyframes pulseFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                `}</style>
            </div>
        );
    }

    // ========================================================================
    // 2. THE TELEMETRY RENDERER
    // ========================================================================
    return (
        <div className="treasury-telemetry-ribbon">
            
            {/* CARD 1: GROSS VOLUME */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--text-main)', backgroundColor: 'var(--bg-input)' }}>
                        <Banknote size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Gross Ticket Volume</span>
                </div>
                <div className="card-value">
                    <span className="currency-symbol">UGX</span>
                    {safeMetrics.grossRevenue.display}
                </div>
                <div className="card-footer">
                    <TrendingUp size={14} className="text-muted" />
                    <span>Total passenger payments received</span>
                </div>
            </div>

            {/* CARD 2: PLATFORM FEES */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--status-warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <PieChart size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Platform & Gateway Fees</span>
                </div>
                <div className="card-value error-tint">
                    <span className="currency-symbol">- UGX</span>
                    {safeMetrics.platformFees.display}
                </div>
                <div className="card-footer">
                    <AlertTriangle size={14} className="text-warning" />
                    <span>AyaBus & Mobile Money processing</span>
                </div>
            </div>

            {/* CARD 3: CANCELLATIONS */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--status-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <RefreshCcw size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Cancellation Clawbacks</span>
                </div>
                <div className="card-value error-tint">
                    <span className="currency-symbol">- UGX</span>
                    {safeMetrics.cancellations.display}
                </div>
                <div className="card-footer">
                    <RefreshCcw size={14} className="text-danger" />
                    <span>Deducted for refunded tickets</span>
                </div>
            </div>

            {/* CARD 4: NET SETTLED (The Alpha Card) */}
            <div className="telemetry-card alpha-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: '#FFF', backgroundColor: 'var(--brand-primary)', boxShadow: '0 4px 12px rgba(206, 172, 92, 0.3)' }}>
                        <Landmark size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title" style={{ color: 'var(--brand-primary)', fontWeight: '900' }}>Net Settled Revenue</span>
                </div>
                <div className="card-value success-tint" style={{ fontSize: '32px' }}>
                    <span className="currency-symbol" style={{ color: 'var(--brand-primary)' }}>UGX</span>
                    {safeMetrics.netSettled.display}
                </div>
                <div className="card-footer" style={{ borderTopColor: 'rgba(206, 172, 92, 0.2)' }}>
                    <div className="pending-indicator">
                        <Clock size={14} className="text-brand pulse-icon" />
                        <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                            UGX {safeMetrics.pendingClearance.display} <span className="text-muted">Pending Clearance</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================================================================
                3. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- GRID LAYOUT --- */
                .treasury-telemetry-ribbon {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    padding: 24px 32px;
                    background: var(--bg-canvas);
                    /* Ensures the cards don't shrink too much on medium screens */
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

                /* THE ALPHA CARD (Net Revenue) */
                .alpha-card {
                    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(206, 172, 92, 0.03) 100%);
                    border-color: rgba(206, 172, 92, 0.3);
                }
                .alpha-card:hover {
                    border-color: var(--brand-primary);
                    box-shadow: 0 12px 32px rgba(206, 172, 92, 0.1);
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
                    font-size: 28px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -1px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                }

                .currency-symbol {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-muted);
                    letter-spacing: 0;
                }

                .error-tint { color: var(--status-danger); }
                .error-tint .currency-symbol { color: rgba(239, 68, 68, 0.7); }
                
                .success-tint { color: var(--text-main); }

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

                .pending-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--bg-canvas);
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: 1px dashed var(--border-strong);
                    width: 100%;
                }

                /* --- UTILITIES & ANIMATIONS --- */
                .text-muted { color: var(--text-muted); }
                .text-warning { color: var(--status-warning); }
                .text-danger { color: var(--status-danger); }
                .text-brand { color: var(--brand-primary); }

                .pulse-icon {
                    animation: subtlePulse 2s infinite ease-in-out;
                }
                @keyframes subtlePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.9); }
                }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1400px) {
                    /* On smaller laptops, shrink typography slightly to prevent text wrap */
                    .card-value { font-size: 24px; }
                    .alpha-card .card-value { font-size: 28px !important; }
                    .treasury-telemetry-ribbon { padding: 20px 24px; gap: 16px; }
                }

                @media (max-width: 1024px) {
                    /* Tablet: Switch to 2x2 Grid */
                    .treasury-telemetry-ribbon {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    /* Mobile: Switch to 1x4 Stack */
                    .treasury-telemetry-ribbon {
                        grid-template-columns: 1fr;
                        padding: 16px;
                    }
                    /* Move the Alpha card to the top on mobile because it's the most important */
                    .alpha-card {
                        order: -1;
                    }
                }
            `}</style>
        </div>
    );
};

export default TreasuryMetrics; 