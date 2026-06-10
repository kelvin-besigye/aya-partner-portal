/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Vaults
 * File: FleetRegistry.jsx
 * * DESCRIPTION:
 * The Master Display Grid for physical fleet assets. Renders the purified 
 * payload from `adaptFleetAsset()` (Plate Numbers, Layouts, Galleries).
 * * WORLD-CLASS PHYSICS:
 * 1. ASSET DOSSIER CARDS: Beautiful, hardware-accelerated grid cards that 
 * display a cropped gallery cover photo, layout specs, and amenity counts.
 * 2. EVENT ISOLATION: Clicking the card triggers `onInspect` (to open the right dock), 
 * but clicking the "Modify" button triggers `e.stopPropagation()` to safely launch 
 * the Change Request Engine without overlapping events.
 * 3. DEFENSIVE MEDIA RENDERING: Automatically falls back to a sleek vector 
 * placeholder if the Admin didn't upload a gallery image for a bus.
 */

import React from 'react';
import { 
    Bus, Armchair, Image as ImageIcon, Coffee, 
    FileEdit, AlertTriangle, ShieldAlert, LayoutGrid, Fingerprint
} from 'lucide-react';
import StoreAssetBadge from '../interactive/StoreAssetBadge';

// ========================================================================
// 1. DEFENSIVE MEDIA HELPER
// ========================================================================
const getCoverImage = (galleryArray) => {
    if (!galleryArray || galleryArray.length === 0) return null;
    const firstImg = galleryArray[0];
    // Handle both raw string URLs and rich objects depending on how Supabase returned it
    return typeof firstImg === 'string' ? firstImg : (firstImg.url || firstImg.preview || null);
};

