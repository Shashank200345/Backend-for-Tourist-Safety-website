import React, { useState, useEffect, useCallback } from 'react';
import { Users, AlertCircle, TrendingUp, Clock, Shield, Target, Download, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  
  // Real-time data states
  const [activeTourists, setActiveTourists] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState('0m');
  const [safetyScore, setSafetyScore] = useState('0%');
  
  const [totalTourists, setTotalTourists] = useState(0);
  const [incidentsResolved, setIncidentsResolved] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  
  const [incidentTrends, setIncidentTrends] = useState<Array<{ type: string; count: number; change: string }>>([]);
  const [recentIncidents, setRecentIncidents] = useState<Array<{ time: string; id: string; location: string; type: string; status: string; timestamp: number }>>([]);
  
  // Previous period data for calculating changes
  const [previousStats, setPreviousStats] = useState({
    activeTourists: 0,
    activeAlerts: 0,
    avgResponseTime: 0,
    safetyScore: 0,
    totalTourists: 0,
    incidentsResolved: 0,
  });

  // Calculate period date range
  const getPeriodDate = useCallback((period: string) => {
    const now = new Date();
    const date = new Date();
    switch (period) {
      case '24h':
        date.setHours(now.getHours() - 24);
        break;
      case '7d':
        date.setDate(now.getDate() - 7);
        break;
      case '30d':
        date.setDate(now.getDate() - 30);
        break;
      case '90d':
        date.setDate(now.getDate() - 90);
        break;
      default:
        date.setDate(now.getDate() - 7);
    }
    return date.toISOString();
  }, []);

  // Calculate percentage change
  const calculateChange = useCallback((current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }, []);

  // Format number with commas
  const formatNumber = useCallback((num: number): string => {
    return num.toLocaleString();
  }, []);

  // Fetch active tourists (count from users table + users with recent location updates)
  const fetchActiveTourists = useCallback(async () => {
    try {
      // Get total count from users table
      const { count: totalUsersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
        // Fallback to counting users with recent locations
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const oneHourAgoISO = oneHourAgo.toISOString();

        const { data: recentLocations, error: locationsError } = await supabase
          .from('user_locations')
          .select('user_id')
          .gte('created_at', oneHourAgoISO)
          .not('user_id', 'is', null);

        if (locationsError) {
          console.error('Error fetching user locations:', locationsError);
          return 0;
        }

        if (!recentLocations || recentLocations.length === 0) {
          return 0;
        }

        const uniqueUsers = new Set(recentLocations.map((loc: any) => loc.user_id).filter(Boolean));
        return uniqueUsers.size;
      }

      // Return total count from users table
      return totalUsersCount || 0;
    } catch (err) {
      console.error('Error in fetchActiveTourists:', err);
      return 0;
    }
  }, []);

  // Fetch active alerts (from alerts table or zones)
  const fetchActiveAlerts = useCallback(async () => {
    try {
      // First try to get from alerts table
      const { count: alertsCount, error: alertsError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'investigating', 'active']);

      if (!alertsError && alertsCount !== null) {
        return alertsCount;
      }

      // Fallback to zones total_alerts
      const { data: zones, error } = await supabase
        .from('zones')
        .select('total_alerts')
        .eq('status', 'ACTIVE');

      if (error) {
        console.error('Error fetching active alerts:', error);
        return 0;
      }

      const total = zones?.reduce((sum, zone) => sum + (zone.total_alerts || 0), 0) || 0;
      return total;
    } catch (err) {
      console.error('Error in fetchActiveAlerts:', err);
      return 0;
    }
  }, []);

  // Fetch total tourists count
  const fetchTotalTourists = useCallback(async () => {
    try {
      const periodDate = getPeriodDate(selectedPeriod);
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', periodDate);

      if (error) {
        console.error('Error fetching total tourists:', error);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.error('Error in fetchTotalTourists:', err);
      return 0;
    }
  }, [selectedPeriod, getPeriodDate]);

  // Fetch incidents resolved (zone events or alerts resolved)
  const fetchIncidentsResolved = useCallback(async () => {
    try {
      const periodDate = getPeriodDate(selectedPeriod);
      // Count zone events as incidents
      const { count, error } = await supabase
        .from('zone_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'ENTER')
        .gte('created_at', periodDate);

      if (error) {
        console.error('Error fetching incidents resolved:', error);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.error('Error in fetchIncidentsResolved:', err);
      return 0;
    }
  }, [selectedPeriod, getPeriodDate]);

  // Fetch incident trends by type (based on zone types)
  const fetchIncidentTrends = useCallback(async () => {
    try {
      const periodDate = getPeriodDate(selectedPeriod);
      
      // Get zone events with zone information
      const { data: events, error: eventsError } = await supabase
        .from('zone_events')
        .select('zone_id, event_type, created_at')
        .eq('event_type', 'ENTER')
        .gte('created_at', periodDate);

      if (eventsError) {
        console.error('Error fetching zone events:', eventsError);
        return [];
      }

      if (!events || events.length === 0) {
        return [];
      }

      // Get zone types for the events
      const zoneIds = [...new Set(events.map((e: any) => e.zone_id))];
      const { data: zones, error: zonesError } = await supabase
        .from('zones')
        .select('id, zone_type')
        .in('id', zoneIds);

      if (zonesError) {
        console.error('Error fetching zones:', zonesError);
        return [];
      }

      const zoneMap = new Map((zones || []).map((z: any) => [z.id, z.zone_type]));

      // Group by zone type
      const trends: Record<string, number> = {};
      events.forEach((event: any) => {
        const zoneType = zoneMap.get(event.zone_id) || 'MONITORED';
        const typeName = zoneType === 'RESTRICTED' ? 'Restricted Zone Entry' :
                        zoneType === 'EMERGENCY' ? 'Emergency Zone Entry' :
                        zoneType === 'SAFE' ? 'Safe Zone Entry' :
                        'Monitored Zone Entry';
        trends[typeName] = (trends[typeName] || 0) + 1;
      });

      // Convert to array format with change calculation (simplified)
      return Object.entries(trends).map(([type, count]) => ({
        type,
        count,
        change: '+0%', // Could calculate based on previous period
      }));
    } catch (err) {
      console.error('Error in fetchIncidentTrends:', err);
      return [];
    }
  }, [selectedPeriod, getPeriodDate]);

  // Fetch recent incidents (from alerts table first, then zone_events as fallback)
  const fetchRecentIncidents = useCallback(async () => {
    try {
      const incidents: Array<{ time: string; id: string; location: string; type: string; status: string }> = [];

      // Try to get from alerts table first
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('id, type, location, status, created_at, tourist_id, severity')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!alertsError && alerts && alerts.length > 0) {
        alerts.forEach((alert: any) => {
          const date = new Date(alert.created_at);
          incidents.push({
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            id: alert.tourist_id || `ALT-${alert.id.substring(0, 8).toUpperCase()}`,
            location: alert.location || 'Unknown Location',
            type: alert.type || alert.severity || 'Alert',
            status: alert.status === 'open' || alert.status === 'active' ? 'Active' :
                   alert.status === 'investigating' ? 'Investigating' : 
                   alert.status === 'resolved' || alert.status === 'closed' ? 'Resolved' : 'Active',
            timestamp: date.getTime(),
          });
        });
      }

      // Also get from zone_events for zone entry incidents
      const { data: events, error: eventsError } = await supabase
        .from('zone_events')
        .select(`
          id,
          event_type,
          latitude,
          longitude,
          created_at,
          zone_id,
          user_id
        `)
        .eq('event_type', 'ENTER')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!eventsError && events && events.length > 0) {
        // Fetch zone names for the events
        const zoneIds = [...new Set(events.map((e: any) => e.zone_id))];
        const { data: zones } = await supabase
          .from('zones')
          .select('id, name, zone_type, risk_level')
          .in('id', zoneIds);

        const zoneMap = new Map((zones || []).map((z: any) => [z.id, z]));

        events.forEach((event: any) => {
          const date = new Date(event.created_at);
          const zone = zoneMap.get(event.zone_id);
          
          // Format zone type for display
          const zoneTypeDisplay = zone?.zone_type === 'RESTRICTED' ? 'Restricted Zone Entry' :
                                 zone?.zone_type === 'EMERGENCY' ? 'Emergency Zone Entry' :
                                 zone?.zone_type === 'SAFE' ? 'Safe Zone Entry' :
                                 'Monitored Zone Entry';

          incidents.push({
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            id: event.user_id ? `USR-${event.user_id.substring(0, 8).toUpperCase()}` : `EVT-${event.id.substring(0, 8).toUpperCase()}`,
            location: zone?.name || `${event.latitude?.toFixed(4)}, ${event.longitude?.toFixed(4)}`,
            type: zoneTypeDisplay,
            status: zone?.risk_level === 'CRITICAL' || zone?.risk_level === 'HIGH' ? 'Active' : 'Investigating',
            timestamp: date.getTime(),
          });
        });
      }

      // Sort by timestamp (most recent first) and limit to 10
      return incidents
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map(({ timestamp, ...incident }) => incident); // Remove timestamp before returning
    } catch (err) {
      console.error('Error in fetchRecentIncidents:', err);
      return [];
    }
  }, []);

  // Calculate average response time (simplified - based on zone events)
  const calculateAvgResponseTime = useCallback(async () => {
    try {
      const periodDate = getPeriodDate(selectedPeriod);
      const { data: events, error } = await supabase
        .from('zone_events')
        .select('created_at')
        .gte('created_at', periodDate)
        .limit(100);

      if (error || !events || events.length === 0) {
        return '0m';
      }

      // Simplified calculation - in real app, you'd track actual response times
      // For now, we'll use a placeholder calculation
      const avgMinutes = 4.2; // This would be calculated from actual response time data
      return `${avgMinutes.toFixed(1)}m`;
    } catch (err) {
      console.error('Error calculating avg response time:', err);
      return '0m';
    }
  }, [selectedPeriod, getPeriodDate]);

  // Calculate safety score
  const calculateSafetyScore = useCallback(async () => {
    try {
      const { data: zones, error } = await supabase
        .from('zones')
        .select('zone_type, risk_level, total_alerts, total_visits')
        .eq('status', 'ACTIVE');

      if (error || !zones || zones.length === 0) {
        return '0%';
      }

      // Calculate safety score based on zones and alerts
      const totalZones = zones.length;
      const safeZones = zones.filter(z => z.zone_type === 'SAFE').length;
      const totalAlerts = zones.reduce((sum, z) => sum + (z.total_alerts || 0), 0);
      const totalVisits = zones.reduce((sum, z) => sum + (z.total_visits || 0), 0);

      // Safety score formula: (safe zones ratio - alerts ratio) * 100
      const safeRatio = totalZones > 0 ? safeZones / totalZones : 0;
      const alertRatio = totalVisits > 0 ? Math.min(totalAlerts / totalVisits, 1) : 0;
      const score = Math.max(0, Math.min(100, (safeRatio - alertRatio * 0.5) * 100));
      
      return `${score.toFixed(1)}%`;
    } catch (err) {
      console.error('Error calculating safety score:', err);
      return '0%';
    }
  }, []);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [tourists, alerts, total, resolved, trends, incidents, responseTime, safety] = await Promise.all([
        fetchActiveTourists(),
        fetchActiveAlerts(),
        fetchTotalTourists(),
        fetchIncidentsResolved(),
        fetchIncidentTrends(),
        fetchRecentIncidents(),
        calculateAvgResponseTime(),
        calculateSafetyScore(),
      ]);

      setActiveTourists(tourists);
      setActiveAlerts(alerts);
      setTotalTourists(total);
      setIncidentsResolved(resolved);
      setIncidentTrends(trends);
      setRecentIncidents(incidents);
      setAvgResponseTime(responseTime);
      setSafetyScore(safety);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [
    fetchActiveTourists,
    fetchActiveAlerts,
    fetchTotalTourists,
    fetchIncidentsResolved,
    fetchIncidentTrends,
    fetchRecentIncidents,
    calculateAvgResponseTime,
    calculateSafetyScore,
  ]);

  // Load data on mount and when period changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, selectedPeriod]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to users table changes (for active tourists count)
    const usersChannel = supabase
      .channel('dashboard-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Subscribe to user_profiles changes
    const userProfilesChannel = supabase
      .channel('dashboard-user-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Subscribe to user_locations changes (for additional tracking)
    const userLocationsChannel = supabase
      .channel('dashboard-user-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Subscribe to zones changes
    const zonesChannel = supabase
      .channel('dashboard-zones')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zones',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Subscribe to zone_events changes
    const zoneEventsChannel = supabase
      .channel('dashboard-zone-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zone_events',
        },
        (payload) => {
          console.log('Zone event change detected:', payload);
          // Immediately refresh recent incidents when zone events change
          fetchRecentIncidents().then((incidents) => {
            setRecentIncidents(incidents);
          });
          // Also refresh all dashboard data
          loadDashboardData();
        }
      )
      .subscribe();

    // Subscribe to alerts changes (if alerts table exists)
    const alertsChannel = supabase
      .channel('dashboard-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('Alert change detected:', payload);
          // Immediately refresh recent incidents when alerts change
          fetchRecentIncidents().then((incidents) => {
            setRecentIncidents(incidents);
          });
          // Also refresh all dashboard data
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(userProfilesChannel);
      supabase.removeChannel(userLocationsChannel);
      supabase.removeChannel(zonesChannel);
      supabase.removeChannel(zoneEventsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [loadDashboardData]);

  // Calculate stats with changes
  const stats = [
    { 
      label: 'Active Tourists', 
      value: formatNumber(activeTourists), 
      change: calculateChange(activeTourists, previousStats.activeTourists), 
      icon: Users, 
      color: 'from-green-500 to-emerald-500', 
      bgColor: 'bg-green-500/10' 
    },
    { 
      label: 'Active Alerts', 
      value: formatNumber(activeAlerts), 
      change: calculateChange(activeAlerts, previousStats.activeAlerts), 
      icon: AlertCircle, 
      color: 'from-green-500 to-emerald-500', 
      bgColor: 'bg-green-500/10' 
    },
    { 
      label: 'Avg Response Time', 
      value: avgResponseTime, 
      change: '-15%', // Placeholder - calculate from actual data
      icon: Clock, 
      color: 'from-green-500 to-emerald-600', 
      bgColor: 'bg-green-500/10' 
    },
    { 
      label: 'Safety Score', 
      value: safetyScore, 
      change: calculateChange(parseFloat(safetyScore), previousStats.safetyScore), 
      icon: Shield, 
      color: 'from-green-500 to-emerald-500', 
      bgColor: 'bg-green-500/10' 
    },
  ];

  const analyticsMetrics = [
    { 
      label: 'Total Tourists', 
      value: formatNumber(totalTourists), 
      change: calculateChange(totalTourists, previousStats.totalTourists), 
      trend: totalTourists >= previousStats.totalTourists ? 'up' : 'down' 
    },
    { 
      label: 'Incidents Resolved', 
      value: formatNumber(incidentsResolved), 
      change: calculateChange(incidentsResolved, previousStats.incidentsResolved), 
      trend: incidentsResolved >= previousStats.incidentsResolved ? 'up' : 'down' 
    },
    { 
      label: 'Avg Response Time', 
      value: avgResponseTime, 
      change: '-12.3%', 
      trend: 'down' 
    },
    { 
      label: 'Safety Score', 
      value: safetyScore, 
      change: calculateChange(parseFloat(safetyScore), previousStats.safetyScore), 
      trend: parseFloat(safetyScore) >= previousStats.safetyScore ? 'up' : 'down' 
    },
  ];

  const customReports = [
    { icon: Users, title: 'Tourist Demographics', description: 'Age, nationality & travel patterns' },
    { icon: Target, title: 'Response Metrics', description: 'Dispatch times & resolution rates' },
    { icon: Calendar, title: 'Seasonal Analysis', description: 'Demand peaks & predictive insights' },
  ];

  // Update previous stats when current stats change (for next period comparison)
  useEffect(() => {
    setPreviousStats({
      activeTourists,
      activeAlerts,
      avgResponseTime: parseFloat(avgResponseTime) || 0,
      safetyScore: parseFloat(safetyScore) || 0,
      totalTourists,
      incidentsResolved,
    });
  }, [activeTourists, activeAlerts, avgResponseTime, safetyScore, totalTourists, incidentsResolved]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl lg:text-4xl font-medium text-white mb-2"
            style={{ color: '#ffffff' }}
          >
            Real-Time Monitoring Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-crypto-text-secondary text-lg"
          >
            Live monitoring and incident management
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center space-x-2"
        >
          <div className="crypto-card px-4 py-2 border border-crypto-accent/20 ">
            <div className="flex items-center space-x-3">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-crypto-accent rounded-full"
              />
              <span className="text-crypto-text-primary font-medium">Live</span>
            </div>
          </div>
        </motion.div>
      </motion.div>





      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden"
          >
            <div className="crypto-card p-6 hover:border-crypto-accent/30 hover: transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} `}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
                {loading ? (
                  <div className="w-16 h-6 bg-slate-700 rounded-full animate-pulse"></div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 500 }}
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${
                      stat.change.startsWith('+') 
                        ? 'text-crypto-accent bg-crypto-accent/20 border-crypto-accent/30' 
                        : stat.change.startsWith('-')
                        ? 'text-red-400 bg-red-500/20 border-red-500/30'
                        : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                    }`}
                  >
                    {stat.change}
                  </motion.div>
                )}
              </div>
              <div>
                <p className="text-crypto-text-secondary text-sm font-medium mb-2">{stat.label}</p>
                {loading ? (
                  <div className="h-9 w-24 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <motion.p 
                    key={stat.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold text-crypto-text-primary"
                  >
                    {stat.value}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
          {/* Analytics Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="crypto-card p-6 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-crypto-text-primary">Analytics & Reporting</h2>
                <p className="text-sm text-crypto-text-secondary">Comprehensive insights and trend analysis</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="crypto-input px-4 py-2 text-sm rounded-lg"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="crypto-btn flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Key Analytics Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                className="crypto-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-crypto-text-secondary">{metric.label}</h3>
                  {loading ? (
                    <div className="w-16 h-5 bg-slate-700 rounded-full animate-pulse"></div>
                  ) : (
                    <div
                      className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                        metric.trend === 'up' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                      }`}
                    >
                      <TrendingUp className={`h-3 w-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{metric.change}</span>
                    </div>
                  )}
                </div>
                {loading ? (
                  <div className="h-9 w-32 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <motion.p 
                    key={metric.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-semibold text-crypto-text-primary"
                  >
                    {metric.value}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>

          

          {/* Incident Type Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.6 }}
            className="crypto-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-crypto-text-primary">Incident Type Analysis</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 animate-pulse">
                    <div className="h-4 w-24 bg-slate-700 rounded mb-2 mx-auto"></div>
                    <div className="h-8 w-16 bg-slate-700 rounded mb-2 mx-auto"></div>
                    <div className="h-5 w-20 bg-slate-700 rounded mx-auto"></div>
                  </div>
                ))
              ) : incidentTrends.length > 0 ? (
                incidentTrends.map((incident, index) => (
                  <motion.div
                    key={incident.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 + index * 0.1, duration: 0.4 }}
                    className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 text-center hover:bg-crypto-surface/50 transition-all duration-200"
                  >
                    <h3 className="font-medium mb-2 text-crypto-text-primary">{incident.type}</h3>
                    <p className="text-2xl font-bold mb-2 text-crypto-text-primary">{incident.count}</p>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center space-x-1 ${
                        incident.change.startsWith('+') ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'
                      }`}
                    >
                      <TrendingUp className={`h-3 w-3 ${incident.change.startsWith('+') ? '' : 'rotate-180'}`} />
                      <span>{incident.change}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center text-crypto-text-secondary py-8">
                  No incident data available for the selected period
                </div>
              )}
            </div>
          </motion.div>

          {/* Custom Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.6 }}
            className="crypto-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-crypto-text-primary">Custom Reports</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customReports.map((report, index) => (
                <motion.button
                  key={report.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.9 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-crypto-surface/30 rounded-lg p-6 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200 text-left hover:bg-crypto-surface/50"
                >
                  <report.icon className="h-8 w-8 text-crypto-accent mb-4" />
                  <h3 className="font-medium mb-2 text-crypto-text-primary">{report.title}</h3>
                  <p className="text-sm text-crypto-text-secondary">{report.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
      </div>

      
      {/* Recent Incidents */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.6 }}
        className="crypto-card p-6 hover:border-crypto-accent/30 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 45 }}
              transition={{ duration: 0.4 }}
              className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
            >
              <Target className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-crypto-text-primary">Recent Incidents</h2>
              <p className="text-sm text-crypto-text-secondary">Latest incident reports and status updates</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="crypto-btn text-sm"
          >
            View All
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-crypto-text-muted text-sm border-b border-crypto-border/30">
                <th className="pb-4 font-medium">Time</th>
                <th className="pb-4 font-medium">Tourist ID</th>
                <th className="pb-4 font-medium">Location</th>
                <th className="pb-4 font-medium">Alert Type</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-crypto-border/20">
                    <td className="py-4"><div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div></td>
                    <td className="py-4"><div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div></td>
                    <td className="py-4"><div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div></td>
                    <td className="py-4"><div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div></td>
                    <td className="py-4"><div className="h-6 w-20 bg-slate-700 rounded-full animate-pulse"></div></td>
                    <td className="py-4"><div className="h-6 w-16 bg-slate-700 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : recentIncidents.length > 0 ? (
                recentIncidents.map((incident, index) => (
                  <motion.tr 
                    key={`${incident.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ backgroundColor: 'rgba(42, 42, 42, 0.3)' }}
                    className="border-b border-crypto-border/20 hover:bg-crypto-surface/20 transition-all duration-200 group"
                  >
                    <td className="py-4 text-sm text-crypto-text-secondary font-mono">
                      {incident.time}
                    </td>
                    <td className="py-4 text-sm font-medium text-crypto-accent">
                      {incident.id}
                    </td>
                    <td className="py-4 text-sm text-crypto-text-secondary">
                      {incident.location}
                    </td>
                    <td className="py-4 text-sm text-crypto-text-primary">
                      {incident.type}
                    </td>
                    <td className="py-4">
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${
                          incident.status === 'Active' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          incident.status === 'Investigating' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-crypto-accent/20 text-crypto-accent border-crypto-accent/30'
                        }`}
                      >
                        {incident.status}
                      </motion.span>
                    </td>
                    <td className="py-4">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="crypto-btn text-xs px-4 py-1"
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-crypto-text-secondary">
                    No recent incidents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

