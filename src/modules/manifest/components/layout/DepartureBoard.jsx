/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / Layout
 * File: DepartureBoard.jsx
 * * DESCRIPTION:
 * The apex dispatch grid. Displays all schedules for the active day.
 * * WORLD-CLASS UPGRADES:
 * 1. TEMPORAL STRIPPING: Removed the volatile date-ticking logic. It now 
 * strictly trusts the state provided by the Adapter pipeline.
 * 2. HORIZONTAL RESPONSIVENESS: Wrapped in an `overflow-x: auto` container 
 * so large data tables never break the mobile viewport.
 * 3. KINETIC ROWS: Hover states and active scaling provide tactile feedback 
 * to dispatchers operating in fast-paced environments.
 * 4. DEFENSIVE RENDERING: Null-coalescing on all fields prevents UI white-screens 
 * if a route is partially configured.
 */

import React from 'react';
import { 
    Clock, MapPin, Navigation, Bus, 
    ChevronRight, AlertTriangle, CheckCircle2, 
    MoreHorizontal, ShieldAlert
} from 'lucide-react';

// ========================================================================
// 1. HELPER PHYSICS: TIME FORMATTING
// ========================================================================
const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    try {
        const [hourStr, minuteStr] = timeString.split(':');
        const h = parseInt(hourStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return {
            time: `${formattedHour}:${minuteStr}`,
            period: ampm
        };
    } catch (e) {
        return { time: '--:--', period: '' };
    }
};

// ========================================================================
// 2. STATUS ENGINE
// ========================================================================
const renderStatusBadge = (status) => {
    const s = (status || 'UNKNOWN').toUpperCase();
    
    switch (s) {
        case 'ACTIVE':
        case 'SCHEDULED':
            return (
                <div className="status-pill active">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span>Active</span>
                </div>
            );
        case 'PENDING_APPROVAL':
        case 'PENDING':
            return (
                <div className="status-pill pending">
                    <Clock size={12} strokeWidth={3} />
                    <span>Pending</span>
                </div>
            );
        case 'BOARDING':
            return (
                <div className="status-pill boarding">
                    <div className="pulse-dot" />
                    <span>Boarding</span>
                </div>
            );
        case 'DEPARTED':
            return (
                <div className="status-pill departed">
                    <Navigation size={12} strokeWidth={3} />
                    <span>Departed</span>
                </div>
            );
        case 'SUSPENDED':
            return (
                <div className="status-pill suspended">
                    <ShieldAlert size={12} strokeWidth={3} />
                    <span>Suspended</span>
                </div>
            );
        default:
            return (
                <div className="status-pill unknown">
                    <AlertTriangle size={12} strokeWidth={3} />
                    <span>{s}</span>
                </div>
            );
    }
};

