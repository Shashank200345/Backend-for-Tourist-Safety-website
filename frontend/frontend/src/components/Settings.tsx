import React, { useState, useEffect } from 'react';
import { Globe, Users, Key, Bell, Shield, Database, Wifi, Settings as SettingsIcon, Save, RefreshCw, CheckCircle, AlertTriangle, Activity, Lock, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser, UserProfile } from '../lib/supabaseClient';

export const Settings: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    whatsapp: true
  });
  const [userId, setUserId] = useState<string | null>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'ur', name: 'اردو (Urdu)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' }
  ];

  const userRoles = [
    { role: 'Admin', users: 3, permissions: { dashboard: true, tourists: true, alerts: true, efir: true, settings: true } },
    { role: 'Dispatcher', users: 12, permissions: { dashboard: true, tourists: true, alerts: true, efir: true, settings: false } },
    { role: 'Officer', users: 28, permissions: { dashboard: true, tourists: false, alerts: true, efir: true, settings: false } },
    { role: 'Viewer', users: 5, permissions: { dashboard: true, tourists: false, alerts: false, efir: false, settings: false } }
  ];

  const systemIntegrations = [
    { service: 'Blockchain Node', status: 'Connected', apiKey: 'bc_****_****_7892' },
    { service: 'AI Prediction Service', status: 'Active', apiKey: 'ai_****_****_3456' },
    { service: 'IoT Data Stream', status: 'Syncing', apiKey: 'iot_****_****_1234' },
    { service: 'SMS Gateway', status: 'Connected', apiKey: 'sms_****_****_5678' }
  ];

  // Load user profile and preferences on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setErrorMessage('Please log in to view settings');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch user profile from Supabase
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('phone_number, notification_preferences')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" - we'll create profile if it doesn't exist
        console.error('Error loading profile:', error);
        setErrorMessage('Failed to load profile');
      } else if (profile) {
        // Update state with fetched data
        setPhoneNumber(profile.phone_number || '');
        if (profile.notification_preferences) {
          setNotifications({
            email: profile.notification_preferences.email !== false,
            sms: profile.notification_preferences.sms !== false,
            push: profile.notification_preferences.push !== false,
            whatsapp: profile.notification_preferences.whatsapp !== false
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!userId) {
      setErrorMessage('Please log in to save settings');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Prepare notification preferences
      const notificationPrefs = {
        email: notifications.email,
        sms: notifications.sms,
        push: notifications.push,
        whatsapp: notifications.whatsapp
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            phone_number: phoneNumber || null,
            notification_preferences: notificationPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            phone_number: phoneNumber || null,
            notification_preferences: notificationPrefs
          });

        if (error) throw error;
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrorMessage(error.message || 'Failed to save settings');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
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
            System Settings & Configuration
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-crypto-text-secondary text-lg"
          >
            Manage system preferences, security, and integrations
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
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="crypto-btn flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All</span>
              </>
            )}
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
              <Users className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-crypto-accent bg-crypto-accent/20 border-crypto-accent/30"
            >
              Active
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">Total Users</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-3xl font-bold text-crypto-text-primary"
            >
              48
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-green-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600"
            >
              <Database className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-green-400 bg-green-500/20 border-green-500/30"
            >
              Online
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">System Status</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-3xl font-bold text-green-400"
            >
              100%
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600"
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
            >
              Secure
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">Security Score</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-3xl font-bold text-yellow-400"
            >
              98.5%
            </motion.p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="crypto-card p-6 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600"
            >
              <Activity className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 500 }}
              className="text-xs font-medium px-3 py-1 rounded-full border text-purple-400 bg-purple-500/20 border-purple-500/30"
            >
              Live
            </motion.div>
          </div>
          <div>
            <p className="text-crypto-text-secondary text-sm font-medium mb-2">API Requests</p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-3xl font-bold text-purple-400"
            >
              1.2K
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="crypto-card border border-green-500/50 bg-green-950/40 text-sm text-green-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span>{successMessage}</span>
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="crypto-card border border-red-500/50 bg-red-950/40 text-sm text-red-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="crypto-card p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-crypto-accent" />
          <p className="mt-4 text-crypto-text-secondary">Loading settings...</p>
        </div>
      )}

      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Settings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="crypto-card p-6 hover:border-crypto-accent/30 transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg"
            >
              <Globe className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">Multilingual Support</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-crypto-text-secondary mb-3">
                System Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="crypto-input w-full focus:border-crypto-accent focus:ring-2 focus:ring-crypto-accent/20"
                aria-label="Select system language"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="crypto-card p-4 border border-crypto-border/30"
            >
              <p className="text-sm text-crypto-text-secondary mb-2">Preview:</p>
              <p className="font-medium text-crypto-text-primary text-lg">
                {selectedLanguage === 'hi' && 'पर्यटक सुरक्षा डैशबोर्ड'}
                {selectedLanguage === 'bn' && 'পর্যটক নিরাপত্তা ড্যাশবোর্ড'}
                {selectedLanguage === 'te' && 'పర్యాటక భద్రతా డాష్‌బోర్డ్'}
                {selectedLanguage === 'ta' && 'சுற்றுலா பாதுகாப்பு டாஷ்போர்டு'}
                {selectedLanguage === 'en' && 'Tourist Safety Dashboard'}
              </p>
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full crypto-btn py-3 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Apply Language Changes</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="crypto-card p-6 hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg"
            >
              <Bell className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">Notification Preferences</h2>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
              Phone Number (for SMS Alerts)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-crypto-text-secondary" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="crypto-input w-full pl-10 pr-4 py-2"
              />
            </div>
            <p className="text-xs text-crypto-text-secondary mt-2">
              Include country code (e.g., +91 for India). Required for SMS alerts.
            </p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value], index) => (
              <motion.div 
                key={key} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-center justify-between p-3 crypto-card border border-crypto-border/30 hover:border-crypto-accent/30 rounded-lg transition-all duration-200"
              >
                <label className="text-sm font-medium text-crypto-text-primary capitalize cursor-pointer">
                  {key === 'sms' ? 'SMS Notifications' : 
                   key === 'whatsapp' ? 'WhatsApp Notifications' :
                   key === 'push' ? 'Push Notifications' :
                   `${key} Notifications`}
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-crypto-accent' : 'bg-crypto-border'
                  }`}
                >
                  <motion.span
                    animate={{ x: value ? 24 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="inline-block h-4 w-4 rounded-full bg-white shadow-lg"
                  />
                </motion.button>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-6 p-4 crypto-card border border-blue-500/20 bg-blue-500/10 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">SMS Alert Info</span>
            </div>
            <p className="text-sm text-blue-300">
              SMS alerts are sent automatically when you enter geofenced zones. Cooldown: 30 minutes per zone.
            </p>
          </motion.div>
        </motion.div>
      </div>
      )}

      {/* User Roles & Permissions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="crypto-card p-6 hover:border-blue-500/30 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
            >
              <Users className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">User Roles & Permissions</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="crypto-btn text-sm flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Add Role</span>
          </motion.button>
        </div>
        
        <div className="space-y-4">
          {userRoles.map((roleData, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="crypto-card p-4 border border-crypto-border/30 hover:border-crypto-accent/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-crypto-text-primary">{roleData.role}</h3>
                    <p className="text-sm text-crypto-text-secondary">{roleData.users} users</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="crypto-btn text-xs px-3 py-1"
                >
                  Edit Role
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(roleData.permissions).map(([permission, allowed]) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${allowed ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-crypto-text-secondary capitalize">{permission}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Integrations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="crypto-card p-6 hover:border-green-500/30 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
            >
              <Key className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">System Integrations</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="crypto-btn text-sm flex items-center space-x-2"
          >
            <Key className="h-4 w-4" />
            <span>Add Integration</span>
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemIntegrations.map((integration, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="crypto-card p-4 border border-crypto-border/30 hover:border-crypto-accent/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-crypto-text-primary">{integration.service}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  integration.status === 'Connected' || integration.status === 'Active' 
                    ? 'bg-green-600/20 text-green-400 border-green-500/30' 
                    : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {integration.status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-crypto-text-secondary">API Key:</span>
                  <span className="font-mono text-crypto-text-primary">{integration.apiKey}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wifi className="h-4 w-4 text-crypto-accent" />
                  </motion.div>
                  <span className="text-sm text-crypto-accent">Connection Active</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 glass py-2 px-3 rounded-lg text-xs transition-all duration-200"
                >
                  <RefreshCw className="h-3 w-3 inline mr-1" />
                  Test
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 crypto-btn py-2 px-3 rounded-lg text-xs"
                >
                  Update Key
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Database & System Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.6 }}
        className="crypto-card p-6 hover:border-purple-500/30 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"
          >
            <Database className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-crypto-text-primary">Database & System Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.6, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="crypto-card p-6 text-center border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
          >
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Database className="h-8 w-8 text-green-400" />
            </motion.div>
            <h3 className="font-medium mb-2 text-crypto-text-primary">Database</h3>
            <p className="text-sm text-green-400 font-medium">Operational</p>
            <p className="text-xs text-crypto-text-muted mt-1">Last backup: 2 hours ago</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.7, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="crypto-card p-6 text-center border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Wifi className="h-8 w-8 text-blue-400" />
            </motion.div>
            <h3 className="font-medium mb-2 text-crypto-text-primary">Network</h3>
            <p className="text-sm text-blue-400 font-medium">Stable</p>
            <p className="text-xs text-crypto-text-muted mt-1">Latency: 23ms</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="crypto-card p-6 text-center border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300"
          >
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="h-8 w-8 text-yellow-400" />
            </motion.div>
            <h3 className="font-medium mb-2 text-crypto-text-primary">Security</h3>
            <p className="text-sm text-yellow-400 font-medium">Monitoring</p>
            <p className="text-xs text-crypto-text-muted mt-1">No threats detected</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.9, duration: 0.6 }}
        className="crypto-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6 text-crypto-text-primary">Quick System Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 p-4 rounded-lg transition-all duration-200 text-left"
          >
            <Database className="h-6 w-6 mb-2 text-white" />
            <h3 className="font-semibold text-crypto-text-primary">Backup System</h3>
            <p className="text-sm text-crypto-text-secondary mt-1">Create full system backup</p>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-4 rounded-lg transition-all duration-200 text-left"
          >
            <RefreshCw className="h-6 w-6 mb-2 text-white" />
            <h3 className="font-semibold text-crypto-text-primary">System Refresh</h3>
            <p className="text-sm text-crypto-text-secondary mt-1">Refresh all connections</p>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 p-4 rounded-lg transition-all duration-200 text-left"
          >
            <Shield className="h-6 w-6 mb-2 text-white" />
            <h3 className="font-semibold text-crypto-text-primary">Security Scan</h3>
            <p className="text-sm text-crypto-text-secondary mt-1">Run comprehensive security check</p>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};