/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Store Engine)
 * ------------------------------------------------------------------
 * Module: Partner Store / Data Layer
 * File: store.adapters.js
 * * DESCRIPTION:
 * The apex purification pipeline. Converts complex, heavily-nested Postgres 
 * snake_case data (Routes, Fleet, Timetables) into flat, heavily-defended, 
 * React-ready camelCase JavaScript objects.
 * * WORLD-CLASS PHYSICS:
 * 1. ZERO-CRASH GUARANTEE: Every adapter is wrapped in a try/catch block with 
 * rigorous fallback values. Missing relational data will never break the UI.
 * 2. AUTOMATIC STATE BINDING: Instantly maps the raw DB status (e.g., 'PENDING_APPROVAL')
 * to its exact UI configuration from `store.dictionary.js`.
 * 3. JSONB UNWRAPPING: Safely decodes complex nested JSON payloads 
 * (Amenities, Galleries, Financials) without throwing parsing errors.
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
 * Unwraps the corporate profile and extracts the complex JSONB details.
 */
export const adaptCorporateProfile = (dbPartner) => {
    if (!dbPartner) return null;

    try {
        const details = safeJSON(dbPartner.details);
        const statusConfig = getStoreStatusConfig(dbPartner.status);

        return {
            assetType: STORE_ASSET_TYPES.CORPORATE.id,
            id: dbPartner.id,
            partnerId: safeStr(dbPartner.partner_id, 'UNKNOWN-ID'),
            companyName: safeStr(dbPartner.company_name, 'Unnamed Partner'),
            
            // Legal & Tax
            tinNumber: safeStr(dbPartner.tin_number, 'Pending TIN'),
            businessType: safeStr(dbPartner.business_type, 'Unspecified'),
            incorporationDate: dbPartner.incorporation_date || 'N/A',
            
            // Nested JSONB Extraction
            financials: safeArr(dbPartner.partner_financials || details.financials),
            contacts: safeArr(dbPartner.partner_contacts || details.contacts),
            parks: safeArr(dbPartner.partner_parks || details.parks),

            // State Integration
            status: dbPartner.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbPartner.created_at
        };
    } catch (error) {
        console.error("🚨 [Adapter Fault] Corporate Profile:", error);
        return null;
    }
};

// ========================================================================
// 3. FLEET ASSET ADAPTER (Table: bus_configs)
// ========================================================================
/**
 * Purifies the physical fleet records. Handles image galleries and amenities arrays.
 */
export const adaptFleetAsset = (dbConfig) => {
    if (!dbConfig) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbConfig.status);

        return {
            assetType: STORE_ASSET_TYPES.FLEET.id,
            id: dbConfig.id,
            partnerId: dbConfig.partner_id,
            
            // Physical Asset Data
            plateNumber: safeStr(dbConfig.plate_number, 'TBA'),
            busClass: safeStr(dbConfig.bus_class, 'Standard'),
            modelName: safeStr(dbConfig.model_name, 'Unknown Model'),
            layoutConfig: safeStr(dbConfig.layout_config, '2x2'),
            
            // Rich Media & Offerings
            amenities: safeArr(dbConfig.amenities),
            gallery: safeArr(dbConfig.gallery),

            // State Integration
            status: dbConfig.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbConfig.created_at
        };
    } catch (error) {
        console.error("🚨 [Adapter Fault] Fleet Asset:", error);
        return null;
    }
};

// ========================================================================
// 4. ROUTE NETWORK ADAPTER (Table: routes)
// ========================================================================
/**
 * Flattens the route blueprints and calculates absolute financials.
 * Protects against inner-join failures if a bus_config is suddenly deleted.
 */
export const adaptRouteBlueprint = (dbRoute) => {
    if (!dbRoute) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbRoute.status);
        const config = safeJSON(dbRoute.bus_configs); // Safely handle the relational join

        const priceTicket = safeNum(dbRoute.price_ticket);
        const priceTax = safeNum(dbRoute.price_tax);

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

            // Relational Fleet Data (If joined)
            assignedFleetClass: safeStr(config.bus_class, 'Unassigned Class'),
            assignedLayout: safeStr(config.layout_config, 'N/A'),

            // State Integration
            status: dbRoute.status || 'UNKNOWN',
            uiState: statusConfig,
            createdAt: dbRoute.created_at
        };
    } catch (error) {
        console.error("🚨 [Adapter Fault] Route Blueprint:", error);
        return null;
    }
};

// ========================================================================
// 5. MASTER TIMETABLE ADAPTER (Table: route_schedules)
// ========================================================================
/**
 * The most complex adapter. Flattens deep relational data so the UI doesn't 
 * have to call `schedule.routes.bus_configs.bus_class` and risk a crash.
 */
export const adaptMasterTimetable = (dbSchedule) => {
    if (!dbSchedule) return null;

    try {
        const statusConfig = getStoreStatusConfig(dbSchedule.status);
        const route = safeJSON(dbSchedule.routes);         // 1st Level Join
        const config = safeJSON(route.bus_configs);        // 2nd Level Join

        // Extract and format the complex frequency rules
        const freqType = safeStr(dbSchedule.frequency_type, 'ONCE');
        const freqData = safeJSON(dbSchedule.frequency_data);
        
        let humanFrequency = freqType;
        if (freqType === 'WEEKLY' && Array.isArray(freqData.days)) {
            humanFrequency = `Weekly on ${freqData.days.join(', ')}`;
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
        console.error("🚨 [Adapter Fault] Master Timetable:", error);
        return null;
    }
};