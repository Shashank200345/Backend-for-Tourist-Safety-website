/**
 * Geofence SMS Watcher Service
 * 
 * This service monitors the zone_events table for ENTER events
 * and automatically triggers SMS alerts via the SMS service.
 * 
 * Architecture:
 * - Uses Supabase Realtime subscriptions to listen for new zone_events
 * - Only processes ENTER events (EXIT events are ignored)
 * - Integrates with SMS service for sending alerts
 * - Includes error handling and logging
 * 
 * @module services/geofenceSMSWatcher
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { sendGeofenceSMSAlert, isSMSServiceReady } from './smsService';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials are required for geofence SMS watcher');
}

// Create a separate Supabase client for realtime subscriptions
// Note: Service role key has full access, but for realtime we might need anon key
// For production, consider using a service account with appropriate permissions
const supabaseRealtime = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

let channel: RealtimeChannel | null = null;
let isWatching = false;

/**
 * Start watching for zone_events ENTER events
 * @returns true if successfully started
 */
export function startGeofenceSMSWatcher(): boolean {
  if (isWatching) {
    console.log('⚠️ Geofence SMS Watcher: Already running');
    return false;
  }
  
  // Check if SMS service is ready
  if (!isSMSServiceReady()) {
    console.warn('⚠️ Geofence SMS Watcher: SMS service not configured. Watcher will not start.');
    return false;
  }
  
  try {
    // Subscribe to INSERT events on zone_events table
    channel = supabaseRealtime
      .channel('zone_events_sms_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'zone_events',
          filter: 'event_type=eq.ENTER', // Only listen for ENTER events
        },
        async (payload) => {
          await handleZoneEvent(payload.new as any);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Geofence SMS Watcher: Subscribed to zone_events table');
          isWatching = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Geofence SMS Watcher: Channel error');
          isWatching = false;
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Geofence SMS Watcher: Connection timed out');
          isWatching = false;
        } else if (status === 'CLOSED') {
          console.log('⚠️ Geofence SMS Watcher: Channel closed');
          isWatching = false;
        }
      });
    
    return true;
  } catch (error: any) {
    console.error('❌ Geofence SMS Watcher: Failed to start', error);
    return false;
  }
}

/**
 * Stop watching for zone_events
 */
export function stopGeofenceSMSWatcher(): void {
  if (channel) {
    channel.unsubscribe();
    channel = null;
    isWatching = false;
    console.log('🛑 Geofence SMS Watcher: Stopped');
  }
}

/**
 * Handle a new zone event (INSERT)
 * @param event New zone event record
 */
async function handleZoneEvent(event: {
  id: string;
  zone_id: string;
  user_id: string | null;
  event_type: string;
  latitude: number;
  longitude: number;
  created_at: string;
}): Promise<void> {
  // Only process ENTER events
  if (event.event_type !== 'ENTER') {
    return;
  }
  
  // Skip if no user_id (anonymous events)
  if (!event.user_id) {
    console.log(`⚠️ Geofence SMS Watcher: Skipping event ${event.id} - no user_id`);
    return;
  }
  
  console.log(
    `📥 Geofence SMS Watcher: Processing ENTER event for user ${event.user_id} in zone ${event.zone_id}`
  );
  
  try {
    // Send SMS alert
    const result = await sendGeofenceSMSAlert(
      event.user_id,
      event.zone_id
    );
    
    if (result.success) {
      console.log(
        `✅ Geofence SMS Watcher: SMS sent successfully for event ${event.id}`
      );
    } else {
      // Log the reason for skipping/failure
      if (result.error) {
        console.log(
          `⏭️ Geofence SMS Watcher: SMS not sent for event ${event.id} - ${result.error}`
        );
      }
    }
  } catch (error: any) {
    console.error(
      `❌ Geofence SMS Watcher: Error processing event ${event.id}:`,
      error
    );
  }
}

/**
 * Get watcher status
 * @returns Status object
 */
export function getWatcherStatus(): {
  isWatching: boolean;
  isSMSReady: boolean;
  channelStatus: string | null;
} {
  return {
    isWatching,
    isSMSReady: isSMSServiceReady(),
    channelStatus: channel?.state || null,
  };
}

