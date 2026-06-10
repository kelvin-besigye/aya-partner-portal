/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest / Components / Interactive
 * File: PassengerLedger.jsx
 * * DESCRIPTION:
 * The financial and operational payload manifest. 
 * Strictly displays passengers who have successfully booked via the AyaBus platform.
 * Excludes Partner's physical park sales to maintain Treasury purity.
 * * PHYSICS:
 * - Real-time client-side search and filtering.
 * - One-click boarding toggles with optimistic UI updates.
 * - Horizontal scroll lock for extreme data density on mobile devices.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Filter, CheckCircle2, Circle, 
    Phone, Hash, Luggage, User, AlertCircle, Loader2, Download
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { manifestService } from '../../data/manifest.service';

const PassengerLedger = ({ scheduleId }) => {
    const { operatorId } = useAuth();
    
    // --- STATE MANAGEMENT ---
    const [passengers, setPassengers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'BOARDED', 'PENDING'

    // ========================================================================
    // 1. DATA IGNITION (The Live Wire)
    // ========================================================================
    useEffect(() => {
        let isMounted = true;

        const loadPayload = async () => {
            if (!scheduleId || !operatorId) return;
            setIsLoading(true);
            setFetchError(null);

            const { success, data, error } = await manifestService.fetchAyaBusPayload(operatorId, scheduleId);
            
            if (!isMounted) return;

            if (success) {
                // In a real-world scenario, you might also pull 'phone_number' and 'luggage_count'
                // Assuming the service brings them, we map them into state.
                setPassengers(data || []);
            } else {
                setFetchError(error);
            }
            setIsLoading(false);
        };

        loadPayload();

        return () => { isMounted = false; };
    }, [scheduleId, operatorId]);

    // ========================================================================
    // 2. DISPATCH PHYSICS (Optimistic Boarding)
    // ========================================================================
    const toggleBoardingStatus = async (ticketId, currentStatus) => {
        const newStatus = currentStatus === 'BOARDED' ? 'PENDING' : 'BOARDED';
        
        // Optimistic UI Update for zero-latency feel
        setPassengers(prev => prev.map(p => 
            p.ticket_id === ticketId ? { ...p, boarding_status: newStatus } : p
        ));

        try {
            // FUTURE-PROOFING: Call to your actual service to update the database
            // await manifestService.updateBoardingStatus(operatorId, ticketId, newStatus);
        } catch (error) {
            console.error("Boarding sync failed. Reverting...", error);
            // Revert on failure
            setPassengers(prev => prev.map(p => 
                p.ticket_id === ticketId ? { ...p, boarding_status: currentStatus } : p
            ));
        }
    };

    // ========================================================================
    // 3. THE SEARCH & FILTER ENGINE
    // ========================================================================
    const filteredPayload = useMemo(() => {
        return passengers.filter(p => {
            // 1. Apply Status Filter
            if (filterMode === 'BOARDED' && p.boarding_status !== 'BOARDED') return false;
            if (filterMode === 'PENDING' && p.boarding_status === 'BOARDED') return false;
            
            // 2. Apply Text Search (Matches Name, Ticket ID, or Seat Number)
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = p.passenger_name?.toLowerCase().includes(q);
                const matchesTicket = p.ticket_id?.toLowerCase().includes(q);
                const matchesSeat = p.seat_number?.toString() === q;
                if (!matchesName && !matchesTicket && !matchesSeat) return false;
            }
            
            return true;
        });
    }, [passengers, searchQuery, filterMode]);

    // Metrics for the HUD
    const totalCount = passengers.length;
    const boardedCount = passengers.filter(p => p.boarding_status === 'BOARDED').length;

    // ========================================================================
    // 4. RENDERERS
    // ========================================================================
    if (isLoading) {
        return (
            <div className="ledger-loading-state">
                <Loader2 size={32} className="ayabus-spin" color="var(--brand-primary)" />
                <p>Decrypting Financial Payload...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="ledger-error-state">
                <AlertCircle size={32} color="var(--status-error)" />
                <h4>Payload Extraction Failed</h4>
                <p>{fetchError}</p>
            </div>
        );
    }

    return (
        <div className="ledger-engine-root">
            
            {/* --- HUD: METRICS & CONTROLS --- */}
            <div className="ledger-controls">
                
                <div className="metrics-hud">
                    <div className="metric-box">
                        <span className="metric-label">Total AyaBus</span>
                        <span className="metric-value">{totalCount}</span>
                    </div>
                    <div className="metric-box success">
                        <span className="metric-label">Boarded</span>
                        <span className="metric-value">{boardedCount}</span>
                    </div>
                    <div className="metric-box warning">
                        <span className="metric-label">Pending</span>
                        <span className="metric-value">{totalCount - boardedCount}</span>
                    </div>
                </div>

                <div className="search-filter-bar">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search name, seat, or ticket..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ledger-search-input"
                        />
                    </div>
                    <div className="filter-group">
                        <button 
                            className={`filter-btn ${filterMode === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilterMode('ALL')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${filterMode === 'PENDING' ? 'active' : ''}`}
                            onClick={() => setFilterMode('PENDING')}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filter-btn ${filterMode === 'BOARDED' ? 'active' : ''}`}
                            onClick={() => setFilterMode('BOARDED')}
                        >
                            Boarded
                        </button>
                    </div>
                    <button className="export-btn" title="Export Manifest">
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* --- DATA GRID: THE PAYLOAD --- */}
            <div className="ledger-table-container">
                {filteredPayload.length === 0 ? (
                    <div className="ledger-empty-state">
                        <User size={40} color="var(--border-strong)" />
                        <p>No passengers match the current criteria.</p>
                    </div>
                ) : (
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th className="col-seat">Seat</th>
                                <th className="col-identity">Passenger Identity</th>
                                <th className="col-ticket">Ticket Ref</th>
                                <th className="col-addons">Manifest Tags</th>
                                <th className="col-action">Boarding Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayload.map((passenger) => {
                                const isBoarded = passenger.boarding_status === 'BOARDED';
                                
                                return (
                                    <tr key={passenger.ticket_id} className={`ledger-row ${isBoarded ? 'is-boarded' : ''}`}>
                                        {/* SEAT */}
                                        <td className="col-seat">
                                            <div className="seat-badge">{passenger.seat_number}</div>
                                        </td>
                                        
                                        {/* IDENTITY */}
                                        <td className="col-identity">
                                            <div className="passenger-name">{passenger.passenger_name}</div>
                                            <div className="passenger-contact">
                                                <Phone size={10} /> {passenger.phone_number || 'N/A'}
                                            </div>
                                        </td>
                                        
                                        {/* TICKET ID */}
                                        <td className="col-ticket">
                                            <div className="ticket-ref">
                                                <Hash size={12} /> {passenger.ticket_id?.split('-')[0].toUpperCase()}
                                            </div>
                                            <div className="payment-badge">PAID</div>
                                        </td>
                                        
                                        {/* ADD-ONS (Future Proofing) */}
                                        <td className="col-addons">
                                            {passenger.luggage_count > 0 ? (
                                                <div className="addon-tag luggage">
                                                    <Luggage size={12} /> {passenger.luggage_count} Bags
                                                </div>
                                            ) : (
                                                <span className="no-addons">—</span>
                                            )}
                                        </td>
                                        
                                        {/* ACTION TOGGLE */}
                                        <td className="col-action">
                                            <button 
                                                className={`boarding-toggle-btn ${isBoarded ? 'boarded' : 'pending'}`}
                                                onClick={() => toggleBoardingStatus(passenger.ticket_id, passenger.boarding_status)}
                                            >
                                                {isBoarded ? (
                                                    <><CheckCircle2 size={16} /> Boarded</>
                                                ) : (
                                                    <><Circle size={16} /> Pending</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- INJECTED PHYSICS STYLESHEET --- */}
            <style>{`
                .ledger-engine-root {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-canvas);
                    gap: 16px;
                }

                /* ==================== LOADING & ERROR STATES ==================== */
                .ledger-loading-state, .ledger-error-state, .ledger-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    background: var(--bg-surface);
                    border: 1px dashed var(--border-strong);
                    border-radius: var(--radius-lg);
                    height: 100%;
                }
                .ayabus-spin { animation: spin 1s linear infinite; margin-bottom: 16px; }
                .ledger-error-state h4 { color: var(--status-error); margin: 16px 0 8px; font-weight: 800; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* ==================== CONTROLS & HUD ==================== */
                .ledger-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-subtle);
                }

                .metrics-hud {
                    display: flex;
                    gap: 12px;
                }
                .metric-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 12px 16px;
                    background: var(--bg-canvas);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-subtle);
                }
                .metric-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
                .metric-value { font-size: 24px; font-weight: 900; color: var(--text-main); line-height: 1.2; }
                
                .metric-box.success .metric-value { color: var(--status-success); }
                .metric-box.warning .metric-value { color: var(--status-warning); }

                /* SEARCH & FILTERS */
                .search-filter-bar {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .search-input-wrapper {
                    flex: 1;
                    min-width: 200px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon { position: absolute; left: 12px; color: var(--text-muted); }
                .ledger-search-input {
                    width: 100%;
                    padding: 10px 10px 10px 36px;
                    background: var(--bg-canvas);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .ledger-search-input:focus { border-color: var(--brand-primary); outline: none; }

                .filter-group {
                    display: flex;
                    background: var(--bg-canvas);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: 4px;
                }
                .filter-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn:hover { color: var(--text-main); }
                .filter-btn.active { background: var(--bg-surface); color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

                .export-btn {
                    padding: 10px;
                    background: var(--bg-canvas);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .export-btn:hover { color: var(--brand-primary); border-color: var(--brand-primary); }

                /* ==================== DATA GRID (TABLE) ==================== */
                .ledger-table-container {
                    flex: 1;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    overflow: auto; /* Enables horizontal scroll on small screens */
                }

                .ledger-table {
                    width: 100%;
                    min-width: 700px; /* Forces horizontal scroll if screen is too small */
                    border-collapse: collapse;
                    text-align: left;
                }

                /* HEADERS */
                .ledger-table th {
                    padding: 16px;
                    background: var(--bg-canvas);
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid var(--border-strong);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                /* ROWS */
                .ledger-row {
                    border-bottom: 1px solid var(--border-subtle);
                    transition: all 0.2s ease;
                }
                .ledger-row:hover { background: rgba(206, 172, 92, 0.03); }
                .ledger-row.is-boarded { opacity: 0.7; }

                .ledger-table td { padding: 16px; vertical-align: middle; }

                /* COLUMNS PHYSICS */
                .col-seat { width: 80px; text-align: center; }
                .col-identity { min-width: 180px; }
                .col-ticket { width: 140px; }
                .col-addons { width: 140px; }
                .col-action { width: 140px; text-align: right; }

                /* TYPOGRAPHY & BADGES */
                .seat-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px; height: 32px;
                    background: var(--text-main);
                    color: var(--bg-surface);
                    border-radius: 8px;
                    font-weight: 900;
                    font-size: 14px;
                }

                .passenger-name { font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 4px; }
                .passenger-contact { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--text-muted); }

                .ticket-ref { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px; font-family: monospace; }
                .payment-badge { display: inline-block; padding: 2px 6px; background: rgba(34, 197, 94, 0.1); color: var(--status-success); border-radius: 4px; font-size: 9px; font-weight: 800; }

                .addon-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
                .addon-tag.luggage { background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border-subtle); }
                .no-addons { color: var(--border-strong); }

                /* BOARDING TOGGLE */
                .boarding-toggle-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100px;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .boarding-toggle-btn.pending {
                    background: var(--bg-input);
                    border-color: var(--border-strong);
                    color: var(--text-main);
                }
                .boarding-toggle-btn.pending:hover { background: var(--border-subtle); }
                
                .boarding-toggle-btn.boarded {
                    background: rgba(34, 197, 94, 0.1);
                    border-color: rgba(34, 197, 94, 0.2);
                    color: var(--status-success);
                }

                /* RESPONSIVE EDGE CASES */
                @media (max-width: 768px) {
                    .search-filter-bar { flex-direction: column; align-items: stretch; }
                    .filter-group { justify-content: space-between; }
                }
            `}</style>
        </div>
    );
};

export default PassengerLedger;