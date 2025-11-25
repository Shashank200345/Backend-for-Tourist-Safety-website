import React, { useState } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, User, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const EFIR: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    touristId: '',
    incidentType: '',
    location: '',
    description: '',
    dateTime: '',
    witnesses: '',
    evidence: ''
  });

  const eFIRs = [
    {
      id: 'EFIR-001',
      touristId: 'TID-1923',
      touristName: 'Sarah Johnson',
      incidentType: 'Missing Person',
      dateCreated: '2024-01-15 13:45',
      location: 'Fort Kochi, Kerala',
      status: 'Under Investigation',
      officerId: 'OFF-456',
      priority: 'High'
    },
    {
      id: 'EFIR-002',
      touristId: 'TID-7834',
      touristName: 'Hans Mueller',
      incidentType: 'Theft',
      dateCreated: '2024-01-15 11:15',
      location: 'Hampi Ruins, Karnataka',
      status: 'Evidence Collection',
      officerId: 'OFF-123',
      priority: 'Medium'
    },
    {
      id: 'EFIR-003',
      touristId: 'TID-5623',
      touristName: 'Maria Garcia',
      incidentType: 'Assault',
      dateCreated: '2024-01-14 16:30',
      location: 'Goa Beach, Goa',
      status: 'Completed',
      officerId: 'OFF-789',
      priority: 'High'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Investigation': return 'text-yellow-400 bg-yellow-600/20';
      case 'Evidence Collection': return 'text-blue-400 bg-blue-600/20';
      case 'Completed': return 'text-green-400 bg-green-600/20';
      default: return 'text-crypto-text-secondary bg-gray-600/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-600/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-600/20';
      case 'Low': return 'text-green-400 bg-green-600/20';
      default: return 'text-crypto-text-secondary bg-gray-600/20';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle E-FIR submission
    setShowForm(false);
    setFormData({
      touristId: '',
      incidentType: '',
      location: '',
      description: '',
      dateTime: '',
      witnesses: '',
      evidence: ''
    });
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
          <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>E-FIR Management</h1>
          <p className="text-crypto-text-secondary mt-1">Digital First Information Reports for tourists</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="crypto-btn flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Create E-FIR</span>
        </motion.button>
      </motion.div>

      {/* E-FIR List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="crypto-card"
      >
        <div className="p-6 border-b border-crypto-border/30">
          <h2 className="text-xl font-semibold text-crypto-text-primary">Recent E-FIRs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-crypto-surface/30">
              <tr className="text-left text-crypto-text-secondary text-sm">
                <th className="p-4">E-FIR ID</th>
                <th className="p-4">Tourist</th>
                <th className="p-4">Incident Type</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eFIRs.map((efir, index) => (
                <motion.tr 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  className="border-b border-crypto-border/30 hover:bg-crypto-surface/30 transition-all duration-200"
                >
                  <td className="p-4 font-medium text-crypto-accent">{efir.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-crypto-text-primary">{efir.touristName}</p>
                      <p className="text-sm text-crypto-text-secondary">{efir.touristId}</p>
                    </div>
                  </td>
                  <td className="p-4 text-crypto-text-primary">{efir.incidentType}</td>
                  <td className="p-4 text-sm text-crypto-text-secondary">{efir.dateCreated}</td>
                  <td className="p-4 text-sm text-crypto-text-secondary">{efir.location}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(efir.status)}`}>
                      {efir.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(efir.priority)}`}>
                      {efir.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-3 py-1 rounded text-xs font-medium text-white transition-all duration-200"
                      >
                        View
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass px-3 py-1 rounded text-xs font-medium text-crypto-text-primary hover:text-white transition-all duration-200"
                      >
                        Edit
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* E-FIR Creation Form Modal */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="crypto-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-crypto-border/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-crypto-text-primary">Create New E-FIR</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowForm(false)}
                  className="text-crypto-text-secondary hover:text-crypto-text-primary transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Tourist ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-crypto-text-secondary" />
                    <input
                      type="text"
                      value={formData.touristId}
                      onChange={(e) => setFormData({ ...formData, touristId: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 crypto-input"
                      placeholder="TID-1923"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Incident Type *
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    required
                  >
                    <option value="">Select incident type</option>
                    <option value="Missing Person">Missing Person</option>
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-crypto-text-secondary" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 crypto-input"
                      placeholder="Fort Kochi, Kerala"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-crypto-text-secondary" />
                    <input
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 crypto-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Incident Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={4}
                  placeholder="Provide detailed description of the incident..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Witnesses (if any)
                </label>
                <textarea
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  placeholder="Names and contact details of witnesses..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Evidence Upload
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                  <Upload className="h-12 w-12 text-crypto-text-secondary mx-auto mb-4" />
                  <p className="text-crypto-text-secondary mb-2">Click to upload evidence files</p>
                  <p className="text-sm text-gray-500">Images, GPS logs, audio recordings (Max 50MB)</p>
                  <button
                    type="button"
                    className="mt-4 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(false)}
                  className="flex-1 glass py-3 px-4 rounded-lg font-medium text-crypto-text-primary hover:text-white transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 crypto-btn py-3 px-4 rounded-lg font-medium"
                >
                  Create E-FIR
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};