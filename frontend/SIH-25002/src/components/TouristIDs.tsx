import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Filter,
  Globe,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  User,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface TouristRecord {
  id: string;
  tourist_id: string;
  blockchain_id: string | null;
  name: string;
  email: string;
  document_type: string;
  document_number: string;
  country: string | null;
  state: string | null;
  itinerary_start_date: string | null;
  itinerary_end_date: string | null;
  verification_status: 'pending' | 'verified' | 'failed' | null;
  verification_method: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

const deriveRisk = (tourist: TouristRecord): RiskLevel => {
  if (tourist.verification_status === 'failed') return 'HIGH';
  if (tourist.verification_status === 'verified') return 'LOW';
  return 'MEDIUM';
};

const deriveStatus = (tourist: TouristRecord) => {
  if (tourist.verification_status === 'failed') return { label: 'Flagged', className: 'text-red-400 bg-red-600/20' };
  if (tourist.itinerary_end_date && new Date(tourist.itinerary_end_date) < new Date()) {
    return { label: 'Expired', className: 'text-yellow-400 bg-yellow-600/20' };
  }
  return { label: 'Active', className: 'text-emerald-300 bg-emerald-600/20' };
};

const riskBadge = (risk: RiskLevel) => {
  switch (risk) {
    case 'HIGH':
      return 'text-red-400 bg-red-500/20';
    case 'MEDIUM':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'LOW':
    default:
      return 'text-green-400 bg-green-500/20';
  }
};

export const TouristIDs: React.FC = () => {
  const [tourists, setTourists] = useState<TouristRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | RiskLevel>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTourists = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from<TouristRecord>('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setTourists(data ?? []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message ?? 'Failed to load tourists from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourists();
  }, []);

  const filteredTourists = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return tourists
      .filter((tourist) => {
        return (
          tourist.name?.toLowerCase().includes(term) ||
          tourist.tourist_id?.toLowerCase().includes(term) ||
          tourist.blockchain_id?.toLowerCase().includes(term) ||
          tourist.document_number?.toLowerCase().includes(term)
        );
      })
      .filter((tourist) => (filterRisk === 'all' ? true : deriveRisk(tourist) === filterRisk));
  }, [tourists, searchTerm, filterRisk]);

  const totals = {
    total: tourists.length,
    highRisk: tourists.filter((tourist) => deriveRisk(tourist) === 'HIGH').length,
    verified: tourists.filter((tourist) => tourist.verification_status === 'verified').length,
    active: tourists.filter((tourist) => deriveStatus(tourist).label === 'Active').length,
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
            onClick={fetchTourists}
            className="crypto-btn flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Supabase</span>
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: <User className="h-6 w-6 text-white" />, label: 'Total Tourists', value: totals.total, tag: 'Live', tagClass: 'text-crypto-accent bg-crypto-accent/20 border border-crypto-accent/30' },
          { icon: <AlertTriangle className="h-6 w-6 text-white" />, label: 'High Risk', value: totals.highRisk, tag: 'Risk', tagClass: 'text-red-400 bg-red-500/20 border border-red-500/30' },
          { icon: <Shield className="h-6 w-6 text-white" />, label: 'Verified Profiles', value: totals.verified, tag: 'Verified', tagClass: 'text-crypto-accent bg-crypto-accent/20 border border-crypto-accent/30' },
          { icon: <Activity className="h-6 w-6 text-white" />, label: 'Active Tracking', value: totals.active, tag: 'Active', tagClass: 'text-blue-400 bg-blue-500/20 border border-blue-500/30' },
        ].map((card, idx) => (
        <motion.div 
            key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-crypto-accent/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
                {card.icon}
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 500 }}
                className={`text-xs font-medium px-3 py-1 rounded-full ${card.tagClass}`}
            >
                {card.tag}
            </motion.div>
          </div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">{card.label}</p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-3xl font-bold">
              {card.value}
            </motion.p>
        </motion.div>
        ))}
          </div>

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
              placeholder="Search by name, tourist ID, blockchain ID, or document..."
              className="crypto-input w-full pl-10 pr-4 py-3 focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-crypto-text-muted" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as 'all' | RiskLevel)}
                className="crypto-input px-3 py-2 text-sm rounded-lg focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
                aria-label="Filter by risk level"
              >
                <option value="all">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
            <span className="text-xs text-crypto-text-secondary whitespace-nowrap">Last synced: {lastUpdated || '--'}</span>
          </div>
        </div>
      </motion.div>

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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-crypto-accent" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-300">{error}</div>
          ) : filteredTourists.length === 0 ? (
            <div className="py-10 text-center text-crypto-text-secondary">No tourists match the filters.</div>
          ) : (
            filteredTourists.map((tourist, index) => {
              const risk = deriveRisk(tourist);
              const status = deriveStatus(tourist);
              return (
            <motion.div 
                  key={tourist.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.08 }}
              whileHover={{ scale: 1.01, x: 4 }}
                  className="p-6 hover:bg-crypto-surface/30 transition-all duration-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-crypto-text-secondary">
                          Last update: {new Date(tourist.updated_at).toLocaleString()}
                    </span>
                        <span className="text-lg font-bold text-crypto-accent">{tourist.tourist_id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskBadge(risk)}`}>{risk}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                        {tourist.blockchain_id && (
                          <span className="text-xs font-mono text-crypto-text-secondary border border-crypto-border/40 px-2 py-1 rounded-full">
                            {tourist.blockchain_id.slice(0, 8)}
                    </span>
                        )}
                  </div>
                  
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-crypto-text-secondary" />
                      <span className="text-sm text-crypto-text-primary font-medium">{tourist.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-crypto-text-secondary" />
                          <span className="text-sm text-crypto-text-primary">{tourist.country ?? '--'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-crypto-text-secondary" />
                          <span className="text-sm text-crypto-text-primary">{tourist.state ?? '--'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-crypto-text-secondary" />
                          <span className="text-sm text-crypto-text-primary capitalize">
                            {tourist.verification_status ?? 'pending'}
                          </span>
                    </div>
                  </div>
                  
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-crypto-text-secondary mb-1">Document</p>
                          <p className="font-semibold">
                            {tourist.document_type?.toUpperCase()} • {tourist.document_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-crypto-text-secondary mb-1">Itinerary Window</p>
                          <p className="font-semibold">
                            {tourist.itinerary_start_date
                              ? new Date(tourist.itinerary_start_date).toLocaleDateString()
                              : 'TBD'}{' '}
                            →{' '}
                            {tourist.itinerary_end_date
                              ? new Date(tourist.itinerary_end_date).toLocaleDateString()
                              : 'TBD'}
                          </p>
                    </div>
                        <div>
                          <p className="text-xs text-crypto-text-secondary mb-1">Verification Method</p>
                          <p className="font-semibold capitalize">{tourist.verification_method ?? 'Not set'}</p>
                    </div>
                  </div>
                </div>
                
                    <div className="flex flex-col gap-2">
                      <button className="crypto-btn flex items-center justify-center space-x-2 px-4 py-2 rounded-lg">
                        <UserCheck className="h-4 w-4" />
                        <span>Link Session</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 crypto-card border border-crypto-border/30 hover:border-crypto-accent/30 rounded-lg transition-all duration-200">
                    <QrCode className="h-4 w-4" />
                        <span>QR</span>
                      </button>
                </div>
              </div>
            </motion.div>
              );
            })
          )}
            </div>
          </motion.div>
    </motion.div>
  );
};
