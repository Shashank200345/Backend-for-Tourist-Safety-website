// src/components/Alerts.tsx
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, MapPin, User, CheckCircle, Send, Filter, Shield, Heart, Flame, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Alert {
  id: string;
  created_at: string;
  alert_type: string;
  severity: string;
  tourist_id: string;
  location_name?: string;
  description?: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export const Alerts: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAuthorityFilter, setSelectedAuthorityFilter] = useState<'all' | 'police' | 'hospital' | 'fire' | 'disaster'>('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    critical: 0,
    active: 0,
    resolved: 0,
    avgResponseTime: 0
  });
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const isSirenMutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);

  // Sync ref with state
  useEffect(() => {
    isSirenMutedRef.current = isSirenMuted;
  }, [isSirenMuted]);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Audio context initialization failed:', error);
    }

    return () => {
      // Cleanup audio context on unmount
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Function to play emergency siren
  const playEmergencySiren = () => {
    if (isSirenMutedRef.current || !audioContextRef.current) return;

    try {
      // Resume audio context if suspended (required for browser autoplay policies)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Stop any existing siren
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current = null;
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      
      // Create siren effect with frequency modulation
      const startTime = audioContext.currentTime;
      const duration = 10; // Play for 3 seconds
      
      // Frequency sweep for siren effect
      oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, startTime + 1);
      oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + 1.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, startTime + 2);
      oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + 2.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, startTime + 3);

      // Gain envelope (fade in/out)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, startTime + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      sirenOscillatorRef.current = oscillator;
      sirenGainRef.current = gainNode;

      // Clean up after siren finishes
      oscillator.onended = () => {
        sirenOscillatorRef.current = null;
        sirenGainRef.current = null;
      };
    } catch (error) {
      console.error('Error playing siren:', error);
    }
  };

  // Fetch initial alerts
  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('Alert change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new as Alert;
            setAlerts(prev => [newAlert, ...prev]);
            
            // Play emergency siren when a new alert is inserted
            playEmergencySiren();
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev =>
              prev.map(alert =>
                alert.id === payload.new.id ? payload.new as Alert : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
          
          // Recalculate stats when alerts change
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Re-fetch stats whenever alerts change
  useEffect(() => {
    fetchStats();
  }, [alerts]);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    if (data) {
      setAlerts(data as Alert[]);
    }
  };

  const fetchStats = async () => {
    // Get critical alerts count
    const { count: criticalCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .eq('status', 'open');

    // Get active alerts count
    const { count: activeCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'investigating']);

    // Get resolved today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: resolvedCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('resolved_at', today.toISOString());

    // Calculate avg response time (if you have a response_time column)
    // This is a placeholder - adjust based on your schema
    const { data: responseData } = await supabase
      .from('alerts')
      .select('response_time')
      .not('response_time', 'is', null)
      .gte('created_at', today.toISOString());

    const avgResponse = responseData && responseData.length > 0
      ? responseData.reduce((sum, a) => sum + (a.response_time || 0), 0) / responseData.length
      : 0;

    setStats({
      critical: criticalCount || 0,
      active: activeCount || 0,
      resolved: resolvedCount || 0,
      avgResponseTime: Math.round(avgResponse)
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getSeverityColor = (severity: string) => {
    const normalized = severity.toLowerCase();
    switch (normalized) {
      case 'critical': return 'text-red-400 bg-red-600/20';
      case 'high': return 'text-orange-400 bg-orange-600/20';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20';
      case 'low': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'open':
      case 'active': return 'text-red-400 bg-red-600/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-600/20';
      case 'acknowledged': return 'text-blue-400 bg-blue-600/20';
      case 'resolved': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  // Helper function to determine which authority is required for an alert
  const getRequiredAuthority = (alert: Alert): 'police' | 'hospital' | 'fire' | 'disaster' | null => {
    const alertType = (alert.alert_type || '').toLowerCase();
    const description = (alert.description || '').toLowerCase();
    const combinedText = `${alertType} ${description}`;

    // Police-related keywords
    const policeKeywords = ['theft', 'robbery', 'assault', 'violence', 'abuse', 'crime', 'stolen', 'missing', 'kidnap', 'harassment', 'fraud', 'vandalism', 'police', 'security', 'law', 'legal'];
    
    // Hospital/Medical keywords
    const hospitalKeywords = ['medical', 'hospital', 'ambulance', 'injury', 'accident', 'hurt', 'wound', 'bleeding', 'unconscious', 'pain', 'sick', 'illness', 'heart', 'breathing', 'emergency medical', 'health', 'doctor', 'healthcare'];
    
    // Fire-related keywords
    const fireKeywords = ['fire', 'smoke', 'burning', 'blaze', 'flame', 'ignition', 'combustion', 'extinguish', 'firefighter'];
    
    // Disaster-related keywords
    const disasterKeywords = ['earthquake', 'flood', 'landslide', 'cyclone', 'tsunami', 'storm', 'avalanche', 'disaster', 'natural disaster', 'emergency evacuation', 'rescue'];

    // Check keywords (order matters - more specific first)
    if (disasterKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'disaster';
    }
    if (fireKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'fire';
    }
    if (hospitalKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'hospital';
    }
    if (policeKeywords.some(keyword => combinedText.includes(keyword))) {
      return 'police';
    }

    // Default based on severity - critical might need multiple authorities
    if (alert.severity?.toLowerCase() === 'critical') {
      return 'police'; // Default for critical alerts
    }

    return null; // Unknown/General alert
  };

  const handleEmergencyAction = async (alertId: string, actionType: 'police' | 'hospital' | 'fire' | 'disaster') => {
    // Handle emergency action button click
    console.log(`Alert ${alertId}: ${actionType} action triggered`);
    
    // You can add logic here to:
    // - Call emergency services API
    // - Update alert status
    // - Send notifications
    // - Log the action in database
    
    try {
      // Example: Update alert with emergency action
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'investigating',
          // You might want to add an emergency_action field
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert:', error);
      } else {
        console.log(`${actionType} action dispatched for alert ${alertId}`);
      }
    } catch (error) {
      console.error('Error handling emergency action:', error);
    }
  };

  // Helper to count alerts by authority
  const getAuthorityCount = (authority: 'police' | 'hospital' | 'fire' | 'disaster' | 'all'): number => {
    if (authority === 'all') return alerts.length;
    
    // Filter by status first (if status filter is applied)
    const statusFiltered = selectedFilter === 'all' 
      ? alerts 
      : alerts.filter(alert => {
          const normalizedStatus = alert.status.toLowerCase();
          return normalizedStatus === selectedFilter || 
                 (selectedFilter === 'active' && ['open', 'active'].includes(normalizedStatus));
        });
    
    return statusFiltered.filter(alert => getRequiredAuthority(alert) === authority).length;
  };

  const filteredAlerts = alerts.filter(alert => {
    // Filter by status
    let statusMatch = true;
    if (selectedFilter !== 'all') {
      const normalizedStatus = alert.status.toLowerCase();
      statusMatch = normalizedStatus === selectedFilter || 
                    (selectedFilter === 'active' && ['open', 'active'].includes(normalizedStatus));
    }

    // Filter by authority
    let authorityMatch = true;
    if (selectedAuthorityFilter !== 'all') {
      const requiredAuthority = getRequiredAuthority(alert);
      authorityMatch = requiredAuthority === selectedAuthorityFilter;
    }

    return statusMatch && authorityMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* ... rest of your existing JSX, but update the stats cards to use stats state ... */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="crypto-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
            </div>
            {/* ... icon ... */}
          </div>
        </motion.div>
        {/* Update other stat cards similarly */}
      </div>

      {/* Alert Feed - update to use real data */}
      <motion.div className="crypto-card">
        <div className="p-6 border-b border-crypto-border/30 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-crypto-text-primary">Alert Feed</h2>
          
          {/* Siren Mute/Unmute Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSirenMuted(!isSirenMuted)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isSirenMuted
                ? 'bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-400'
                : 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400'
            }`}
            title={isSirenMuted ? 'Unmute Siren' : 'Mute Siren'}
          >
            {isSirenMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isSirenMuted ? 'Siren Muted' : 'Siren On'}
            </span>
          </motion.button>
        </div>
        
        {/* Authority Filter Buttons */}
        <div className="p-4 border-b border-crypto-border/30 bg-crypto-surface/20">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-crypto-text-secondary" />
            <span className="text-sm font-medium text-crypto-text-secondary">Filter by Authority:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAuthorityFilter('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedAuthorityFilter === 'all'
                  ? 'bg-crypto-accent/20 border border-crypto-accent text-crypto-accent'
                  : 'bg-crypto-surface hover:bg-crypto-surface/80 border border-crypto-border/30 text-crypto-text-secondary'
              }`}
            >
              <span className="text-sm font-medium">All</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedAuthorityFilter === 'all'
                  ? 'bg-crypto-accent/20 text-crypto-accent'
                  : 'bg-crypto-border/30 text-crypto-text-secondary'
              }`}>
                {getAuthorityCount('all')}
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAuthorityFilter('police')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedAuthorityFilter === 'police'
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'bg-crypto-surface hover:bg-crypto-surface/80 border border-crypto-border/30 text-crypto-text-secondary'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Police</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedAuthorityFilter === 'police'
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-crypto-border/30 text-crypto-text-secondary'
              }`}>
                {getAuthorityCount('police')}
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAuthorityFilter('hospital')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedAuthorityFilter === 'hospital'
                  ? 'bg-red-600/20 border border-red-500/50 text-red-400'
                  : 'bg-crypto-surface hover:bg-crypto-surface/80 border border-crypto-border/30 text-crypto-text-secondary'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Hospital</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedAuthorityFilter === 'hospital'
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-crypto-border/30 text-crypto-text-secondary'
              }`}>
                {getAuthorityCount('hospital')}
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAuthorityFilter('fire')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedAuthorityFilter === 'fire'
                  ? 'bg-orange-600/20 border border-orange-500/50 text-orange-400'
                  : 'bg-crypto-surface hover:bg-crypto-surface/80 border border-crypto-border/30 text-crypto-text-secondary'
              }`}
            >
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">Fire</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedAuthorityFilter === 'fire'
                  ? 'bg-orange-600/20 text-orange-400'
                  : 'bg-crypto-border/30 text-crypto-text-secondary'
              }`}>
                {getAuthorityCount('fire')}
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAuthorityFilter('disaster')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedAuthorityFilter === 'disaster'
                  ? 'bg-purple-600/20 border border-purple-500/50 text-purple-400'
                  : 'bg-crypto-surface hover:bg-crypto-surface/80 border border-crypto-border/30 text-crypto-text-secondary'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Disaster</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedAuthorityFilter === 'disaster'
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'bg-crypto-border/30 text-crypto-text-secondary'
              }`}>
                {getAuthorityCount('disaster')}
              </span>
            </motion.button>
          </div>
        </div>
        
        <div className="divide-y divide-crypto-border/30">
          {filteredAlerts.map((alert) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 hover:bg-crypto-surface/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-crypto-text-secondary flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(alert.created_at)}</span>
                    </span>
                    <span className="text-sm font-medium text-crypto-text-primary">{alert.alert_type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
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
                  </div>
                  
                  {alert.description && (
                    <p className="text-crypto-text-secondary text-sm mb-4">{alert.description}</p>
                  )}
                  
                  {/* Emergency Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEmergencyAction(alert.id, 'police')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 transition-all duration-200"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Police</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEmergencyAction(alert.id, 'hospital')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 transition-all duration-200"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">Hospital</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEmergencyAction(alert.id, 'fire')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 transition-all duration-200"
                    >
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">Fire</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEmergencyAction(alert.id, 'disaster')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 transition-all duration-200"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Disaster</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};