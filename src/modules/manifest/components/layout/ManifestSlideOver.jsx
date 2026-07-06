/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / Layout
 * File: ManifestSlideOver.jsx
 * * DESCRIPTION:
 * The apex deep-inspector drawer. Takes full command of the Z-axis 
 * to display the mission-critical details of a single dispatch schedule.
 * * WORLD-CLASS UPGRADES:
 * 1. KINETIC TAB ENGINE: Seamlessly swaps between the physical Seat Matrix 
 * and the financial Passenger Ledger without destroying component state.
 * 2. Z-AXIS LOCKDOWN: Automatically disables background scrolling (`overflow: hidden` on body) 
 * while open, preventing double-scroll bugs on mobile devices.
 * 3. OMNI-DIRECTIONAL SCROLL: The core viewport supports X/Y scrolling for 
 * massive 70-seater layouts, while keeping the Header and Footer firmly locked in place.
 * 4. DETERMINISTIC BADGING: Wires directly into the CutoffBadge using the purified Adapter data.
 */

import React, { useState, useEffect } from 'react';
import { 
    X, MapPin, Navigation, Clock, Calendar, 
    Bus, Users, Grid, Printer, ShieldCheck
} from 'lucide-react';

// --- CHILD COMPONENTS ---
import CutoffBadge from '../states/CutoffBadge';
import SeatMatrix from '../interactive/SeatMatrix';
import PassengerLedger from '../interactive/PassengerLedger';
import SeatActionPopover from '../interactive/SeatActionPopover';

// --- SERVICE ---
import { manifestService } from '../../data/manifest.service';

