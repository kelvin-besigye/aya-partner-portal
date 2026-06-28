/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Layout
 * File: StoreInspectorDock.jsx
 * Goes to: apps/partner-portal/src/modules/store/components/layout/StoreInspectorDock.jsx
 *
 * CHANGES IN THIS VERSION:
 * - Removed selectedAsset.plateNumber from header title (column dropped from DB).
 *   Fleet assets now display busClass + layoutDisplay as their identifier.
 * - Changed asset.layoutConfig → asset.layoutDisplay (fixed adapter field name).
 * - All other field names verified against store.adapters.js fixed output.
 */

import React from 'react';
import {
    X, Bus, Map, CalendarClock, ShieldCheck,
    Armchair, Coffee, FileEdit, AlertTriangle,
    Navigation, MapPin, Clock, Banknote, Image as ImageIcon
} from 'lucide-react';
import StoreAssetBadge from '../interactive/StoreAssetBadge';

// ========================================================================
// 1. DEFENSIVE FORMATTERS
// ========================================================================
const formatMoney = (amount) => {
    if (isNaN(amount) || amount === null) return '0';
    return new Intl.NumberFormat('en-UG', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
};

const getCoverImage = (galleryArray) => {
    if (!galleryArray || galleryArray.length === 0) return null;
    const firstImg = galleryArray[0];
    return typeof firstImg === 'string' ? firstImg : (firstImg.url || firstImg.preview || null);
};

// ========================================================================
// 2. MAIN COMPONENT
// ========================================================================
const StoreInspectorDock = ({
    selectedAsset,
    onClose,
    onRequestChange
}) => {

    // --- IDLE STATE (Empty Dock) ---
    if (!selectedAsset) {
        return (
            <div className="inspector-idle-state">
                <div className="idle-icon-ring">
                    <ShieldCheck size={32} color="var(--text-muted)" />
                </div>
                <h3>Sovereign Inspector</h3>
                <p>Select an asset from the vault to view deep telemetry and request modifications.</p>
            </div>
        );
    }

    // ========================================================================
    // 3. POLYMORPHIC RENDERING ENGINES
    // ========================================================================

    /**
     * Renders physical bus data (Gallery, Amenities, Specs)
     * Fields from store.adapters.js: busClass, layoutDisplay, amenities, gallery
     */
    const renderFleetDetails = (asset) => {
        const coverImage = getCoverImage(asset.gallery);
        return (
            <div className="inspector-polymorph-body">
                {coverImage ? (
                    <div className="inspector-hero-image">
                        <img src={coverImage} alt="Asset Visual Profile" />
                        {asset.gallery.length > 1 && (
                            <div className="gallery-count-badge">
                                <ImageIcon size={12} /> +{asset.gallery.length - 1}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="inspector-hero-placeholder">
                        <Bus size={32} />
                        <span>No visual profile registered</span>
                    </div>
                )}

                <div className="data-section">
                    <h4 className="section-label">Physical Specifications</h4>
                    <div className="data-grid">
                        <div className="data-card">
                            <span className="card-label">Hardware Class</span>
                            <span className="card-val">{asset.busClass || '—'}</span>
                        </div>
                        <div className="data-card">
                            <span className="card-label">Layout Config</span>
                            {/* FIX: was asset.layoutConfig — adapters now return layoutDisplay */}
                            <div className="card-val-icon"><Armchair size={14}/> {asset.layoutDisplay || '—'}</div>
                        </div>
                    </div>
                </div>

                <div className="data-section">
                    <h4 className="section-label">Onboard Amenities ({asset.amenities?.length || 0})</h4>
                    {asset.amenities && asset.amenities.length > 0 ? (
                        <div className="amenity-tags">
                            {asset.amenities.map((item, idx) => (
                                <span key={idx} className="amenity-tag">
                                    <Coffee size={12} /> {item.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-sub-state">No special amenities configured.</div>
                    )}
                </div>
            </div>
        );
    };

    /**
     * Renders geographical and financial vectors
     * Fields: originCity, departurePark, durationText, destinationCity,
     *         priceTicket, priceTax, totalFare, assignedFleetClass, assignedLayout
     */
    const renderRouteDetails = (asset) => (
        <div className="inspector-polymorph-body">
            <div className="data-section">
                <h4 className="section-label">Geographical Vector</h4>
                <div className="route-vector-card">
                    <div className="vector-node">
                        <MapPin size={16} color="var(--brand-primary)" />
                        <div>
                            <div className="node-city">{asset.originCity}</div>
                            <div className="node-park">{asset.departurePark}</div>
                        </div>
                    </div>
                    <div className="vector-connector">
                        <div className="connector-line" />
                        <div className="connector-pill">{asset.durationText}</div>
                    </div>
                    <div className="vector-node">
                        <Navigation size={16} color="var(--brand-primary)" />
                        <div>
                            <div className="node-city">{asset.destinationCity}</div>
                            <div className="node-park">Arrival Terminal</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="data-section">
                <h4 className="section-label">Financial Ledger (Per Ticket)</h4>
                <div className="financial-breakdown-card">
                    <div className="fin-row">
                        <span className="fin-label">Base Fare</span>
                        <span className="fin-val">UGX {formatMoney(asset.priceTicket)}</span>
                    </div>
                    <div className="fin-row">
                        <span className="fin-label">Service/Tax Margin</span>
                        <span className="fin-val">UGX {formatMoney(asset.priceTax)}</span>
                    </div>
                    <div className="fin-divider" />
                    <div className="fin-row total">
                        <span className="fin-label">Customer Total</span>
                        <span className="fin-val highlight">UGX {formatMoney(asset.totalFare)}</span>
                    </div>
                </div>
            </div>

            <div className="data-section">
                <h4 className="section-label">Assigned Hardware Constraints</h4>
                <div className="data-grid">
                    <div className="data-card">
                        <span className="card-label">Required Class</span>
                        <span className="card-val">{asset.assignedFleetClass}</span>
                    </div>
                    <div className="data-card">
                        <span className="card-label">Required Layout</span>
                        <span className="card-val">{asset.assignedLayout}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * Renders temporal and automation rules
     * Fields: humanFrequency, departureTimeFormatted, routeCode, busClass,
     *         originCity, destinationCity
     */
    const renderTimetableDetails = (asset) => (
        <div className="inspector-polymorph-body">
            <div className="data-section">
                <h4 className="section-label">Temporal Execution Rule</h4>
                <div className="execution-card">
                    <CalendarClock size={24} color="var(--brand-primary)" />
                    <div className="execution-text">
                        <span className="exec-title">{asset.humanFrequency}</span>
                        <span className="exec-subtitle">Dispatch triggers strictly at {asset.departureTimeFormatted}</span>
                    </div>
                </div>
            </div>

            <div className="data-section">
                <h4 className="section-label">Target Route Linkage</h4>
                <div className="data-grid">
                    <div className="data-card">
                        <span className="card-label">Route Code</span>
                        <span className="card-val monospace">{asset.routeCode}</span>
                    </div>
                    <div className="data-card">
                        <span className="card-label">Hardware</span>
                        <span className="card-val">{asset.busClass}</span>
                    </div>
                </div>
            </div>

            <div className="data-section">
                <h4 className="section-label">Geographical Summary</h4>
                <div className="info-panel">
                    This automation executes the corridor from <strong>{asset.originCity}</strong> to <strong>{asset.destinationCity}</strong>.
                    Any modifications to the base Route Pricing will automatically apply to this schedule.
                </div>
            </div>
        </div>
    );

    // ========================================================================
    // 4. HEADER TITLE RESOLVER
    // ========================================================================
    /**
     * FIX: plateNumber is dropped from the DB schema.
     * Fleet assets now show busClass + layoutDisplay as their primary identifier.
     * Routes show routeCode. Timetable shows humanFrequency.
     */
    const resolveHeaderTitle = (asset) => {
        if (asset.assetType === 'FLEET') {
            return asset.busClass
                ? `${asset.busClass} — ${asset.layoutDisplay || 'Config'}`
                : 'Fleet Asset';
        }
        if (asset.assetType === 'ROUTES') return asset.routeCode || 'Route Blueprint';
        if (asset.assetType === 'TIMETABLE') return asset.humanFrequency || 'Automation Rule';
        return 'Asset Dossier';
    };

    // --- MASTER RENDERER ---
    return (
        <div className="inspector-chassis">

            {/* MASTER HEADER */}
            <header className="inspector-header">
                <div className="header-top">
                    <div className="header-titles">
                        <span className="asset-type-label">
                            {selectedAsset.assetType === 'FLEET' && 'Fleet Asset Dossier'}
                            {selectedAsset.assetType === 'ROUTES' && 'Route Blueprint'}
                            {selectedAsset.assetType === 'TIMETABLE' && 'Automation Rule'}
                        </span>
                        <h2>{resolveHeaderTitle(selectedAsset)}</h2>
                    </div>
                    <button className="inspector-close-btn" onClick={onClose} title="Close Inspector">
                        <X size={20} />
                    </button>
                </div>
                <div className="header-bottom">
                    <StoreAssetBadge status={selectedAsset.status} size="sm" />
                    <span className="system-id">ID: {selectedAsset.id?.split('-')[0]}...</span>
                </div>
            </header>

            {/* SCROLLABLE VIEWPORT (Polymorphic Injection) */}
            <div className="inspector-viewport">
                {selectedAsset.assetType === 'FLEET' && renderFleetDetails(selectedAsset)}
                {selectedAsset.assetType === 'ROUTES' && renderRouteDetails(selectedAsset)}
                {selectedAsset.assetType === 'TIMETABLE' && renderTimetableDetails(selectedAsset)}
            </div>

            {/* STICKY COMMAND FOOTER */}
            <footer className="inspector-footer">
                <div className="security-notice">
                    <ShieldCheck size={12} className="shield-icon" />
                    <span>Live edits are disabled to protect active ticket sales.</span>
                </div>
                <button
                    className="request-modification-btn"
                    onClick={() => onRequestChange(selectedAsset.assetType, selectedAsset)}
                >
                    <FileEdit size={16} /> Request Asset Modification
                </button>
            </footer>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                /* DOCK LAYOUT */
                .inspector-chassis {
                    display: flex; flex-direction: column;
                    width: 420px; height: 100%;
                    background: var(--bg-surface);
                    border-left: 1px solid var(--border-subtle);
                    box-shadow: -10px 0 40px rgba(0,0,0,0.05);
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    z-index: 50;
                }

                /* IDLE STATE */
                .inspector-idle-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; width: 420px; padding: 32px; text-align: center;
                    background: var(--bg-canvas); border-left: 1px dashed var(--border-subtle);
                }
                .idle-icon-ring { width: 64px; height: 64px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
                .inspector-idle-state h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .inspector-idle-state p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }

                /* HEADER */
                .inspector-header {
                    padding: 24px; border-bottom: 1px solid var(--border-subtle);
                    background: var(--bg-surface); flex-shrink: 0;
                }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .asset-type-label { display: block; font-size: 10px; font-weight: 800; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .header-titles h2 { margin: 0; font-size: 20px; font-weight: 900; color: var(--text-main); line-height: 1.2; }
                .inspector-close-btn { background: var(--bg-input); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-main); cursor: pointer; transition: all 0.2s; }
                .inspector-close-btn:hover { background: var(--border-strong); transform: rotate(90deg); }
                .header-bottom { display: flex; justify-content: space-between; align-items: center; }
                .system-id { font-size: 11px; font-family: monospace; color: var(--text-muted); font-weight: 700; }

                /* VIEWPORT & COMMON POLYMORPH CLASSES */
                .inspector-viewport {
                    flex: 1; overflow-y: auto; padding: 24px;
                    display: flex; flex-direction: column; gap: 32px;
                    background: var(--bg-canvas);
                }
                .inspector-viewport::-webkit-scrollbar { width: 4px; }
                .inspector-viewport::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }

                .inspector-polymorph-body { display: flex; flex-direction: column; gap: 24px; }
                .data-section { display: flex; flex-direction: column; gap: 12px; }
                .section-label { margin: 0; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

                .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .data-card { padding: 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; gap: 6px; }
                .card-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .card-val { font-size: 14px; font-weight: 900; color: var(--text-main); line-height: 1.2; }
                .card-val.monospace { font-family: monospace; letter-spacing: 1px; color: var(--brand-primary); }
                .card-val-icon { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 900; color: var(--text-main); }
                .card-val-icon svg { color: var(--text-muted); }

                /* FLEET SPECIFICS */
                .inspector-hero-image { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid var(--border-subtle); }
                .inspector-hero-image img { width: 100%; height: 100%; object-fit: cover; }
                .gallery-count-badge { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #fff; padding: 6px 10px; border-radius: 100px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.2); }
                .inspector-hero-placeholder { width: 100%; height: 160px; background: var(--bg-input); border-radius: 12px; border: 1px dashed var(--border-strong); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; }

                .amenity-tags { display: flex; flex-wrap: wrap; gap: 8px; }
                .amenity-tag { padding: 6px 12px; background: rgba(206, 172, 92, 0.1); border: 1px solid rgba(206, 172, 92, 0.2); border-radius: 100px; color: var(--brand-primary); font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: capitalize; }
                .empty-sub-state { font-size: 12px; color: var(--text-muted); font-style: italic; padding: 12px; background: var(--bg-input); border-radius: 8px; }

                /* ROUTE SPECIFICS */
                .route-vector-card { padding: 20px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; gap: 8px; }
                .vector-node { display: flex; align-items: flex-start; gap: 12px; }
                .node-city { font-size: 15px; font-weight: 900; color: var(--text-main); line-height: 1.2; }
                .node-park { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .vector-connector { display: flex; align-items: center; padding-left: 7px; margin: 4px 0; height: 32px; position: relative; }
                .connector-line { width: 2px; height: 100%; background: repeating-linear-gradient(180deg, var(--border-strong), var(--border-strong) 4px, transparent 4px, transparent 8px); }
                .connector-pill { margin-left: 20px; padding: 4px 10px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 100px; font-size: 10px; font-weight: 800; color: var(--text-main); }

                .financial-breakdown-card { padding: 20px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; gap: 12px; }
                .fin-row { display: flex; justify-content: space-between; align-items: center; }
                .fin-label { font-size: 13px; font-weight: 700; color: var(--text-muted); }
                .fin-val { font-size: 14px; font-weight: 800; color: var(--text-main); font-family: monospace; }
                .fin-divider { height: 1px; background: var(--border-subtle); margin: 4px 0; }
                .fin-row.total .fin-label { color: var(--text-main); font-weight: 900; text-transform: uppercase; font-size: 12px; }
                .fin-row.total .fin-val.highlight { color: var(--status-success); font-size: 18px; font-weight: 900; }

                /* TIMETABLE SPECIFICS */
                .execution-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(206, 172, 92, 0.05); border: 1px solid rgba(206, 172, 92, 0.2); border-radius: 12px; }
                .execution-text { display: flex; flex-direction: column; gap: 4px; }
                .exec-title { font-size: 15px; font-weight: 900; color: var(--brand-primary); }
                .exec-subtitle { font-size: 12px; font-weight: 600; color: var(--text-main); line-height: 1.4; }
                .info-panel { padding: 16px; background: var(--bg-input); border-radius: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.6; border: 1px dashed var(--border-strong); }
                .info-panel strong { color: var(--text-main); }

                /* FOOTER COMMANDS */
                .inspector-footer { padding: 24px; background: var(--bg-surface); border-top: 1px solid var(--border-subtle); flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
                .security-notice { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); line-height: 1.4; }
                .shield-icon { color: var(--brand-primary); flex-shrink: 0; margin-top: 2px; }
                .request-modification-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: var(--brand-primary); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 900; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 16px rgba(206, 172, 92, 0.3); }
                .request-modification-btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(206, 172, 92, 0.4); }

                /* ANIMATIONS & RESPONSIVE */
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

                @media (max-width: 1024px) {
                    .inspector-chassis, .inspector-idle-state {
                        position: fixed; top: 0; right: 0; bottom: 0;
                        width: 100%; max-width: 450px;
                        border-left: none; box-shadow: -20px 0 60px rgba(0,0,0,0.2);
                    }
                }
                @media (max-width: 600px) {
                    .inspector-chassis, .inspector-idle-state { max-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default StoreInspectorDock;
