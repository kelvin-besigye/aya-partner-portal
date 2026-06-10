/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: LiveCommLink.jsx
 * * DESCRIPTION:
 * The Emergency Hotline array. Provides zero-friction, instant-launch 
 * links to WhatsApp and direct phone dialing for critical incidents.
 * * WORLD-CLASS PHYSICS:
 * 1. CONTEXT INJECTION: Automatically grabs the Partner's Identity from the 
 * AuthContext and pre-fills the WhatsApp message payload. Dispatch knows 
 * exactly who is reporting the SOS before the partner even types a word.
 * 2. NATIVE API ROUTING: Uses `tel:` and `https://wa.me/` protocols to break 
 * out of the browser and natively launch the operator's mobile/desktop apps.
 * 3. TACTILE BRANDING: The WhatsApp card perfectly matches the official 
 * WhatsApp brand hex code (#25D366) to create instant psychological recognition.
 */

import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { MessageCircle, PhoneCall, Zap } from 'lucide-react';

const LiveCommLink = () => {
    // 1. Hook into the Global Auth State to identify the caller
    const { tenant } = useAuth();
    
    // ========================================================================
    // 2. PROTOCOL CONFIGURATION & TELEMETRY INJECTION
    // ========================================================================
    
    // In a live production environment, these numbers would be fetched from 
    // your centralized tenant settings or environment variables. 
    // Using standard Ugandan (+256) formats for the L9 Admin Dispatch Desk.
    const WHATSAPP_NUMBER = '256700000000'; 
    const DISPATCH_PHONE = '+256700000000';

    // The Payload: Pre-fill the WhatsApp chat so the operator doesn't have to type their details.
    const companyName = tenant?.company_name || 'AyaBus Authorized Partner';
    const partnerId = tenant?.id ? `[ID: ${tenant.id.substring(0,8).toUpperCase()}]` : '[ID: UNKNOWN]';
    
    const rawMessage = `🚨 URGENT: Dispatch Support required.\n\nOperator: ${companyName}\n${partnerId}\n\nIssue Details: `;
    const encodedMessage = encodeURIComponent(rawMessage);

    // ========================================================================
    // 3. LAUNCH TRIGGERS
    // ========================================================================
    
    const handleWhatsAppLaunch = () => {
        // Opens WhatsApp Web on Desktop, or the WhatsApp App on Mobile
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    };

    const handlePhoneLaunch = () => {
        // Triggers the native phone dialer
        window.open(`tel:${DISPATCH_PHONE}`, '_self');
    };

    // ========================================================================
    // 4. RENDER ENGINE
    // ========================================================================
    return (
        <div className="comm-link-chassis">
            
            <div className="section-header">
                <div className="title-lockup">
                    <Zap size={18} className="text-brand" />
                    <h3>Live Dispatch Comm-Link</h3>
                </div>
                <p>For critical emergencies that require immediate voice or text interaction with the L9 Admin Team.</p>
            </div>

            <div className="hotline-grid">
                
                {/* --- WHATSAPP HOTLINE CARD --- */}
                <button 
                    className="hotline-card whatsapp-card" 
                    onClick={handleWhatsAppLaunch}
                    aria-label="Launch WhatsApp to message AyaBus Dispatch"
                >
                    <div className="card-backdrop-glow" />
                    <div className="hotline-content">
                        <div className="hotline-icon">
                            <MessageCircle size={28} color="#FFF" strokeWidth={2.5} />
                        </div>
                        <div className="hotline-text">
                            <span className="hotline-title">WhatsApp Dispatch</span>
                            <span className="hotline-subtitle">Average response: &lt; 2 mins</span>
                        </div>
                    </div>
                </button>

                {/* --- DIRECT PHONE HOTLINE CARD --- */}
                <button 
                    className="hotline-card phone-card" 
                    onClick={handlePhoneLaunch}
                    aria-label="Call AyaBus Dispatch directly"
                >
                    <div className="hotline-content">
                        <div className="hotline-icon">
                            <PhoneCall size={28} color="var(--bg-surface)" strokeWidth={2.5} />
                        </div>
                        <div className="hotline-text">
                            <span className="hotline-title">Direct Phone Line</span>
                            <span className="hotline-subtitle">24/7 L9 Admin Access</span>
                        </div>
                    </div>
                </button>

            </div>

            {/* ========================================================================
                5. WORLD-CLASS CSS PHYSICS
            ======================================================================== */}
            <style>{`
                /* --- BASE CHASSIS --- */
                .comm-link-chassis { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 20px; 
                    width: 100%;
                }
                
                /* --- HEADER --- */
                .title-lockup {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }
                .title-lockup h3 { 
                    margin: 0; 
                    font-size: 16px; 
                    font-weight: 900; 
                    color: var(--text-main); 
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .section-header p { 
                    margin: 0; 
                    font-size: 13px; 
                    color: var(--text-muted); 
                    line-height: 1.5;
                }

                /* --- GRID LAYOUT --- */
                .hotline-grid { 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 16px; 
                }

                /* --- TACTILE CARDS --- */
                .hotline-card {
                    position: relative;
                    display: flex; 
                    align-items: center; 
                    padding: 24px 20px; 
                    border-radius: 16px; 
                    border: none;
                    cursor: pointer; 
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    outline: none;
                }

                .hotline-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                }

                /* WhatsApp Identity */
                .whatsapp-card { 
                    background: #25D366; 
                    color: #FFF; 
                    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.2); 
                }
                .whatsapp-card:hover, .whatsapp-card:focus-visible { 
                    background: #22C35E; 
                    transform: translateY(-4px); 
                    box-shadow: 0 12px 28px rgba(37, 211, 102, 0.3); 
                }
                .card-backdrop-glow {
                    position: absolute;
                    top: -50%; right: -20%;
                    width: 150px; height: 150px;
                    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                /* Phone Identity (High Contrast Theme Aware) */
                .phone-card { 
                    background: var(--text-main); 
                    color: var(--bg-surface); 
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); 
                }
                .phone-card:hover, .phone-card:focus-visible { 
                    transform: translateY(-4px); 
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2); 
                    filter: brightness(1.1);
                }
                [data-theme="dark"] .phone-card { 
                    border: 1px solid var(--border-subtle); 
                    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.05);
                }
                [data-theme="dark"] .phone-card:hover {
                    box-shadow: 0 12px 28px rgba(255, 255, 255, 0.1);
                }

                /* Text Formatting */
                .hotline-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    transition: transform 0.3s ease;
                }
                .hotline-card:hover .hotline-icon {
                    transform: scale(1.1) rotate(-5deg);
                }
                
                .hotline-text { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 4px; 
                }
                .hotline-title { 
                    font-size: 16px; 
                    font-weight: 900; 
                    letter-spacing: -0.3px;
                }
                .hotline-subtitle { 
                    font-size: 12px; 
                    font-weight: 700; 
                    opacity: 0.85; 
                }

                /* --- UTILITIES --- */
                .text-brand { color: var(--brand-primary); }
                .text-muted { color: var(--text-muted); }

                /* --- RESPONSIVE DEGRADATION --- */
                @media (max-width: 1024px) { 
                    .hotline-grid { 
                        grid-template-columns: 1fr; 
                    } 
                }
                @media (max-width: 640px) {
                    .hotline-card {
                        padding: 16px;
                    }
                    .hotline-title {
                        font-size: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveCommLink;