import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Bus, Lock, Eye, EyeOff, 
    ArrowRight, AlertCircle, Loader2, ShieldCheck, Sun, Moon, Mail 
} from 'lucide-react';

/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Entry Terminal)
 * ------------------------------------------------------------------
 * Module: Authentication / UI
 * File: LoginPage.jsx
 * * DESCRIPTION:
 * The primary gateway to the Partner Citadel. Engineered for zero-friction 
 * access while maintaining a high-security posture.
 * * ARCHITECTURE:
 * 1. PERSISTENT THEME ENGINE: Defaults to Light Mode as requested.
 * 2. KINETIC FEEDBACK: Real-time authentication state handling.
 * 3. IDENTITY LINK VALIDATION: Informs the user if their login is valid 
 * but their corporate profile is missing.
 */

const LoginPage = () => {
    const { login, authError, clearError, isAuthenticated, tenant } = useAuth();
    const navigate = useNavigate();

    // --- 1. LOCAL STATE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 2. THEME ENGINE (RECALIBRATED TO LIGHT DEFAULT) ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('ayabus-partner-theme');
        // 🔥 DEFAULT: Force light mode if no previous preference exists
        return savedTheme === 'dark'; 
    });

    useEffect(() => {
        localStorage.setItem('ayabus-partner-theme', isDarkMode ? 'dark' : 'light');
        const root = document.body;
        if (isDarkMode) {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        } else {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    // --- 3. NAVIGATION CONTROLLER ---
    useEffect(() => {
        // Only navigate in if BOTH auth and identity (tenant) are hydrated
        if (isAuthenticated && tenant) {
            navigate('/');
        }
    }, [isAuthenticated, tenant, navigate]);

    // --- 4. AUTHENTICATION PROTOCOL ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        clearError();

        try {
            const result = await login(email, password);
            // If result.success is true but user stays here, the tenant link is missing
            if (!result.success) {
                setIsSubmitting(false);
            }
        } catch (err) {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', width: '100vw', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-canvas)', padding: '24px',
            overflowY: 'auto', overflowX: 'hidden'
        }}>
            {/* THEME TOGGLE */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ 
                    position: 'fixed', top: '24px', right: '24px',
                    padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)', color: 'var(--text-main)', cursor: 'pointer'
                }}
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div style={{ 
                width: '100%', maxWidth: '440px', background: 'var(--bg-surface)',
                borderRadius: '24px', border: '1px solid var(--border-subtle)',
                padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
            }}>
                
                {/* LOGO AREA */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ 
                        width: '64px', height: '64px', background: 'var(--brand-primary)',
                        borderRadius: '18px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px', color: '#FFF'
                    }}>
                        <Bus size={32} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                        AyaBus Partner Portal
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>
                        AyaBus Sovereign Partner Portal
                    </p>
                </div>

                {/* ERROR TELEMETRY */}
                {authError && (
                    <div style={{ 
                        padding: '16px', background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--status-error)', borderRadius: '12px',
                        display: 'flex', gap: '12px', marginBottom: '24px'
                    }}>
                        <AlertCircle size={20} color="var(--status-error)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--status-error)', fontWeight: '700' }}>
                            {authError}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* EMAIL INPUT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Corporate Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                style={{ 
                                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px',
                                    background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-main)', fontSize: '15px', fontWeight: '600'
                                }}
                            />
                        </div>
                    </div>

                    {/* PASSWORD INPUT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Security Key
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ 
                                    width: '100%', padding: '16px 48px', borderRadius: '12px',
                                    background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-main)', fontSize: '15px', fontWeight: '600'
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', right: '16px', top: '16px',
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* SUBMIT ACTION */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        style={{ 
                            marginTop: '12px', padding: '16px', borderRadius: '12px',
                            background: 'var(--brand-primary)', color: '#FFF', fontWeight: '900',
                            fontSize: '16px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={20} className="spin-anim" /> AUTHENTICATING...</>
                        ) : (
                            <>ACCESS PORTAL <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div style={{ 
                    marginTop: '32px', textAlign: 'center', paddingTop: '24px',
                    borderTop: '1px solid var(--border-subtle)'
                }}>
                    <div style={{ 
                        fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)',
                        letterSpacing: '1px', textTransform: 'uppercase', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <ShieldCheck size={14} /> Secured by Sovereign Auth
                    </div>
                </div>
            </div>

            <style>{`
                .spin-anim { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                input:focus { outline: none; border-color: var(--brand-primary) !important; box-shadow: 0 0 0 4px rgba(206, 172, 92, 0.1); }
            `}</style>
        </div>
    );
};

export default LoginPage;