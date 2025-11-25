import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, User, CheckCircle, Filter, Loader2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Alert {
  id: string;
  tourist_id: string;
  alert_type: string;
  severity: string; // 'low' | 'medium' | 'high'
  description?: string | null;
  location_name?: string | null;
  latitude?: number | null; // Made optional in case some rows don't have it
  longitude?: number | null; // Made optional in case some rows don't have it
  created_at: string;
  resolved_at?: string | null;
  status?: string | null; // Made optional with default 'open'
}

export const Alerts: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    high: 0, // Changed from 'critical' to 'high' to match schema
    active: 0,
    resolved: 0,
    avgResponseTime: 0
  });

  // Define functions BEFORE useEffect to avoid hoisting issues
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching alerts from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('❌ Error fetching alerts:', fetchError);
        // Provide more helpful error messages
        let errorMessage = fetchError.message;
        if (fetchError.message?.includes('schema cache') || fetchError.message?.includes('relation') || fetchError.code === 'PGRST116') {
          errorMessage = 'Alerts table not found. Please ensure the table exists in Supabase and Row Level Security (RLS) policies allow access.';
        } else if (fetchError.code === '42501') {
          errorMessage = 'Permission denied. Please check your Supabase RLS policies.';
        }
        setError(errorMessage);
        return;
      }

      if (data) {
        // Ensure all alerts have a status (default to 'open' if missing)
        const processedData = data.map(alert => ({
          ...alert,
          status: alert.status || 'open'
        })) as Alert[];
        
        console.log(`✅ Successfully fetched ${processedData.length} alerts`);
        setAlerts(processedData);
      } else {
        console.log('ℹ️ No alerts found');
        setAlerts([]);
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setError(err?.message || 'Failed to fetch alerts. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get high severity alerts count (matching schema: 'low' | 'medium' | 'high')
      const { count: highCount, error: highError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'high')
        .eq('status', 'open');

      if (highError) {
        console.error('Error fetching high severity count:', highError);
      }

      // Get active alerts count (status = 'open')
      const { count: activeCount, error: activeError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (activeError) {
        console.error('Error fetching active count:', activeError);
      }

      // Get resolved today count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: resolvedCount, error: resolvedError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('resolved_at', today.toISOString());

      if (resolvedError) {
        console.error('Error fetching resolved count:', resolvedError);
      }

      // Calculate avg response time based on resolved_at - created_at
      const { data: resolvedAlerts, error: responseError } = await supabase
        .from('alerts')
        .select('created_at, resolved_at')
        .not('resolved_at', 'is', null)
        .gte('resolved_at', today.toISOString());

      if (responseError) {
        console.error('Error fetching response time data:', responseError);
      }

      let avgResponse = 0;
      if (resolvedAlerts && resolvedAlerts.length > 0) {
        const responseTimes = resolvedAlerts
          .map(alert => {
            if (alert.resolved_at && alert.created_at) {
              const created = new Date(alert.created_at).getTime();
              const resolved = new Date(alert.resolved_at).getTime();
              return (resolved - created) / (1000 * 60); // Convert to minutes
            }
            return 0;
          })
          .filter(time => time > 0);
        
        if (responseTimes.length > 0) {
          avgResponse = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        }
      }

      setStats({
        high: highCount || 0,
        active: activeCount || 0,
        resolved: resolvedCount || 0,
        avgResponseTime: Math.round(avgResponse)
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Don't set error state for stats, just log it
    }
  };

  // Fetch initial alerts and stats
  useEffect(() => {
    fetchAlerts();
    fetchStats();
    
    // Subscribe to real-time changes (only if table exists)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    try {
      channel = supabase
        .channel('alerts-realtime')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'alerts'
          },
          (payload) => {
            console.log('🔔 Alert change received:', payload);
            
            try {
              if (payload.eventType === 'INSERT') {
                const newAlert = {
                  ...payload.new,
                  status: payload.new.status || 'open'
                } as Alert;
                console.log('➕ New alert inserted:', newAlert);
                setAlerts(prev => [newAlert, ...prev]);
                fetchStats();
              } else if (payload.eventType === 'UPDATE') {
                const updatedAlert = {
                  ...payload.new,
                  status: payload.new.status || 'open'
                } as Alert;
                console.log('🔄 Alert updated:', updatedAlert);
                setAlerts(prev =>
                  prev.map(alert =>
                    alert.id === updatedAlert.id ? updatedAlert : alert
                  )
                );
                fetchStats();
              } else if (payload.eventType === 'DELETE') {
                console.log('🗑️ Alert deleted:', payload.old.id);
                setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
                fetchStats();
              }
            } catch (err) {
              console.error('❌ Error processing real-time update:', err);
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to alerts real-time updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel subscription error - table may not exist or RLS policies may be blocking access');
          } else if (status === 'TIMED_OUT') {
            console.warn('⚠️ Subscription timed out');
          } else if (status === 'CLOSED') {
            console.warn('⚠️ Subscription closed');
          }
        });
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSeverityColor = (severity: string) => {
    const normalized = severity.toLowerCase();
    switch (normalized) {
      case 'high': return 'text-red-400 bg-red-600/20 border border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20 border border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-600/20 border border-green-500/30';
      default: return 'text-gray-400 bg-gray-600/20 border border-gray-500/30';
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    const normalized = (status || 'open').toLowerCase();
    switch (normalized) {
      case 'open': return 'text-red-400 bg-red-600/20 border border-red-500/30';
      case 'resolved': return 'text-green-400 bg-green-600/20 border border-green-500/30';
      default: return 'text-gray-400 bg-gray-600/20 border border-gray-500/30';
    }
  };

  const filteredAlerts = selectedFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => {
        const status = (alert.status || 'open').toLowerCase();
        return status === selectedFilter || 
               (selectedFilter === 'active' && status === 'open');
      });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl lg:text-4xl font-medium text-white mb-2"
          >
            Alert Management System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-crypto-text-secondary text-lg"
          >
            Real-time monitoring and response coordination
          </motion.p>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="crypto-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">High Severity</p>
              <p className="text-3xl font-bold text-red-400">{stats.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>
        <motion.div 
          className="crypto-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Active Alerts</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
        <motion.div 
          className="crypto-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Resolved Today</p>
              <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div 
          className="crypto-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Avg Response Time</p>
              <p className="text-3xl font-bold text-blue-400">{stats.avgResponseTime}m</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Filter Section */}
      <motion.div 
        className="crypto-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-crypto-text-muted" />
            <span className="text-sm text-crypto-text-secondary">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'open', 'resolved'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter
                    ? 'crypto-btn text-white'
                    : 'crypto-card border border-crypto-border/30 text-crypto-text-secondary hover:border-crypto-accent/30 hover:text-crypto-text-primary'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alert Feed */}
      <motion.div 
        className="crypto-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="p-6 border-b border-crypto-border/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-crypto-text-primary">Alert Feed</h2>
            <div className="flex items-center space-x-2 crypto-card px-3 py-1 border border-crypto-accent/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-crypto-accent rounded-full"
              />
              <span className="text-crypto-text-primary font-medium text-sm">
                Live • {filteredAlerts.length} {filteredAlerts.length === 1 ? 'Alert' : 'Alerts'}
              </span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-crypto-accent" />
          </div>
        ) : error ? (
          <div className="py-10 px-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-300 font-semibold mb-2">{error}</p>
            {error.includes('table') || error.includes('schema cache') ? (
              <div className="mt-4 text-sm text-crypto-text-secondary space-y-2 max-w-2xl mx-auto">
                <p className="font-medium text-crypto-text-primary mb-3">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Ensure the <code className="bg-crypto-surface px-2 py-1 rounded">alerts</code> table exists in your Supabase database</li>
                  <li>Check that Row Level Security (RLS) policies allow SELECT operations</li>
                  <li>Verify your Supabase URL and API keys in the .env file</li>
                  <li>Run the table creation SQL in your Supabase SQL editor if the table doesn't exist</li>
                </ol>
              </div>
            ) : null}
            <button
              onClick={() => {
                fetchAlerts();
                fetchStats();
              }}
              className="mt-6 crypto-btn text-sm"
            >
              Retry
            </button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-crypto-text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-crypto-text-secondary">No alerts found matching the selected filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-crypto-border/30">
            {filteredAlerts.map((alert, index) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-crypto-surface/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm text-crypto-text-secondary flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(alert.created_at)} {formatTime(alert.created_at)}</span>
                      </span>
                      <span className="text-sm font-medium text-crypto-text-primary">{alert.alert_type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status || 'open')}`}>
                        {(alert.status || 'open').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-crypto-text-secondary" />
                        <span className="text-sm text-crypto-text-primary">
                          Tourist: <span className="text-crypto-accent font-medium">{alert.tourist_id}</span>
                        </span>
                      </div>
                      {alert.location_name && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-crypto-text-secondary" />
                          <span className="text-sm text-crypto-text-primary">{alert.location_name}</span>
                        </div>
                      )}
                      {alert.latitude != null && alert.longitude != null && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-crypto-text-secondary" />
                          <span className="text-sm text-crypto-text-secondary font-mono">
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {alert.description && (
                      <p className="text-crypto-text-secondary text-sm mb-4">{alert.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
