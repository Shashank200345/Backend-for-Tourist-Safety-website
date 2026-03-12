/**
 * Supabase Edge Function: check-location
 * 
 * Receives user location and returns zones where the point is inside
 * - For polygon zones: uses ST_Contains
 * - For circle zones: uses ST_DistanceSphere <= radius
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const { lat, lng, userId } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Missing lat or lng' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Query zones where point is inside
    // Use PostGIS functions via RPC
    const { data: zones, error } = await supabase.rpc('check_point_in_zone', {
      p_latitude: lat,
      p_longitude: lng,
      p_zone_id: null, // Check all zones
    });

    if (error) {
      console.error('Error checking location:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If using raw SQL instead of RPC, use this query:
    /*
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
      .eq('status', 'ACTIVE')
      .or(`geometry->>'type'.eq.Point.and(center_lat.isnot.null,center_lng.isnot.null,radius_meters.isnot.null),geometry->>'type'.in.(Polygon,MultiPolygon)`)
      // Note: Actual spatial queries need to be done via RPC or raw SQL
    */

    return new Response(
      JSON.stringify({
        success: true,
        zones: zones || [],
        location: { lat, lng },
        userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in check-location:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