// ========================================================================
// 3. MAIN COMPONENT
// ========================================================================
const DepartureBoard = ({ trips = [], onInspect }) => {
    
    if (!trips || trips.length === 0) {
        return (
            <div className="empty-board-state">
                <AlertTriangle size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>No Departures Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>The schedule adapter returned an empty matrix.</p>
            </div>
        );
    }

    return (
        <div className="departure-board-chassis">
            <div className="table-responsive-wrapper">
                <table className="departure-table">
                    <thead>
                        <tr>
                            <th>Departure</th>
                            <th>Route Vector</th>
                            <th>Bus Class</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip) => {
                            const timeData = formatTime(trip.departureTime || trip.departure_time);
                            
                            return (
                                <tr 
                                    key={trip.id} 
                                    className="trip-row"
                                    onClick={() => onInspect && onInspect(trip)}
                                >
                                    {/* COL 1: TIME */}
                                    <td className="col-time">
                                        <div className="time-display">
                                            <span className="time-val">{timeData.time}</span>
                                            <span className="time-period">{timeData.period}</span>
                                        </div>
                                    </td>

                                    {/* COL 2: ROUTE */}
                                    <td className="col-route">
                                        <div className="route-wrapper">
                                            <div className="city-node origin">
                                                <MapPin size={14} className="node-icon" />
                                                <span className="city-name">{trip.originCity || trip.origin_city || 'TBA'}</span>
                                            </div>
                                            <div className="route-connector">
                                                <div className="connector-line" />
                                                <Navigation size={10} className="connector-arrow" />
                                            </div>
                                            <div className="city-node destination">
                                                <MapPin size={14} className="node-icon" />
                                                <span className="city-name">{trip.destinationCity || trip.destination_city || 'TBA'}</span>
                                            </div>
                                        </div>
                                        <div className="route-code">{trip.routeCode || trip.route_code || 'UNTITLED-ROUTE'}</div>
                                    </td>

                                    {/* COL 3: ASSET */}
                                    <td className="col-fleet">
                                        <div className="fleet-badge">
                                            <Bus size={14} />
                                            <span>{trip.busClass || 'Standard Config'}</span>
                                        </div>
                                    </td>

                                    {/* COL 4: STATUS */}
                                    <td className="col-status">
                                        {renderStatusBadge(trip.status)}
                                    </td>

                                    {/* COL 5: ACTION */}
                                    <td className="col-action">
                                        <button className="inspect-btn">
                                            <span>Inspect</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .departure-board-chassis {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    overflow: hidden;
                    width: 100%;
                }

                /* RESPONSIVE SCROLL WRAPPER */
                .table-responsive-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .departure-table {
                    width: 100%;
                    min-width: 800px; /* Forces scroll on mobile */
                    border-collapse: collapse;
                    text-align: left;
                }

                .departure-table th {
                    padding: 16px 24px;
                    background: var(--bg-input);
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .departure-table td {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-subtle);
                    vertical-align: middle;
                }

                /* ROW KINETICS */
                .trip-row {
                    cursor: pointer;
                    background: var(--bg-surface);
                    transition: all 0.2s ease;
                }
                .trip-row:hover {
                    background: var(--bg-input);
                }
                .trip-row:hover .inspect-btn {
                    background: var(--brand-primary);
                    color: #fff;
                    border-color: var(--brand-primary);
                }
                .trip-row:hover .inspect-btn svg {
                    transform: translateX(4px);
                }
                .trip-row:last-child td {
                    border-bottom: none;
                }

                /* TIME DISPLAY */
                .time-display {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }
                .time-val {
                    font-size: 20px;
                    font-weight: 900;
                    color: var(--text-main);
                    letter-spacing: -0.5px;
                }
                .time-period {
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--text-muted);
                }

                /* ROUTE CORRIDOR */
                .route-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 4px;
                }
                .city-node {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .node-icon { color: var(--brand-primary); }
                .city-name {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--text-main);
                }
                .route-connector {
                    flex: 1;
                    max-width: 60px;
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .connector-line {
                    height: 2px;
                    flex: 1;
                    background: var(--border-strong);
                    border-radius: 2px;
                }
                .connector-arrow {
                    color: var(--border-strong);
                    margin-left: -4px;
                }
                .route-code {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }

                /* FLEET ASSET */
                .fleet-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .fleet-badge svg { color: var(--text-muted); }

                /* STATUS ENGINE PILLS */
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-pill.active { background: rgba(34, 197, 94, 0.1); color: var(--status-success); border: 1px solid rgba(34, 197, 94, 0.2); }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: var(--status-warning); border: 1px solid rgba(245, 158, 11, 0.2); }
                .status-pill.boarding { background: rgba(206, 172, 92, 0.1); color: var(--brand-primary); border: 1px solid rgba(206, 172, 92, 0.2); }
                .status-pill.departed { background: var(--bg-input); color: var(--text-muted); border: 1px solid var(--border-subtle); }
                .status-pill.suspended { background: rgba(239, 68, 68, 0.1); color: var(--status-error); border: 1px solid rgba(239, 68, 68, 0.2); }
                .status-pill.unknown { background: var(--bg-input); color: var(--text-muted); border: 1px dashed var(--border-strong); }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--brand-primary);
                    border-radius: 50%;
                    animation: boardingPulse 1.5s infinite;
                }
                @keyframes boardingPulse {
                    0% { box-shadow: 0 0 0 0 rgba(206, 172, 92, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(206, 172, 92, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(206, 172, 92, 0); }
                }

                /* ACTION BUTTON */
                .col-action { text-align: right; }
                .inspect-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    color: var(--text-main);
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .inspect-btn svg { transition: transform 0.2s; }
                
                /* EMPTY STATE */
                .empty-board-state {
                    padding: 64px 24px;
                    text-align: center;
                    background: var(--bg-surface);
                    border: 1px dashed var(--border-strong);
                    border-radius: var(--radius-lg);
                }
            `}</style>
        </div>
    );
};

export default DepartureBoard;