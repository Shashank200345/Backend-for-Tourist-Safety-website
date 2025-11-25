// import React from 'react';
// import { Menu, Shield, Globe, User, LogOut } from 'lucide-react';
// import { ActiveSection } from '../App';

// interface HeaderProps {
//   activeSection: ActiveSection;
//   setActiveSection: (section: ActiveSection) => void;
//   toggleSidebar: () => void;
// }

// export const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, toggleSidebar }) => {
//   const navItems = [
//     { id: 'dashboard' as ActiveSection, label: 'Dashboard' },
//     { id: 'tourist-ids' as ActiveSection, label: 'Tourist IDs' },
//     { id: 'heatmap' as ActiveSection, label: 'Heatmap' },
//     { id: 'alerts' as ActiveSection, label: 'Alerts' },
//     { id: 'incidents' as ActiveSection, label: 'Incidents' },
//     { id: 'efir' as ActiveSection, label: 'E-FIR' },
//     { id: 'analytics' as ActiveSection, label: 'Analytics' },
//     { id: 'geofences' as ActiveSection, label: 'Geofences' },
//     { id: 'cases' as ActiveSection, label: 'Cases' },
//     { id: 'settings' as ActiveSection, label: 'Settings' },
//   ];

//   return (
//     <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={toggleSidebar}
//             className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
//           >
//             <Menu className="h-5 w-5" />
//           </button>
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
//               <Shield className="h-6 w-6 text-white" />
//             </div>
//             <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
//               Smart Tourist Safety
//             </h1>
//           </div>
//         </div>

//         <nav className="hidden lg:flex items-center space-x-1 bg-slate-800/50 rounded-xl p-1">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveSection(item.id)}
//               className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
//                 activeSection === item.id
//                   ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
//                   : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div className="flex items-center space-x-4">
//           <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
//             <Globe className="h-5 w-5" />
//           </button>
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
//               <User className="h-4 w-4" />
//             </div>
//             <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
//               <LogOut className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };



import React from 'react';
import { Shield, Globe, User, LogOut } from 'lucide-react';
import { ActiveSection } from '../App';
import { motion } from 'framer-motion';

interface HeaderProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  onLogout?: () => void;
  touristName?: string;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, onLogout, touristName }) => {
  const navItems = [
    { id: 'dashboard' as ActiveSection, label: 'Dashboard' },
    { id: 'tourist-ids' as ActiveSection, label: 'Tourist IDs' },
    { id: 'heatmap' as ActiveSection, label: 'Heatmap' },
    { id: 'alerts' as ActiveSection, label: 'Alerts' },
    { id: 'incidents' as ActiveSection, label: 'Incidents' },
    { id: 'efir' as ActiveSection, label: 'E-FIR' },
    { id: 'geofences' as ActiveSection, label: 'Geofences' },
    { id: 'registration' as ActiveSection, label: 'Register Tourist' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass border-b border-crypto-border/50 px-6 py-4 sticky top-0 z-50 "
    >
      <div className="flex items-center justify-between">
        {/* Left: Logo & Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2 bg-accent-gradient rounded-lg "
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl font-bold gradient-text tracking-wide"
            >
              Smart Tourist Safety
            </motion.h1>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center space-x-2 bg-crypto-surface/60 rounded-2xl p-2 shadow-inner border border-crypto-border/30">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-300 relative overflow-hidden
                ${
                  activeSection === item.id
                    ? 'text-white '
                    : 'text-crypto-text-secondary hover:text-crypto-text-primary hover:bg-crypto-surface/80'
                }`}
            >
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-accent-gradient rounded-lg "
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ rotate: 15, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-crypto-surface/80 transition-all duration-200"
          >
            <Globe className="h-5 w-5 text-crypto-text-secondary hover:text-crypto-accent" />
          </motion.button>

          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 1 }}
              className="w-8 h-8 bg-accent-gradient rounded-full flex items-center justify-center"
              title={touristName || 'User'}
            >
              <User className="h-4 w-4 text-white" />
            </motion.div>
            {touristName && (
              <span className="text-sm text-crypto-text-secondary hidden sm:block">
                {touristName}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-crypto-surface/80 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-crypto-text-secondary hover:text-red-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
