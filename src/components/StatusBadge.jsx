/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign UI Primitive)
 * ------------------------------------------------------------------
 * Module: Shared Components
 * File: StatusBadge.jsx
 * * DESCRIPTION:
 * The Master Status Indicator. An intelligent pill component that reads 
 * a raw status string from the database and automatically renders the 
 * correct enterprise colors, icons, and animations based on the Global Dictionary.
 * * UPGRADES (World-Class Features):
 * 1. Omni-Dictionary: Pre-programmed to recognize every possible state 
 * across Treasury, Operations, and Concierge modules.
 * 2. Pulse Physics: Automatically applies a hardware-accelerated heartbeat 
 * animation to high-urgency states (e.g., SURGE, BOARDING).
 * 3. Size Matrix: Adapts perfectly to dense ledgers (sm) or massive detail cards (lg).
 */

import React from 'react';
import { 
    CheckCircle2, Clock, AlertTriangle, XCircle, 
    PlayCircle, Zap, ShieldAlert, Bus, AlertCircle, FileText
} from 'lucide-react';

// ========================================================================
// 1. THE STATUS DICTIONARY (The Core Physics)
// ========================================================================
/**
 * Maps any database string to its strict visual counterpart.
 * Uses fallback CSS variables mapped directly to your index.css.
 */
const STATUS_DICTIONARY = {
    // --- TREASURY & FINANCIAL STATES ---
    'SETTLED':      { theme: 'success', icon: CheckCircle2, label: 'Settled', pulse: false },
    'PENDING':      { theme: 'warning', icon: Clock, label: 'Pending Payout', pulse: false },
    'FAILED':       { theme: 'danger',  icon: XCircle, label: 'Failed', pulse: false },
    'CLAWBACK':     { theme: 'danger',  icon: AlertTriangle, label: 'Vault Clawback', pulse: false },
    'PROCESSING':   { theme: 'primary', icon: PlayCircle, label: 'Processing', pulse: true },

    // --- OPERATIONAL & MANIFEST STATES ---
    'SCHEDULED':    { theme: 'neutral', icon: FileText, label: 'Scheduled', pulse: false },
    'BOARDING':     { theme: 'warning', icon: Bus, label: 'Boarding Now', pulse: true },
    'DEPARTED':     { theme: 'primary', icon: PlayCircle, label: 'In Transit', pulse: false },
    'ARRIVED':      { theme: 'success', icon: CheckCircle2, label: 'Trip Completed', pulse: false },
    'DELAYED':      { theme: 'danger',  icon: AlertCircle, label: 'Delayed', pulse: true },
    'CANCELLED':    { theme: 'danger',  icon: XCircle, label: 'Cancelled', pulse: false },

    // --- CONCIERGE & SURGE STATES ---
    'OPEN':         { theme: 'warning', icon: Clock, label: 'Awaiting Action', pulse: false },
    'RESOLVED':     { theme: 'success', icon: CheckCircle2, label: 'Resolved', pulse: false },
    'REJECTED':     { theme: 'danger',  icon: XCircle, label: 'Rejected', pulse: false },
    'SURGE_ACTIVE': { theme: 'primary', icon: Zap, label: 'High Demand Surge', pulse: true },
    
    // --- SYSTEM STATES ---
    'ACTIVE':       { theme: 'success', icon: CheckCircle2, label: 'Active', pulse: false },
    'SUSPENDED':    { theme: 'danger',  icon: ShieldAlert, label: 'Suspended', pulse: false },
    
    // --- FALLBACK (If database sends an unknown string) ---
    'UNKNOWN':      { theme: 'neutral', icon: AlertCircle, label: 'Unknown State', pulse: false }
};

// ========================================================================
// 2. THE THEME ENGINE (Translating to CSS Variables)
// ========================================================================
const THEME_COLORS = {
    success: { bg: 'rgba(34, 197, 94, 0.15)',  text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' },
    danger:  { bg: 'rgba(239, 68, 68, 0.15)',  text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
    primary: { bg: 'rgba(206, 172, 92, 0.15)', text: 'var(--brand-primary)', border: 'rgba(206, 172, 92, 0.3)' }, // AyaBus Gold
    neutral: { bg: 'var(--bg-input)',          text: 'var(--text-muted)', border: 'var(--border-subtle)' }
};

const SIZES = {
    sm: { padding: '2px 8px', fontSize: '11px', iconSize: 12, gap: '4px' },
    md: { padding: '4px 12px', fontSize: '12px', iconSize: 14, gap: '6px' },
    lg: { padding: '6px 16px', fontSize: '13px', iconSize: 16, gap: '8px' }
};

// ========================================================================
// 3. MASTER COMPONENT EXECUTION
// ========================================================================
const StatusBadge = ({ 
    status, 
    size = 'md', 
    overrideLabel = null, // Allows developer to force a custom text label
    disablePulse = false  // Allows developer to turn off the pulse manually
}) => {
    
    // 1. Sanitize and fetch the dictionary entry (defaults to UNKNOWN if not found)
    const rawStatus = status ? status.toUpperCase().trim() : 'UNKNOWN';
    const config = STATUS_DICTIONARY[rawStatus] || STATUS_DICTIONARY['UNKNOWN'];
    
    // 2. Map to layout specs
    const themeParams = THEME_COLORS[config.theme];
    const sizeParams = SIZES[size] || SIZES.md;
    const IconComponent = config.icon;
    
    // 3. Determine Final Physics
    const finalLabel = overrideLabel || config.label;
    const isPulsing = config.pulse && !disablePulse;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sizeParams.gap,
            padding: sizeParams.padding,
            backgroundColor: themeParams.bg,
            color: themeParams.text,
            border: `1px solid ${themeParams.border}`,
            borderRadius: '100px', // Perfect pill shape
            fontWeight: '800',
            fontSize: sizeParams.fontSize,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            // If pulsing, apply the animation natively
            animation: isPulsing ? 'ayabus-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
        }}>
            
            <IconComponent 
                size={sizeParams.iconSize} 
                strokeWidth={2.5} 
                // Ensure the icon perfectly inherits the text color
                color="currentColor" 
            />
            
            {finalLabel}

            {/* Failsafe Keyframe Injection (Guarantees pulse works even if index.css is updated) */}
            {isPulsing && (
                <style>{`
                    @keyframes ayabus-pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                `}</style>
            )}
            
        </span>
    );
};

export default StatusBadge;