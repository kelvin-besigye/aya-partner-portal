/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Translator)
 * ------------------------------------------------------------------
 * Module: Manifest Data Adapters
 * File: manifest.adapters.js
 * * DESCRIPTION:
 * The absolute truth layer between the Postgres Database and the React UI.
 * Unwraps complex relational joins (Schedules -> Routes -> Bus Configs) 
 * into a single, flat, crash-proof object.
 * * WORLD-CLASS PHYSICS:
 * 1. TEMPORAL INJECTION: Dynamically attaches the 'targetDate' to recurring 
 * schedules so the UI's T-4 Cutoff Engine never throws an "Invalid Date" crash.
 * 2. DEFENSIVE MAPPING: Null-coalescing on every single field. Prevents 
 * white-screen crashes if a related bus config was deleted.
 * 3. OMNI-CASING: Outputs both camelCase and snake_case to guarantee 
 * perfect hardware compatibility with all legacy UI components.
 */

// ========================================================================
// 1. SCHEDULE ADAPTER (Database -> Departure Board UI)
// ========================================================================
export const adaptScheduleToManifest = (dbSchedule, targetDate) => {
    if (!dbSchedule) return null;

    try {
        // 🛡️ Safe Extraction: Prevent crashes if the INNER JOIN failed
        const route = dbSchedule.routes || {};
        const config = route.bus_configs || {};

        return {
            // --- 1. CORE IDENTITY ---
            id: dbSchedule.id,                  // The Active Schedule ID
            baseRouteId: route.id || null,      // The Parent Blueprint ID
            routeCode: route.route_code || 'TBA',
            route_code: route.route_code || 'TBA', // Omni-case fallback
            
            // --- 2. TEMPORAL PHYSICS (THE FIX) ---
            // We inject the user's selected calendar date into the recurring schedule 
            // so the CutoffBadge.jsx can calculate the exact milliseconds until lock.
            departureDate: targetDate, 
            departure_date: targetDate,
            departureTime: route.departure_time || '00:00:00',
            departure_time: route.departure_time || '00:00:00',
            
            // --- 3. GEOGRAPHY ---
            originCity: route.origin_city || 'Unknown',
            destinationCity: route.destination_city || 'Unknown',
            origin_city: route.origin_city || 'Unknown',
            destination_city: route.destination_city || 'Unknown',
            
            // --- 4. FINANCIAL LEDGER ---
            // Forces strict numerical types to prevent string concatenation math errors
            ticketPrice: Number(route.price_ticket) || 0,
            price_ticket: Number(route.price_ticket) || 0,
            
            // --- 5. SCHEDULE STATE ---
            status: dbSchedule.status || 'PENDING',
            frequencyType: dbSchedule.frequency_type || 'UNKNOWN',
            frequency_type: dbSchedule.frequency_type || 'UNKNOWN',
            
            // --- 6. FLEET ASSETS (Required for SeatMatrix Grid) ---
            busClass: config.bus_class || 'Standard',
            layoutConfig: config.layout_config || '2x2',
            bus_configs: config // Raw fallback for deep UI inspections
        };
    } catch (error) {
        console.error("🚨 [Manifest Adapter] Hydration failed for schedule:", error);
        return null; // Fail gracefully, don't crash the whole board
    }
};

// ========================================================================
// 2. PASSENGER TICKET ADAPTER (Database -> Passenger Ledger UI)
// ========================================================================
export const adaptTicketToLedger = (dbTicket) => {
    if (!dbTicket) return null;

    try {
        return {
            id: dbTicket.id,
            seatNumber: dbTicket.seat_number,
            seat_number: dbTicket.seat_number,
            
            passengerName: dbTicket.passenger_name || 'Anonymous',
            passenger_name: dbTicket.passenger_name || 'Anonymous',
            
            passengerPhone: dbTicket.passenger_phone || 'N/A',
            passenger_phone: dbTicket.passenger_phone || 'N/A',
            
            status: dbTicket.status || 'AVAILABLE',
            paymentStatus: dbTicket.payment_status || 'UNPAID',
            payment_status: dbTicket.payment_status || 'UNPAID',
            
            farePaid: Number(dbTicket.fare_paid) || 0,
            fare_paid: Number(dbTicket.fare_paid) || 0,
            
            createdAt: dbTicket.created_at,
            created_at: dbTicket.created_at
        };
    } catch (error) {
        console.error("🚨 [Ticket Adapter] Parse failure:", error);
        return null;
    }
};

// ========================================================================
// 3. OPERATIONAL PULSE ADAPTER (Dashboard Analytics)
// ========================================================================
export const adaptOperationalPulse = (dbSchedules) => {
    if (!Array.isArray(dbSchedules)) {
        return { activeTrips: 0, pendingApprovals: 0, fleetActive: false };
    }

    const activeTrips = dbSchedules.filter(s => s.status === 'ACTIVE').length;
    const pendingApprovals = dbSchedules.filter(s => s.status === 'PENDING_APPROVAL').length;

    return {
        activeTrips,
        pendingApprovals,
        fleetActive: activeTrips > 0
    };
};