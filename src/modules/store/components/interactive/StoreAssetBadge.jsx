/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / UI Primitives
 * File: StoreAssetBadge.jsx
 * * DESCRIPTION:
 * The Master Status Indicator for the Partner Store ecosystem.
 * An intelligent UI primitive that reads raw operational state and 
 * automatically renders the correct enterprise colors, icons, and animations.
 * * WORLD-CLASS PHYSICS:
 * 1. OMNI-SIZE MATRIX: Scales gracefully from dense lists (`sm`) to 
 * massive Inspector Dock headers (`lg`).
 * 2. KINETIC PULSE: Applies a hardware-accelerated subtle heartbeat 
 * to the icon if the asset is in a `PENDING` state, signaling to the 
 * operator that the system is waiting on Admin Action.
 * 3. CRASH IMMUNITY: Relies on `getStoreStatusConfig()` to guarantee it 
 * will never crash on a missing or null database string.
 */

import React from 'react';
import { getStoreStatusConfig } from '../../data/store.dictionary';

const StoreAssetBadge = ({ 
    status, 
    size = 'md', 
    showLabel = true, 
    className = '' 
}) => {
    // 1. Fetch the exact visual physics from the Sovereign Dictionary
    const config = getStoreStatusConfig(status);
    const { Icon, label, color, bgOpacity, borderOpacity, code } = config;

    // 2. Size Dictionary (Adapts padding and font sizes dynamically)
    const SIZE_MAP = {
        sm: { padding: '4px 8px', fontSize: '10px', iconSize: 12, gap: '6px' },
        md: { padding: '6px 12px', fontSize: '11px', iconSize: 14, gap: '8px' },
        lg: { padding: '8px 16px', fontSize: '12px', iconSize: 16, gap: '10px' }
    };

    const activeSize = SIZE_MAP[size] || SIZE_MAP.md;

    return (
        <div className={`store-asset-badge size-${size} status-${code.toLowerCase()} ${className}`}>
            
            {/* ICON COMPONENT */}
            <Icon 
                size={activeSize.iconSize} 
                strokeWidth={2.5} 
                className="badge-icon" 
            />
            
            {/* TEXT LABEL (Optional for extreme density) */}
            {showLabel && (
                <span className="badge-label">{label}</span>
            )}

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .store-asset-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: ${activeSize.gap};
                    padding: ${activeSize.padding};
                    background: ${bgOpacity};
                    border: 1px solid ${borderOpacity};
                    color: ${color};
                    border-radius: 100px; /* Perfect pill shape */
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                    white-space: nowrap;
                }

                /* HOVER KINETICS */
                .store-asset-badge:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${bgOpacity};
                }

                /* LABEL TYPOGRAPHY */
                .badge-label {
                    font-size: ${activeSize.fontSize};
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1;
                }

                /* * STATUS-SPECIFIC ANIMATIONS 
                 * If the Partner requested a change, or if a new asset is awaiting 
                 * Admin approval, the icon pulses to indicate "System Working".
                 */
                .status-update_pending .badge-icon,
                .status-pending_approval .badge-icon {
                    animation: pendingPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @keyframes pendingPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
            `}</style>
        </div>
    );
};

export default StoreAssetBadge;