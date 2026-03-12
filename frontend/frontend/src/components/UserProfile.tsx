import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  Globe, 
  Shield, 
  QrCode, 
  Download, 
  Share2, 
  Edit3, 
  CheckCircle, 
  Clock,
  FileText,
  Smartphone,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { TouristData } from './AuthPage';

interface UserProfileProps {
  touristData: TouristData;
  onUpdateProfile?: (updatedData: TouristData) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ touristData, onUpdateProfile }) => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(touristData);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile(editData);
    }
    setIsEditing(false);
  };

  const qrData = JSON.stringify({
    id: touristData.id,
    name: touristData.name,
    country: touristData.country,
    state: touristData.state,
    startDate: touristData.startDate,
    endDate: touristData.endDate,
    verified: touristData.digiLockerVerified,
    documentType: touristData.documentType,
    createdAt: touristData.createdAt
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTripDuration = () => {
    const start = new Date(touristData.startDate);
    const end = new Date(touristData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `tourist-qr-${touristData.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

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
          >
            Tourist Profile
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-crypto-text-secondary text-lg"
          >
            Digital ID and travel information
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
            onClick={() => setIsEditing(!isEditing)}
            className="crypto-btn flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Code Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="crypto-card p-6 text-center">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-crypto-text-primary">Digital Tourist ID</h2>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-2 rounded-lg hover:bg-crypto-surface/80 transition-all duration-200"
              >
                {showQRCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {showQRCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white p-4 rounded-xl mx-auto inline-block">
                  <QRCode
                    id="qr-code"
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={qrData}
                    viewBox="0 0 256 256"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 crypto-card border border-crypto-accent/20">
                    <div className="flex items-center space-x-2">
                      <QrCode className="h-4 w-4 text-crypto-accent" />
                      <span className="text-sm font-mono text-crypto-accent">{touristData.id}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(touristData.id, 'id')}
                      className="p-1 rounded hover:bg-crypto-surface/50 transition-colors"
                    >
                      {copiedField === 'id' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-crypto-text-muted" />
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadQR}
                      className="flex-1 crypto-btn py-2 text-sm flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCopy(qrData, 'qr')}
                      className="flex-1 crypto-btn py-2 text-sm flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 text-center">
                <Smartphone className="h-16 w-16 text-crypto-text-muted mx-auto mb-4" />
                <p className="text-crypto-text-muted">QR Code Hidden</p>
                <p className="text-sm text-crypto-text-muted mt-2">Click the eye icon to show</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Personal Information */}
          <div className="crypto-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent-gradient rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-crypto-text-primary">Personal Information</h3>
              </div>
              {touristData.digiLockerVerified && (
                <div className="flex items-center space-x-2 crypto-card px-3 py-1 border border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">DigiLocker Verified</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="crypto-input w-full"
                    aria-label="Full Name"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center justify-between p-3 crypto-card border border-crypto-border/30">
                    <span className="text-crypto-text-primary">{touristData.name}</span>
                    <button
                      onClick={() => handleCopy(touristData.name, 'name')}
                      className="p-1 rounded hover:bg-crypto-surface/50 transition-colors"
                    >
                      {copiedField === 'name' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-crypto-text-muted" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.country}
                    onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                    className="crypto-input w-full"
                    aria-label="Country"
                    placeholder="Enter your country"
                  />
                ) : (
                  <div className="flex items-center justify-between p-3 crypto-card border border-crypto-border/30">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-crypto-accent" />
                      <span className="text-crypto-text-primary">{touristData.country}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(touristData.country, 'country')}
                      className="p-1 rounded hover:bg-crypto-surface/50 transition-colors"
                    >
                      {copiedField === 'country' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-crypto-text-muted" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">State/Region</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.state}
                    onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                    className="crypto-input w-full"
                    aria-label="State/Region"
                    placeholder="Enter your state or region"
                  />
                ) : (
                  <div className="flex items-center justify-between p-3 crypto-card border border-crypto-border/30">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-crypto-accent" />
                      <span className="text-crypto-text-primary">{touristData.state}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(touristData.state, 'state')}
                      className="p-1 rounded hover:bg-crypto-surface/50 transition-colors"
                    >
                      {copiedField === 'state' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-crypto-text-muted" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Document Type</label>
                <div className="flex items-center justify-between p-3 crypto-card border border-crypto-border/30">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-crypto-accent" />
                    <span className="text-crypto-text-primary capitalize">{touristData.documentType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="crypto-btn flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Changes</span>
                </motion.button>
                <button
                  onClick={() => {
                    setEditData(touristData);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-crypto-border text-crypto-text-secondary hover:bg-crypto-surface/50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Trip Information */}
          <div className="crypto-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-crypto-text-primary">Trip Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.startDate}
                    onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                    className="crypto-input w-full"
                    aria-label="Trip Start Date"
                  />
                ) : (
                  <div className="p-3 crypto-card border border-crypto-border/30">
                    <span className="text-crypto-text-primary">{formatDate(touristData.startDate)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">End Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.endDate}
                    onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                    className="crypto-input w-full"
                    aria-label="Trip End Date"
                  />
                ) : (
                  <div className="p-3 crypto-card border border-crypto-border/30">
                    <span className="text-crypto-text-primary">{formatDate(touristData.endDate)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Duration</label>
                <div className="p-3 crypto-card border border-crypto-border/30">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-crypto-accent" />
                    <span className="text-crypto-text-primary">{getTripDuration()} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="crypto-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-crypto-text-primary">Account Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Registration Date</label>
                <div className="p-3 crypto-card border border-crypto-border/30">
                  <span className="text-crypto-text-primary">{formatDate(touristData.createdAt)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Verification Status</label>
                <div className="p-3 crypto-card border border-green-500/20 bg-green-500/10">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">DigiLocker Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
