/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign UI Primitive)
 * ------------------------------------------------------------------
 * Module: Shared Components
 * File: ActionButton.jsx
 * * DESCRIPTION:
 * The Master Interaction Trigger. A highly kinetic, state-aware button 
 * engine that automatically handles network loading states, iconography, 
 * and theme variants while respecting the global AyaBus CSS variables.
 * * UPGRADES (World-Class Features):
 * 1. Kinetic Physics: Hardware-accelerated hover lifts and click 
 * compressions (`scale(0.98)`) for tactile B2B feedback.
 * 2. Layout Intelligence: Native support for left/right Lucide icons, 
 * auto-spacing, and responsive `fullWidth` expansion for mobile dashboards.
 * 3. Layout Lock: When `isLoading` is triggered, the button maintains its 
 * exact width to prevent the UI from jittering when the text swaps to a spinner.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// ========================================================================
// 1. THE VARIANT & SIZE DICTIONARIES
// ========================================================================
const VARIANTS = {
    primary: {
        background: 'var(--brand-primary)',
        color: '#ffffff',
        border: '1px solid var(--brand-primary)',
        hoverFilter: 'brightness(1.1)',
    },
    secondary: {
        background: 'var(--bg-surface)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        hoverFilter: 'brightness(0.95)', // Darkens slightly in light mode, adjusts in dark
    },
    danger: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        hoverFilter: 'brightness(1.2)',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--text-main)',
        border: '1px solid transparent',
        hoverFilter: 'brightness(1.5)',
    },
    goldOutline: {
        background: 'rgba(206, 172, 92, 0.05)',
        color: 'var(--brand-primary)',
        border: '1px solid var(--brand-primary)',
        hoverFilter: 'brightness(1.2)',
    }
};

const SIZES = {
    sm: { height: '32px', padding: '0 12px', fontSize: '13px', iconSize: 14, gap: '6px' },
    md: { height: '44px', padding: '0 16px', fontSize: '14px', iconSize: 18, gap: '8px' },
    lg: { height: '52px', padding: '0 24px', fontSize: '15px', iconSize: 20, gap: '10px' },
};

// ========================================================================
// 2. MASTER COMPONENT EXECUTION
// ========================================================================
const ActionButton = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    type = 'button',
    leftIcon: LeftIcon = null, 
    rightIcon: RightIcon = null, 
    isLoading = false, 
    isDisabled = false,
    fullWidth = false,
    style = {}, // Allows parent to inject specific margin overrides if needed
}) => {
    
    // --- STATE & REFS ---
    const buttonRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [lockedWidth, setLockedWidth] = useState(null);

    // --- DICTIONARY LOOKUPS ---
    const currentVariant = VARIANTS[variant] || VARIANTS.primary;
    const currentSize = SIZES[size] || SIZES.md;
    const interactable = !isLoading && !isDisabled;

    // --- PHYSICS: ANTI-JITTER LOCK ---
    // When a button goes into a loading state, the text disappears and a spinner appears.
    // This normally causes the button to shrink, ruining the UI layout.
    // This effect locks the exact pixel width right before loading starts.
    useEffect(() => {
        if (isLoading && buttonRef.current && !lockedWidth) {
            setLockedWidth(buttonRef.current.offsetWidth);
        } else if (!isLoading) {
            setLockedWidth(null);
        }
    }, [isLoading]);

    // ========================================================================
    // 3. RENDER ENGINE
    // ========================================================================
    return (
        <button
            ref={buttonRef}
            type={type}
            onClick={(e) => {
                if (interactable && onClick) onClick(e);
            }}
            onMouseEnter={() => interactable && setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
            onMouseDown={() => interactable && setIsActive(true)}
            onMouseUp={() => interactable && setIsActive(false)}
            // Touch physics for mobile fleet operators
            onTouchStart={() => interactable && setIsActive(true)}
            onTouchEnd={() => interactable && setIsActive(false)}
            disabled={!interactable}
            style={{
                // Layout Physics
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: currentSize.gap,
                width: lockedWidth ? `${lockedWidth}px` : (fullWidth ? '100%' : 'auto'),
                height: currentSize.height,
                padding: currentSize.padding,
                
                // Typography & Theme
                background: currentVariant.background,
                color: currentVariant.color,
                border: currentVariant.border,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
                fontSize: currentSize.fontSize,
                fontWeight: '800',
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                
                // Kinetic Transitions
                cursor: interactable ? 'pointer' : (isLoading ? 'wait' : 'not-allowed'),
                opacity: isDisabled ? 0.5 : 1,
                transform: isActive ? 'scale(0.97)' : (isHovered ? 'translateY(-1px)' : 'translateY(0)'),
                filter: isHovered && interactable ? currentVariant.hoverFilter : 'brightness(1)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                
                // Accessibility Outline (For Keyboard Navigation)
                outline: 'none',
                
                // Allow parent injection
                ...style
            }}
        >
            {/* THE LOADING OVERRIDE */}
            {isLoading ? (
                <>
                    <Loader2 
                        size={currentSize.iconSize} 
                        style={{ animation: 'ayabus-spin 1s linear infinite' }} 
                    />
                    <span>Executing...</span>
                </>
            ) : (
                /* THE STANDARD LAYOUT */
                <>
                    {LeftIcon && <LeftIcon size={currentSize.iconSize} strokeWidth={2.5} />}
                    {children}
                    {RightIcon && <RightIcon size={currentSize.iconSize} strokeWidth={2.5} />}
                </>
            )}

            {/* Failsafe Animation Injection */}
            {isLoading && (
                <style>{`
                    @keyframes ayabus-spin {
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            )}
        </button>
    );
};

export default ActionButton;