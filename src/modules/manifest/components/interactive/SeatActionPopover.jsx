/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / Interactive
 * File: SeatActionPopover.jsx
 * * DESCRIPTION:
 * The strict mutation interface for Seat State changes. 
 * Allows operators to mark seats as UNAVAILABLE for walk-ins, VIPs, 
 * or maintenance, instantly synchronizing with the Consumer Web App.
 * * PHYSICS:
 * Calculates physical DOM coordinates to anchor itself to the clicked seat.
 * Transforms into a Bottom Sheet on mobile devices for operational safety.
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
    X, Lock, Wrench, Star, RefreshCcw, 
    ShieldAlert, Loader2, Info
} from 'lucide-react';
import { SEAT_STATES } from '../../data/seat.dictionary';

const SeatActionPopover = ({ 
    isOpen, 
    onClose, 
    anchorElement, 
    seatId, 
    currentStatus, 
    onConfirmAction 
}) => {
    const popoverRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // ========================================================================
    // 1. POSITIONING & RESPONSIVE PHYSICS
    // ========================================================================
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen && anchorElement && !isMobile) {
            // Calculate exact coordinates relative to the viewport
            const rect = anchorElement.getBoundingClientRect();
            
            // Default position: Right of the seat
            let calcTop = rect.top + window.scrollY - 10;
            let calcLeft = rect.right + window.scrollX + 16;

            // Boundary Physics: If it renders off the right side of the screen, flip it to the left
            if (calcLeft + 280 > window.innerWidth) {
                calcLeft = rect.left + window.scrollX - 280 - 16;
            }
            
            // Boundary Physics: If it renders off the bottom, shift it up
            if (calcTop + 250 > window.innerHeight + window.scrollY) {
                calcTop = (window.innerHeight + window.scrollY) - 260;
            }

            setPosition({ top: calcTop, left: calcLeft });
        }
    }, [isOpen, anchorElement, isMobile]);

    // ========================================================================
    // 2. LIFECYCLE & EVENT LISTENERS
    // ========================================================================
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        
        // Lock body scroll on mobile to prevent double-scrolling
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile, onClose]);

    // ========================================================================
    // 3. MUTATION HANDLER
    // ========================================================================
    const handleAction = async (requestedState, reasonCode) => {
        setIsSubmitting(true);
        try {
            // Await the parent's database mutation logic
            await onConfirmAction(seatId, requestedState, reasonCode);
            onClose();
        } catch (error) {
            console.error("Mutation failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !seatId) return null;

    const isAvailable = currentStatus === SEAT_STATES.AVAILABLE;

    return (
        <div className="popover-portal-root">
            
            {/* INVISIBLE BACKDROP (Catches outside clicks) */}
            <div className={`popover-backdrop ${isMobile ? 'mobile-dim' : ''}`} onClick={onClose} />

            {/* THE COMMAND MODULE */}
            <div 
                ref={popoverRef}
                className={`popover-container ${isMobile ? 'mobile-sheet' : 'desktop-float'}`}
                style={isMobile ? {} : { top: position.top, left: position.left }}
            >
                {/* Mobile Drag Handle */}
                {isMobile && <div className="mobile-drag-indicator" />}

                {/* HEADER */}
                <div className="popover-header">
                    <div className="header-identity">
                        <span className="seat-badge">Seat {seatId}</span>  {/* seatId is now positional (e.g. "7D") — derived upstream by SeatMatrix via seatLabelFor(slot) */}
                        <span className={`status-text ${isAvailable ? 'success' : 'muted'}`}>
                            {isAvailable ? 'Market Open' : 'Currently Blocked'}
                        </span>
                    </div>
                    {!isMobile && (
                        <button className="close-btn" onClick={onClose}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* BODY / ACTIONS */}
                <div className="popover-body">
                    {isSubmitting ? (
                        <div className="submitting-state">
                            <Loader2 size={32} className="ayabus-spin" color="var(--brand-primary)" />
                            <span>Updating Digital Twin...</span>
                        </div>
                    ) : (
                        <div className="action-list">
                            
                            {isAvailable ? (
                                <>
                                    <div className="action-group-label">Block Matrix Visibility</div>
                                    
                                    <button className="action-btn block-cash" onClick={() => handleAction(SEAT_STATES.UNAVAILABLE, 'WALK_IN_SALE')}>
                                        <Lock size={16} />
                                        <div className="btn-text">
                                            <strong>Walk-in / Cash Sale</strong>
                                            <span>Sold at physical park</span>
                                        </div>
                                    </button>
                                    
                                    <button className="action-btn block-vip" onClick={() => handleAction(SEAT_STATES.UNAVAILABLE, 'VIP_RESERVE')}>
                                        <Star size={16} />
                                        <div className="btn-text">
                                            <strong>VIP Reservation</strong>
                                            <span>Hold for priority client</span>
                                        </div>
                                    </button>
                                    
                                    <button className="action-btn block-maint" onClick={() => handleAction(SEAT_STATES.UNAVAILABLE, 'MAINTENANCE')}>
                                        <Wrench size={16} />
                                        <div className="btn-text">
                                            <strong>Maintenance / Broken</strong>
                                            <span>Seat is physically unusable</span>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="action-group-label">Revert Matrix Visibility</div>
                                    <div className="warning-box">
                                        <Info size={14} />
                                        <span>Releasing this seat will make it instantly available for purchase on the AyaBus App.</span>
                                    </div>
                                    
                                    <button className="action-btn revert" onClick={() => handleAction(SEAT_STATES.AVAILABLE, null)}>
                                        <RefreshCcw size={16} />
                                        <div className="btn-text">
                                            <strong>Release to Market</strong>
                                            <span>Make available online</span>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* INJECTED PHYSICS STYLESHEET */}
            <style>{`
                .popover-portal-root {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    pointer-events: none; /* Let clicks pass through to backdrop */
                }

                .popover-backdrop {
                    position: absolute;
                    inset: 0;
                    pointer-events: auto; /* Catch clicks to close */
                    background: transparent;
                }
                .popover-backdrop.mobile-dim {
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                    animation: fadeIn 0.2s ease-out forwards;
                }

                /* --- CONTAINER BASE --- */
                .popover-container {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    pointer-events: auto;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* --- DESKTOP FLOAT PHYSICS --- */
                .popover-container.desktop-float {
                    position: absolute;
                    width: 280px;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    animation: popScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top left;
                }

                /* --- MOBILE SHEET PHYSICS --- */
                .popover-container.mobile-sheet {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    border-radius: 24px 24px 0 0;
                    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
                    padding-bottom: env(safe-area-inset-bottom); /* iOS safe area */
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .mobile-drag-indicator {
                    width: 40px;
                    height: 4px;
                    background: var(--border-strong);
                    border-radius: 2px;
                    margin: 12px auto 0;
                }

                /* --- HEADER --- */
                .popover-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-canvas);
                }
                .header-identity {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .seat-badge {
                    background: var(--text-main);
                    color: var(--bg-canvas);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                }
                .status-text { font-size: 11px; font-weight: 800; text-transform: uppercase; }
                .status-text.success { color: var(--status-success); }
                .status-text.muted { color: var(--text-muted); }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                .close-btn:hover { background: var(--bg-input); color: var(--text-main); }

                /* --- BODY --- */
                .popover-body {
                    padding: 16px 20px 20px;
                }
                .action-group-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    letter-spacing: 0.5px;
                }

                /* --- ACTIONS --- */
                .action-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 16px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s ease;
                }
                .action-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .btn-text { display: flex; flex-direction: column; gap: 2px; }
                .btn-text strong { font-size: 13px; font-weight: 700; color: var(--text-main); }
                .btn-text span { font-size: 11px; font-weight: 500; color: var(--text-muted); }

                /* Action specific styling */
                .action-btn.block-cash { color: var(--text-main); }
                .action-btn.block-cash:hover { border-color: var(--text-main); }
                
                .action-btn.block-vip { color: var(--brand-primary); }
                .action-btn.block-vip:hover { border-color: var(--brand-primary); background: rgba(206, 172, 92, 0.05); }
                
                .action-btn.block-maint { color: var(--status-error); }
                .action-btn.block-maint:hover { border-color: var(--status-error); background: rgba(239, 68, 68, 0.05); }

                .action-btn.revert { color: var(--status-success); }
                .action-btn.revert:hover { border-color: var(--status-success); background: rgba(34, 197, 94, 0.05); }

                /* --- FEEDBACK STATES --- */
                .warning-box {
                    display: flex;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(206, 172, 92, 0.1);
                    border-left: 3px solid var(--brand-primary);
                    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
                    margin-bottom: 16px;
                    font-size: 11px;
                    line-height: 1.4;
                    color: var(--text-main);
                }

                .submitting-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 32px 0;
                    color: var(--brand-primary);
                    font-weight: 700;
                    font-size: 14px;
                }
                .ayabus-spin { animation: spin 1s linear infinite; }

                /* --- ANIMATIONS --- */
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popScale { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SeatActionPopover;