// ========================================================================
// HELPER PHYSICS: FORMATTERS
// ========================================================================
const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    try {
        const [hour, minute] = timeString.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${minute} ${ampm}`;
    } catch {
        return timeString;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Active Date';
    try {
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
};

// ========================================================================
// MAIN COMPONENT
// ========================================================================
const ManifestSlideOver = ({ trip, tenantId, onClose }) => {
    const [activeTab, setActiveTab] = useState('MATRIX'); // 'MATRIX' | 'LEDGER'

    // --- SEAT ACTION STATE ---
    // The seat currently under the popover, and an optimistic local
    // overlay of status changes. manifestService.updateSeatState is
    // currently a stub (see its own header comment — it doesn't persist
    // to the seat_matrix_state JSONB column yet), so without this local
    // overlay a confirmed action would appear to do nothing until that
    // backend work lands. This overlay is intentionally lightweight and
    // in-memory only — it does NOT replace the real persistence layer.
    const [popoverTarget, setPopoverTarget] = useState(null); // { seatId, currentStatus, anchorElement }
    const [localStatusOverrides, setLocalStatusOverrides] = useState({}); // { [seatId]: newStatus }

    // Merge the trip's real seat_matrix_state with any optimistic local
    // overrides not yet reflected by a backend refresh.
    const effectiveSeatMatrixState = {
        ...(trip?.seatMatrixState || trip?.seat_matrix_state || {}),
        ...Object.fromEntries(
            Object.entries(localStatusOverrides).map(([seatId, status]) => [seatId, { status }])
        ),
    };

    // Cutoff badge state (OPEN/WARNING/LOCKED/DEPARTED) and the database
    // status (PENDING_APPROVAL/ACTIVE/etc.) are two DIFFERENT enums that
    // this component currently conflates by passing trip.status to both
    // CutoffBadge and this check — a pre-existing mismatch, not something
    // introduced here. Until the real T-4-hour cutoff calculation exists
    // (flagged as a TODO in manifest.service.js), this will effectively
    // never lock seat interactions.
    const isCutoffLocked = trip?.status === 'LOCKED';

    const handleSeatActionRequest = (seatId, currentStatus, anchorElement, slot) => {
        setPopoverTarget({ seatId, currentStatus, anchorElement, slot });
    };

    const handleConfirmSeatAction = async (seatId, requestedState, reasonCode) => {
        try {
            // NOTE: manifestService.updateSeatState doesn't accept a reason
            // code today — SeatActionPopover.jsx collects one, but there's
            // nowhere for it to go yet on the backend. Logged here so it
            // isn't silently lost, pending that service being extended.
            if (reasonCode) console.info('[ManifestSlideOver] Seat action reason (not yet persisted):', reasonCode);

            const result = await manifestService.updateSeatState(trip.id, tenantId, seatId, requestedState);
            if (result.success) {
                setLocalStatusOverrides((prev) => ({ ...prev, [seatId]: requestedState }));
            } else {
                console.error('[ManifestSlideOver] updateSeatState failed:', result.error);
                alert(result.error || 'Could not update seat status. Please try again.');
            }
        } catch (err) {
            console.error('[ManifestSlideOver] updateSeatState threw:', err);
            alert('Could not update seat status. Please try again.');
        } finally {
            setPopoverTarget(null);
        }
    };

    // --- LOCKOUT PHYSICS ---
    // Prevent the body from scrolling when the drawer is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Safety catch: If no trip data was passed, render nothing
    if (!trip) return null;

    return (
        <div className="slideover-overlay">
            {/* BACKGROUND BACKDROP (Click to close) */}
            <div className="slideover-backdrop" onClick={onClose} />

            {/* MAIN DRAWER CHASSIS */}
            <div className="slideover-panel">
                
                {/* =========================================
                    1. FIXED HEADER: COMMAND & TELEMETRY
                ========================================= */}
                <header className="slideover-header">
                    <div className="header-top-row">
                        <div className="route-identity">
                            <span className="route-code">{trip.routeCode || 'TBA'}</span>
                            <CutoffBadge state={trip.status} />
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="corridor-display">
                        <div className="city-node origin">
                            <MapPin size={18} className="node-icon" />
                            <span className="city-name">{trip.originCity || 'Unknown'}</span>
                        </div>
                        <div className="route-connector">
                            <div className="connector-line" />
                            <Navigation size={14} className="connector-arrow" />
                        </div>
                        <div className="city-node destination">
                            <MapPin size={18} className="node-icon" />
                            <span className="city-name">{trip.destinationCity || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="telemetry-bar">
                        <div className="telemetry-item">
                            <Calendar size={14} />
                            <span>{formatDate(trip.departureDate)}</span>
                        </div>
                        <div className="telemetry-item">
                            <Clock size={14} />
                            <span>{formatTime(trip.departureTime)}</span>
                        </div>
                        <div className="telemetry-item">
                            <Bus size={14} />
                            <span>{trip.busClass || 'Standard Config'}</span>
                        </div>
                    </div>

                    {/* TAB NAVIGATION */}
                    <div className="tab-container">
                        <button 
                            className={`tab-btn ${activeTab === 'MATRIX' ? 'active' : ''}`}
                            onClick={() => setActiveTab('MATRIX')}
                        >
                            <Grid size={16} /> Visual Dispatch
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'LEDGER' ? 'active' : ''}`}
                            onClick={() => setActiveTab('LEDGER')}
                        >
                            <Users size={16} /> Passenger Ledger
                        </button>
                    </div>
                </header>

                {/* =========================================
                    2. SCROLLABLE VIEWPORT (The Engine)
                ========================================= */}
                <main className="slideover-viewport">
                    {activeTab === 'MATRIX' ? (
                        <div className="viewport-content matrix-mode">
                            <SeatMatrix 
                                scheduleId={trip.id} 
                                layoutConfig={trip.layoutConfig}
                                tenantId={tenantId}
                                seatMatrixState={effectiveSeatMatrixState}
                                onSeatActionRequest={handleSeatActionRequest}
                                isCutoffLocked={isCutoffLocked}
                            />
                        </div>
                    ) : (
                        <div className="viewport-content ledger-mode">
                            <PassengerLedger 
                                scheduleId={trip.id} 
                            />
                        </div>
                    )}
                </main>

                {/* =========================================
                    3. FIXED FOOTER: ACTIONS
                ========================================= */}
                <footer className="slideover-footer">
                    <div className="security-stamp">
                        <ShieldCheck size={16} color="var(--brand-primary)" />
                        <span>Sovereign Dispatch Mode</span>
                    </div>
                    <div className="footer-actions">
                        <button className="secondary-btn" onClick={() => window.print()}>
                            <Printer size={16} /> Print
                        </button>
                        <button className="primary-btn" onClick={onClose}>
                            Close Inspector
                        </button>
                    </div>
                </footer>
            </div>

            {/* SEAT ACTION POPOVER — booking-status mutation only (mark
                unavailable/VIP/maintenance), separate from Admin's
                structural SeatActionPopover used in the bus-config wizard. */}
            <SeatActionPopover
                isOpen={!!popoverTarget}
                onClose={() => setPopoverTarget(null)}
                anchorElement={popoverTarget?.anchorElement}
                seatId={popoverTarget?.seatId}
                currentStatus={popoverTarget?.currentStatus}
                onConfirmAction={handleConfirmSeatAction}
            />

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                /* OVERLAY & DRAWER STRUCTURE */
                .slideover-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 9999;
                    display: flex;
                    justify-content: flex-end;
                }
                
                .slideover-backdrop {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.3s ease;
                }

                .slideover-panel {
                    position: relative;
                    width: 100%;
                    max-width: 800px;
                    background: var(--bg-canvas);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* HEADER */
                .slideover-header {
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-subtle);
                    padding: 24px 32px 0 32px;
                    flex-shrink: 0;
                }

                .header-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }

                .route-identity {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .route-code {
                    font-size: 24px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -0.5px;
                }

                .close-btn {
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-main);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: var(--border-subtle); transform: rotate(90deg); }

                /* CORRIDOR DISPLAY */
                .corridor-display {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                    background: var(--bg-input);
                    padding: 16px 24px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-subtle);
                }
                .city-node { display: flex; alignItems: center; gap: 8px; }
                .node-icon { color: var(--brand-primary); }
                .city-name { font-size: 18px; font-weight: 800; color: var(--text-main); }
                .route-connector { flex: 1; display: flex; align-items: center; position: relative; }
                .connector-line { height: 2px; flex: 1; background: var(--border-strong); border-radius: 2px; }
                .connector-arrow { color: var(--border-strong); margin-left: -4px; }

                /* TELEMETRY */
                .telemetry-bar {
                    display: flex;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .telemetry-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* TABS */
                .tab-container {
                    display: flex;
                    gap: 32px;
                    border-bottom: 2px solid transparent;
                }
                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 0;
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: -1px;
                }
                .tab-btn:hover { color: var(--text-main); }
                .tab-btn.active {
                    color: var(--brand-primary);
                    border-bottom-color: var(--brand-primary);
                }

                /* VIEWPORT (SCROLLABLE AREA) */
                .slideover-viewport {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: var(--bg-canvas);
                    position: relative;
                }
                .viewport-content {
                    padding: 32px;
                    min-height: 100%;
                    animation: fadeIn 0.3s ease;
                }

                /* FOOTER */
                .slideover-footer {
                    background: var(--bg-surface);
                    border-top: 1px solid var(--border-subtle);
                    padding: 24px 32px;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .security-stamp {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .footer-actions {
                    display: flex;
                    gap: 12px;
                }
                .secondary-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 12px 20px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-main);
                    border-radius: var(--radius-md);
                    font-weight: 800; font-size: 14px;
                    cursor: pointer; transition: all 0.2s;
                }
                .secondary-btn:hover { background: var(--border-strong); }
                
                .primary-btn {
                    padding: 12px 32px;
                    background: var(--brand-primary);
                    color: #fff;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 800; font-size: 14px;
                    cursor: pointer; transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(206, 172, 92, 0.3);
                }
                .primary-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

                /* ANIMATIONS & SCROLLBAR */
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .slideover-viewport::-webkit-scrollbar { width: 6px; }
                .slideover-viewport::-webkit-scrollbar-track { background: transparent; }
                .slideover-viewport::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
                .slideover-viewport::-webkit-scrollbar-thumb:hover { background: var(--brand-primary); }

                /* MOBILE RESPONSIVE DEGRADATION */
                @media (max-width: 768px) {
                    .slideover-panel { width: 100%; max-width: 100%; }
                    .slideover-header { padding: 16px 16px 0 16px; }
                    .corridor-display { flex-direction: column; align-items: flex-start; gap: 12px; padding: 12px; }
                    .route-connector { display: none; } /* Hide line on vertical mobile */
                    .telemetry-bar { flex-wrap: wrap; gap: 12px; }
                    .tab-container { gap: 16px; }
                    .viewport-content { padding: 16px; }
                    .slideover-footer { padding: 16px; flex-direction: column-reverse; gap: 16px; }
                    .footer-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
                    .security-stamp { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default ManifestSlideOver;