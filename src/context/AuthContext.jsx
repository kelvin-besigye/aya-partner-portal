import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, handleDataException } from '../services/api.config';

/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Auth Engine)
 * ------------------------------------------------------------------
 * Module: Multi-Tenant Identity & Security
 * File: AuthContext.jsx
 * * WORLD-CLASS FIXES APPLIED:
 * 1. SYNCHRONOUS OVERRIDE: Forces state updates immediately inside the login() 
 * function, bypassing Vite's broken HMR event listeners.
 * 2. ZOMBIE-STATE PREVENTION: If a user logs in but lacks a Partner Profile, 
 * they are forcefully logged out and shown a hard UI error.
 * 3. GUARANTEED BOOT: The 4-second failsafe remains intact to prevent infinite loading.
 */

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // --- THEME ENGINE ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('ayabus-partner-theme') === 'dark'; 
    });

    useEffect(() => {
        const root = document.body;
        localStorage.setItem('ayabus-partner-theme', isDarkMode ? 'dark' : 'light');
        isDarkMode ? root.classList.add('dark-mode') : root.classList.remove('light-mode');
    }, [isDarkMode]);

    // --- IDENTITY HYDRATION ---
    const hydrateTenantIdentity = useCallback(async (authId) => {
        if (!authId) return null;
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('auth_id', authId)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setTenant(data);
                return data;
            }
            setTenant(null);
            return null;
        } catch (err) {
            handleDataException(err, 'Identity Hydration');
            setTenant(null);
            return null;
        }
    }, []);

    // --- LINEAR BOOT SEQUENCE ---
    useEffect(() => {
        let mounted = true;
        const emergencyRelease = setTimeout(() => {
            if (loading && mounted) setLoading(false);
        }, 4000);

        const executeBootSequence = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session?.user && mounted) {
                    setUser(session.user);
                    await hydrateTenantIdentity(session.user.id);
                }
            } catch (err) {
                console.error("[AyaBus Boot Error]:", err.message);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(emergencyRelease);
                }
            }
        };

        executeBootSequence();

        // ONLY listen for external sign outs (e.g., token expiry). 
        // Logins are now handled manually.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setTenant(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(emergencyRelease);
        };
    }, [hydrateTenantIdentity]);

    // --- SYNCHRONOUS LOGIN (THE FIX) ---
    const login = async (email, password) => {
        setAuthError(null);
        try {
            // 1. Authenticate with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            if (data?.user) {
                // 2. 🔥 FORCE THE STATE UPDATE IMMEDIATELY
                setUser(data.user);
                
                // 3. Check for the Partner Profile SQL Link
                const tenantData = await hydrateTenantIdentity(data.user.id);
                
                // 4. If the SQL link is missing, throw a hard error and kill the zombie session
                if (!tenantData) {
                    throw new Error("IDENTITY_UNLINKED: Login successful, but no Partner profile is linked to this account. Run the SQL update.");
                }
            }
            return { success: true };

        } catch (err) {
            // Purge the session if they failed the Tenant Check
            supabase.auth.signOut();
            setUser(null);
            setTenant(null);

            const anomaly = handleDataException(err, 'Citadel Entry');
            setAuthError(err.message.includes('IDENTITY_UNLINKED') ? err.message : anomaly.error);
            return { success: false, error: anomaly.error };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setTenant(null);
    };

    const clearError = () => setAuthError(null);

    // --- BOOT VIEWPORT ---
    if (loading) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-subtle)', borderTop: '3px solid var(--brand-primary)', borderRadius: '50%', animation: 'ayabus-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
                <style>{`@keyframes ayabus-spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user, tenant, isAuthenticated: !!user, hasIdentity: !!tenant,
            authError, isDarkMode, toggleTheme: () => setIsDarkMode(prev => !prev),
            login, logout, clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);