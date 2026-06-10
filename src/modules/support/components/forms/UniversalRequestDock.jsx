/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: UniversalRequestDock.jsx
 * * DESCRIPTION:
 * The apex Maker-Checker mutation form. Slides over the workspace to 
 * accept structured data and physical documents from the Partner.
 * * WORLD-CLASS PHYSICS:
 * 1. DYNAMIC HYDRATION: Reads the `requestType` and instantly changes its 
 * header, colors, icons, and placeholder text to match the specific action.
 * 2. TACTILE DRAG & DROP: Features a native HTML5 drag-and-drop zone for 
 * document uploads, calculating file sizes and enforcing PDF/Image limits.
 * 3. ATOMIC TRANSMISSION: Packages the text payload and the physical file 
 * into a single transaction, transmitting it via the Support Service.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { supportService } from '../../data/support.service';
import { getRequestTypeConfig } from '../../data/support.dictionary';
import { 
    X, Send, UploadCloud, FileText, 
    Trash2, CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';

const UniversalRequestDock = ({ 
    isOpen, 
    requestType, 
    onClose, 
    onSuccessTrigger 
}) => {
    const { tenant } = useAuth();
    
    // ========================================================================
    // 1. STATE MACHINE
    // ========================================================================
    const [description, setDescription] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Transmission States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successState, setSuccessState] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const fileInputRef = useRef(null);

    // ========================================================================
    // 2. CONFIGURATION HYDRATION
    // ========================================================================
    const config = getRequestTypeConfig(requestType);
    const DynamicIcon = config.Icon || FileText;
    const isCritical = requestType === 'BREAKDOWN';

    // Reset state when the dock opens or the request type changes
    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setAttachedFile(null);
            setIsSubmitting(false);
            setSuccessState(false);
            setErrorMsg(null);
            setIsDragging(false);
        }
    }, [isOpen, requestType]);

    // ========================================================================
    // 3. FILE UPLOAD PHYSICS (Drag & Drop Engine)
    // ========================================================================
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = (file) => {
        setErrorMsg(null);
        if (!file) return;

        // Security: Prevent massive files (Limit: 5MB)
        const MAX_SIZE = 5 * 1024 * 1024; 
        if (file.size > MAX_SIZE) {
            setErrorMsg("File exceeds maximum 5MB limit. Please compress and try again.");
            return;
        }

        // Security: Restrict Mime Types
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setErrorMsg("Invalid format. Only PDF, JPG, and PNG are accepted.");
            return;
        }

        setAttachedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    // Helper to format bytes cleanly (e.g., 2.4 MB)
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // ========================================================================
    // 4. THE TRANSMISSION ENGINE
    // ========================================================================
    const handleTransmit = async () => {
        if (!description.trim() || !tenant?.id) return;
        
        setIsSubmitting(true);
        setErrorMsg(null);

        const payload = {
            requestType: config.id,
            priority: isCritical ? 'CRITICAL' : 'NORMAL',
            description: description.trim()
        };

        const response = await supportService.submitRequest(tenant.id, payload, attachedFile);

        if (response.success) {
            setSuccessState(true);
            // Tell the main orchestrator to refresh the Active Tickets board
            if (onSuccessTrigger) onSuccessTrigger();
            
            // Auto-close after celebration
            setTimeout(() => {
                onClose();
            }, 2500);
        } else {
            setErrorMsg(response.error || "A secure transmission failure occurred.");
            setIsSubmitting(false);
        }
    };

    // ========================================================================
    // 5. EARLY RETURN
    // ========================================================================
    if (!isOpen || !requestType) return null;

    // ========================================================================
    // 6. RENDER CHASSIS
    // ========================================================================
    return (
        <>
            {/* INVISIBLE BACKDROP */}
            <div className="dock-backdrop" onClick={!isSubmitting ? onClose : undefined} />

            {/* THE SLIDING DOCK */}
            <div className={`request-dock-panel ${isCritical ? 'critical-mode' : ''}`}>
                
                {/* --- HEADER --- */}
                <div className="dock-header">
                    <div className="header-identity">
                        <div 
                            className="dynamic-icon-box"
                            style={{ backgroundColor: config.bgOpacity, color: config.color }}
                        >
                            <DynamicIcon size={24} strokeWidth={2.5} />
                        </div>
                        <div className="header-titles">
                            <h3>{config.label}</h3>
                            <span className="subtitle">Secure L9 Dispatch Transmission</span>
                        </div>
                    </div>
                    {!isSubmitting && !successState && (
                        <button className="dock-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* --- BODY SCROLL VAULT --- */}
                <div className="dock-body">
                    
                    {successState ? (
                        /* SUCCESS OVERRIDE STATE */
                        <div className="transmission-success-state">
                            <div className="success-ring">
                                <CheckCircle2 size={48} className="text-success" />
                            </div>
                            <h2>Transmission Verified</h2>
                            <p>Your request has been securely routed to the AyaBus L9 Admin Cockpit. Dispatch is reviewing your telemetry.</p>
                            <p className="text-muted mt-4 text-sm">You can track live status in the Dispatch Radar board.</p>
                        </div>
                    ) : (
                        /* DATA ENTRY STATE */
                        <div className="form-chassis">
                            
                            {/* Critical SOS Warning */}
                            {isCritical && (
                                <div className="critical-warning-box">
                                    <AlertTriangle size={20} className="text-danger flex-shrink-0" />
                                    <p><strong>SOS PROTOCOL ACTIVE:</strong> This transmission will bypass the standard queue and trigger an immediate alert in the Admin Cockpit. Misuse may result in penalties.</p>
                                </div>
                            )}

                            {/* Text Payload */}
                            <div className="input-group">
                                <label className="dynamic-prompt">
                                    <FileText size={14} className="text-muted" />
                                    <span>{config.prompt}</span>
                                </label>
                                <textarea
                                    className="secure-textarea"
                                    placeholder="Type your detailed request here..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Document Payload (Conditional based on Dictionary) */}
                            {config.requiresDoc && (
                                <div className="input-group mt-4">
                                    <label className="dynamic-prompt">
                                        <UploadCloud size={14} className="text-muted" />
                                        <span>{config.docLabel || 'Upload Required Document (PDF/JPG)'}</span>
                                    </label>
                                    
                                    {!attachedFile ? (
                                        // Dropzone
                                        <div 
                                            className={`upload-dropzone ${isDragging ? 'is-dragging' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input 
                                                type="file" 
                                                className="hidden-file-input" 
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept=".pdf,image/jpeg,image/png,image/jpg"
                                            />
                                            <div className="dropzone-content">
                                                <UploadCloud size={28} className={isDragging ? 'text-brand' : 'text-muted'} />
                                                <span className="primary-text">Click to upload or drag and drop</span>
                                                <span className="secondary-text">PDF, JPG, or PNG (Max 5MB)</span>
                                            </div>
                                        </div>
                                    ) : (
                                        // Attached File Card
                                        <div className="attached-file-card">
                                            <div className="file-info">
                                                <div className="file-icon-bg">
                                                    <FileText size={18} className="text-brand" />
                                                </div>
                                                <div className="file-details">
                                                    <span className="file-name">{attachedFile.name}</span>
                                                    <span className="file-size">{formatBytes(attachedFile.size)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className="remove-file-btn" 
                                                onClick={() => setAttachedFile(null)}
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Global Error Banner */}
                            {errorMsg && (
                                <div className="error-banner">
                                    <AlertTriangle size={16} />
                                    <span>{errorMsg}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- COMMAND FOOTER --- */}
                {!successState && (
                    <div className="dock-footer">
                        <button 
                            className="master-transmit-btn"
                            disabled={!description.trim() || isSubmitting}
                            style={!isCritical ? { backgroundColor: config.color, boxShadow: `0 4px 16px ${config.bgOpacity}` } : {}}
                            onClick={handleTransmit}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="ayabus-spin" /> Encrypting & Transmitting...</>
                            ) : (
                                <><Send size={18} /> Transmit Request</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================================================
                7. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* BACKDROP */
                .dock-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }

                /* DOCK CHASSIS */
                .request-dock-panel {
                    position: fixed; top: 0; right: 0; bottom: 0;
                    width: 500px; max-width: 100vw;
                    background: var(--bg-surface);
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    z-index: 101;
                    display: flex; flex-direction: column;
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border-left: 1px solid var(--border-strong);
                }

                /* CRITICAL OVERRIDE (For SOS) */
                .critical-mode { border-left: 2px solid var(--status-danger); }
                .critical-mode .master-transmit-btn { background: var(--status-danger); box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2); }

                /* HEADER */
                .dock-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-canvas); }
                .header-identity { display: flex; align-items: center; gap: 16px; }
                .dynamic-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .header-titles { display: flex; flex-direction: column; gap: 2px; }
                .header-titles h3 { margin: 0; font-size: 18px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .header-titles .subtitle { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .dock-close-btn { background: var(--bg-input); border: 1px solid transparent; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .dock-close-btn:hover { background: var(--border-subtle); color: var(--text-main); transform: rotate(90deg); }

                /* BODY SCROLL */
                .dock-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; }
                /* Custom Scrollbar */
                .dock-body::-webkit-scrollbar { width: 6px; }
                .dock-body::-webkit-scrollbar-track { background: transparent; }
                .dock-body::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

                /* FORM CHASSIS */
                .form-chassis { display: flex; flex-direction: column; gap: 24px; }
                
                .critical-warning-box {
                    display: flex; align-items: flex-start; gap: 12px; padding: 16px;
                    background: rgba(239, 68, 68, 0.05); border: 1px dashed rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                }
                .critical-warning-box p { margin: 0; font-size: 13px; color: var(--status-danger); line-height: 1.5; font-weight: 600; }

                .input-group { display: flex; flex-direction: column; gap: 10px; }
                .dynamic-prompt { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--text-main); line-height: 1.4; }
                
                .secure-textarea {
                    width: 100%; min-height: 160px; padding: 16px; background: var(--bg-canvas);
                    border: 1px solid var(--border-strong); border-radius: 12px;
                    color: var(--text-main); font-size: 14px; font-weight: 600; font-family: inherit;
                    resize: vertical; transition: all 0.2s; line-height: 1.5;
                }
                .secure-textarea:focus { outline: none; border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(206, 172, 92, 0.1); }
                .secure-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

                /* FILE UPLOAD (DRAG & DROP) */
                .upload-dropzone {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    border: 2px dashed var(--border-strong); border-radius: 12px; padding: 40px 20px;
                    background: var(--bg-canvas); cursor: pointer; transition: all 0.2s ease;
                }
                .upload-dropzone:hover, .upload-dropzone.is-dragging {
                    border-color: var(--brand-primary); background: rgba(206, 172, 92, 0.02);
                }
                .hidden-file-input { display: none; }
                
                .dropzone-content { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
                .primary-text { font-size: 14px; font-weight: 800; color: var(--text-main); margin-top: 8px; }
                .secondary-text { font-size: 12px; font-weight: 600; color: var(--text-muted); }

                /* ATTACHED FILE CARD */
                .attached-file-card {
                    display: flex; align-items: center; justify-content: space-between; padding: 16px;
                    background: var(--bg-canvas); border: 1px solid var(--brand-primary);
                    border-radius: 12px; box-shadow: 0 4px 12px rgba(206, 172, 92, 0.05);
                }
                .file-info { display: flex; align-items: center; gap: 12px; }
                .file-icon-bg { width: 36px; height: 36px; border-radius: 8px; background: rgba(206, 172, 92, 0.1); display: flex; align-items: center; justify-content: center; }
                .file-details { display: flex; flex-direction: column; gap: 2px; }
                .file-name { font-size: 13px; font-weight: 800; color: var(--text-main); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .file-size { font-size: 11px; font-weight: 700; color: var(--text-muted); font-family: monospace; }
                
                .remove-file-btn {
                    background: transparent; border: none; color: var(--status-danger);
                    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s;
                }
                .remove-file-btn:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); }
                .remove-file-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ERROR BANNER */
                .error-banner {
                    display: flex; align-items: center; gap: 8px; padding: 12px 16px;
                    background: rgba(239, 68, 68, 0.1); border-radius: 8px;
                    color: var(--status-danger); font-size: 13px; font-weight: 700;
                    animation: fadeIn 0.3s ease;
                }

                /* FOOTER & CTA */
                .dock-footer { padding: 24px; border-top: 1px solid var(--border-subtle); background: var(--bg-canvas); }
                .master-transmit-btn {
                    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 16px; color: #FFF; border: none; border-radius: 12px; font-size: 15px; font-weight: 900;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .master-transmit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
                .master-transmit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

                /* SUCCESS STATE */
                .transmission-success-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; animation: fadeIn 0.4s ease; padding: 20px; }
                .success-ring { width: 80px; height: 80px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); border: 2px solid rgba(34, 197, 94, 0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .transmission-success-state h2 { margin: 0 0 12px 0; font-size: 24px; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .transmission-success-state p { margin: 0; font-size: 14px; color: var(--text-main); line-height: 1.6; max-width: 320px; }

                /* UTILS */
                .text-brand { color: var(--brand-primary); }
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--status-success); }
                .text-danger { color: var(--status-danger); }
                .mt-4 { margin-top: 16px; }
                .text-sm { font-size: 12px; }
                .ayabus-spin { animation: spin 1s linear infinite; }
                
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </>
    );
};

export default UniversalRequestDock;