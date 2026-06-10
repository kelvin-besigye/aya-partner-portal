/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: SupportRibbon.jsx
 * * DESCRIPTION:
 * The apex Telemetry Ribbon for the Maker-Checker Support Hub.
 * Aggregates live ticket statuses into an instantly readable executive summary.
 * * WORLD-CLASS PHYSICS:
 * 1. MATHEMATICAL DELEGATION: Offloads array crunching to the `supportService` 
 * to guarantee UI thread performance, even with hundreds of historical tickets.
 * 2. THE ALPHA CARD: The first card acts as a live heartbeat, using CSS pulse 
 * animations to reassure the Partner that the L9 Admin team is online and watching.
 * 3. KINETIC SKELETON: Seamlessly transitions from pulsing wireframes to solid 
 * data without a single pixel of layout shift during the initial network fetch.
 */

import React, { useMemo } from 'react';
import { 
    Headphones, Clock, CheckCircle2, 
    ShieldCheck, Activity, AlertCircle, Loader2
} from 'lucide-react';
import { supportService } from '../../data/support.service';

const SupportRibbon = ({ tickets = [], isLoading = false }) => {

    // ========================================================================
    // 1. DATA HYDRATION & MATHEMATICS
    // ========================================================================
    
    // Memoize the math so it only re-runs when the raw ticket array physically changes.
    const metrics = useMemo(() => {
        return supportService.calculateSupportMetrics(tickets);
    }, [tickets]);

    // Calculate system load to provide contextual feedback
    const isHighVolume = metrics.pending > 5;

    // ========================================================================
    // 2. SKELETON LOADER
    // ========================================================================
    if (isLoading) {
        return (
            <div className="support-ribbon-chassis">
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
                    .skeleton-icon { width: 36px; height: 36px; border-radius: 10px; }
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
        <div className="support-ribbon-chassis">
            
            {/* CARD 1: OVERALL SYSTEM HEALTH (The Alpha Indicator) */}
            <div className="telemetry-card alpha-card">
                <div className="card-header">
                    <div className="card-icon-wrapper alpha-icon">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                    <span className="card-title alpha-title">L9 Dispatch Status</span>
                </div>
                <div className="card-value alpha-value">
                    {isHighVolume ? 'High Volume' : 'Systems Online'}
                </div>
                <div className="card-footer alpha-footer">
                    <div className="live-indicator">
                        <div className={`status-dot ${isHighVolume ? 'pulse-warning' : 'pulse-stable'}`} />
                        <span>Avg. response: {isHighVolume ? '< 10 mins' : '< 2 mins'}</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: PENDING TICKETS (Awaiting Admin) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)' }}>
                        <Clock size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Pending Action</span>
                </div>
                <div className="card-value muted-tint">
                    {metrics.pending.toLocaleString()}
                </div>
                <div className="card-footer">
                    <Clock size={14} className="text-muted" />
                    <span>Awaiting Admin Assignment</span>
                </div>
            </div>

            {/* CARD 3: PROCESSING (Admin is working on it) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--brand-primary)', backgroundColor: 'rgba(206, 172, 92, 0.1)' }}>
                        <Loader2 size={18} strokeWidth={2.5} className="ayabus-spin" />
                    </div>
                    <span className="card-title">Processing</span>
                </div>
                <div className="card-value brand-tint">
                    {metrics.processing.toLocaleString()}
                </div>
                <div className="card-footer">
                    <Activity size={14} className="text-brand" />
                    <span>Currently under review</span>
                </div>
            </div>

            {/* CARD 4: RESOLVED (Completed requests) */}
            <div className="telemetry-card">
                <div className="card-header">
                    <div className="card-icon-wrapper" style={{ color: 'var(--status-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                    </div>
                    <span className="card-title">Resolved</span>
                </div>
                <div className="card-value success-tint">
                    {metrics.resolved.toLocaleString()}
                </div>
                <div className="card-footer">
                    <CheckCircle2 size={14} className="text-success" />
                    <span>Completed operations</span>
                </div>
            </div>

            {/* ========================================================================
                4. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- GRID LAYOUT --- */
                .support-ribbon-chassis {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    background: transparent;
                    width: 100%;
                }

                /* --- CARD CHASSIS --- */
                .telemetry-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 16px;
                    padding: 20px 24px;
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
                    width: 40px;
                    height: 40px;
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
                    letter-spacing: -1px;
                    margin-bottom: 16px;
                    line-height: 1;
                }

                /* Typographic Tints */
                .success-tint { color: var(--status-success); }
                .brand-tint { color: var(--brand-primary); }
                .muted-tint { color: var(--text-main); } /* Standard text for pending */

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

                /* --- THE ALPHA CARD (L9 Heartbeat) --- */
                .alpha-card {
                    background: linear-gradient(145deg, var(--bg-surface) 0%, rgba(34, 197, 94, 0.05) 100%);
                    border-color: rgba(34, 197, 94, 0.2);
                }
                .alpha-card:hover { box-shadow: 0 12px 32px rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.4); }

                .alpha-icon { background: var(--status-success); color: #FFF; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }

                .alpha-title { color: var(--text-main); }
                .alpha-value { font-family: inherit; font-size: 24px; letter-spacing: -0.5px; color: var(--status-success); }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-canvas);
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-strong);
                    width: 100%;
                    color: var(--text-main);
                    font-weight: 700;
                }

                /* Pulsing Dots */
                .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .pulse-stable { background: var(--status-success); animation: glowStable 2s infinite; }
                .pulse-warning { background: var(--status-warning); animation: glowWarning 1.5s infinite; }

                @keyframes glowStable {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
                @keyframes glowWarning {
                    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }

                /* --- UTILITIES --- */
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                .text-brand { color: var(--brand-primary); }
                .ayabus-spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1400px) {
                    .card-value { font-size: 28px; }
                    .alpha-value { font-size: 20px; }
                    .telemetry-card { padding: 16px 20px; }
                }

                @media (max-width: 1024px) {
                    /* Tablet: 2x2 Grid */
                    .support-ribbon-chassis { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    /* Mobile: 1x4 Stack, Alpha card stays at top */
                    .support-ribbon-chassis { grid-template-columns: 1fr; gap: 16px; }
                }
            `}</style>
        </div>
    );
};

export default SupportRibbon;