import React, { useState } from 'react';
import { FileText, User, MapPin, Calendar, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Get API base URL
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

export const EFIR: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    touristId: '',
    incidentType: '',
    location: '',
    description: '',
    dateTime: '',
    witnesses: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    const requestUrl = `${API_BASE_URL}/efir/generate`;

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          touristId: formData.touristId,
          incidentType: formData.incidentType,
          location: formData.location,
          description: formData.description,
          dateTime: formData.dateTime,
          witnesses: formData.witnesses || '',
          evidence: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate EFIR' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EFIR-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSuccess('E-FIR generated and downloaded successfully!');
        setShowForm(false);
        setFormData({
          touristId: '',
          incidentType: '',
          location: '',
          description: '',
          dateTime: '',
          witnesses: ''
        });
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error('Unexpected response format. Expected PDF file.');
      }
    } catch (err: any) {
      console.error('❌ Error generating EFIR:', err);
      let errorMessage = err.message || 'Failed to generate E-FIR. Please try again.';
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
        errorMessage = `Cannot connect to backend server. Please ensure:
1. Backend server is running on port 3001
2. Check backend console for errors
3. Verify API URL: ${requestUrl}`;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsGenerating(false);
    }
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
            E-FIR Management
          </h1>
          <p className="text-crypto-text-secondary mt-1">
            Generate First Information Reports for tourist incidents
          </p>
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="crypto-card border border-red-500/50 bg-red-950/40 text-sm text-red-200"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 mt-1 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-100">Error</p>
              <p className="whitespace-pre-line">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="crypto-card border border-green-500/50 bg-green-950/40 text-sm text-green-200"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 mt-1 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-100">Success</p>
              <p>{success}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="crypto-card"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-crypto-text-primary mb-4">
            E-FIR Generator
          </h2>
          <p className="text-crypto-text-secondary mb-4">
            Fill in the essential details below to generate a formal First Information Report (FIR).
            The system will create a professional PDF document using AI-powered content generation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-crypto-text-secondary">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-1 text-crypto-accent" />
              <div>
                <p className="font-medium text-crypto-text-primary">AI-Generated Content</p>
                <p>Professional FIR format with structured sections</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-1 text-crypto-accent" />
              <div>
                <p className="font-medium text-crypto-text-primary">PDF Download</p>
                <p>Download the generated FIR as a PDF document</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create E-FIR Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isGenerating && setShowForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="crypto-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-crypto-border/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-crypto-text-primary">Create New E-FIR</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isGenerating && setShowForm(false)}
                  className="text-crypto-text-secondary hover:text-crypto-text-primary transition-colors text-2xl"
                  disabled={isGenerating}
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tourist ID */}
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
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Incident Type */}
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Incident Type *
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    required
                    disabled={isGenerating}
                  >
                    <option value="">Select incident type</option>
                    <option value="Missing Person">Missing Person</option>
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Accident">Accident</option>
                    <option value="Lost Property">Lost Property</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Location */}
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
                      placeholder="Shillong, Meghalaya"
                      required
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Date & Time */}
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
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </div>

              {/* Incident Description */}
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Incident Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={5}
                  placeholder="Provide a detailed description of the incident, including what happened, sequence of events, and any relevant details..."
                  required
                  disabled={isGenerating}
                ></textarea>
              </div>

              {/* Witnesses */}
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Witnesses (Optional)
                </label>
                <textarea
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  placeholder="Names and contact details of witnesses, if any..."
                  disabled={isGenerating}
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  onClick={() => setShowForm(false)}
                  disabled={isGenerating}
                  className="flex-1 glass py-3 px-4 rounded-lg font-medium text-crypto-text-primary hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isGenerating}
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  className="flex-1 crypto-btn py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating E-FIR...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      <span>Generate E-FIR</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
