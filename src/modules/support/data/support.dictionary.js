/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Support Hub)
 * ------------------------------------------------------------------
 * Module: Support & Action Desk
 * File: support.dictionary.js
 * * DESCRIPTION:
 * The absolute source of truth for all Partner-to-Admin requests.
 * Maps raw database strings from the `partner_requests` table into 
 * beautiful UI configurations, and acts as the brain for the Universal Request Form.
 * * WORLD-CLASS PHYSICS:
 * 1. DYNAMIC FORM INJECTION: Each Request Type contains `prompt` and `requiresDoc` 
 * properties. The UI form reads this dictionary to automatically change its 
 * text and requirements based on what the user clicked.
 * 2. IMMUTABILITY: Sealed via Object.freeze() to prevent state corruption.
 * 3. CRASH IMMUNITY: Exported resolver functions guarantee the UI will never 
 * white-screen if the database returns an unexpected status string.
 */

import { 
    Map, Bus, AlertTriangle, Clock, 
    Wallet, LifeBuoy, CheckCircle2, XCircle, 
    Loader2, ShieldAlert, Activity, FileText
} from 'lucide-react';

// ========================================================================
// 1. REQUEST TAXONOMY (The "What")
// ========================================================================
/**
 * Defines the exact types of actions a Partner can request from the L9 Admin.
 */
export const SUPPORT_REQUEST_TYPES = Object.freeze({
    'ROUTE_ADD': {
        id: 'ROUTE_ADD',
        label: 'Request New Route',
        description: 'Open a new origin-to-destination vector.',
        color: 'var(--brand-primary)',
        bgOpacity: 'rgba(206, 172, 92, 0.1)',
        Icon: Map,
        // Form Configuration
        prompt: 'Please specify the exact Origin Terminal, Destination Terminal, and proposed Ticket Price.',
        requiresDoc: true,
        docLabel: 'Upload Route Permit (Optional but recommended)'
    },
    'FLEET_ADD': {
        id: 'FLEET_ADD',
        label: 'Add Fleet Asset',
        description: 'Register a new bus into your active AyaBus fleet.',
        color: 'var(--status-success)',
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        Icon: Bus,
        // Form Configuration
        prompt: 'Provide the Plate Number, Seating Capacity, and Bus Class (Executive/Ordinary).',
        requiresDoc: true,
        docLabel: 'Upload Logbook or PSV License (PDF/JPG)'
    },
    'SCHEDULE_CHANGE': {
        id: 'SCHEDULE_CHANGE',
        label: 'Alter Schedule',
        description: 'Change departure times or cancel a specific trip.',
        color: 'var(--status-warning)',
        bgOpacity: 'rgba(245, 158, 11, 0.1)',
        Icon: Clock,
        // Form Configuration
        prompt: 'Which exact route and departure time needs to be altered? Please provide the reason.',
        requiresDoc: false,
        docLabel: null
    },
    'BREAKDOWN': {
        id: 'BREAKDOWN',
        label: 'Report Breakdown',
        description: 'Emergency SOS. Dispatch replacement asset or refund passengers.',
        color: 'var(--status-danger)',
        bgOpacity: 'rgba(239, 68, 68, 0.1)',
        Icon: AlertTriangle,
        // Form Configuration
        prompt: 'URGENT: State the exact bus plate number, current location, and whether a rescue bus is needed.',
        requiresDoc: false,
        docLabel: null
    },
    'FINANCIAL_DISPUTE': {
        id: 'FINANCIAL_DISPUTE',
        label: 'Financial Dispute',
        description: 'Query a payout, commission, or cancellation clawback.',
        color: '#8B5CF6', // Enterprise Purple
        bgOpacity: 'rgba(139, 92, 246, 0.1)',
        Icon: Wallet,
        // Form Configuration
        prompt: 'Provide the exact Transaction ID or Ticket Number you are disputing and the reason.',
        requiresDoc: true,
        docLabel: 'Upload relevant receipt or proof'
    },
    'GENERAL': {
        id: 'GENERAL',
        label: 'General Support',
        description: 'Any other inquiries or platform assistance.',
        color: 'var(--text-main)',
        bgOpacity: 'var(--bg-input)',
        Icon: LifeBuoy,
        // Form Configuration
        prompt: 'How can the L9 Admin Team assist you today?',
        requiresDoc: false,
        docLabel: null
    }
});

// ========================================================================
// 2. PRIORITY TAXONOMY (The Urgency)
// ========================================================================
/**
 * Defines how fast the Admin Cockpit needs to react.
 */
export const REQUEST_PRIORITIES = Object.freeze({
    'NORMAL': { 
        id: 'NORMAL', 
        label: 'Standard', 
        color: 'var(--text-muted)', 
        Icon: Activity 
    },
    'URGENT': { 
        id: 'URGENT', 
        label: 'High Priority', 
        color: 'var(--status-warning)', 
        Icon: Clock 
    },
    'CRITICAL': { 
        id: 'CRITICAL', 
        label: 'Emergency / SOS', 
        color: 'var(--status-danger)', 
        Icon: ShieldAlert 
    }
});

// ========================================================================
// 3. STATUS TAXONOMY (The Resolution State)
// ========================================================================
/**
 * Defines where the ticket is in the Maker-Checker workflow.
 */
export const TICKET_STATUSES = Object.freeze({
    'PENDING': { 
        id: 'PENDING', 
        label: 'Awaiting Admin', 
        color: 'var(--text-muted)', 
        bgColor: 'var(--bg-input)',
        Icon: Clock 
    },
    'PROCESSING': { 
        id: 'PROCESSING', 
        label: 'Admin Reviewing', 
        color: 'var(--brand-primary)', 
        bgColor: 'rgba(206, 172, 92, 0.1)',
        Icon: Loader2 // UI can add an animation class to spin this
    },
    'RESOLVED': { 
        id: 'RESOLVED', 
        label: 'Completed & Approved', 
        color: 'var(--status-success)', 
        bgColor: 'rgba(34, 197, 94, 0.1)',
        Icon: CheckCircle2 
    },
    'REJECTED': { 
        id: 'REJECTED', 
        label: 'Declined by Admin', 
        color: 'var(--status-danger)', 
        bgColor: 'rgba(239, 68, 68, 0.1)',
        Icon: XCircle 
    }
});

// ========================================================================
// 4. DEFENSIVE RESOLVERS (The Crash Shields)
// ========================================================================

export const getRequestTypeConfig = (rawType) => {
    if (!rawType) return SUPPORT_REQUEST_TYPES['GENERAL'];
    const normalized = String(rawType).toUpperCase().trim();
    return SUPPORT_REQUEST_TYPES[normalized] || SUPPORT_REQUEST_TYPES['GENERAL'];
};

export const getPriorityConfig = (rawPriority) => {
    if (!rawPriority) return REQUEST_PRIORITIES['NORMAL'];
    const normalized = String(rawPriority).toUpperCase().trim();
    return REQUEST_PRIORITIES[normalized] || REQUEST_PRIORITIES['NORMAL'];
};

export const getStatusConfig = (rawStatus) => {
    if (!rawStatus) return TICKET_STATUSES['PENDING'];
    const normalized = String(rawStatus).toUpperCase().trim();
    return TICKET_STATUSES[normalized] || TICKET_STATUSES['PENDING'];
};