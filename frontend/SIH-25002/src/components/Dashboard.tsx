import React, { useState } from 'react';
import { Users, AlertCircle, TrendingUp, Clock, Shield, Target, Download, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedReport, setSelectedReport] = useState('overview');

  const stats = [
    { label: 'Active Tourists', value: '2,847', change: '+12%', icon: Users, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    { label: 'Active Alerts', value: '23', change: '-8%', icon: AlertCircle, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    { label: 'Avg Response Time', value: '4.2m', change: '-15%', icon: Clock, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10' },
    { label: 'Safety Score', value: '94.8%', change: '+2.1%', icon: Shield, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
  ];

  const reportTypes = [
    { id: 'overview', label: 'Overview' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'response', label: 'Response Times' },
    { id: 'zones', label: 'Zone Analysis' },
  ];

  const analyticsMetrics = [
    { label: 'Total Tourists', value: '12,847', change: '+15.2%', trend: 'up' },
    { label: 'Incidents Resolved', value: '342', change: '+8.7%', trend: 'up' },
    { label: 'Avg Response Time', value: '4.2m', change: '-12.3%', trend: 'down' },
    { label: 'Safety Score', value: '94.8%', change: '+2.1%', trend: 'up' },
  ];

  const incidentTrends = [
    { type: 'Theft', count: 45, change: '-12%' },
    { type: 'Missing Person', count: 23, change: '+8%' },
    { type: 'Medical Emergency', count: 18, change: '-5%' },
    { type: 'Assault', count: 12, change: '+15%' },
    { type: 'Fraud', count: 8, change: '-20%' },
  ];

  const customReports = [
    { icon: Users, title: 'Tourist Demographics', description: 'Age, nationality & travel patterns' },
    { icon: Target, title: 'Response Metrics', description: 'Dispatch times & resolution rates' },
    { icon: Calendar, title: 'Seasonal Analysis', description: 'Demand peaks & predictive insights' },
  ];

  const recentIncidents = [
    { time: '14:30', id: 'TID-2847', location: 'Marina Beach', type: 'SOS Alert', status: 'Active' },
    { time: '13:45', id: 'TID-1923', location: 'Fort Kochi', type: 'Missing Person', status: 'Investigating' },
    { time: '12:20', id: 'TID-3456', location: 'Mysore Palace', type: 'Medical Emergency', status: 'Resolved' },
    { time: '11:15', id: 'TID-7834', location: 'Hampi Ruins', type: 'Theft Report', status: 'Active' },
  ];

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
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 500 }}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    stat.change.startsWith('+') 
                      ? 'text-crypto-accent bg-crypto-accent/20 border-crypto-accent/30' 
                      : 'text-red-400 bg-red-500/20 border-red-500/30'
                  }`}
                >
                  {stat.change}
                </motion.div>
              </div>
              <div>
                <p className="text-crypto-text-secondary text-sm font-medium mb-2">{stat.label}</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="text-3xl font-bold text-crypto-text-primary"
                >
                  {stat.value}
                </motion.p>
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
            <div className="flex flex-wrap items-center gap-2 glass rounded-xl p-2">
              {reportTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReport(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedReport === type.id
                      ? 'crypto-btn'
                      : 'text-crypto-text-secondary hover:text-crypto-text-primary hover:bg-crypto-surface/40'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
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
                  <div
                    className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                      metric.trend === 'up' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                    }`}
                  >
                    <TrendingUp className={`h-3 w-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{metric.change}</span>
                  </div>
                </div>
                <p className="text-3xl font-semibold text-crypto-text-primary">{metric.value}</p>
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
              {incidentTrends.map((incident, index) => (
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
              ))}
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
              {recentIncidents.map((incident, index) => (
                <motion.tr 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.5 + index * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(42, 42, 42, 0.3)' }}
                  className="border-b border-crypto-border/20 hover:bg-crypto-surface/20 transition-all duration-200 group"
                >
                  <td className="py-4 text-sm text-crypto-text-secondary">{incident.time}</td>
                  <td className="py-4 text-sm font-medium text-crypto-accent">{incident.id}</td>
                  <td className="py-4 text-sm text-crypto-text-secondary">{incident.location}</td>
                  <td className="py-4 text-sm text-crypto-text-primary">{incident.type}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      incident.status === 'Active' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      incident.status === 'Investigating' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-crypto-accent/20 text-crypto-accent border-crypto-accent/30'
                    }`}>
                      {incident.status}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

