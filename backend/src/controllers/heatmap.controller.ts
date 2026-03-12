/**
 * Heatmap Controller
 * 
 * REST API endpoints for heatmap data
 * Reads from existing Supabase tables: zone_events, user_locations
 * 
 * @module controllers/heatmap.controller
 */

import { Request, Response } from 'express';
import supabase from '../config/database';

/**
 * Get heatmap data points
 * GET /api/heatmap/data
 * Query params: start_date?, end_date?, source?, intensity_threshold?, limit?
 * 
 * Returns array of [lat, lng, intensity] points for heatmap visualization
 */
export const getHeatmapData = async (req: Request, res: Response) => {
  try {
    const {
      start_date,
      end_date,
      source = 'zone_events', // 'zone_events' or 'user_locations'
      intensity_threshold = '1',
      limit = '10000',
    } = req.query;

    let heatmapPoints: [number, number, number][] = [];

    if (source === 'zone_events') {
      // Get data from zone_events table
      let query = supabase
        .from('zone_events')
        .select('latitude, longitude, event_type')
        .limit(parseInt(limit as string));

      if (start_date) {
        query = query.gte('created_at', start_date);
      }
      if (end_date) {
        query = query.lte('created_at', end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching zone events for heatmap:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch heatmap data',
          message: error.message,
        });
      }

      // Aggregate events by location and calculate intensity
      const locationMap = new Map<string, number>();

      data?.forEach((event: any) => {
        // Round coordinates to 4 decimal places (~11 meters precision) for aggregation
        const lat = parseFloat(event.latitude.toFixed(4));
        const lng = parseFloat(event.longitude.toFixed(4));
        const key = `${lat},${lng}`;

        // Increase intensity for ENTER events (more important)
        const weight = event.event_type === 'ENTER' ? 2 : 1;
        locationMap.set(key, (locationMap.get(key) || 0) + weight);
      });

      // Convert to heatmap format [lat, lng, intensity]
      heatmapPoints = Array.from(locationMap.entries())
        .filter(([_, intensity]) => intensity >= parseInt(intensity_threshold as string))
        .map(([key, intensity]) => {
          const [lat, lng] = key.split(',').map(Number);
          return [lat, lng, intensity] as [number, number, number];
        });
    } else if (source === 'user_locations') {
      // Get data from user_locations table
      let query = supabase
        .from('user_locations')
        .select('latitude, longitude')
        .limit(parseInt(limit as string));

      if (start_date) {
        query = query.gte('created_at', start_date);
      }
      if (end_date) {
        query = query.lte('created_at', end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user locations for heatmap:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch heatmap data',
          message: error.message,
        });
      }

      // Aggregate locations by coordinates
      const locationMap = new Map<string, number>();

      data?.forEach((location: any) => {
        const lat = parseFloat(location.latitude.toFixed(4));
        const lng = parseFloat(location.longitude.toFixed(4));
        const key = `${lat},${lng}`;
        locationMap.set(key, (locationMap.get(key) || 0) + 1);
      });

      // Convert to heatmap format
      heatmapPoints = Array.from(locationMap.entries())
        .filter(([_, intensity]) => intensity >= parseInt(intensity_threshold as string))
        .map(([key, intensity]) => {
          const [lat, lng] = key.split(',').map(Number);
          return [lat, lng, intensity] as [number, number, number];
        });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid source parameter',
        message: "Source must be 'zone_events' or 'user_locations'",
      });
    }

    return res.status(200).json({
      success: true,
      data: heatmapPoints,
      count: heatmapPoints.length,
      source,
      meta: {
        start_date: start_date || null,
        end_date: end_date || null,
        intensity_threshold: parseInt(intensity_threshold as string),
      },
    });
  } catch (error: any) {
    console.error('Error in getHeatmapData:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get heatmap statistics
 * GET /api/heatmap/stats
 * Returns statistics about heatmap data
 */
export const getHeatmapStats = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, source = 'zone_events' } = req.query;

    let query;
    let tableName = '';

    if (source === 'zone_events') {
      tableName = 'zone_events';
      query = supabase.from('zone_events').select('latitude, longitude, created_at');
    } else if (source === 'user_locations') {
      tableName = 'user_locations';
      query = supabase.from('user_locations').select('latitude, longitude, created_at');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid source parameter',
        message: "Source must be 'zone_events' or 'user_locations'",
      });
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error, count } = await query.select('*', { count: 'exact', head: false });

    if (error) {
      console.error('Error fetching heatmap stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch heatmap statistics',
        message: error.message,
      });
    }

    // Calculate date range
    const dates = data?.map((item: any) => new Date(item.created_at).getTime()) || [];
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

    // Calculate geographic bounds
    const latitudes = data?.map((item: any) => parseFloat(item.latitude)) || [];
    const longitudes = data?.map((item: any) => parseFloat(item.longitude)) || [];

    const bounds = {
      north: latitudes.length > 0 ? Math.max(...latitudes) : null,
      south: latitudes.length > 0 ? Math.min(...latitudes) : null,
      east: longitudes.length > 0 ? Math.max(...longitudes) : null,
      west: longitudes.length > 0 ? Math.min(...longitudes) : null,
    };

    // Calculate unique locations
    const uniqueLocations = new Set(
      data?.map((item: any) => 
        `${parseFloat(item.latitude.toFixed(4))},${parseFloat(item.longitude.toFixed(4))}`
      ) || []
    );

    return res.status(200).json({
      success: true,
      data: {
        totalPoints: count || 0,
        uniqueLocations: uniqueLocations.size,
        dateRange: {
          start: minDate?.toISOString() || null,
          end: maxDate?.toISOString() || null,
        },
        bounds,
        source: tableName,
      },
    });
  } catch (error: any) {
    console.error('Error in getHeatmapStats:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

