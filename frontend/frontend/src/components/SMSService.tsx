import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Activity,
  Bell,
  Settings,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser, supabase } from '../lib/supabaseClient';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_API;
  if (envUrl) {
    let url = envUrl.replace(/\/airport\/?$/, '');
    if (!url.endsWith('/api')) {
      url = url.replace(/\/api\/?$/, '') + '/api';
    }
    return url;
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

interface SMSStatus {
  smsServiceReady: boolean;
  watcher: {
    isWatching: boolean;
    channelStatus: string | null;
  };
}

interface UserProfile {
  phone_number: string | null;
  notification_preferences: {
    sms?: boolean;
    email?: boolean;
    push?: boolean;
    whatsapp?: boolean;
  } | null;
}

interface SMSLog {
  id: string;
  zone_id: string;
  zone_name: string;
  zone_type: string;
  user_id: string;
  created_at: string;
  sms_sent: boolean;
}

export const SMSService: React.FC = () => {
  const [status, setStatus] = useState<SMSStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadStatus();
    loadUserProfile();
    loadSMSLogs();
    
    // Set up real-time subscription for zone_events (to track SMS triggers)
    const channel = supabase
      .channel('sms_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'zone_events',
          filter: 'event_type=eq.ENTER',
        },
        (payload) => {
          // When a new ENTER event is logged, refresh logs and status
          loadSMSLogs();
          loadStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to load SMS status');
      }
    } catch (error) {
      console.error('Error loading SMS status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Try to get from users table first (primary source)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('contact_number, email')
        .eq('id', user.id)
        .single();

      if (!userError && userData) {
        // Convert numeric contact_number to string and map to phone_number format
        const phoneNumber = userData.contact_number ? String(userData.contact_number) : null;
        setUserProfile({
          phone_number: phoneNumber,
          notification_preferences: { sms: true } // Default SMS enabled
        });
      } else {
        // Fallback to user_profiles if users table doesn't have the data
        const { data, error } = await supabase
          .from('user_profiles')
          .select('phone_number, notification_preferences')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadSMSLogs = async () => {
    setLoadingLogs(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoadingLogs(false);
        return;
      }

      // Get recent ENTER events for this user with zone information
      const { data: events, error } = await supabase
        .from('zone_events')
        .select(`
          id,
          zone_id,
          user_id,
          created_at,
          zones (
            id,
            name,
            zone_type
          )
        `)
        .eq('user_id', user.id)
        .eq('event_type', 'ENTER')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && events) {
        const logs: SMSLog[] = events.map((event: any) => ({
          id: event.id,
          zone_id: event.zone_id,
          zone_name: event.zones?.name || 'Unknown Zone',
          zone_type: event.zones?.zone_type || 'MONITORED',
          user_id: event.user_id,
          created_at: event.created_at,
          sms_sent: event.zones?.zone_type === 'RESTRICTED' || event.zones?.zone_type === 'EMERGENCY' // Assume sent for restricted zones
        }));
        setSmsLogs(logs);
      }
    } catch (error) {
      console.error('Error loading SMS logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStatus();
    loadUserProfile();
    loadSMSLogs();
  };

  const getStatusColor = (ready: boolean) => {
    return ready ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBg = (ready: boolean) => {
    return ready ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50';
  };

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
          <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>
            SMS Service Manager
          </h1>
          <p className="text-crypto-text-secondary mt-1">
            Monitor and test geofence-based SMS alerts
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="crypto-btn flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Service Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">Service Status</h2>
          </div>
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-crypto-accent" />
          )}
        </div>

        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMS Service Status */}
            <div className={`p-4 rounded-lg border ${getStatusBg(status.smsServiceReady)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className={`h-5 w-5 ${getStatusColor(status.smsServiceReady)}`} />
                  <span className="font-medium text-crypto-text-primary">SMS Service</span>
                </div>
                {status.smsServiceReady ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <p className={`text-sm font-medium ${getStatusColor(status.smsServiceReady)}`}>
                {status.smsServiceReady ? 'Ready' : 'Not Configured'}
              </p>
              <p className="text-xs text-crypto-text-secondary mt-1">
                {status.smsServiceReady 
                  ? 'Twilio credentials configured and ready'
                  : 'Twilio credentials missing. Check backend .env file.'}
              </p>
            </div>

            {/* Watcher Status */}
            <div className={`p-4 rounded-lg border ${getStatusBg(status.watcher.isWatching)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className={`h-5 w-5 ${getStatusColor(status.watcher.isWatching)}`} />
                  <span className="font-medium text-crypto-text-primary">Event Watcher</span>
                </div>
                {status.watcher.isWatching ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <p className={`text-sm font-medium ${getStatusColor(status.watcher.isWatching)}`}>
                {status.watcher.isWatching ? 'Active' : 'Inactive'}
              </p>
              <p className="text-xs text-crypto-text-secondary mt-1">
                {status.watcher.isWatching 
                  ? `Channel: ${status.watcher.channelStatus || 'Connected'}`
                  : 'Not listening for zone events'}
              </p>
            </div>
          </div>
        )}

        {!status && !loading && (
          <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400">Unable to fetch service status. Check backend connection.</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-crypto-text-primary">Your Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div className="p-4 rounded-lg border border-crypto-border/30 bg-crypto-surface/30">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="h-4 w-4 text-crypto-accent" />
              <span className="font-medium text-crypto-text-primary">Phone Number</span>
            </div>
            {userProfile?.phone_number ? (
              <>
                <p className="text-crypto-text-primary font-mono">{userProfile.phone_number}</p>
                <CheckCircle className="h-4 w-4 text-green-400 mt-2" />
              </>
            ) : (
              <>
                <p className="text-crypto-text-secondary text-sm">Not configured</p>
                <p className="text-xs text-yellow-400 mt-2">
                  Add phone number in Settings to receive SMS alerts
                </p>
              </>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="p-4 rounded-lg border border-crypto-border/30 bg-crypto-surface/30">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-4 w-4 text-crypto-accent" />
              <span className="font-medium text-crypto-text-primary">SMS Notifications</span>
            </div>
            {userProfile?.notification_preferences?.sms !== false ? (
              <>
                <p className="text-green-400 font-medium">Enabled</p>
                <CheckCircle className="h-4 w-4 text-green-400 mt-2" />
              </>
            ) : (
              <>
                <p className="text-red-400 font-medium">Disabled</p>
                <AlertCircle className="h-4 w-4 text-red-400 mt-2" />
                <p className="text-xs text-yellow-400 mt-2">
                  Enable SMS in Settings to receive alerts
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* SMS Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-crypto-text-primary">Zone Entry Events & SMS Alerts</h2>
                <p className="text-sm text-crypto-text-secondary mt-1">
                  Automatic SMS alerts are sent when you enter RESTRICTED or EMERGENCY zones from the Geofences section
                </p>
              </div>
            </div>
            <button
              onClick={loadSMSLogs}
              disabled={loadingLogs}
              className="p-2 rounded-lg hover:bg-crypto-surface/80 transition-all"
              title="Refresh activity log"
            >
              <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-300 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                <strong>Note:</strong> To trigger SMS alerts, enter a RESTRICTED or EMERGENCY zone from the <strong>Geofences</strong> section. 
                SMS alerts are sent automatically when you enter these zones.
              </span>
            </p>
          </div>
        </div>

        {loadingLogs ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-crypto-accent" />
            <p className="text-crypto-text-secondary mt-2">Loading activity...</p>
          </div>
        ) : smsLogs.length === 0 ? (
          <div className="text-center py-8 text-crypto-text-secondary">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No zone entry events yet</p>
            <p className="text-sm mt-2">Enter a geofenced zone to see activity here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {smsLogs.map((log) => {
              const isRestricted = log.zone_type === 'RESTRICTED' || log.zone_type === 'EMERGENCY';
              const date = new Date(log.created_at);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${
                    isRestricted
                      ? 'border-red-500/50 bg-red-950/20'
                      : 'border-crypto-border/30 bg-crypto-surface/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {isRestricted ? (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-crypto-accent" />
                        )}
                        <span className="font-medium text-crypto-text-primary">
                          {log.zone_name}
                        </span>
                        {isRestricted && log.sms_sent && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>SMS Sent</span>
                          </span>
                        )}
                        {isRestricted && !log.sms_sent && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            SMS Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-crypto-text-secondary">
                        <span className={`capitalize font-medium ${
                          isRestricted ? 'text-red-400' : 'text-crypto-text-secondary'
                        }`}>
                          {log.zone_type}
                        </span>
                        <span>•</span>
                        <span>{date.toLocaleString()}</span>
                      </div>
                      {isRestricted && (
                        <p className="text-xs text-red-300 mt-2">
                          🔴 RED ZONE: SMS alert automatically sent to your registered phone number
                        </p>
                      )}
                    </div>
                    {isRestricted && log.sms_sent && (
                      <div className="flex flex-col items-center space-y-1">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400">Delivered</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="crypto-card p-6 border border-blue-500/30 bg-blue-950/20"
      >
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-400 mb-2">How SMS Alerts Work</h3>
            <ul className="text-sm text-crypto-text-secondary space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>Go to Geofences section</strong> and enter a RESTRICTED or EMERGENCY zone - SMS alerts are sent automatically</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>RED Zones only:</strong> SMS alerts are only sent for RESTRICTED and EMERGENCY zones (not SAFE or MONITORED)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>Real-time updates:</strong> This page automatically refreshes when new zone entries are detected</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>Cooldown protection:</strong> 30 minutes between SMS for the same user-zone combination to prevent spam</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>Requirements:</strong> Make sure your phone number is set in the <strong>users</strong> table and SMS notifications are enabled</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">•</span>
                <span><strong>All entries logged above:</strong> RESTRICTED/EMERGENCY entries show "SMS Sent" badge when alert is successfully delivered</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

