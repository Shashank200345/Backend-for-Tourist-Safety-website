/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for use throughout the application.
 * Make sure to set your Supabase project URL and anon key in environment variables.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (TypeScript interfaces)
export interface Zone {
  id: string;
  name: string;
  description: string | null;
  zone_type: 'SAFE' | 'MONITORED' | 'RESTRICTED' | 'EMERGENCY';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shape_type: 'circle' | 'polygon';
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  polygon_coordinates: any | null; // JSONB for polygon coordinates
  geometry?: GeoJSON.Geometry; // Optional - computed from lat/lng or polygon_coordinates
  status: 'ACTIVE' | 'INACTIVE' | 'STANDBY';
  notifications: {
    entry: boolean;
    exit: boolean;
    extended_stay: boolean;
  };
  rules: string[];
  active_visitors: number;
  total_visits: number;
  total_alerts: number;
  region: string | null;
  state: string | null;
  district: string | null;
  // Backward compatibility fields
  center_lat?: number | null;
  center_lng?: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ZoneEvent {
  id: string;
  zone_id: string;
  user_id: string | null;
  event_type: 'ENTER' | 'EXIT';
  latitude: number;
  longitude: number;
  distance_meters: number | null;
  device_info: Record<string, any> | null;
  accuracy_meters: number | null;
  created_at: string;
}

export interface UserLocation {
  id: string;
  user_id: string | null;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  device_info: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  phone_number: string | null;
  email: string | null;
  notification_preferences: {
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  fcm_token: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  full_name: string | null;
  role: 'admin' | 'dispatcher' | 'officer' | 'visitor' | 'viewer';
  created_at: string;
  updated_at: string;
}

/**
 * Helper function to check authentication status
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      // Don't log AuthSessionMissingError as an error (it's normal when not logged in)
      if (error.message && !error.message.includes('Auth session missing')) {
        console.error('Error getting current user:', error);
      }
      return null;
    }
    return user;
  } catch (err: any) {
    // Handle session missing gracefully (user not logged in)
    if (err?.message?.includes('Auth session missing')) {
      return null; // Normal when not logged in
    }
    console.error('Error getting current user:', err);
    return null;
  }
}

/**
 * Helper function to get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

/**
 * Helper function to check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin' || false;
}

export default supabase;

