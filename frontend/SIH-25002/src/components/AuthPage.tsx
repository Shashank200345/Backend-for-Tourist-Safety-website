import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, MapPin, Calendar, FileText, QrCode, CheckCircle, Globe, Lock, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

export interface TouristData {
  id: string;
  name: string;
  country: string;
  state: string;
  startDate: string;
  endDate: string;
  digiLockerVerified: boolean;
  documentType: 'aadhaar' | 'passport';
  documentNumber: string;
  createdAt: string;
}

interface AuthPageProps {
  onAuthSuccess: (touristData: TouristData) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState<'auth' | 'verification' | 'details' | 'success'>('auth');
  const [loading, setLoading] = useState(false);
  const [touristData, setTouristData] = useState<Partial<TouristData>>({});
  const [digitalId, setDigitalId] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    country: '',
    state: '',
    startDate: '',
    endDate: '',
    documentType: 'aadhaar' as 'aadhaar' | 'passport',
    documentNumber: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateDigiLockerVerification = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    return true;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      setStep('verification');
    } else {
      // For signin, skip to verification for demo
      setStep('verification');
    }
  };

  const handleVerification = async () => {
    const verified = await simulateDigiLockerVerification();
    if (verified) {
      setStep('details');
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate digital ID token
    const id = uuidv4();
    const digitalToken = `TOURIST_${id.substring(0, 8).toUpperCase()}`;
    setDigitalId(digitalToken);
    
    // Create tourist data
    const newTouristData: TouristData = {
      id: digitalToken,
      name: formData.name,
      country: formData.country,
      state: formData.state,
      startDate: formData.startDate,
      endDate: formData.endDate,
      digiLockerVerified: true,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      createdAt: new Date().toISOString()
    };
    
    setTouristData(newTouristData);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setStep('success');
    
    // Call success callback after showing QR
    setTimeout(() => {
      onAuthSuccess(newTouristData);
    }, 3000);
  };

  const renderAuthForm = () => (
    <motion.div
      key="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block p-4 bg-accent-gradient rounded-2xl mb-4"
        >
          <Shield className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Tourist Safety Portal
        </h1>
        <p className="text-crypto-text-secondary">
          Secure registration with DigiLocker verification
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex crypto-card p-1 mb-8 border border-crypto-border/30">
        <button
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            isSignUp 
              ? 'bg-accent-gradient text-white shadow-glow' 
              : 'text-crypto-text-secondary hover:text-crypto-text-primary'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
            !isSignUp 
              ? 'bg-accent-gradient text-white shadow-glow' 
              : 'text-crypto-text-secondary hover:text-crypto-text-primary'
          }`}
        >
          Sign In
        </button>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
            placeholder="Enter your password"
          />
        </div>

        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              placeholder="Confirm your password"
            />
          </motion.div>
        )}

        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              placeholder="Enter your phone number"
            />
          </motion.div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full crypto-btn py-4 text-lg font-semibold"
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </motion.button>
      </form>

      <p className="text-center text-sm text-crypto-text-muted mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </motion.div>
  );

  const renderVerification = () => (
    <motion.div
      key="verification"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <div className="crypto-card p-8 border border-crypto-accent/20">
        <motion.div
          animate={{ rotate: loading ? [0, 360] : 0 }}
          transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
          className="inline-block p-4 bg-accent-gradient rounded-2xl mb-6"
        >
          <Lock className="h-8 w-8 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-crypto-text-primary mb-4">
          DigiLocker Verification
        </h2>
        <p className="text-crypto-text-secondary mb-8">
          Verify your identity using DigiLocker for secure access
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 crypto-card border border-crypto-border/30">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-crypto-accent" />
              <span className="text-crypto-text-primary">Aadhaar Card</span>
            </div>
            <input
              type="radio"
              name="document"
              checked={formData.documentType === 'aadhaar'}
              onChange={() => handleInputChange('documentType', 'aadhaar')}
              className="text-crypto-accent focus:ring-crypto-accent"
              aria-label="Select Aadhaar Card"
            />
          </div>

          <div className="flex items-center justify-between p-4 crypto-card border border-crypto-border/30">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-crypto-accent" />
              <span className="text-crypto-text-primary">Passport</span>
            </div>
            <input
              type="radio"
              name="document"
              checked={formData.documentType === 'passport'}
              onChange={() => handleInputChange('documentType', 'passport')}
              className="text-crypto-accent focus:ring-crypto-accent"
              aria-label="Select Passport"
            />
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            required
            value={formData.documentNumber}
            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
            className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
            placeholder={`Enter ${formData.documentType === 'aadhaar' ? 'Aadhaar' : 'Passport'} number`}
          />
        </div>

        <motion.button
          onClick={handleVerification}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full crypto-btn py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify with DigiLocker'
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
          className="inline-block p-4 bg-green-500 rounded-2xl mb-4"
        >
          <CheckCircle className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-crypto-text-primary mb-2">
          Verification Successful!
        </h2>
        <p className="text-crypto-text-secondary">
          Please provide your trip details to complete registration
        </p>
      </div>

      <form onSubmit={handleDetailsSubmit} className="crypto-card p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              <Globe className="inline h-4 w-4 mr-2" />
              Country
            </label>
            <select
              required
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              aria-label="Select Country"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              <MapPin className="inline h-4 w-4 mr-2" />
              State/Region
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              placeholder="Enter state or region"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Trip Start Date
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              aria-label="Trip Start Date"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Trip End Date
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
              aria-label="Trip End Date"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full crypto-btn py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Generating Digital ID...</span>
            </div>
          ) : (
            'Complete Registration'
          )}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <div className="crypto-card p-8 border border-crypto-accent/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
          className="inline-block p-4 bg-green-500 rounded-2xl mb-6"
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-crypto-text-primary mb-4">
          Registration Complete!
        </h2>
        
        <div className="mb-6">
          <p className="text-crypto-text-secondary mb-4">
            Your Digital Tourist ID has been generated. Save this QR code for quick access:
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white p-4 rounded-xl mx-auto inline-block"
          >
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={JSON.stringify({
                id: digitalId,
                name: formData.name,
                country: formData.country,
                verified: true,
                timestamp: new Date().toISOString()
              })}
              viewBox="0 0 256 256"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-3 crypto-card border border-crypto-accent/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <QrCode className="h-4 w-4 text-crypto-accent" />
              <span className="text-sm font-mono text-crypto-accent">{digitalId}</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-2 text-sm text-crypto-text-muted"
        >
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Screenshot or save this QR code</span>
          </div>
          <p>Redirecting to dashboard in 3 seconds...</p>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-crypto-bg text-crypto-text-primary relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <motion.div
        className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-crypto-accent/10 blur-3xl rounded-full"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-250px] right-[-250px] w-[700px] h-[700px] bg-emerald-500/8 blur-3xl rounded-full"
        animate={{ scale: [1.2, 1, 1.2], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] grid-pattern"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 'auth' && renderAuthForm()}
          {step === 'verification' && renderVerification()}
          {step === 'details' && renderDetails()}
          {step === 'success' && renderSuccess()}
        </AnimatePresence>
      </div>
    </div>
  );
};
