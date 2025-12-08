import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TouristIDs } from './components/TouristIDs';
import  Heatmap  from './components/Heatmap';
import { Alerts } from './components/Alerts';
import { EFIR } from './components/EFIR';
import { Geofences } from './components/Geofences';
import { IncidentManagement } from './components/IncidentManagement';
import { AuthPage } from './components/AuthPage';
import type { TouristData } from './components/AuthPage';

// 🎬 Animations
import { motion, AnimatePresence } from 'framer-motion';

export type ActiveSection =
  | 'dashboard'
  | 'tourist-ids'
  | 'register'
  | 'heatmap'
  | 'alerts'
  | 'efir'
  | 'geofences'
  | 'incidents';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [currentTourist, setCurrentTourist] = useState<TouristData | null>(null);

  const handleLogout = () => {
    setCurrentTourist(null);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'tourist-ids':
        return <TouristIDs />;
      case 'register':
        return <AuthPage />;
      case 'heatmap':
        return <Heatmap />;
      case 'alerts':
        return <Alerts />;
      case 'efir':
        return <EFIR />;
      case 'geofences':
        return <Geofences />;
      case 'incidents':
        return <IncidentManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-crypto-bg text-crypto-text-primary relative overflow-hidden">
      {/* 🌌 Crypto-style Background Glow Effects */}
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
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/5 blur-3xl rounded-full"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] grid-pattern"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20"
      >
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
          touristName={currentTourist?.name}
        />
      </motion.div>

      {/* Main Content with Page Transition */}
      <main className={`relative z-10 ${activeSection === 'heatmap' ? 'p-0' : 'p-6 lg:p-8 max-w-7xl mx-auto w-full'}`}>
        <AnimatePresence mode="wait">
          {activeSection === 'heatmap' ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {renderContent()}
            </motion.div>
          ) : (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              className="crypto-card p-6 lg:p-8"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

