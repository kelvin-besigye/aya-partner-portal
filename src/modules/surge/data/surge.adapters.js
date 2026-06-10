/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: surge.adapters.js
 * * DESCRIPTION:
 * The Mathematical Aggregation Engine. Takes raw, unformatted telemetry arrays 
 * from the database and crunches them into pre-calculated percentages, 
 * heatmaps, and sorted arrays for the Forensics UI.
 * * WORLD-CLASS PHYSICS:
 * 1. O(N) AGGREGATION: Uses single-pass `.reduce()` loops to crunch thousands 
 * of rows instantly without blocking the main browser thread.
 * 2. PERCENTAGE PURIFICATION: Automatically handles divide-by-zero errors and 
 * formats percentages to exactly 1 decimal place (e.g., 84.5%).
 * 3. DICTIONARY HYDRATION: Automatically attaches the visual UI configs 
 * (Colors, Icons) directly to the math results so the UI components can just map and render.
 */

import { 
    getCancelReasonConfig, 
    getPaymentMethodConfig, 
    getSeatTypeConfig, 
    getBusClassConfig,
    SEAT_POSITIONS
} from './surge.dictionary';

// ========================================================================
// 1. INTENT ADAPTER (Search Volume & Route Surges)
// ========================================================================
/**
 * Processes raw searches to find the hottest routes and generate Surge Alerts.
 * @param {Array} rawSearches - Rows from `telemetry_searches`
 */
export const adaptSearchTelemetry = (rawSearches = []) => {
    const totalSearches = rawSearches.length;
    if (totalSearches === 0) return { totalSearches: 0, topRoutes: [], actionableSurge: null };

    // 1. Group by Route Code
    const routeMap = rawSearches.reduce((acc, curr) => {
        const route = curr.route_code || 'UNKNOWN';
        if (!acc[route]) {
            acc[route] = { routeCode: route, volume: 0, origin: curr.origin_city, destination: curr.destination_city };
        }
        acc[route].volume += 1;
        return acc;
    }, {});

    // 2. Convert to Array, Calculate Percentages, and Sort Descending
    const topRoutes = Object.values(routeMap)
        .map(route => ({
            ...route,
            percentage: ((route.volume / totalSearches) * 100).toFixed(1),
            // Generate a human-readable title for the UI
            label: `${route.origin} ➔ ${route.destination}`
        }))
        .sort((a, b) => b.volume - a.volume);

    // 3. Identify the Alpha Surge (The #1 most searched route to feed the Deployment Dock)
    const actionableSurge = topRoutes.length > 0 ? topRoutes[0] : null;

    return {
        totalSearches,
        topRoutes,
        actionableSurge
    };
};

// ========================================================================
// 2. PREFERENCE ADAPTER (Seat Heatmaps & Payment Methods)
// ========================================================================
/**
 * Processes booking data to reveal EXACTLY what passengers prefer.
 * @param {Array} rawBookings - Rows from `telemetry_bookings`
 */
export const adaptBookingPreferences = (rawBookings = []) => {
    const totalBookings = rawBookings.length;
    if (totalBookings === 0) return { totalBookings: 0, seatHeatmap: [], payments: [] };

    // 1. Payment Method Distribution
    const paymentMap = rawBookings.reduce((acc, curr) => {
        const method = curr.payment_method || 'UNKNOWN';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});

    const payments = Object.entries(paymentMap)
        .map(([method, count]) => ({
            config: getPaymentMethodConfig(method),
            count,
            percentage: ((count / totalBookings) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    // 2. Seat Position Heatmap Matrix (Front/Mid/Back vs Window/Aisle)
    // We create a composite key (e.g., 'FRONT_WINDOW')
    const seatMap = rawBookings.reduce((acc, curr) => {
        const position = curr.seat_position || 'UNKNOWN'; // FRONT, MID, BACK
        const type = curr.seat_type || 'UNKNOWN';         // WINDOW, AISLE
        const key = `${position}_${type}`;
        
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const seatHeatmap = Object.entries(seatMap)
        .map(([key, count]) => {
            const [position, type] = key.split('_');
            const typeConfig = getSeatTypeConfig(type);
            const posConfig = SEAT_POSITIONS[position] || SEAT_POSITIONS['UNKNOWN'];

            return {
                id: key,
                positionLabel: posConfig.label,
                typeLabel: typeConfig.label,
                color: typeConfig.color,
                count,
                percentage: ((count / totalBookings) * 100).toFixed(1)
            };
        })
        .sort((a, b) => b.count - a.count); // Most requested seats at the top

    return {
        totalBookings,
        payments,
        seatHeatmap
    };
};

// ========================================================================
// 3. AUTOPSY ADAPTER (Cancellation Forensics)
// ========================================================================
/**
 * Processes cancellation data to show Partners exactly WHY they are losing money.
 * @param {Array} rawCancellations - Rows from `telemetry_cancellations`
 */
export const adaptCancellationAutopsy = (rawCancellations = []) => {
    const totalCancellations = rawCancellations.length;
    if (totalCancellations === 0) return { totalCancellations: 0, reasons: [], classes: [] };

    // 1. Group by "Why" (The Reason)
    const reasonMap = rawCancellations.reduce((acc, curr) => {
        const reason = curr.cancellation_reason || 'UNKNOWN';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
    }, {});

    const reasons = Object.entries(reasonMap)
        .map(([reason, count]) => ({
            config: getCancelReasonConfig(reason),
            count,
            percentage: ((count / totalCancellations) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    // 2. Group by "What" (The Bus Class abandoned)
    const classMap = rawCancellations.reduce((acc, curr) => {
        const busClass = curr.bus_class || 'UNKNOWN';
        acc[busClass] = (acc[busClass] || 0) + 1;
        return acc;
    }, {});

    const classes = Object.entries(classMap)
        .map(([busClass, count]) => ({
            config: getBusClassConfig(busClass),
            count,
            percentage: ((count / totalCancellations) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    return {
        totalCancellations,
        reasons,
        classes
    };
};