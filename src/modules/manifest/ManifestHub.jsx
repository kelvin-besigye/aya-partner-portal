import React, { useState, useEffect, useCallback } from 'react';
import { 
    CalendarDays, ChevronLeft, ChevronRight, RefreshCw, 
    ShieldCheck, AlertTriangle, Loader2 
} from 'lucide-react';

// --- CONTEXT & SERVICES ---
import { useAuth } from '../../context/AuthContext';
import { manifestService } from './data/manifest.service';

// --- ECOSYSTEM COMPONENTS ---
import DepartureBoard from './components/layout/DepartureBoard';
import ManifestSlideOver from './components/layout/ManifestSlideOver';
import EmptyManifestState from './components/states/EmptyState';

/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Dispatch Engine)
 * ------------------------------------------------------------------
 * Module: Manifest (Master Controller)
 * File: ManifestHub.jsx
 * * * DESCRIPTION:
 * The apex orchestration layer for the dispatch ecosystem. 
 * Manages identity-locked data fetching and temporal state.
 * * * PHYSICS:
 * - Tenant-Locked: Only fetches data matching the logged-in Partner UUID.
 * - Reactive Temporal State: Updates fleet telemetry when the date changes.
 * - Zero-Latency Transitions: Optimized for fast-paced bus park environments.
 */

const ManifestHub = () => {
    // ========================================================================
    // 1. IDENTITY & TEMPORAL STATE
    // ========================================================================
    const { tenant } = useAuth(); // 🔥 THE FIX: Connects to the real Partner ID
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [departures, setDepartures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI State: Manifest Inspection
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

    // ========================================================================
    // 2. DATA SYNCHRONIZATION ENGINE
    // ========================================================================
    /**
     * Fetches the specific manifest for the active tenant.
     * Locked by tenant.id to ensure data privacy.
     */
    const syncManifest = useCallback(async () => {
        if (!tenant?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const dateStr = currentDate.toISOString().split('T')[0];
            const result = await manifestService.fetchDailyDepartures(tenant.id, dateStr);

            if (result.success) {
                setDepartures(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Manifest Sync Failed: System Connection Interrupted.");
        } finally {
            setIsLoading(false);
        }
    }, [tenant?.id, currentDate]);

    // Re-sync whenever the Partner ID or selected Date changes
    useEffect(() => {
        syncManifest();
    }, [syncManifest]);

    // ========================================================================
    // 3. COMMAND HANDLERS
    // ========================================================================
    const handleNextDay = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 1);
        setCurrentDate(next);
    };

    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 1);
        setCurrentDate(prev);
    };

    const handleInspectTrip = (trip) => {
        setSelectedTrip(trip);
        setIsSlideOverOpen(true);
    };

    // ========================================================================
    // 4. VIEWPORT RENDER
    // ========================================================================
    return (
        <div style={{ 
            height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
            background: 'var(--bg-canvas)', overflow: 'hidden'
        }}>
            
            {/* --- COMMAND BAR (TEMPORAL NAVIGATION) --- */}
            <div style={{ 
                padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                        padding: '10px', background: 'var(--brand-primary)', 
                        borderRadius: '10px', color: '#FFF', display: 'flex' 
                    }}>
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Dispatch Date
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                        <button onClick={handlePrevDay} className="nav-btn"><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="nav-btn" style={{ fontSize: '11px', fontWeight: '800', padding: '0 12px' }}>TODAY</button>
                        <button onClick={handleNextDay} className="nav-btn"><ChevronRight size={18} /></button>
                    </div>
                    
                    <button 
                        onClick={syncManifest}
                        disabled={isLoading}
                        style={{ 
                            padding: '10px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                            borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', gap: '8px', fontWeight: '700', transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={16} className={isLoading ? 'spin-anim' : ''} />
                        Sync
                    </button>
                </div>
            </div>

            {/* --- PRIMARY OPERATIONAL VIEWPORT --- */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                
                {isLoading && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', opacity: 0.6 }}>
                        <Loader2 size={32} className="spin-anim" color="var(--brand-primary)" />
                        <span style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>RECALLING TELEMETRY...</span>
                    </div>
                )}

                {!isLoading && error && (
                    <div style={{ 
                        padding: '40px', textAlign: 'center', background: 'var(--bg-surface)', 
                        border: '1px dashed var(--status-error)', borderRadius: '16px' 
                    }}>
                        <AlertTriangle size={40} color="var(--status-error)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Sync Interrupted</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{error}</p>
                    </div>
                )}

                {!isLoading && !error && departures.length === 0 && (
                    <EmptyManifestState />
                )}

                {!isLoading && !error && departures.length > 0 && (
                    <DepartureBoard 
                        trips={departures} 
                        onInspect={handleInspectTrip} 
                    />
                )}
            </div>

            {/* --- TRIP INSPECTION OVERLAY --- */}
            {isSlideOverOpen && selectedTrip && (
                <ManifestSlideOver 
                    trip={selectedTrip} 
                    tenantId={tenant.id}
                    onClose={() => setIsSlideOverOpen(false)} 
                />
            )}

            <style>{`
                .nav-btn {
                    background: transparent; border: none; padding: 8px; 
                    color: var(--text-main); cursor: pointer; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .nav-btn:hover { background: var(--bg-surface); color: var(--brand-primary); }
                .spin-anim { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ManifestHub;