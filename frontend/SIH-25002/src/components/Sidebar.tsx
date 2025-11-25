import React from 'react';
import { Bell, Activity, Wifi, Database, Shield, Radio, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const statusSummary = [
    { label: 'Active Alerts', value: '23', delta: '+3', tone: 'text-red-400 bg-red-500/15' },
    { label: 'On-ground Teams', value: '18', delta: '+2', tone: 'text-crypto-accent bg-crypto-accent/10' },
    { label: 'Tourists Safe', value: '2.8k', delta: '99%', tone: 'text-emerald-300 bg-emerald-500/10' },
  ];

  const readiness = [
    { label: 'Rapid Response', status: 'Deployed', detail: '3 squads', icon: Shield },
    { label: 'Command Center', status: 'Online', detail: 'All channels', icon: Radio },
    { label: 'Emergency Lines', status: 'Active', detail: '12 agents', icon: Zap },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className={`glass border-r border-crypto-border/50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      } lg:w-64 h-screen -lg`}
    >
      <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold gradient-text">Operations Panel</h2>
            <p className="text-xs text-crypto-text-muted mt-1">Live control snapshot</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-red-500/20 border border-red-500/30 rounded-full w-9 h-9 flex items-center justify-center"
          >
            <Bell className="h-4 w-4 text-red-300" />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2.5 h-2.5"
            />
          </motion.div>
        </motion.div>

        {/* Summary Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {statusSummary.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.02, x: 4 }}
              className="crypto-card p-4 flex items-center justify-between border border-crypto-border/40"
              transition={{ duration: 0.2 }}
            >
              <div>
                <p className="text-xs text-crypto-text-muted">{item.label}</p>
                <p className="text-lg font-semibold text-crypto-text-primary">{item.value}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.tone}`}>
                {item.delta}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="crypto-card p-4"
        >
          <h3 className="text-sm font-semibold text-crypto-text-muted mb-4 tracking-wide">SYSTEM STATUS</h3>
          <div className="space-y-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-crypto-surface/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-crypto-accent" />
                <span className="text-sm text-crypto-text-secondary">IoT Devices</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crypto-accent rounded-full animate-pulse"></div>
                <span className="text-crypto-accent text-sm font-medium">Online</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-crypto-surface/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-crypto-text-secondary">AI Predictions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">Active</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-crypto-surface/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-crypto-text-secondary">Database Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 text-sm font-medium">Syncing</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="crypto-card p-4"
        >
          <h3 className="text-sm font-semibold text-crypto-text-muted mb-4 tracking-wide">FIELD READINESS</h3>
          <div className="space-y-3">
            {readiness.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-crypto-surface/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4 text-crypto-accent" />
                  <div>
                    <p className="text-sm text-crypto-text-primary">{item.label}</p>
                    <p className="text-xs text-crypto-text-muted">{item.detail}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-crypto-accent">{item.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};