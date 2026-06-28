/**
 * 👑 AYABUS MANIFEST HUB (Sovereign Translator)
 * ------------------------------------------------------------------
 * File: manifest.adapters.js
 *
 * CHANGE (chassis redesign):
 * - layoutConfig fallback changed from '2x2' (string) to {} (object).
 *   SeatMatrix now uses buildChassisRows(schedule.layoutConfig), which
 *   expects a layout_config object, not a legacy string like '2x2'.
 *   All other fields unchanged.
 */

// ========================================================================
// 1. SCHEDULE ADAPTER (Database → Departure Board UI)
// ========================================================================
export const adaptScheduleToManifest = (dbSchedule, targetDate) => {
    if (!dbSchedule) return null;

    try {
        const route  = dbSchedule.routes      || {};
        const config = route.bus_configs || {};

        return {
            // --- CORE IDENTITY ---
            id:          dbSchedule.id,
            baseRouteId: route.id    || null,
            routeCode:   route.route_code || 'TBA',
            route_code:  route.route_code || 'TBA',

            // --- TEMPORAL PHYSICS ---
            departureDate:  targetDate,
            departure_date: targetDate,
            departureTime:  route.departure_time || '00:00:00',
            departure_time: route.departure_time || '00:00:00',

            // --- GEOGRAPHY ---
            originCity:       route.origin_city       || 'Unknown',
            destinationCity:  route.destination_city  || 'Unknown',
            origin_city:      route.origin_city       || 'Unknown',
            destination_city: route.destination_city  || 'Unknown',

            // --- FINANCIAL LEDGER ---
            ticketPrice:  Number(route.price_ticket) || 0,
            price_ticket: Number(route.price_ticket) || 0,

            // --- SCHEDULE STATE ---
            status:        dbSchedule.status         || 'PENDING',
            frequencyType: dbSchedule.frequency_type || 'UNKNOWN',
            frequency_type: dbSchedule.frequency_type || 'UNKNOWN',

            // --- FLEET ASSETS ---
            busClass: config.bus_class || 'Standard',

            // FIX: was `config.layout_config || '2x2'` — the '2x2' string
            // broke SeatMatrix after the chassis redesign because
            // buildChassisRows expects a layout_config object, not a string.
            // Fall back to {} so SeatMatrix uses safe numeric defaults.
            layoutConfig: (config.layout_config && typeof config.layout_config === 'object')
                ? config.layout_config
                : {},

            bus_configs: config, // raw fallback for deep UI inspections
        };
    } catch (error) {
        console.error('🚨 [Manifest Adapter] Hydration failed for schedule:', error);
        return null;
    }
};

// ========================================================================
// 2. PASSENGER TICKET ADAPTER (Database → Passenger Ledger UI)
// ========================================================================
export const adaptTicketToLedger = (dbTicket) => {
    if (!dbTicket) return null;

    try {
        return {
            id:         dbTicket.id,
            seatNumber: dbTicket.seat_number,
            seat_number: dbTicket.seat_number,

            passengerName:  dbTicket.passenger_name  || 'Anonymous',
            passenger_name: dbTicket.passenger_name  || 'Anonymous',

            passengerPhone:  dbTicket.passenger_phone || 'N/A',
            passenger_phone: dbTicket.passenger_phone || 'N/A',

            status:        dbTicket.status         || 'AVAILABLE',
            paymentStatus: dbTicket.payment_status || 'UNPAID',
            payment_status: dbTicket.payment_status || 'UNPAID',

            farePaid:  Number(dbTicket.fare_paid) || 0,
            fare_paid: Number(dbTicket.fare_paid) || 0,

            createdAt:  dbTicket.created_at,
            created_at: dbTicket.created_at,
        };
    } catch (error) {
        console.error('🚨 [Ticket Adapter] Parse failure:', error);
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

    const activeTrips      = dbSchedules.filter(s => s.status === 'ACTIVE').length;
    const pendingApprovals = dbSchedules.filter(s => s.status === 'PENDING_APPROVAL').length;

    return {
        activeTrips,
        pendingApprovals,
        fleetActive: activeTrips > 0,
    };
};
