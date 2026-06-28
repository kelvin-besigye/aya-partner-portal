/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Data Layer
 * File: store.adapters.js
 *
 * FIXES APPLIED:
 * 1. adaptFleetAsset: Removed plateNumber field — plate_number column was dropped
 *    from bus_configs in Session 1 SQL.
 * 2. adaptFleetAsset: layout_config is now JSONB not a string — added safe handling
 *    so it doesn't crash when the object comes back from the DB.
 * 3. adaptCorporateProfile: Now correctly reads partner_parks, partner_financials,
 *    partner_contacts from the joined query result (not from details JSONB fallback only).
 */

import { getStoreStatusConfig, STORE_ASSET_TYPES } from './store.dictionary';

// ========================================================================
// 1. DEFENSIVE UTILITIES (The Armor)
// ========================================================================
const safeStr = (val, fallback = 'N/A') => (val && typeof val === 'string' ? val.trim() : fallback);
const safeNum = (val, fallback = 0) => (isNaN(Number(val)) ? fallback : Number(val));
const safeArr = (val) => (Array.isArray(val) ? val : []);
const safeJSON = (val) => (typeof val === 'object' && val !== null ? val : {});

/**
 * Transforms '14:30:00' into '02:30 PM'
 */
const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
        const [hStr, mStr] = timeStr.split(':');
        const h = parseInt(hStr, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:${mStr} ${period}`;
    } catch {
        return timeStr;
    }
};

// ========================================================================
// 2. CORPORATE IDENTITY ADAPTER (Table: partners)
// ========================================================================
/**
 * Unwraps the corporate profile and extracts parks, financials and contacts
 * from the joined query result. Falls back to the details JSONB if joins
 * are not present (defensive).
 */
export const adaptCorporateProfile = (dbPartner) => {
    if (!dbPartner) return null;

    try {
        const details = safeJSON(dbPartner.details);
        const statusConfig = getStoreStatusConfig(dbPartner.status);

        // FIX: Read from joined tables first (partner_parks, partner_financials,
        // partner_contacts), then fall back to the details JSONB blob.
        // The joined data comes back as arrays directly on the object.
        const parks = safeArr(dbPartner.partner_parks || details.parks);
        const financials = safeArr(dbPartner.partner_financials || details.financials);
        const contacts = safeArr(dbPartner.partner_contacts || details.contacts);

        return {
            assetType: STORE_ASSET_TYPES.CORPORATE.id,
            id: dbPartner.id,
            partnerId: safeStr(dbPartner.partner_id, 'UNKNOWN-ID'),
            companyName: safeStr(dbPartner.company_name, 'Unnamed Partner'),

            // Legal & Tax
            tinNumber: safeStr(dbPartner.tin_number, 'Pending TIN'),
            businessType: safeStr(dbPartner.business_type, 'Unspecified'),
            incorporationDate: dbPartner.incorporation_date || 'N/A',

            // Relational child data (now hydrated from joins)
            financials,
            contacts,
            parks,

            // State Integration
            status: dbPartner.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbPartner.created_at
        };
    } catch (error) {
        console.error('🚨 [Adapter Fault] Corporate Profile:', error);
        return null;
    }
};

// ========================================================================
// 3. FLEET ASSET ADAPTER (Table: bus_configs)
// ========================================================================
/**
 * Purifies bus configuration records.
 *
 * FIX: Removed plateNumber — plate_number column was dropped from bus_configs.
 * FIX: layout_config is JSONB not a plain string — safely extract a display
 *      string from it rather than treating it as a string directly.
 */
export const adaptFleetAsset = (dbConfig) => {
    if (!dbConfig) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbConfig.status);

        // layout_config is a JSONB object e.g. { total_rows: 9, cols_left: 2, ... }
        // We build a human-readable string from it for display purposes.
        const layout = safeJSON(dbConfig.layout_config);
        const layoutDisplay = layout.cols_left && layout.cols_right
            ? `${layout.cols_left}x${layout.cols_right} (${layout.total_seats || dbConfig.capacity || 0} seats)`
            : 'Standard Layout';

        return {
            assetType: STORE_ASSET_TYPES.FLEET.id,
            id: dbConfig.id,
            partnerId: dbConfig.partner_id,
            fleetId: dbConfig.fleet_id || null,

            // Configuration Data
            busClass: safeStr(dbConfig.bus_class, 'Standard'),
            modelName: safeStr(dbConfig.model_name, 'Unknown Model'),
            capacity: safeNum(dbConfig.capacity, 0),
            layoutDisplay,          // Human-readable string for the UI
            layoutRaw: layout,      // Raw object if the Inspector needs it

            // Rich Media & Offerings
            amenities: safeArr(dbConfig.amenities),
            gallery: safeArr(dbConfig.gallery),

            // State Integration
            status: dbConfig.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbConfig.created_at
        };
    } catch (error) {
        console.error('🚨 [Adapter Fault] Fleet Asset:', error);
        return null;
    }
};

// ========================================================================
// 4. ROUTE NETWORK ADAPTER (Table: routes)
// ========================================================================
/**
 * Flattens route blueprints and calculates absolute financials.
 */
export const adaptRouteBlueprint = (dbRoute) => {
    if (!dbRoute) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbRoute.status);
        const config = safeJSON(dbRoute.bus_configs);

        const priceTicket = safeNum(dbRoute.price_ticket);
        const priceTax = safeNum(dbRoute.price_tax);

        // bus_configs.layout_config is JSONB — extract display string safely
        const layout = safeJSON(config.layout_config);
        const assignedLayout = layout.cols_left && layout.cols_right
            ? `${layout.cols_left}x${layout.cols_right}`
            : 'N/A';

        return {
            assetType: STORE_ASSET_TYPES.ROUTES.id,
            id: dbRoute.id,
            routeCode: safeStr(dbRoute.route_code, 'UNASSIGNED'),

            // Geographic Physics
            originCity: safeStr(dbRoute.origin_city, 'Unknown'),
            destinationCity: safeStr(dbRoute.destination_city, 'Unknown'),
            departurePark: safeStr(dbRoute.departure_park, 'Main Park'),

            // Temporal Physics
            departureTimeRaw: dbRoute.departure_time,
            departureTimeFormatted: formatTime(dbRoute.departure_time),
            durationText: `${safeNum(dbRoute.duration_hours)}h ${safeNum(dbRoute.duration_minutes)}m`,

            // Financial Ledger
            priceTicket,
            priceTax,
            totalFare: priceTicket + priceTax,

            // Relational Fleet Data (if joined)
            assignedFleetClass: safeStr(config.bus_class, 'Unassigned Class'),
            assignedLayout,

            // State Integration
            status: dbRoute.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbRoute.created_at
        };
    } catch (error) {
        console.error('🚨 [Adapter Fault] Route Blueprint:', error);
        return null;
    }
};

// ========================================================================
// 5. MASTER TIMETABLE ADAPTER (Table: route_schedules)
// ========================================================================
/**
 * Flattens deep relational schedule data for the Timetable tab.
 */
export const adaptMasterTimetable = (dbSchedule) => {
    if (!dbSchedule) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbSchedule.status);
        const route = safeJSON(dbSchedule.routes);
        const config = safeJSON(route.bus_configs);

        const freqType = safeStr(dbSchedule.frequency_type, 'ONCE');
        const freqData = safeJSON(dbSchedule.frequency_data);

        let humanFrequency = freqType;
        if (freqType === 'WEEKLY' && Array.isArray(freqData.days)) {
            humanFrequency = `Weekly on ${freqData.days.join(', ')}`;
        } else if (freqType === 'DAILY') {
            humanFrequency = 'Every Day';
        } else if (freqType === 'CUSTOM' && Array.isArray(freqData.days)) {
            humanFrequency = `Custom: ${freqData.days.join(', ')}`;
        }

        return {
            assetType: STORE_ASSET_TYPES.TIMETABLE.id,
            id: dbSchedule.id,

            // Automation Logic
            frequencyType: freqType,
            humanFrequency,

            // Flattened Route Data
            routeId: route.id,
            routeCode: safeStr(route.route_code, 'N/A'),
            originCity: safeStr(route.origin_city, 'Unknown'),
            destinationCity: safeStr(route.destination_city, 'Unknown'),
            departureTimeFormatted: formatTime(route.departure_time),

            // Flattened Fleet Data
            busClass: safeStr(config.bus_class, 'Unassigned'),

            // State Integration
            status: dbSchedule.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbSchedule.created_at
        };
    } catch (error) {
        console.error('🚨 [Adapter Fault] Master Timetable:', error);
        return null;
    }
};
