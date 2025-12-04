import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, Calendar, MapPin, Phone, User, Shield, Clock, Globe, Heart, AlertTriangle, QrCode, CheckCircle, UserCheck, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Tourist {
  id: string;
  touristId: string;
  name: string;
  nationality: string;
  document: string;
  validUntil: string;
  lastLocation: string;
  status: string;
  phone: string;
  emergency: string;
  itinerary: string[];
  riskLevel: string;
  safetyScore: number;
  lastUpdate: string;
  consentStatus: {
    tracking: boolean;
    familySharing: boolean;
    dataSharing: boolean;
  };
  travelHistory: string[];
  medicalInfo: string;
  language: string;
  email?: string;
  country?: string;
  state?: string;
  blockchainId?: string;
  createdAt?: string;
}

export const TouristIDs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const [filterRisk, setFilterRisk] = useState('all');
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    avgSafetyScore: 0,
    activeTracking: 0,
  });

  // Fetch initial tourists from users table
  useEffect(() => {
    fetchTourists();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('tourists-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('User change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new tourist
            const newTourist = mapUserToTourist(payload.new as any);
            setTourists(prev => [newTourist, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing tourist
            setTourists(prev =>
              prev.map(tourist =>
                tourist.touristId === (payload.new as any).tourist_id
                  ? mapUserToTourist(payload.new as any)
                  : tourist
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted tourist
            setTourists(prev => prev.filter(tourist => tourist.touristId !== (payload.old as any).tourist_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate stats when tourists change
  useEffect(() => {
    fetchStats();
  }, [tourists]);

  const fetchTourists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tourists:', error);
        return;
      }

      if (data) {
        const mappedTourists = data.map(mapUserToTourist);
        setTourists(mappedTourists);
      }
    } catch (err) {
      console.error('Error fetching tourists:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapUserToTourist = (user: any): Tourist => {
    // Calculate risk level based on itinerary end date
    const endDate = user.itinerary_end_date ? new Date(user.itinerary_end_date) : null;
    const now = new Date();
    const daysUntilExpiry = endDate ? Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let riskLevel = 'LOW';
    let safetyScore = 90;
    
    if (daysUntilExpiry < 0) {
      riskLevel = 'HIGH';
      safetyScore = 30;
    } else if (daysUntilExpiry < 7) {
      riskLevel = 'HIGH';
      safetyScore = 45;
    } else if (daysUntilExpiry < 30) {
      riskLevel = 'MEDIUM';
      safetyScore = 70;
    }

    // Format document string
    const documentType = user.document_type === 'aadhaar' ? 'Aadhaar' : 'Passport';
    const documentNumber = user.document_number ? user.document_number.replace(/(.{4})/g, '$1 ').trim() : 'N/A';
    const document = `${documentType}: ${documentNumber}`;

    // Format valid until date
    const validUntil = endDate ? endDate.toISOString().split('T')[0] : 'N/A';

    // Calculate last update time
    const updatedAt = user.updated_at ? new Date(user.updated_at) : new Date(user.created_at);
    const lastUpdate = formatTimeAgo(updatedAt);

    // Default itinerary (can be enhanced with actual location data)
    const itinerary = user.state ? [user.state] : ['India'];

    return {
      id: user.id,
      touristId: user.tourist_id || user.id,
      name: user.name || 'Unknown',
      nationality: user.country || 'India',
      document: document,
      validUntil: validUntil,
      lastLocation: user.state ? `${user.state}, India` : 'Location not available',
      status: daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry < 7 ? 'Warning' : 'Active',
      phone: 'N/A', // Phone not in users table
      emergency: 'N/A', // Emergency contact not in users table
      itinerary: itinerary,
      riskLevel: riskLevel,
      safetyScore: safetyScore,
      lastUpdate: lastUpdate,
      consentStatus: {
        tracking: true, // Default
        familySharing: true, // Default
        dataSharing: false, // Default
      },
      travelHistory: user.country ? [`${user.country} (${new Date(user.created_at).getFullYear()})`] : [],
      medicalInfo: 'No medical info available',
      language: 'English',
      email: user.email,
      country: user.country,
      state: user.state,
      blockchainId: user.blockchain_id,
      createdAt: user.created_at,
    };
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  const fetchStats = () => {
    const total = tourists.length;
    const highRisk = tourists.filter(t => t.riskLevel === 'HIGH').length;
    const avgSafetyScore = tourists.length > 0
      ? tourists.reduce((sum, t) => sum + t.safetyScore, 0) / tourists.length
      : 0;
    const activeTracking = tourists.filter(t => t.status === 'Active').length;

    setStats({
      total,
      highRisk,
      avgSafetyScore: Math.round(avgSafetyScore * 10) / 10,
      activeTracking,
    });
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.touristId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tourist.email && tourist.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(tourist => 
    filterRisk === 'all' || tourist.riskLevel === filterRisk
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
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
            style={{ color: '#ffffff' }}
          >
            Tourist Digital ID Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-crypto-text-secondary text-lg"
          >
            Blockchain-verified digital identities with real-time tracking
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center space-x-3"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="crypto-btn flex items-center space-x-2"
          >
            <UserCheck className="h-4 w-4" />
            <span>Add Tourist</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-crypto-accent/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600"
            >
              <User className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-crypto-accent bg-crypto-accent/20 border-crypto-accent/30"
            >
              +12%
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">Total Tourists</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-3xl font-bold text-crypto-text-primary"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : stats.total}
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-red-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600"
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-red-400 bg-red-500/20 border-red-500/30"
            >
              -8%
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">High Risk</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-3xl font-bold text-red-400"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : stats.highRisk}
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-crypto-accent/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600"
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-crypto-accent bg-crypto-accent/20 border-crypto-accent/30"
            >
              +2.1%
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">Avg Safety Score</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-3xl font-bold text-crypto-accent"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : stats.avgSafetyScore}
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600"
            >
              <Activity className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-blue-400 bg-blue-500/20 border-blue-500/30"
            >
              Live
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">Active Tracking</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-3xl font-bold text-blue-400"
            >
              {loading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : stats.activeTracking}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-crypto-text-muted" />
            <input
              type="text"
              placeholder="Search by name, ID, or document number..."
              className="crypto-input w-full pl-10 pr-4 py-3 focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-crypto-text-muted" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="crypto-input px-3 py-2 text-sm rounded-lg focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
                aria-label="Filter by risk level"
              >
                <option value="all">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 crypto-card border border-crypto-border/30 hover:border-crypto-accent/30 rounded-lg transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span>Date Range</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tourist List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="crypto-card"
      >
        <div className="p-6 border-b border-crypto-border/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-crypto-text-primary">Tourist Directory</h2>
            <div className="flex items-center space-x-2 crypto-card px-3 py-1 border border-crypto-accent/20">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-crypto-accent rounded-full"
              />
              <span className="text-crypto-text-primary font-medium text-sm">{filteredTourists.length} Found</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-crypto-border/30">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-crypto-accent" />
              <span className="ml-3 text-crypto-text-secondary">Loading tourists...</span>
            </div>
          ) : filteredTourists.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-crypto-text-muted opacity-50" />
              <p className="text-crypto-text-secondary">No tourists found</p>
            </div>
          ) : (
            filteredTourists.map((tourist, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="p-6 hover:bg-crypto-surface/30 transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedTourist(tourist)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm text-crypto-text-secondary flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{tourist.lastUpdate}</span>
                    </span>
                    <span className="text-lg font-bold text-crypto-accent">{tourist.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(tourist.riskLevel)}`}>
                      {tourist.riskLevel}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tourist.status === 'Active' ? 'text-green-400 bg-green-600/20' :
                      tourist.status === 'Missing' ? 'text-red-400 bg-red-600/20' :
                      'text-yellow-400 bg-yellow-600/20'
                    }`}>
                      {tourist.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-crypto-text-secondary" />
                      <span className="text-sm text-crypto-text-primary font-medium">{tourist.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-crypto-text-secondary" />
                      <span className="text-sm text-crypto-text-primary">{tourist.nationality}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-crypto-text-secondary" />
                      <span className="text-sm text-crypto-text-primary">{tourist.lastLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-crypto-text-secondary" />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          tourist.safetyScore >= 80 ? 'bg-green-400' :
                          tourist.safetyScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-sm font-medium text-crypto-text-primary">{tourist.safetyScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-crypto-text-secondary">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{tourist.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Valid until: {tourist.validUntil}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTourist(tourist);
                    }}
                    className="crypto-btn p-2 rounded-lg"
                  >
                    <QrCode className="h-4 w-4" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTourist(tourist);
                    }}
                    className="glass p-2 rounded-lg transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  {tourist.status === 'Missing' && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 p-2 rounded-lg transition-all duration-200"
                    >
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Tourist Detail Modal */}
      {selectedTourist && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="crypto-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-crypto-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent-gradient rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-crypto-text-primary">Tourist Profile Details</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTourist(null)}
                  className="p-2 rounded-lg hover:bg-crypto-surface/80 transition-all duration-200 text-crypto-text-muted hover:text-crypto-text-primary"
                >
                  ✕
                </motion.button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <User className="h-5 w-5 text-teal-400" />
                    <span>Personal Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Name:</span>
                      <span>{selectedTourist.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Nationality:</span>
                      <span>{selectedTourist.nationality}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Document:</span>
                      <span>{selectedTourist.document}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Language:</span>
                      <span>{selectedTourist.language}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Valid Until:</span>
                      <span>{selectedTourist.validUntil}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-teal-400" />
                    <span>Contact & Safety</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Phone:</span>
                      <span>{selectedTourist.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-400">Emergency:</span>
                      <span>{selectedTourist.emergency}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Risk Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedTourist.riskLevel)}`}>
                        {selectedTourist.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Safety Score:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedTourist.safetyScore >= 80 ? 'bg-green-400' :
                          selectedTourist.safetyScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="font-medium">{selectedTourist.safetyScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Last Update:</span>
                      <span>{selectedTourist.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent & Privacy Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-teal-400" />
                  <span>Consent & Privacy Status</span>
                </h3>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(selectedTourist.consentStatus).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-teal-400" />
                  <span>Recent Activity Timeline</span>
                </h3>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">Location updated - {selectedTourist.lastLocation}</span>
                      <span className="text-xs text-gray-400">{selectedTourist.lastUpdate}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">Safety check completed</span>
                      <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm">Entered monitored zone</span>
                      <span className="text-xs text-gray-400">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel History */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-teal-400" />
                  <span>Travel History</span>
                </h3>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTourist.travelHistory.map((trip: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-700 rounded-full text-sm">
                        {trip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-teal-400" />
                  <span>Current Itinerary</span>
                </h3>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTourist.itinerary.map((city: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          index === selectedTourist.itinerary.length - 1 
                            ? 'bg-teal-600/20 text-teal-400' 
                            : 'bg-slate-700 text-gray-400'
                        }`}>
                          {city}
                        </span>
                        {index < selectedTourist.itinerary.length - 1 && (
                          <span className="text-gray-600">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 crypto-btn py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>View on Map</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Send Alert</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Ban className="h-4 w-4" />
                  <span>Block ID</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
};