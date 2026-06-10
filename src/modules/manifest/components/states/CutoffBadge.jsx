/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / States
 * File: CutoffBadge.jsx
 * * DESCRIPTION:
 * A pure, deterministic UI primitive that indicates who has control 
 * over the bus inventory (AyaBus Consumer App vs. Physical Park).
 * * WORLD-CLASS UPGRADES:
 * 1. TEMPORAL STRIPPING: Removed the volatile JavaScript ticking clock. 
 * State is now strictly inherited from the parent payload, guaranteeing zero crashes.
 * 2. DETERMINISTIC PHYSICS: Maps predefined states (OPEN, WARNING, LOCKED, DEPARTED)
 * to exact hex/variable values from the global CSS ecosystem.
 * 3. KINETIC DEGRADATION: On mobile, the badge gracefully compresses its 
 * text footprint while maintaining the high-visibility color coding.
 */

import React from 'react';
import { 
    CheckCircle2, Lock, AlertTriangle, 
    ShieldAlert, Globe, Store, Navigation 
} from 'lucide-react';

// ========================================================================
// 1. STATE DICTIONARY (The Visual Physics)
// ========================================================================
const BADGE_DICTIONARY = {
    OPEN: {
        id: 'OPEN',
        label: 'AyaBus Market Open',
        subtext: 'Digital Sales Active',
        Icon: Globe,
        color: 'var(--status-success)', // Green
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        borderOpacity: 'rgba(34, 197, 94, 0.2)'
    },
    WARNING: {
        id: 'WARNING',
        label: 'Cutoff Approaching',
        subtext: 'Lockdown Imminent',
        Icon: AlertTriangle,
        color: 'var(--status-warning)', // Yellow/Orange
        bgOpacity: 'rgba(245, 158, 11, 0.1)',
        borderOpacity: 'rgba(245, 158, 11, 0.2)'
    },
    LOCKED: {
        id: 'LOCKED',
        label: 'Park Control Locked',
        subtext: 'Walk-ins Only',
        Icon: Store,
        color: 'var(--brand-primary)', // AyaBus Gold
        bgOpacity: 'rgba(206, 172, 92, 0.1)',
        borderOpacity: 'rgba(206, 172, 92, 0.2)'
    },
    DEPARTED: {
        id: 'DEPARTED',
        label: 'Manifest Closed',
        subtext: 'Asset En Route',
        Icon: Navigation,
        color: 'var(--text-muted)', // Grey
        bgOpacity: 'var(--bg-input)',
        borderOpacity: 'var(--border-strong)'
    },
    INVALID: {
        id: 'INVALID',
        label: 'Status Unknown',
        subtext: 'Awaiting Telemetry',
        Icon: ShieldAlert,
        color: 'var(--status-error)', // Red
        bgOpacity: 'rgba(239, 68, 68, 0.1)',
        borderOpacity: 'rgba(239, 68, 68, 0.2)'
    }
};

// ========================================================================
// 2. MAIN COMPONENT
// ========================================================================
const CutoffBadge = ({ 
    state = 'INVALID', 
    overrideLabel, 
    overrideSubtext,
    className = '' 
}) => {
    // Defensive mapping: Fallback to INVALID if the parent passes garbage data
    const activeConfig = BADGE_DICTIONARY[state] || BADGE_DICTIONARY.INVALID;
    const { Icon, color, bgOpacity, borderOpacity } = activeConfig;

    // Allow the parent to override the text if they have more specific context
    const displayLabel = overrideLabel || activeConfig.label;
    const displaySubtext = overrideSubtext || activeConfig.subtext;

    return (
        <div className={`cutoff-badge-chassis ${className}`}>
            
            {/* 1. ICON ZONE */}
            <div className="cutoff-icon-zone">
                <Icon size={18} strokeWidth={2.5} />
            </div>

            {/* 2. TELEMETRY ZONE */}
            <div className="cutoff-telemetry-zone">
                <span className="cutoff-label">{displayLabel}</span>
                <span className="cutoff-subtext">{displaySubtext}</span>
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .cutoff-badge-chassis {
                    display: inline-flex;
                    align-items: center;
                    background: ${bgOpacity};
                    border: 1px solid ${borderOpacity};
                    border-radius: var(--radius-md);
                    padding: 6px 14px 6px 8px;
                    gap: 12px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                }

                .cutoff-badge-chassis:hover {
                    filter: brightness(1.05);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${bgOpacity};
                }

                /* ICON ZONE */
                .cutoff-icon-zone {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-sm);
                    background: var(--bg-surface);
                    color: ${color};
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* TELEMETRY TEXT */
                .cutoff-telemetry-zone {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 2px;
                }

                .cutoff-label {
                    font-size: 12px;
                    font-weight: 900;
                    color: ${color};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1;
                }

                .cutoff-subtext {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    line-height: 1;
                }

                /* RESPONSIVE DEGRADATION */
                @media (max-width: 600px) {
                    .cutoff-badge-chassis {
                        padding: 6px 10px 6px 6px;
                        gap: 8px;
                    }
                    .cutoff-subtext {
                        display: none; /* Strip subtext to save horizontal space on mobile */
                    }
                    .cutoff-label {
                        font-size: 11px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CutoffBadge;