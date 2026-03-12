/**
 * Geofence Controller
 * 
 * REST API endpoints for geofence data (zones, events, statistics)
 * Reads from existing Supabase tables: zones, zone_events
 * 
 * @module controllers/geofence.controller
 */

import { Request, Response } from 'express';
import supabase from '../config/database';

/**
 * Get all zones with optional filters
 * GET /api/geofence/zones
 * Query params: zone_type?, status?, region?, state?, district?
 */
export const getZones = async (req: Request, res: Response) => {
  try {
    const { zone_type, status, region, state, district } = req.query;

    let query = supabase
      .from('zones')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (zone_type) {
      query = query.eq('zone_type', zone_type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (region) {
      query = query.eq('region', region);
    }
    if (state) {
      query = query.eq('state', state);
    }
    if (district) {
      query = query.eq('district', district);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching zones:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch zones',
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Error in getZones:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get single zone by ID
 * GET /api/geofence/zones/:id
 */
export const getZoneById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Zone ID is required',
      });
    }

    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Zone not found',
        });
      }
      console.error('Error fetching zone:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch zone',
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in getZoneById:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get zone events (ENTER/EXIT) with optional filters
 * GET /api/geofence/events
 * Query params: zone_id?, user_id?, event_type?, start_date?, end_date?, limit?, offset?
 */
export const getZoneEvents = async (req: Request, res: Response) => {
  try {
    const {
      zone_id,
      user_id,
      event_type,
      start_date,
      end_date,
      limit = '100',
      offset = '0',
    } = req.query;

    let query = supabase
      .from('zone_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (zone_id) {
      query = query.eq('zone_id', zone_id);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching zone events:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch zone events',
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (count || 0) > parseInt(offset as string) + parseInt(limit as string),
      },
    });
  } catch (error: any) {
    console.error('Error in getZoneEvents:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

/**
 * Get geofence statistics
 * GET /api/geofence/stats
 * Returns aggregated statistics about zones and events
 */
export const getGeofenceStats = async (req: Request, res: Response) => {
  try {
    // Get total zones count
    const { count: totalZones } = await supabase
      .from('zones')
      .select('*', { count: 'exact', head: true });

    // Get zones by type
    const { data: zonesByType } = await supabase
      .from('zones')
      .select('zone_type');

    const zonesByTypeCount = zonesByType?.reduce((acc: any, zone: any) => {
      acc[zone.zone_type] = (acc[zone.zone_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get zones by status
    const { data: zonesByStatus } = await supabase
      .from('zones')
      .select('status');

    const zonesByStatusCount = zonesByStatus?.reduce((acc: any, zone: any) => {
      acc[zone.status] = (acc[zone.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get total events count
    const { count: totalEvents } = await supabase
      .from('zone_events')
      .select('*', { count: 'exact', head: true });

    // Get events by type
    const { data: eventsByType } = await supabase
      .from('zone_events')
      .select('event_type');

    const eventsByTypeCount = eventsByType?.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get active visitors (users currently in zones)
    const { data: activeVisitorsData } = await supabase
      .from('zones')
      .select('active_visitors');

    const totalActiveVisitors = activeVisitorsData?.reduce(
      (sum: number, zone: any) => sum + (zone.active_visitors || 0),
      0
    ) || 0;

    // Get total visits
    const { data: totalVisitsData } = await supabase
      .from('zones')
      .select('total_visits');

    const totalVisits = totalVisitsData?.reduce(
      (sum: number, zone: any) => sum + (zone.total_visits || 0),
      0
    ) || 0;

    // Get total alerts
    const { data: totalAlertsData } = await supabase
      .from('zones')
      .select('total_alerts');

    const totalAlerts = totalAlertsData?.reduce(
      (sum: number, zone: any) => sum + (zone.total_alerts || 0),
      0
    ) || 0;

    // Get recent events (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { count: recentEvents } = await supabase
      .from('zone_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    return res.status(200).json({
      success: true,
      data: {
        zones: {
          total: totalZones || 0,
          byType: zonesByTypeCount,
          byStatus: zonesByStatusCount,
        },
        events: {
          total: totalEvents || 0,
          byType: eventsByTypeCount,
          recent24Hours: recentEvents || 0,
        },
        visitors: {
          active: totalActiveVisitors,
          totalVisits,
          totalAlerts,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in getGeofenceStats:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
};

