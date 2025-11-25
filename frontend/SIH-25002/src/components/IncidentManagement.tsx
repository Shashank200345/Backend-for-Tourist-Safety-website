import React, { useState } from 'react';
import { AlertTriangle, Clock, User, MapPin, CheckCircle, ArrowRight, Filter, Plus, Eye, Edit, MessageSquare, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export const IncidentManagement: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'kanban' | 'table'>('kanban');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const incidents = [
    {
      id: 'INC-001',
      type: 'PANIC',
      severity: 'CRITICAL',
      touristId: 'TID-2847',
      touristName: 'John Smith',
      location: 'Marina Beach, Chennai',
      coordinates: { lat: 13.0475, lng: 80.2824 },
      timestamp: '2024-01-15 14:32:15',
      status: 'ACTIVE',
      assignedUnit: 'Unit-7',
      description: 'Emergency panic button activated',
      responseTime: '2m 15s',
      priority: 1,
      metadata: {
        deviceId: 'DEV-4567',
        batteryLevel: 45,
        signalStrength: 'Strong'
      }
    },
    {
      id: 'INC-002',
      type: 'GEOFENCE_VIOLATION',
      severity: 'HIGH',
      touristId: 'TID-1923',
      touristName: 'Sarah Johnson',
      location: 'Restricted Zone A, Fort Kochi',
      coordinates: { lat: 9.9658, lng: 76.2427 },
      timestamp: '2024-01-15 14:28:42',
      status: 'DISPATCHED',
      assignedUnit: 'Unit-3',
      description: 'Tourist entered high-risk restricted area',
      responseTime: '5m 32s',
      priority: 2,
      metadata: {
        zoneId: 'ZONE-001',
        entryTime: '14:28:42',
        riskLevel: 'HIGH'
      }
    },
    {
      id: 'INC-003',
      type: 'ANOMALY',
      severity: 'MEDIUM',
      touristId: 'TID-3456',
      touristName: 'Hans Mueller',
      location: 'Mysore Palace, Karnataka',
      coordinates: { lat: 12.3052, lng: 76.6551 },
      timestamp: '2024-01-15 14:25:18',
      status: 'INVESTIGATING',
      assignedUnit: 'Unit-12',
      description: 'Unusual movement pattern detected',
      responseTime: '8m 47s',
      priority: 3,
      metadata: {
        anomalyType: 'Movement Pattern',
        confidence: 0.87,
        duration: '15 minutes'
      }
    },
    {
      id: 'INC-004',
      type: 'MISSING_PERSON',
      severity: 'HIGH',
      touristId: 'TID-7834',
      touristName: 'Maria Garcia',
      location: 'Last seen: Hampi Ruins',
      coordinates: { lat: 15.3350, lng: 76.4600 },
      timestamp: '2024-01-15 11:15:30',
      status: 'ESCALATED',
      assignedUnit: 'Unit-5, Unit-8',
      description: 'No location update for 4+ hours',
      responseTime: '12m 03s',
      priority: 1,
      metadata: {
        lastSeen: '11:15:30',
        duration: '3h 17m',
        searchRadius: '2km'
      }
    }
  ];

  const statusColumns = [
    { id: 'ACTIVE', label: 'Active', color: 'border-red-500 bg-red-500/10' },
    { id: 'DISPATCHED', label: 'Dispatched', color: 'border-blue-500 bg-blue-500/10' },
    { id: 'INVESTIGATING', label: 'Investigating', color: 'border-yellow-500 bg-yellow-500/10' },
    { id: 'ESCALATED', label: 'Escalated', color: 'border-purple-500 bg-purple-500/10' },
    { id: 'RESOLVED', label: 'Resolved', color: 'border-green-500 bg-green-500/10' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PANIC': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'GEOFENCE_VIOLATION': return <MapPin className="h-4 w-4 text-orange-400" />;
      case 'ANOMALY': return <Eye className="h-4 w-4 text-yellow-400" />;
      case 'MISSING_PERSON': return <User className="h-4 w-4 text-purple-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredIncidents = filterSeverity === 'all' 
    ? incidents 
    : incidents.filter(incident => incident.severity === filterSeverity);

  const handleAction = (action: string, incidentId: string) => {
    console.log(`${action} action for incident ${incidentId}`);
    // Handle action logic here
  };

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
            Incident & Alert Management
          </h1>
          <p className="text-crypto-text-secondary mt-1">Real-time incident triage and response coordination</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 glass rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedView('kanban')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedView === 'kanban' 
                  ? 'crypto-btn' 
                  : 'text-crypto-text-secondary hover:text-crypto-text-primary'
              }`}
            >
              Kanban
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedView('table')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedView === 'table' 
                  ? 'crypto-btn' 
                  : 'text-crypto-text-secondary hover:text-crypto-text-primary'
              }`}
            >
              Table
            </motion.button>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="crypto-input px-4 py-2 text-sm rounded-lg"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </motion.div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="crypto-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-400">3</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg "
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="crypto-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">High</p>
              <p className="text-2xl font-bold text-orange-400">8</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg "
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="crypto-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Medium</p>
              <p className="text-2xl font-bold text-yellow-400">12</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg "
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="crypto-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Avg Response</p>
              <p className="text-2xl font-bold text-green-400">4.2m</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg "
            >
              <Clock className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="crypto-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-crypto-text-secondary text-sm font-medium">Resolved</p>
              <p className="text-2xl font-bold text-blue-400">47</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg "
            >
              <CheckCircle className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Kanban View */}
      {selectedView === 'kanban' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {statusColumns.map((column) => (
            <motion.div 
              key={column.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className={`crypto-card p-4 border-t-4 ${column.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-crypto-text-primary">{column.label}</h3>
                <span className="bg-crypto-surface/50 text-xs px-2 py-1 rounded-full text-crypto-text-secondary">
                  {filteredIncidents.filter(inc => inc.status === column.id).length}
                </span>
              </div>
              <div className="space-y-3">
                {filteredIncidents
                  .filter(incident => incident.status === column.id)
                  .map((incident) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-crypto-surface/50 rounded-lg p-4 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200 cursor-pointer "
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(incident.type)}
                          <span className="text-xs font-medium text-crypto-accent">{incident.id}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm mb-1 text-crypto-text-primary">{incident.touristName}</h4>
                      <p className="text-xs text-crypto-text-secondary mb-2">{incident.location}</p>
                      <div className="flex items-center justify-between text-xs text-crypto-text-muted">
                        <span>{incident.timestamp.split(' ')[1]}</span>
                        <span>{incident.responseTime}</span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Table View */}
      {selectedView === 'table' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="crypto-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-crypto-surface/30">
                <tr className="text-left text-crypto-text-secondary text-sm">
                  <th className="p-4">Incident</th>
                  <th className="p-4">Tourist</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Response</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(incident.type)}
                        <span className="font-medium text-teal-400">{incident.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-sm">{incident.touristName}</p>
                        <p className="text-xs text-slate-400">{incident.touristId}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{incident.type.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{incident.location}</td>
                    <td className="p-4 text-sm text-slate-400">{incident.timestamp.split(' ')[1]}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incident.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400' :
                        incident.status === 'DISPATCHED' ? 'bg-blue-500/20 text-blue-400' :
                        incident.status === 'INVESTIGATING' ? 'bg-yellow-500/20 text-yellow-400' :
                        incident.status === 'ESCALATED' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{incident.responseTime}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedIncident(incident)}
                          className="p-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleAction('acknowledge', incident.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedIncident.type)}
                  <h2 className="text-2xl font-bold">{selectedIncident.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incident Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Incident Details</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Type:</span>
                        <span className="font-medium">{selectedIncident.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Timestamp:</span>
                        <span className="font-medium">{selectedIncident.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Response Time:</span>
                        <span className="font-medium">{selectedIncident.responseTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Unit:</span>
                        <span className="font-medium text-blue-400">{selectedIncident.assignedUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tourist Information</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-medium">{selectedIncident.touristName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Tourist ID:</span>
                        <span className="font-medium text-teal-400">{selectedIncident.touristId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-medium">{selectedIncident.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      {Object.entries(selectedIncident.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map and Actions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Location Map</h3>
                    <div className="bg-slate-900/50 rounded-lg h-64 flex items-center justify-center border border-slate-700/30">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Interactive Location Map</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Lat: {selectedIncident.coordinates.lat}, Lng: {selectedIncident.coordinates.lng}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAction('acknowledge', selectedIncident.id)}
                        className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Acknowledge</span>
                      </button>
                      <button
                        onClick={() => handleAction('dispatch', selectedIncident.id)}
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-sm font-medium">Dispatch Unit</span>
                      </button>
                      <button
                        onClick={() => handleAction('escalate', selectedIncident.id)}
                        className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Escalate</span>
                      </button>
                      <button
                        onClick={() => handleAction('contact', selectedIncident.id)}
                        className="bg-teal-600 hover:bg-teal-700 p-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">Contact</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Automated Notifications</h3>
                    <div className="space-y-3">
                      <div className="bg-slate-900/50 rounded-lg p-3 flex items-center space-x-3">
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">SMS sent to emergency contacts</span>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-green-400" />
                        <span className="text-sm">Email alert to nearest station</span>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">WhatsApp blast initiated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAction('generate-efir', selectedIncident.id)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 py-3 px-4 rounded-lg transition-all duration-200 font-medium"
                  >
                    Generate E-FIR
                  </button>
                  <button
                    onClick={() => handleAction('resolve', selectedIncident.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 px-4 rounded-lg transition-colors font-medium"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleAction('false-alarm', selectedIncident.id)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 py-3 px-4 rounded-lg transition-colors font-medium"
                  >
                    False Alarm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};