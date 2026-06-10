/**
 * 👑 AYABUS PARTNER PORTAL (Sovereign Surge Engine)
 * ------------------------------------------------------------------
 * Module: Market Intelligence & Surge Routing
 * File: surge.service.js
 * * DESCRIPTION:
 * The apex network bridge for the Surge & Market Intelligence Module. 
 * Securely reaches into the 3 Master Consumer Telemetry pipelines 
 * (Searches, Bookings, Cancellations) and channels the raw data into 
 * the mathematical adapters.
 * * WORLD-CLASS PHYSICS:
 * 1. CONCURRENT PIPELINE EXECUTION: Utilizes `Promise.all()` to fetch from 
 * all three massive database tables simultaneously. This prevents network 
 * waterfalls and ensures the UI hydrates in milliseconds, not seconds.
 * 2. TEMPORAL INJECTION: Accepts strict ISO Date strings to slice the 
 * telemetry data mathematically, allowing partners to view surges for 
 * "Tomorrow" vs "Next Week".
 * 3. ATOMIC PAYLOAD STRUCTURE: Always returns a unified, purified object 
 * containing { intent, conversion, friction } so the UI orchestrator 
 * never has to stitch data together manually.
 */

import { supabase, handleDataException } from '../../../services/api.config';
import { 
    adaptSearchTelemetry, 
    adaptBookingPreferences, 
    adaptCancellationAutopsy 
} from './surge.adapters';

// ========================================================================
// 1. THE MASTER TELEMETRY FETCH ENGINE
// ========================================================================

export const surgeService = {

    /**
     * Fetches and purifies the entire Market Intelligence spectrum.
     * @param {Object} timeFrame - { start: ISOString, end: ISOString } Optional temporal bounds.
     * @returns {Promise<Object>} { success: true, data: { intent, conversion, friction } }
     */
    fetchSurgeIntelligence: async (timeFrame = null) => {
        try {
            // ---------------------------------------------------------
            // 1. CONSTRUCT QUERY PIPELINES
            // ---------------------------------------------------------
            // We initialize the queries but DO NOT await them yet.
            // Notice: There is no `.eq('partner_id')` filter here because 
            // Surge data is Global Network Demand. Every partner sees the whole market.
            
            let searchPipeline = supabase
                .from('telemetry_searches')
                .select('*')
                .order('created_at', { ascending: false });

            let bookingPipeline = supabase
                .from('telemetry_bookings')
                .select('*')
                .order('created_at', { ascending: false });

            let cancelPipeline = supabase
                .from('telemetry_cancellations')
                .select('*')
                .order('created_at', { ascending: false });

            // ---------------------------------------------------------
            // 2. INJECT TEMPORAL SLICING (If timeFrame is provided)
            // ---------------------------------------------------------
            if (timeFrame && timeFrame.start && timeFrame.end) {
                searchPipeline = searchPipeline.gte('created_at', timeFrame.start).lte('created_at', timeFrame.end);
                bookingPipeline = bookingPipeline.gte('created_at', timeFrame.start).lte('created_at', timeFrame.end);
                cancelPipeline = cancelPipeline.gte('created_at', timeFrame.start).lte('created_at', timeFrame.end);
            }

            // ---------------------------------------------------------
            // 3. CONCURRENT EXECUTION (The Waterfall Killer)
            // ---------------------------------------------------------
            // We fire all 3 database requests simultaneously to the Supabase Cloud.
            const [searchResponse, bookingResponse, cancelResponse] = await Promise.all([
                searchPipeline,
                bookingPipeline,
                cancelPipeline
            ]);

            // ---------------------------------------------------------
            // 4. DEFENSIVE ERROR CHECKING
            // ---------------------------------------------------------
            if (searchResponse.error) throw searchResponse.error;
            if (bookingResponse.error) throw bookingResponse.error;
            if (cancelResponse.error) throw cancelResponse.error;

            // ---------------------------------------------------------
            // 5. THE PURIFICATION & MATH HANDOFF
            // ---------------------------------------------------------
            // We instantly pass the raw arrays through our Math Engine adapters.
            // If a table is empty, we pass an empty array to prevent `.length` crashes.
            const intelligenceData = {
                // Pipeline 1: Intent (What are people looking for?)
                intent: adaptSearchTelemetry(searchResponse.data || []),
                
                // Pipeline 2: Conversion (What do they actually buy & prefer?)
                conversion: adaptBookingPreferences(bookingResponse.data || []),
                
                // Pipeline 3: Friction (Why are they abandoning carts/trips?)
                friction: adaptCancellationAutopsy(cancelResponse.data || [])
            };

            // ---------------------------------------------------------
            // 6. RETURN ATOMIC PAYLOAD
            // ---------------------------------------------------------
            return {
                success: true,
                data: intelligenceData
            };

        } catch (err) {
            // Pipes network failures through our standardized exception system
            // so the UI can render a beautiful "Connection Lost" state instead of crashing.
            return handleDataException(err, 'Market Intelligence Synchronisation');
        }
    }

};