// ========================================================================
// 2. MAIN COMPONENT
// ========================================================================
const FleetRegistry = ({ fleet = [], onInspect, onRequestChange }) => {

    if (!fleet || fleet.length === 0) {
        return (
            <div className="vault-empty-state">
                <div className="empty-icon-ring">
                    <Bus size={32} color="var(--text-muted)" />
                </div>
                <h3>No Fleet Assets Found</h3>
                <p>There are currently no active or pending physical bus configurations registered to your corporate identity.</p>
            </div>
        );
    }

    return (
        <div className="fleet-vault-chassis">
            
            {/* --- MASTER HEADER --- */}
            <header className="vault-header">
                <div className="header-identity">
                    <div className="vault-icon-box">
                        <Bus size={24} color="var(--brand-primary)" />
                    </div>
                    <div className="vault-titles">
                        <h1>Fleet Registry</h1>
                        <p>Physical assets, seating layouts, and operational vehicle statuses.</p>
                    </div>
                </div>
                <div className="header-metrics">
                    <div className="metric-pill">
                        <span className="metric-val">{fleet.length}</span>
                        <span className="metric-label">Total Assets</span>
                    </div>
                    <div className="metric-pill success">
                        <span className="metric-val">
                            {fleet.filter(a => a.status === 'ACTIVE').length}
                        </span>
                        <span className="metric-label">Active</span>
                    </div>
                </div>
            </header>

            {/* --- MASONRY ASSET GRID --- */}
            <div className="fleet-grid">
                {fleet.map((asset) => {
                    const coverImage = getCoverImage(asset.gallery);
                    const amenityCount = asset.amenities ? asset.amenities.length : 0;

                    return (
                        <div 
                            key={asset.id} 
                            className="fleet-dossier-card"
                            onClick={() => onInspect && onInspect(asset)}
                        >
                            {/* TOP: MEDIA & STATUS OVERLAY */}
                            <div className="dossier-media-zone">
                                {coverImage ? (
                                    <img src={coverImage} alt={asset.plateNumber} className="dossier-image" />
                                ) : (
                                    <div className="dossier-placeholder">
                                        <Bus size={48} strokeWidth={1} />
                                        <span>No Visual Profile</span>
                                    </div>
                                )}
                                
                                {/* Overlay Badges */}
                                <div className="dossier-overlay-top">
                                    <StoreAssetBadge status={asset.status} size="sm" />
                                    
                                    <button 
                                        className="dossier-modify-btn"
                                        title="Request Modification (Layout / Swap)"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent opening the inspector
                                            onRequestChange('FLEET', asset); // Pass context to parent
                                        }}
                                    >
                                        <FileEdit size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* BOTTOM: TELEMETRY & SPECS */}
                            <div className="dossier-body">
                                <div className="dossier-primary-row">
                                    <div className="plate-badge">
                                        <Fingerprint size={12} className="plate-icon" />
                                        <span>{asset.plateNumber}</span>
                                    </div>
                                    <span className="bus-class-tag">{asset.busClass}</span>
                                </div>

                                <h3 className="model-name">{asset.modelName}</h3>

                                <div className="dossier-specs-grid">
                                    <div className="spec-item">
                                        <div className="spec-icon"><Armchair size={14} /></div>
                                        <div className="spec-data">
                                            <span className="spec-label">Layout</span>
                                            <span className="spec-val">{asset.layoutConfig}</span>
                                        </div>
                                    </div>
                                    <div className="spec-item">
                                        <div className="spec-icon"><Coffee size={14} /></div>
                                        <div className="spec-data">
                                            <span className="spec-label">Amenities</span>
                                            <span className="spec-val">{amenityCount} Installed</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Visual Indicators */}
                                <div className="dossier-footer">
                                    <span className="footer-link">Click to view deep inspector &rarr;</span>
                                    {asset.gallery && asset.gallery.length > 1 && (
                                        <div className="gallery-indicator">
                                            <ImageIcon size={12} />
                                            <span>+{asset.gallery.length - 1} photos</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- COMPONENT CSS PHYSICS --- */}
            <style>{`
                .fleet-vault-chassis {
                    padding: 32px;
                    max-width: 1400px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease;
                }

                /* HEADER PHYSICS */
                .vault-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--border-subtle);
                }
                .header-identity { display: flex; align-items: center; gap: 20px; }
                .vault-icon-box {
                    width: 56px; height: 56px;
                    background: rgba(206, 172, 92, 0.1);
                    border: 1px solid rgba(206, 172, 92, 0.3);
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                }
                .vault-titles h1 { margin: 0 0 4px 0; font-size: 28px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .vault-titles p { margin: 0; font-size: 14px; color: var(--text-muted); }

                .header-metrics { display: flex; gap: 12px; }
                .metric-pill {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 10px 16px; background: var(--bg-surface);
                    border: 1px solid var(--border-subtle); border-radius: 12px;
                }
                .metric-pill.success { background: rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.2); }
                .metric-val { font-size: 18px; font-weight: 900; color: var(--text-main); line-height: 1; margin-bottom: 4px; }
                .metric-pill.success .metric-val { color: var(--status-success); }
                .metric-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }

                /* GRID PHYSICS */
                .fleet-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                /* DOSSIER CARD */
                .fleet-dossier-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }
                .fleet-dossier-card:hover {
                    border-color: var(--border-strong);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }

                /* MEDIA ZONE (TOP) */
                .dossier-media-zone {
                    height: 160px;
                    position: relative;
                    background: var(--bg-input);
                    overflow: hidden;
                }
                .dossier-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .fleet-dossier-card:hover .dossier-image {
                    transform: scale(1.05);
                }
                .dossier-placeholder {
                    width: 100%; height: 100%;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: var(--border-strong); gap: 8px;
                }
                .dossier-placeholder span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

                .dossier-overlay-top {
                    position: absolute; top: 12px; left: 12px; right: 12px;
                    display: flex; justify-content: space-between; align-items: flex-start;
                    z-index: 2;
                }
                .dossier-modify-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.2); color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .dossier-modify-btn:hover {
                    background: var(--brand-primary); border-color: var(--brand-primary);
                    transform: scale(1.05);
                }

                /* BODY ZONE (BOTTOM) */
                .dossier-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
                
                .dossier-primary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .plate-badge { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; font-family: monospace; font-size: 14px; font-weight: 900; color: var(--text-main); letter-spacing: 1px; }
                .plate-icon { color: var(--text-muted); }
                .bus-class-tag { font-size: 11px; font-weight: 900; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 0.5px; }

                .model-name { margin: 0 0 20px 0; font-size: 18px; font-weight: 800; color: var(--text-main); line-height: 1.2; }

                .dossier-specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
                .spec-item { display: flex; gap: 10px; align-items: center; padding: 12px; background: var(--bg-canvas); border-radius: 8px; border: 1px dashed var(--border-subtle); }
                .spec-icon { color: var(--text-muted); }
                .spec-data { display: flex; flex-direction: column; gap: 2px; }
                .spec-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
                .spec-val { font-size: 13px; font-weight: 800; color: var(--text-main); }

                .dossier-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-subtle); margin-top: auto; }
                .footer-link { font-size: 12px; font-weight: 700; color: var(--text-muted); transition: color 0.2s; }
                .fleet-dossier-card:hover .footer-link { color: var(--brand-primary); }
                .gallery-indicator { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--text-muted); }

                /* EMPTY STATE */
                .vault-empty-state { padding: 80px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .empty-icon-ring { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px dashed var(--border-strong); }
                .vault-empty-state h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 900; color: var(--text-main); }
                .vault-empty-state p { margin: 0; font-size: 14px; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

                /* MOBILE RESPONSIVE DEGRADATION */
                @media (max-width: 768px) {
                    .fleet-vault-chassis { padding: 16px; }
                    .vault-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .fleet-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default FleetRegistry;