import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Users, MapPin, AlertTriangle, FileText, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'response', label: 'Response Times', icon: Activity },
    { id: 'zones', label: 'Zone Analysis', icon: MapPin },
  ];

  const metrics = [
    { label: 'Total Tourists', value: '12,847', change: '+15.2%', trend: 'up' },
    { label: 'Incidents Resolved', value: '342', change: '+8.7%', trend: 'up' },
    { label: 'Avg Response Time', value: '4.2m', change: '-12.3%', trend: 'down' },
    { label: 'Safety Score', value: '94.8%', change: '+2.1%', trend: 'up' },
  ];

  const topZones = [
    { name: 'Marina Beach', visitors: 2847, incidents: 23, riskScore: 8.5 },
    { name: 'Gateway of India', visitors: 2156, incidents: 18, riskScore: 7.2 },
    { name: 'Fort Kochi', visitors: 1923, incidents: 12, riskScore: 6.8 },
    { name: 'Mysore Palace', visitors: 1654, incidents: 8, riskScore: 4.2 },
    { name: 'India Gate', visitors: 1432, incidents: 6, riskScore: 3.8 },
  ];

  const incidentTrends = [
    { type: 'Theft', count: 45, change: '-12%' },
    { type: 'Missing Person', count: 23, change: '+8%' },
    { type: 'Medical Emergency', count: 18, change: '-5%' },
    { type: 'Assault', count: 12, change: '+15%' },
    { type: 'Fraud', count: 8, change: '-20%' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>
            Analytics & Reporting
          </h1>
          <p className="text-crypto-text-secondary mt-1">Comprehensive insights and trend analysis</p>
        </div>
        <div className="flex items-center space-x-4">
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
            <span>Export Report</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex items-center space-x-1 glass rounded-lg p-1">
          {reportTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedReport(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedReport === type.id
                  ? 'crypto-btn'
                  : 'text-crypto-text-secondary hover:text-crypto-text-primary hover:bg-crypto-surface/30'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
            className="crypto-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-crypto-text-secondary text-sm font-medium">{metric.label}</h3>
              <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
              }`}>
                <TrendingUp className={`h-3 w-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{metric.change}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-crypto-text-primary">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="crypto-card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">Trend Analysis</h2>
          </div>
          <div className="bg-crypto-surface/30 rounded-xl h-64 flex items-center justify-center border border-crypto-border/30">
            <div className="text-center">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                <BarChart3 className="h-12 w-12 text-crypto-accent mx-auto mb-4" />
              </motion.div>
              <p className="text-crypto-text-primary font-medium">Interactive Trend Charts</p>
              <p className="text-sm text-crypto-text-secondary mt-2">Tourist flow • Incident patterns • Response metrics</p>
            </div>
          </div>
        </motion.div>

        {/* Top Risk Zones */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="crypto-card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
            >
              <MapPin className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">Top Risk Zones</h2>
          </div>
          <div className="space-y-4">
            {topZones.map((zone, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 hover:bg-crypto-surface/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-crypto-text-primary">{zone.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    zone.riskScore >= 8 ? 'bg-red-500/20 text-red-400' :
                    zone.riskScore >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    Risk: {zone.riskScore}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-crypto-text-secondary">
                  <div>
                    <span>Visitors: </span>
                    <span className="text-crypto-text-primary font-medium">{zone.visitors.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Incidents: </span>
                    <span className="text-crypto-text-primary font-medium">{zone.incidents}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Incident Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
          >
            <AlertTriangle className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-crypto-text-primary">Incident Type Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {incidentTrends.map((incident, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.4 }}
              className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 text-center hover:bg-crypto-surface/50 transition-all duration-200"
            >
              <h3 className="font-medium mb-2 text-crypto-text-primary">{incident.type}</h3>
              <p className="text-2xl font-bold mb-2 text-crypto-text-primary">{incident.count}</p>
              <div className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center space-x-1 ${
                incident.change.startsWith('+') ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'
              }`}>
                <TrendingUp className={`h-3 w-3 ${incident.change.startsWith('+') ? '' : 'rotate-180'}`} />
                <span>{incident.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Custom Reports */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
          >
            <FileText className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-crypto-text-primary">Custom Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-crypto-surface/30 rounded-lg p-6 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200 text-left hover:bg-crypto-surface/50"
          >
            <Users className="h-8 w-8 text-crypto-accent mb-4" />
            <h3 className="font-medium mb-2 text-crypto-text-primary">Tourist Demographics</h3>
            <p className="text-sm text-crypto-text-secondary">Age, nationality, and travel patterns</p>
          </motion.button>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-crypto-surface/30 rounded-lg p-6 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200 text-left hover:bg-crypto-surface/50"
          >
            <Target className="h-8 w-8 text-crypto-accent mb-4" />
            <h3 className="font-medium mb-2 text-crypto-text-primary">Response Metrics</h3>
            <p className="text-sm text-crypto-text-secondary">Response times and resolution rates</p>
          </motion.button>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-crypto-surface/30 rounded-lg p-6 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200 text-left hover:bg-crypto-surface/50"
          >
            <Calendar className="h-8 w-8 text-crypto-accent mb-4" />
            <h3 className="font-medium mb-2 text-crypto-text-primary">Seasonal Analysis</h3>
            <p className="text-sm text-crypto-text-secondary">Seasonal trends and predictions</p>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};