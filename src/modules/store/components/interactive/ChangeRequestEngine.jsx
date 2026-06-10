/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Interactive
 * File: ChangeRequestEngine.jsx
 * * STATUS: DE-POISONED & HOOK-STABILIZED
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, AlertTriangle, Send, Loader2, ShieldCheck, 
    FileEdit, CheckCircle2, Info, Bus, Map, Clock, 
    Layers, Landmark, BadgeCheck
} from 'lucide-react';

// --- DATA & SERVICE BRIDGE ---
import { CHANGE_REQUEST_TYPES } from '../../data/store.dictionary';
import { storeService } from '../../data/store.service';

const ChangeRequestEngine = ({ 
    isOpen, 
    onClose, 
    asset,        
    tenantId,     
    onSuccess     
}) => {
    // ========================================================================
    // 1. STATE MANAGEMENT
    // ========================================================================
    const [selectedTypeId, setSelectedTypeId] = useState(null);
    const [proposedChanges, setProposedChanges] = useState('');
    const [partnerNote, setPartnerNote] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [systemError, setSystemError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // ========================================================================
    // 2. KINETIC LOCKOUT & RESET
    // ========================================================================
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setSelectedTypeId(null);
            setProposedChanges('');
            setPartnerNote('');
            setSystemError(null);
            setIsSuccess(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // ========================================================================
    // 3. CONTEXTUAL INTELLIGENCE (Hooks must be before return null)
    // ========================================================================
    const filteredTypes = useMemo(() => {
        if (!asset?.assetType) return [];
        return CHANGE_REQUEST_TYPES.filter(type => type.targetAsset === asset.assetType);
    }, [asset?.assetType]); // Dependency optimized for stability

    // ========================================================================
    // 4. THE SECURE TRANSMISSION
    // ========================================================================
    const executeTransmission = async () => {
        if (!selectedTypeId) return setSystemError('Please select a modification category.');
        if (proposedChanges.length < 5) return setSystemError('Please describe the specific changes required.');
        if (partnerNote.length < 10) return setSystemError('Operational justification must be at least 10 characters.');

        setIsSubmitting(true);
        setSystemError(null);

        const response = await storeService.submitChangeRequest({
            tenantId,
            requestType: selectedTypeId,
            assetType: asset.assetType,
            assetId: asset.id,
            requestedChanges: { payload: proposedChanges },
            partnerNote
        });

        setIsSubmitting(false);

        if (response.success) {
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess(); 
                onClose();
            }, 2200);
        } else {
            setSystemError(response.error || 'The Citadel rejected the request package.');
        }
    };

    // --- CONDITIONAL RETURN (Placed after all hooks) ---
    if (!isOpen || !asset) return null;

    return (
        <div className="cre-root-overlay">
            <div className="cre-backdrop-blur" onClick={!isSubmitting ? onClose : undefined} />
            
            <div className="cre-modal-chassis">
                <header className="cre-modal-header">
                    <div className="header-brand">
                        <div className="icon-badge"><FileEdit size={20} /></div>
                        <div className="title-stack">
                            <h2>Request Asset Modification</h2>
                            <span>ID: {asset.id?.slice(0, 8)}... • {asset.assetType}</span>
                        </div>
                    </div>
                    {!isSubmitting && !isSuccess && (
                        <button className="cre-close-x" onClick={onClose}><X size={20} /></button>
                    )}
                </header>

                {isSuccess ? (
                    <div className="cre-success-state">
                        <div className="success-pulse-ring">
                            <BadgeCheck size={64} color="var(--status-success)" />
                        </div>
                        <h3>Request Logged Successfully</h3>
                        <p>The Admin Citadel has received your proposal. This asset is now under "Pending Review" status.</p>
                    </div>
                ) : (
                    <div className="cre-form-viewport">
                        <div className="cre-asset-summary">
                            <ShieldCheck size={18} color="var(--brand-primary)" />
                            <p><strong>Security Note:</strong> You are proposing changes to a live asset. Changes are subject to admin approval.</p>
                        </div>

                        {systemError && (
                            <div className="cre-error-ribbon">
                                <AlertTriangle size={16} /> {systemError}
                            </div>
                        )}

                        <div className="cre-form-section">
                            <label className="section-title">1. Modification Type</label>
                            <div className="cre-category-grid">
                                {filteredTypes.map((type) => {
                                    const Icon = type.icon || Info;
                                    const active = selectedTypeId === type.id;
                                    return (
                                        <button 
                                            key={type.id} 
                                            className={`cre-category-card ${active ? 'active' : ''}`}
                                            onClick={() => setSelectedTypeId(type.id)}
                                        >
                                            <div className="card-icon"><Icon size={20} /></div>
                                            <div className="card-meta">
                                                <h4>{type.label}</h4>
                                                <p>{type.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="cre-form-section">
                            <label className="section-title">2. Proposed Values / Data</label>
                            <textarea 
                                className="cre-input-area"
                                placeholder="E.g. Change seat capacity from 40 to 45..."
                                value={proposedChanges}
                                onChange={(e) => setProposedChanges(e.target.value)}
                            />
                        </div>

                        <div className="cre-form-section">
                            <label className="section-title">3. Operational Justification</label>
                            <textarea 
                                className="cre-input-area"
                                placeholder="E.g. This configuration matches our new VIP service layout..."
                                value={partnerNote}
                                onChange={(e) => setPartnerNote(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {!isSuccess && (
                    <footer className="cre-modal-footer">
                        <button 
                            className="btn-secondary" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={executeTransmission}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={16} className="ayabus-spin" /> Processing...</>
                            ) : (
                                <>Submit Proposal <Send size={16} /></>
                            )}
                        </button>
                    </footer>
                )}
            </div>

            <style>{`
                .cre-root-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .cre-backdrop-blur { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); animation: fadeIn 0.3s ease; }
                .cre-modal-chassis { position: relative; width: 100%; max-width: 650px; max-height: 90vh; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.25); animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .cre-modal-header { padding: 24px 32px; background: var(--bg-canvas); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
                .header-brand { display: flex; align-items: center; gap: 16px; }
                .icon-badge { width: 44px; height: 44px; background: rgba(206, 172, 92, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--brand-primary); }
                .title-stack h2 { margin: 0; font-size: 18px; font-weight: 900; color: var(--text-main); }
                .title-stack span { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .cre-close-x { background: var(--bg-input); border: none; width: 32px; height: 32px; border-radius: 50%; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .cre-close-x:hover { color: var(--text-main); transform: rotate(90deg); }
                .cre-form-viewport { padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 28px; flex: 1; }
                .cre-asset-summary { padding: 16px; background: rgba(206, 172, 92, 0.05); border: 1px solid rgba(206, 172, 92, 0.2); border-radius: 12px; display: flex; gap: 12px; }
                .cre-asset-summary p { margin: 0; font-size: 12px; color: var(--text-main); line-height: 1.5; }
                .cre-error-ribbon { padding: 12px 16px; background: rgba(239, 68, 68, 0.1); color: var(--status-error); border-radius: 8px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
                .cre-form-section { display: flex; flex-direction: column; gap: 12px; }
                .section-title { font-size: 12px; font-weight: 900; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
                .cre-category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .cre-category-card { display: flex; gap: 12px; padding: 16px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s; }
                .cre-category-card.active { border-color: var(--brand-primary); background: var(--bg-surface); }
                .cre-input-area { width: 100%; min-height: 100px; padding: 16px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 12px; color: var(--text-main); font-size: 14px; resize: none; outline: none; }
                .cre-success-state { padding: 60px 32px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .success-pulse-ring { width: 100px; height: 100px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: successPulse 2s infinite; }
                .cre-modal-footer { padding: 24px 32px; background: var(--bg-canvas); border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 16px; }
                .btn-secondary { padding: 12px 24px; background: transparent; border: 1px solid var(--border-strong); border-radius: 10px; color: var(--text-main); font-weight: 700; cursor: pointer; }
                .btn-primary { padding: 12px 24px; background: var(--brand-primary); border: none; border-radius: 10px; color: white; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; }
                @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes successPulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
                .ayabus-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media (max-width: 600px) {
                    .cre-modal-chassis { height: 100%; max-height: 100vh; border-radius: 0; }
                    .cre-category-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default ChangeRequestEngine;