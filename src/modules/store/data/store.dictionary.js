/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Data Layer
 * File: store.dictionary.js
 *
 * FIXES APPLIED:
 * 1. FLEET description updated — removed "Plate Numbers" since that column
 *    was dropped from bus_configs in Session 1.
 */

import {
    CheckCircle2, Clock, ShieldAlert, AlertTriangle,
    XCircle, FileEdit, Bus, Map, CalendarClock, Briefcase,
    Wrench, Banknote, Users
} from 'lucide-react';

// ========================================================================
// 1. ASSET VAULT TAXONOMY
// ========================================================================
export const STORE_ASSET_TYPES = Object.freeze({
    CORPORATE: {
        id: 'CORPORATE',
        label: 'Corporate Identity',
        description: 'TIN, Revenue Splits & Financial Contacts',
        icon: Briefcase
    },
    FLEET: {
        id: 'FLEET',
        label: 'Fleet Registry',
        // FIX: Removed "Plate Numbers" — column was dropped
        description: 'Bus Configurations, Layouts & Amenities',
        icon: Bus
    },
    ROUTES: {
        id: 'ROUTES',
        label: 'Route Network',
        description: 'Geographical Corridors & Ticket Pricing',
        icon: Map
    },
    TIMETABLE: {
        id: 'TIMETABLE',
        label: 'Master Timetable',
        description: 'Automated Dispatch Rules & Frequencies',
        icon: CalendarClock
    }
});

// ========================================================================
// 2. STATUS PHYSICS ENGINE
// ========================================================================
export const STORE_STATUS_DICTIONARY = Object.freeze({
    'ACTIVE': {
        label: 'Active Asset',
        code: 'ACTIVE',
        Icon: CheckCircle2,
        color: 'var(--status-success)',
        bgOpacity: 'rgba(34, 197, 94, 0.1)',
        borderOpacity: 'rgba(34, 197, 94, 0.2)'
    },
    'PENDING_APPROVAL': {
        label: 'Awaiting Admin',
        code: 'PENDING_APPROVAL',
        Icon: Clock,
        color: 'var(--status-warning)',
        bgOpacity: 'rgba(245, 158, 11, 0.1)',
        borderOpacity: 'rgba(245, 158, 11, 0.2)'
    },
    'UPDATE_PENDING': {
        label: 'Modification Requested',
        code: 'UPDATE_PENDING',
        Icon: FileEdit,
        color: 'var(--brand-primary)',
        bgOpacity: 'rgba(206, 172, 92, 0.1)',
        borderOpacity: 'rgba(206, 172, 92, 0.2)'
    },
    'SUSPENDED': {
        label: 'Suspended',
        code: 'SUSPENDED',
        Icon: ShieldAlert,
        color: 'var(--status-error)',
        bgOpacity: 'rgba(239, 68, 68, 0.1)',
        borderOpacity: 'rgba(239, 68, 68, 0.2)'
    },
    'REJECTED': {
        label: 'Request Denied',
        code: 'REJECTED',
        Icon: XCircle,
        color: 'var(--text-muted)',
        bgOpacity: 'var(--bg-input)',
        borderOpacity: 'var(--border-strong)'
    },
    'UNKNOWN': {
        label: 'Unknown State',
        code: 'UNKNOWN',
        Icon: AlertTriangle,
        color: 'var(--text-muted)',
        bgOpacity: 'var(--bg-input)',
        borderOpacity: 'var(--border-strong)'
    }
});

// ========================================================================
// 3. CHANGE REQUEST TAXONOMY
// ========================================================================
export const CHANGE_REQUEST_TYPES = Object.freeze([
    {
        id: 'LAYOUT_MODIFICATION',
        label: 'Seating Layout Update',
        targetAsset: 'FLEET',
        icon: Wrench,
        description: 'Reconfigure a vehicle\'s physical seat capacity or VIP arrangement.'
    },
    {
        id: 'PRICE_ADJUSTMENT',
        label: 'Ticket Fare Adjustment',
        targetAsset: 'ROUTES',
        icon: Banknote,
        description: 'Request a permanent or seasonal change to base ticket pricing.'
    },
    {
        id: 'TIMETABLE_SHIFT',
        label: 'Schedule Resynchronization',
        targetAsset: 'TIMETABLE',
        icon: Clock,
        description: 'Adjust departure times or frequency for an automated route.'
    },
    {
        id: 'FLEET_SUBSTITUTION',
        label: 'Asset Replacement',
        targetAsset: 'FLEET',
        icon: Bus,
        description: 'Swap a physical bus (e.g., breakdown) while maintaining the layout.'
    },
    {
        id: 'FINANCIAL_UPDATE',
        label: 'Banking & Routing Update',
        targetAsset: 'CORPORATE',
        icon: Briefcase,
        description: 'Update the primary Mobile Money or Bank Settlement accounts.'
    },
    {
        id: 'PERSONNEL_CHANGE',
        label: 'Key Personnel Change',
        targetAsset: 'CORPORATE',
        icon: Users,
        description: 'Update primary dispatchers, managers, or financial contacts.'
    }
]);

// ========================================================================
// 4. DEFENSIVE UTILITIES
// ========================================================================
export const getStoreStatusConfig = (rawStatus) => {
    if (!rawStatus) return STORE_STATUS_DICTIONARY['UNKNOWN'];
    const normalizedStatus = rawStatus.toUpperCase().trim();
    return STORE_STATUS_DICTIONARY[normalizedStatus] || STORE_STATUS_DICTIONARY['UNKNOWN'];
};
