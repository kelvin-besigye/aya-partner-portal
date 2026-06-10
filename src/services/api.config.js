/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Data Link)
 * ------------------------------------------------------------------
 * Module: API Services / Infrastructure
 * File: api.config.js
 * * DESCRIPTION:
 * The Master Database Client. This file serves as the singular 
 * umbilical cord between the Partner Portal and the Supabase 
 * Cloud Infrastructure.
 * * WORLD-CLASS ARCHITECTURE:
 * 1. TENANT ISOLATION LOCK: Uses a unique storage key to ensure 
 * Partner sessions never collide with Admin Cockpit sessions.
 * 2. PRE-FLIGHT VALIDATION: Violently rejects system boot if 
 * security credentials (ENV) are missing.
 * 3. TELEMETRY HEADERS: Injects application identity into every 
 * Postgres request for the Auditor Module to track.
 * 4. UNIFIED EXCEPTION PIPELINE: Standardizes error shapes so 
 * the UI never crashes on "undefined" error objects.
 */

import { createClient } from '@supabase/supabase-js';

// ========================================================================
// 1. INFRASTRUCTURE CREDENTIALS (Pre-Flight Check)
// ========================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Immediate system halt if environment is compromised
if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = '🚨 [CITADEL CRITICAL]: Supabase credentials missing. Check .env.local';
    console.error(errorMsg);
    throw new Error(errorMsg);
}

// ========================================================================
// 2. SOVEREIGN CLIENT INITIALIZATION
// ========================================================================
/**
 * The Master Supabase Client
 * Engineered for persistent B2B sessions and multi-tenant security.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        
        // ISOLATION LOCK: Crucial to keep Partner Portal and Admin Cockpit 
        // local-storage tokens independent in the same browser.
        storageKey: 'ayabus-sovereign-partner-vault', 
    },
    db: {
        schema: 'public',
    },
    global: {
        headers: {
            // TELEMETRY: Identifies this client to the database auditor
            'x-application-name': 'ayabus-partner-portal',
            'x-client-version': '1.0.0-sovereign',
            'x-tenant-type': 'OPERATOR_PORTAL'
        }
    }
});

// ========================================================================
// 3. THE EXCEPTION ORCHESTRATOR
// ========================================================================
/**
 * Standardized Data Exception Handler
 * Translates cryptic database rejections into actionable UI telemetry.
 * * @param {Object} error - The raw error from Supabase.
 * @param {string} context - The operational area (e.g., 'Manifest Fetch').
 * @returns {Object} { success: false, error: string, code: string }
 */
export const handleDataException = (error, context = 'Sovereign Engine') => {
    const errorMessage = error?.message || 'An unknown anomaly occurred during data transfer.';
    const errorCode = error?.code || 'X000_UNKNOWN';
    
    // Developer Telemetry
    console.error(`🚨 [AyaBus ${context} Exception] Code: ${errorCode} | ${errorMessage}`);
    
    // Structured response for UI components to consume
    return {
        success: false,
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
    };
};

// ========================================================================
// 4. CONSTANTS & SYSTEM DEFAULTS
// ========================================================================
export const API_CONFIG = Object.freeze({
    MAX_RETRY_ATTEMPTS: 3,
    CACHE_EXPIRY_MS: 300000, // 5 minutes
    DEFAULT_PAGE_SIZE: 50
});