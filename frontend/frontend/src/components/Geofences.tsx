// /**
//  * Geofences Component - Full Supabase Integration
//  * 
//  * Complete geofencing system for Northeast India with:
//  * - Supabase/PostGIS backend integration
//  * - Real-time location detection with ENTER/EXIT event logging
//  * - Leaflet map with polygon and circle zone support
//  * - MAPOG GeoJSON import
//  * - Color-coded zones (SAFE, MONITORED, RESTRICTED, EMERGENCY)
//  * - Interactive zone creation with draggable radius handle
//  */


// // export const Geofences: React.FC = () => {
// //   const [showCreateForm, setShowCreateForm] = useState(false);
// //   const [selectedZone, setSelectedZone] = useState<any>(null);

// //   const geofences = [
// //     {
// //       id: 'GF-001',
// //       name: 'Marina Beach Safe Zone',
// //       type: 'SAFE',
// //       riskLevel: 'LOW',
// //       coordinates: { lat: 13.0475, lng: 80.2824 },
// //       radius: 500,
// //       activeVisitors: 342,
// //       totalVisits: 2847,
// //       alerts: 5,
// //       status: 'ACTIVE',
// //       notifications: {
// //         entry: true,
// //         exit: true,
// //         extended_stay: false
// //       },
// //       rules: ['No swimming after 6 PM', 'Stay in designated areas']
// //     },
// //     {
// //       id: 'GF-002',
// //       name: 'High Crime Area - Sector 7',
// //       type: 'RESTRICTED',
// //       riskLevel: 'HIGH',
// //       coordinates: { lat: 13.0525, lng: 80.2750 },
// //       radius: 300,
// //       activeVisitors: 12,
// //       totalVisits: 156,
// //       alerts: 23,
// //       status: 'ACTIVE',
// //       notifications: {
// //         entry: true,
// //         exit: true,
// //         extended_stay: true
// //       },
// //       rules: ['Immediate alert on entry', 'Police dispatch required', 'Tourist advisory sent']
// //     },
// //     {
// //       id: 'GF-003',
// //       name: 'Fort Kochi Heritage Zone',
// //       type: 'MONITORED',
// //       riskLevel: 'MEDIUM',
// //       coordinates: { lat: 9.9658, lng: 76.2427 },
// //       radius: 750,
// //       activeVisitors: 89,
// //       totalVisits: 1923,
// //       alerts: 8,
// //       status: 'ACTIVE',
// //       notifications: {
// //         entry: false,
// //         exit: false,
// //         extended_stay: true
// //       },
// //       rules: ['Heritage site guidelines', 'Guided tours recommended']
// //     },
// //     {
// //       id: 'GF-004',
// //       name: 'Emergency Assembly Point',
// //       type: 'EMERGENCY',
// //       riskLevel: 'CRITICAL',
// //       coordinates: { lat: 19.0760, lng: 72.8777 },
// //       radius: 200,
// //       activeVisitors: 0,
// //       totalVisits: 45,
// //       alerts: 0,
// //       status: 'STANDBY',
// //       notifications: {
// //         entry: true,
// //         exit: true,
// //         extended_stay: false
// //       },
// //       rules: ['Emergency evacuation point', 'Medical assistance available']
// //     }
// //   ];

// //   const getZoneTypeColor = (type: string) => {
// //     switch (type) {
// //       case 'SAFE': return 'text-green-400 bg-green-500/20 border-green-500/30';
// //       case 'RESTRICTED': return 'text-red-400 bg-red-500/20 border-red-500/30';
// //       case 'MONITORED': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
// //       case 'EMERGENCY': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
// //       default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
// //     }
// //   };

// //   const getRiskLevelColor = (level: string) => {
// //     switch (level) {
// //       case 'LOW': return 'text-green-400 bg-green-500/20';
// //       case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
// //       case 'HIGH': return 'text-orange-400 bg-orange-500/20';
// //       case 'CRITICAL': return 'text-red-400 bg-red-500/20';
// //       default: return 'text-gray-400 bg-gray-500/20';
// //     }
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       transition={{ duration: 0.6 }}
// //       className="space-y-6"
// //     >
// //       <motion.div
// //         initial={{ opacity: 0, y: -20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ delay: 0.2, duration: 0.6 }}
// //         className="flex items-center justify-between"
// //       >
// //         <div>
// //           <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>
// //             Geofence & Risk Zone Management
// //           </h1>
// //           <p className="text-crypto-text-secondary mt-1">Configure and monitor geographical boundaries</p>
// //         </div>
// //         <motion.button
// //           whileHover={{ scale: 1.05 }}
// //           whileTap={{ scale: 0.95 }}
// //           onClick={() => setShowCreateForm(true)}
// //           className="crypto-btn flex items-center space-x-2"
// //         >
// //           <Plus className="h-4 w-4" />
// //           <span>Create Geofence</span>
// //         </motion.button>
// //       </motion.div>

// //       {/* Zone Statistics */}
// //       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.4, duration: 0.6 }}
// //           className="crypto-card p-6"
// //         >
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-crypto-text-secondary text-sm font-medium">Active Zones</p>
// //               <p className="text-2xl font-bold text-crypto-text-primary">12</p>
// //             </div>
// //             <motion.div
// //               whileHover={{ scale: 1.1, rotate: 5 }}
// //               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
// //             >
// //               <MapPin className="h-6 w-6 text-white" />
// //             </motion.div>
// //           </div>
// //         </motion.div>
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.5, duration: 0.6 }}
// //           className="crypto-card p-6"
// //         >
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-crypto-text-secondary text-sm font-medium">High Risk Zones</p>
// //               <p className="text-2xl font-bold text-red-400">3</p>
// //             </div>
// //             <motion.div
// //               whileHover={{ scale: 1.1, rotate: 5 }}
// //               className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg"
// //             >
// //               <AlertTriangle className="h-6 w-6 text-white" />
// //             </motion.div>
// //           </div>
// //         </motion.div>
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.6, duration: 0.6 }}
// //           className="crypto-card p-6"
// //         >
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-crypto-text-secondary text-sm font-medium">Zone Violations</p>
// //               <p className="text-2xl font-bold text-yellow-400">18</p>
// //             </div>
// //             <motion.div
// //               whileHover={{ scale: 1.1, rotate: 5 }}
// //               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
// //             >
// //               <Shield className="h-6 w-6 text-white" />
// //             </motion.div>
// //           </div>
// //         </motion.div>
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.7, duration: 0.6 }}
// //           className="crypto-card p-6"
// //         >
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <p className="text-crypto-text-secondary text-sm font-medium">Tourists in Zones</p>
// //               <p className="text-2xl font-bold text-green-400">443</p>
// //             </div>
// //             <motion.div
// //               whileHover={{ scale: 1.1, rotate: 5 }}
// //               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
// //             >
// //               <Users className="h-6 w-6 text-white" />
// //             </motion.div>
// //           </div>
// //         </motion.div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         {/* Interactive Map */}
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.8, duration: 0.6 }}
// //           className="lg:col-span-2 crypto-card p-6"
// //         >
// //           <div className="flex items-center justify-between mb-4">
// //             <div className="flex items-center space-x-3">
// //               <motion.div
// //                 whileHover={{ scale: 1.1, rotate: 5 }}
// //                 className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
// //               >
// //                 <MapPin className="h-5 w-5 text-white" />
// //               </motion.div>
// //               <h2 className="text-xl font-semibold text-crypto-text-primary">Zone Management Map</h2>
// //             </div>
// //             <div className="flex items-center space-x-2">
// //               <motion.button
// //                 whileHover={{ scale: 1.05 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 className="text-sm text-crypto-text-secondary hover:text-crypto-text-primary px-3 py-1 rounded-lg glass transition-all duration-200"
// //               >
// //                 Drawing Tools
// //               </motion.button>
// //               <motion.button
// //                 whileHover={{ scale: 1.05 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 className="text-sm text-crypto-text-secondary hover:text-crypto-text-primary px-3 py-1 rounded-lg glass transition-all duration-200"
// //               >
// //                 Layers
// //               </motion.button>
// //             </div>
// //           </div>
// //           <div className="bg-crypto-surface/30 rounded-xl h-96 flex items-center justify-center relative overflow-hidden border border-crypto-border/30">
// //             <div className="absolute inset-0 bg-gradient-to-br from-crypto-accent/20 via-crypto-surface to-green-900/20"></div>

// //             {/* Simulated geofence zones */}
// //             <div className="absolute top-20 left-32 w-16 h-16 border-2 border-green-400 rounded-full opacity-60 animate-pulse"></div>
// //             <div className="absolute top-32 right-40 w-12 h-12 border-2 border-red-400 rounded-full opacity-60 animate-pulse"></div>
// //             <div className="absolute bottom-24 left-40 w-20 h-20 border-2 border-yellow-400 rounded-full opacity-60 animate-pulse"></div>
// //             <div className="absolute bottom-32 right-32 w-8 h-8 border-2 border-purple-400 rounded-full opacity-60 animate-pulse"></div>

// //             {/* Tourist markers */}
// //             <div className="absolute top-24 left-36 w-2 h-2 bg-blue-400 rounded-full"></div>
// //             <div className="absolute top-36 right-44 w-2 h-2 bg-blue-400 rounded-full"></div>
// //             <div className="absolute bottom-28 left-44 w-2 h-2 bg-blue-400 rounded-full"></div>

// //             <div className="relative z-10 text-center">
// //               <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
// //                 <MapPin className="h-12 w-12 text-crypto-accent mx-auto mb-4" />
// //               </motion.div>
// //               <p className="text-crypto-text-primary font-medium">Interactive Geofence Map</p>
// //               <p className="text-sm text-crypto-text-secondary mt-2">Draw zones • Set boundaries • Configure alerts</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* Zone List */}
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 1, duration: 0.6 }}
// //           className="crypto-card p-6"
// //         >
// //           <div className="flex items-center space-x-3 mb-6">
// //             <motion.div
// //               whileHover={{ scale: 1.1, rotate: 5 }}
// //               className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
// //             >
// //               <Settings className="h-5 w-5 text-white" />
// //             </motion.div>
// //             <h2 className="text-xl font-semibold text-crypto-text-primary">Active Zones</h2>
// //           </div>
// //           <div className="space-y-4 max-h-96 overflow-y-auto">
// //             {geofences.map((zone, index) => (
// //               <motion.div
// //                 key={index}
// //                 initial={{ opacity: 0, x: -20 }}
// //                 animate={{ opacity: 1, x: 0 }}
// //                 transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
// //                 className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200"
// //               >
// //                 <div className="flex items-center justify-between mb-2">
// //                   <h3 className="font-medium text-sm text-crypto-text-primary">{zone.name}</h3>
// //                   <div className="flex items-center space-x-1">
// //                     <motion.button
// //                       whileHover={{ scale: 1.1 }}
// //                       whileTap={{ scale: 0.9 }}
// //                       onClick={() => setSelectedZone(zone)}
// //                       className="p-1 text-crypto-text-secondary hover:text-crypto-accent transition-colors"
// //                     >
// //                       <Eye className="h-3 w-3" />
// //                     </motion.button>
// //                     <motion.button
// //                       whileHover={{ scale: 1.1 }}
// //                       whileTap={{ scale: 0.9 }}
// //                       className="p-1 text-crypto-text-secondary hover:text-crypto-accent transition-colors"
// //                     >
// //                       <Edit className="h-3 w-3" />
// //                     </motion.button>
// //                   </div>
// //                 </div>
// //                 <div className="flex items-center space-x-2 mb-3">
// //                   <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(zone.type)}`}>
// //                     {zone.type}
// //                   </span>
// //                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
// //                     {zone.riskLevel}
// //                   </span>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-2 text-xs text-crypto-text-secondary">
// //                   <div>
// //                     <span>Visitors: </span>
// //                     <span className="text-crypto-text-primary font-medium">{zone.activeVisitors}</span>
// //                   </div>
// //                   <div>
// //                     <span>Alerts: </span>
// //                     <span className="text-crypto-text-primary font-medium">{zone.alerts}</span>
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             ))}
// //           </div>
// //         </motion.div>
// //       </div>

// //       {/* Zone Details Table */}
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ delay: 1.2, duration: 0.6 }}
// //         className="crypto-card overflow-hidden"
// //       >
// //         <div className="p-6 border-b border-crypto-border/30">
// //           <h2 className="text-xl font-semibold text-crypto-text-primary">Zone Configuration</h2>
// //         </div>
// //         <div className="overflow-x-auto">
// //           <table className="w-full">
// //             <thead className="bg-crypto-surface/30">
// //               <tr className="text-left text-crypto-text-secondary text-sm">
// //                 <th className="p-4">Zone Name</th>
// //                 <th className="p-4">Type</th>
// //                 <th className="p-4">Risk Level</th>
// //                 <th className="p-4">Radius</th>
// //                 <th className="p-4">Active Visitors</th>
// //                 <th className="p-4">Alerts</th>
// //                 <th className="p-4">Status</th>
// //                 <th className="p-4">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {geofences.map((zone, index) => (
// //                 <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
// //                   <td className="p-4 font-medium">{zone.name}</td>
// //                   <td className="p-4">
// //                     <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(zone.type)}`}>
// //                       {zone.type}
// //                     </span>
// //                   </td>
// //                   <td className="p-4">
// //                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
// //                       {zone.riskLevel}
// //                     </span>
// //                   </td>
// //                   <td className="p-4 text-sm text-slate-400">{zone.radius}m</td>
// //                   <td className="p-4 text-sm">{zone.activeVisitors}</td>
// //                   <td className="p-4 text-sm">{zone.alerts}</td>
// //                   <td className="p-4">
// //                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                       zone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
// //                     }`}>
// //                       {zone.status}
// //                     </span>
// //                   </td>
// //                   <td className="p-4">
// //                     <div className="flex items-center space-x-2">
// //                       <motion.button
// //                         whileHover={{ scale: 1.05 }}
// //                         whileTap={{ scale: 0.95 }}
// //                         className="p-2 bg-teal-400 hover:bg-teal-500 rounded-lg transition-colors"
// //                       >
// //                         <Edit className="h-3 w-3 text-white" />
// //                       </motion.button>
// //                       <motion.button
// //                         whileHover={{ scale: 1.05 }}
// //                         whileTap={{ scale: 0.95 }}
// //                         className="p-2 bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
// //                       >
// //                         <Trash2 className="h-3 w-3 text-white" />
// //                       </motion.button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </motion.div>

// //       {/* Zone Detail Modal */}
// //       {selectedZone && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// //             <div className="p-6 border-b border-slate-700">
// //               <div className="flex items-center justify-between">
// //                 <h2 className="text-2xl font-bold">{selectedZone.name}</h2>
// //                 <button
// //                   onClick={() => setSelectedZone(null)}
// //                   className="text-slate-400 hover:text-white"
// //                 >
// //                   ✕
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="p-6 space-y-6">
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 <div>
// //                   <h3 className="text-lg font-semibold mb-4">Zone Information</h3>
// //                   <div className="space-y-3">
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Type:</span>
// //                       <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(selectedZone.type)}`}>
// //                         {selectedZone.type}
// //                       </span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Risk Level:</span>
// //                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(selectedZone.riskLevel)}`}>
// //                         {selectedZone.riskLevel}
// //                       </span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Radius:</span>
// //                       <span>{selectedZone.radius}m</span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Status:</span>
// //                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                         selectedZone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
// //                       }`}>
// //                         {selectedZone.status}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div>
// //                   <h3 className="text-lg font-semibold mb-4">Statistics</h3>
// //                   <div className="space-y-3">
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Active Visitors:</span>
// //                       <span className="font-medium">{selectedZone.activeVisitors}</span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Total Visits:</span>
// //                       <span className="font-medium">{selectedZone.totalVisits.toLocaleString()}</span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-slate-400">Alerts Generated:</span>
// //                       <span className="font-medium">{selectedZone.alerts}</span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div>
// //                 <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
// //                 <div className="space-y-3">
// //                   {Object.entries(selectedZone.notifications).map(([key, value]) => (
// //                     <div key={key} className="flex items-center justify-between">
// //                       <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
// //                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                         value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
// //                       }`}>
// //                         {value ? 'Enabled' : 'Disabled'}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div>
// //                 <h3 className="text-lg font-semibold mb-4">Zone Rules</h3>
// //                 <div className="bg-slate-900/50 rounded-lg p-4">
// //                   <ul className="space-y-2">
// //                     {selectedZone.rules.map((rule: string, index: number) => (
// //                       <li key={index} className="text-sm text-slate-400 flex items-start space-x-2">
// //                         <span className="text-teal-400 mt-1">•</span>
// //                         <span>{rule}</span>
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               </div>

// //               <div className="flex space-x-4">
// //                 <button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 py-2 px-4 rounded-lg transition-all duration-200">
// //                   Edit Zone
// //                 </button>
// //                 <button className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors">
// //                   Delete Zone
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // };

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import * as turf from "@turf/turf";
// import { MapPin, Plus, Edit, Trash2, Settings, Eye, Upload, AlertCircle, CheckCircle, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { supabase, Zone, getCurrentUser } from "../lib/supabaseClient";
// import { GeoImport } from "./GeoImport";

// // Notification type for on-screen alerts
// interface Notification {
//   id: string;
//   type: 'ENTER' | 'EXIT';
//   zoneName: string;
//   zoneType: string;
//   message: string;
//   timestamp: Date;
// }

// // This file adds interactive geofence creation on the map in realtime
// // with full Supabase/PostGIS integration:
// // 1) Load zones from Supabase database
// // 2) Real-time location detection with ENTER/EXIT event logging
// // 3) Interactive zone creation with draggable radius handle
// // 4) MAPOG GeoJSON import support
// // 5) Color-coded zones (SAFE, MONITORED, RESTRICTED, EMERGENCY)

// export const Geofences: React.FC = () => {
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showImportForm, setShowImportForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
//   const [zoneToEdit, setZoneToEdit] = useState<any | null>(null);
//   const [showLabels, setShowLabels] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<any>(null);
  
//   // Notifications for on-screen display
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // Zones loaded from Supabase
//   const [geofences, setGeofences] = useState<Zone[]>([]);
//   const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger

//   // Location tracking state
//   const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
//   const [lastTrackedLocation, setLastTrackedLocation] = useState<[number, number] | null>(null);
//   const locationTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Track which zones the user is currently inside
//   const insideMapRef = useRef<Record<string, boolean>>({});
//   const lastEventTimeRef = useRef<Record<string, number>>({}); // Cooldown tracking

//   // Helper function to format zone data
//   function formatZoneData(zone: Zone) {
//     return {
//       ...zone,
//       type: zone.zone_type,
//       riskLevel: zone.risk_level,
//       coordinates: (() => {
//         // First try center_lat/center_lng
//         if (zone.center_lat && zone.center_lng) {
//           return { lat: zone.center_lat, lng: zone.center_lng };
//         }
//         // Then try to extract from geometry
//         const extracted = extractCoordinatesFromGeometry(zone.geometry);
//         if (extracted) {
//           return extracted;
//         }
//         // If geometry exists but extraction failed, return null (will be handled in drawZone)
//         // For polygon zones, we don't need coordinates - geometry is enough
//         return null;
//       })(),
//       radius: zone.radius_meters || 0,
//       activeVisitors: zone.active_visitors || 0,
//       totalVisits: zone.total_visits || 0,
//       alerts: zone.total_alerts || 0,
//       notifications: zone.notifications as { entry: boolean; exit: boolean; extended_stay: boolean },
//       rules: Array.isArray(zone.rules) ? zone.rules : [],
//       geometry: zone.geometry, // Preserve geometry for polygon zones
//     };
//   }

//   // Load zones from Supabase - wrapped in useCallback for real-time subscription
//   const loadZones = useCallback(async (silent = false) => {
//     if (!silent) {
//       setLoading(true);
//     }
//     setError(null);
//     try {
//       console.log('🔍 Fetching zones from Supabase...');
//       const { data, error: fetchError } = await supabase
//         .from('zones')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (fetchError) {
//         console.error('❌ Error fetching zones:', fetchError);
//         let errorMessage = fetchError.message;
//         if (fetchError.message?.includes('schema cache') || fetchError.message?.includes('relation') || fetchError.code === 'PGRST116') {
//           errorMessage = 'Zones table not found. Please ensure the table exists in Supabase and Row Level Security (RLS) policies allow access.';
//         } else if (fetchError.code === '42501') {
//           errorMessage = 'Permission denied. Please check your Supabase RLS policies for the zones table.';
//         }
//         setError(errorMessage);
//         return;
//       }

//       // Convert database format to component format
//       const formattedZones = (data || []).map((zone: Zone) => {
//         // Parse geometry if it's a string (JSONB from Supabase)
//         let parsedGeometry = zone.geometry;
//         if (typeof zone.geometry === 'string') {
//           try {
//             parsedGeometry = JSON.parse(zone.geometry);
//           } catch (e) {
//             console.warn('Failed to parse geometry for zone:', zone.id, e);
//           }
//         }
        
//         const formatted = formatZoneData({
//           ...zone,
//           geometry: parsedGeometry as GeoJSON.Geometry
//         });
        
//         // Debug log for each zone with raw data
//         console.log(`Zone: ${formatted.name}`, {
//           id: formatted.id,
//           status: formatted.status,
//           type: formatted.type,
//           hasCoordinates: !!formatted.coordinates,
//           coordinates: formatted.coordinates,
//           center_lat: zone.center_lat,
//           center_lng: zone.center_lng,
//           hasRadius: formatted.radius > 0,
//           radius_meters: zone.radius_meters,
//           hasGeometry: !!formatted.geometry,
//           geometryType: formatted.geometry?.type,
//           rawGeometry: zone.geometry // Show raw geometry to debug
//         });
        
//         return formatted;
//       });

//       console.log(`✅ Successfully fetched ${formattedZones.length} zones`);
//       console.log('Formatted zones:', formattedZones);
//       // Update state - this will trigger map re-render via useEffect
//       setGeofences([...formattedZones] as any); // Create new array reference
//       setRefreshKey(prev => prev + 1); // Force refresh
//     } catch (err: any) {
//       console.error('❌ Unexpected error loading zones:', err);
//       setError(err.message || 'Failed to load zones');
//     } finally {
//       if (!silent) {
//         setLoading(false);
//       }
//     }
//   }, []);

//   // Load zones from Supabase on mount and set up real-time subscription
//   useEffect(() => {
//     loadZones();
//     getCurrentUser().then(setCurrentUser);

//     // Set up real-time subscription for zones table
//     let channel: ReturnType<typeof supabase.channel> | null = null;

//     try {
//       console.log('🔔 Setting up real-time subscription for zones...');
//       channel = supabase
//         .channel('zones-realtime')
//         .on(
//           'postgres_changes',
//           {
//             event: '*', // Listen to INSERT, UPDATE, DELETE
//             schema: 'public',
//             table: 'zones'
//           },
//           (payload) => {
//             console.log('🔔 Zone change received:', payload);

//             try {
//               if (payload.eventType === 'INSERT') {
//                 // Parse geometry if it's a string
//                 let parsedGeometry = (payload.new as any).geometry;
//                 if (typeof parsedGeometry === 'string') {
//                   try {
//                     parsedGeometry = JSON.parse(parsedGeometry);
//                   } catch (e) {
//                     console.warn('Failed to parse geometry for new zone:', e);
//                   }
//                 }
//                 const newZone = formatZoneData({
//                   ...(payload.new as Zone),
//                   geometry: parsedGeometry as GeoJSON.Geometry
//                 });
//                 console.log('➕ New zone inserted:', newZone);
//                 setGeofences(prev => {
//                   // Check if zone already exists (avoid duplicates)
//                   if (prev.some(z => z.id === newZone.id)) {
//                     return prev;
//                   }
//                   return [newZone, ...prev] as any;
//                 });
//                 setRefreshKey(prev => prev + 1); // Force map refresh
//               } else if (payload.eventType === 'UPDATE') {
//                 // Parse geometry if it's a string
//                 let parsedGeometry = (payload.new as any).geometry;
//                 if (typeof parsedGeometry === 'string') {
//                   try {
//                     parsedGeometry = JSON.parse(parsedGeometry);
//                   } catch (e) {
//                     console.warn('Failed to parse geometry for updated zone:', e);
//                   }
//                 }
//                 const updatedZone = formatZoneData({
//                   ...(payload.new as Zone),
//                   geometry: parsedGeometry as GeoJSON.Geometry
//                 });
//                 console.log('🔄 Zone updated:', updatedZone);
//                 setGeofences(prev =>
//                   prev.map(zone =>
//                     zone.id === updatedZone.id ? updatedZone : zone
//                   ) as any
//                 );
//                 setRefreshKey(prev => prev + 1); // Force map refresh
//               } else if (payload.eventType === 'DELETE') {
//                 console.log('🗑️ Zone deleted:', payload.old.id);
//                 setGeofences(prev => prev.filter(zone => zone.id !== payload.old.id) as any);
//                 setRefreshKey(prev => prev + 1); // Force map refresh
//               }
//             } catch (err) {
//               console.error('❌ Error processing real-time zone update:', err);
//             }
//           }
//         )
//         .subscribe((status) => {
//           console.log('Subscription status:', status);
//           if (status === 'SUBSCRIBED') {
//             console.log('✅ Successfully subscribed to zones real-time updates');
//           } else if (status === 'CHANNEL_ERROR') {
//             console.error('❌ Channel subscription error - zones table may not exist or RLS policies may be blocking access. Ensure Realtime is enabled for the "zones" table in Supabase -> Database -> Replication.');
//             setError('Real-time subscription failed. Check console for details. Ensure "zones" table is enabled for Realtime in Supabase.');
//           } else if (status === 'TIMED_OUT') {
//             console.warn('⚠️ Subscription timed out');
//           } else if (status === 'CLOSED') {
//             console.warn('⚠️ Subscription closed');
//           }
//         });
//     } catch (err) {
//       console.error('❌ Error setting up real-time subscription:', err);
//       setError('Failed to set up real-time subscription. Check console for details.');
//     }

//     return () => {
//       if (channel) {
//         console.log('🧹 Cleaning up real-time subscription');
//         supabase.removeChannel(channel);
//       }
//     };
//   }, [loadZones]);

//   function extractCoordinatesFromGeometry(geometry: GeoJSON.Geometry | null | undefined): { lat: number; lng: number } | null {
//     if (!geometry) {
//       console.warn('extractCoordinatesFromGeometry: geometry is null or undefined');
//       return null;
//     }
    
//     try {
//       // Handle Point geometry (for circle zones)
//       if (geometry.type === 'Point') {
//         const coords = (geometry as GeoJSON.Point).coordinates;
//         if (coords && Array.isArray(coords) && coords.length >= 2) {
//           const lng = coords[0];
//           const lat = coords[1];
//           // Validate coordinates are valid numbers
//           if (typeof lat === 'number' && typeof lng === 'number' && 
//               !isNaN(lat) && !isNaN(lng) && 
//               lat !== 0 && lng !== 0) {
//             return { lat, lng };
//           }
//         }
//       }
      
//       // For polygons, get centroid
//       if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
//         const polygon = turf.feature(geometry);
//         const centroid = turf.centroid(polygon);
//         const coords = centroid.geometry.coordinates;
//         if (coords && Array.isArray(coords) && coords.length >= 2) {
//           const lng = coords[0];
//           const lat = coords[1];
//           // Validate coordinates are valid numbers
//           if (typeof lat === 'number' && typeof lng === 'number' && 
//               !isNaN(lat) && !isNaN(lng) && 
//               lat !== 0 && lng !== 0) {
//             return { lat, lng };
//           }
//         }
//       }
//     } catch (e) {
//       console.error('Error extracting coordinates from geometry:', e, geometry);
//     }
    
//     return null;
//   }

//   // Store user location to database for tracking
//   async function storeUserLocation(lat: number, lng: number, position?: GeolocationPosition) {
//     try {
//       const user = await getCurrentUser();
//       const userId = user?.id || null;

//       // Don't store if same location (within 10 meters)
//       if (lastTrackedLocation) {
//         const distance = turf.distance(
//           turf.point([lastTrackedLocation[1], lastTrackedLocation[0]]),
//           turf.point([lng, lat]),
//           { units: 'meters' }
//         );
        
//         // Only store if moved more than 10 meters
//         if (distance < 10) {
//           return;
//         }
//       }

//       // Prepare location data
//       const locationData: any = {
//         user_id: userId,
//         latitude: lat,
//         longitude: lng,
//         accuracy_meters: position?.coords.accuracy || null,
//         altitude: position?.coords.altitude || null,
//         heading: position?.coords.heading || null,
//         speed: position?.coords.speed || null,
//         device_info: {
//           userAgent: navigator.userAgent,
//           platform: navigator.platform,
//           isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
//           screenWidth: window.screen.width,
//           screenHeight: window.screen.height,
//         },
//       };

//       // Insert into user_locations table
//       const { error } = await supabase
//         .from('user_locations')
//         .insert(locationData);

//       if (error) {
//         // Don't log RLS errors as critical (expected when not logged in)
//         if (!error.message?.includes('row-level security')) {
//           console.error('Error storing location:', error);
//         }
//       } else {
//         console.log(`📍 Location stored: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
//         setLastTrackedLocation([lat, lng]);
        
//         // Update user_profiles current location directly (faster)
//         if (userId) {
//           await supabase
//             .from('user_profiles')
//             .update({
//               current_latitude: lat,
//               current_longitude: lng,
//               location_updated_at: new Date().toISOString(),
//             })
//             .eq('id', userId);
//         }
//       }
//     } catch (err: any) {
//       console.error('Error in storeUserLocation:', err);
//     }
//   }

//   // Delete zone handler
//   async function handleDeleteZone(zoneId: string, zoneName: string) {
//     if (!confirm(`Are you sure you want to delete "${zoneName}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       // First, remove from map immediately
//       if (layersRef.current[zoneId]) {
//         try {
//           const layerObj = layersRef.current[zoneId];
//           if (layerObj.circle && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.circle);
//           }
//           if (layerObj.polygon && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.polygon);
//           }
//           if (layerObj.tooltip && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.tooltip);
//           }
//           delete layersRef.current[zoneId];
//         } catch (e) {
//           console.warn('Error removing layer:', e);
//         }
//       }

//       // Delete from database
//       const { error } = await supabase
//         .from('zones')
//         .delete()
//         .eq('id', zoneId);

//       if (error) throw error;

//       // Clear selected zone if it was deleted
//       if (selectedZone?.id === zoneId) {
//         setSelectedZone(null);
//       }

//       // Remove from state immediately (creates new array reference)
//       // Don't reload from DB - state update is immediate and correct
//       setGeofences((prev) => {
//         const filtered = prev.filter((z) => z.id !== zoneId);
//         console.log(`Deleted zone from state. Remaining: ${filtered.length}`);
//         return [...filtered]; // Ensure new array reference
//       });
//       setRefreshKey(prev => prev + 1); // Force refresh

//       console.log(`✅ Zone "${zoneName}" deleted successfully`);
//     } catch (err: any) {
//       console.error('Error deleting zone:', err);
//       alert(`Failed to delete zone: ${err.message}`);
//     }
//   }

//   // Edit zone handler - opens edit modal
//   function handleEditZone(zone: any) {
//     setZoneToEdit(zone);
//     setShowEditForm(true);
//   }

//   // Save edited zone handler
//   async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     if (!zoneToEdit) return;

//     const formData = new FormData(event.currentTarget);
//     const name = formData.get('name') as string;
//     const description = formData.get('description') as string;
//     const zone_type = formData.get('type') as string;
//     const risk_level = formData.get('risk') as string;
//     const status = formData.get('status') as string;

//     try {
//       const updateData: any = {
//         name,
//         description: description || null,
//         zone_type,
//         risk_level,
//         status,
//         updated_at: new Date().toISOString(),
//       };

//       // Update geometry if it's a circle zone and coordinates/radius changed
//       const isCircle = zoneToEdit.geometry?.type === 'Point';
//       if (isCircle) {
//         const lat = parseFloat(formData.get('lat') as string);
//         const lng = parseFloat(formData.get('lng') as string);
//         const radius = parseFloat(formData.get('radius') as string);

//         if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
//           updateData.geometry = {
//             type: 'Point',
//             coordinates: [lng, lat],
//             properties: { radius }
//           };
//           updateData.center_lat = lat;
//           updateData.center_lng = lng;
//           updateData.radius_meters = radius;
//         }
//       }

//       // First, remove old layer from map if geometry changed
//       const editedZoneId = zoneToEdit.id;
//       if (layersRef.current[editedZoneId]) {
//         try {
//           const layerObj = layersRef.current[editedZoneId];
//           if (layerObj.circle && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.circle);
//           }
//           if (layerObj.polygon && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.polygon);
//           }
//           if (layerObj.tooltip && mapRef.current) {
//             mapRef.current.removeLayer(layerObj.tooltip);
//           }
//           delete layersRef.current[editedZoneId];
//         } catch (e) {
//           console.warn('Error removing layer:', e);
//         }
//       }

//       // Update in database
//       const { error } = await supabase
//         .from('zones')
//         .update(updateData)
//         .eq('id', editedZoneId);

//       if (error) throw error;

//       // Update state immediately with edited zone data
//       setGeofences((prev) => {
//         return prev.map((z) => {
//           if (z.id === editedZoneId) {
//             // Create updated zone object
//             const updated: any = {
//               ...z,
//               name,
//               description: description || null,
//               zone_type,
//               risk_level,
//               status,
//               type: zone_type,
//               riskLevel: risk_level,
//             };

//             // Update geometry if circle zone
//             if (isCircle) {
//               const lat = parseFloat(formData.get('lat') as string);
//               const lng = parseFloat(formData.get('lng') as string);
//               const radius = parseFloat(formData.get('radius') as string);

//               if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
//                 const newGeometry = {
//                   type: 'Point',
//                   coordinates: [lng, lat],
//                   properties: { radius }
//                 } as GeoJSON.Point;
//                 updated.geometry = newGeometry;
//                 updated.center_lat = lat;
//                 updated.center_lng = lng;
//                 updated.radius_meters = radius;
//                 updated.coordinates = { lat, lng };
//                 updated.radius = radius;
//               }
//             }

//             return updated;
//           }
//           return z;
//         });
//       });
//       setRefreshKey(prev => prev + 1); // Force refresh

//       // Close edit modal
//       setShowEditForm(false);
//       setZoneToEdit(null);
      
//       // Update selected zone if it was edited
//       setSelectedZone((prev) => {
//         if (prev?.id === editedZoneId) {
//           return {
//             ...prev,
//             name,
//             description: description || null,
//             zone_type: zone_type as any,
//             risk_level: risk_level as any,
//             status: status as any,
//             type: zone_type,
//             riskLevel: risk_level,
//           } as any;
//         }
//         return prev;
//       });

//       console.log(`✅ Zone "${name}" updated successfully`);
//     } catch (err: any) {
//       console.error('Error updating zone:', err);
//       alert(`Failed to update zone: ${err.message}`);
//     }
//   }

//   // Leaflet map refs
//   const mapRef = useRef<L.Map | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const layersRef = useRef<
//     Record<string, { circle?: L.Circle; polygon?: L.GeoJSON; tooltip?: L.Tooltip }>
//   >({});
//   const userMarkerRef = useRef<L.Marker | null>(null);

//   // Create-mode helpers
//   const [tempCenter, setTempCenter] = useState<L.LatLng | null>(null);
//   const tempCircleRef = useRef<L.Circle | null>(null);
//   const tempHandleRef = useRef<L.Marker | null>(null);

//   // inject component CSS on mount (outline/shadow + label hide rule via container class)
//   useEffect(() => {
//     const css = `
//       .zone-label { background: rgba(0,0,0,0.65) !important; color: #fff !important; border: none !important; padding: 4px 8px !important; border-radius: 6px !important; font-size: 12px !important; line-height: 1 !important; white-space: nowrap !important; pointer-events: auto !important; cursor: pointer !important; transition: background 0.2s !important; box-shadow: 0 2px 6px rgba(0,0,0,0.4); }
//       .zone-label:hover { background: rgba(0,0,0,0.85) !important; }
//       .geofence-circle { filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35)); }
//       .geofence-circle .leaflet-interactive { stroke-linejoin: round; }
//       .hide-zone-labels .zone-label { display: none !important; }
//       .user-location-marker {
//         background: transparent !important;
//         border: none !important;
//         z-index: 10000 !important;
//       }
//       .user-location-marker > div {
//         animation: pulse 2s infinite;
//       }
//       @keyframes pulse {
//         0% {
//           box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
//         }
//         50% {
//           box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 12px rgba(59, 130, 246, 0.2);
//         }
//         100% {
//           box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
//         }
//       }
//     `;
//     const style = document.createElement("style");
//     style.setAttribute("data-generated", "geofence-styles");
//     style.innerHTML = css;
//     document.head.appendChild(style);

//     return () => {
//       try {
//         document.head.removeChild(style);
//       } catch (e) {}
//     };
//   }, []);

//   useEffect(() => {
//     if (!containerRef.current) return;
//     if (mapRef.current) return; // init once

//     const map = L.map(containerRef.current).setView([26.0, 92.0], 6); // center on Northeast India
//     mapRef.current = map;

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       maxZoom: 19,
//       attribution: "&copy; OpenStreetMap contributors",
//     }).addTo(map);

//     // draw initial geofences
//     geofences.forEach((zone) => drawZone(zone));

//     // map click handler used for create mode
//     map.on("click", (e: L.LeafletMouseEvent) => {
//       if (!showCreateForm) return; // only place temp center when modal open

//       const { latlng } = e;
//       setTempCenter(latlng);

//       // draw or update preview circle
//       if (tempCircleRef.current) tempCircleRef.current.remove();
//       tempCircleRef.current = L.circle(latlng, {
//         radius: 200, // default preview radius
//         color: "#38bdf8",
//         dashArray: "6",
//         weight: 2,
//         fillOpacity: 0.06,
//       }).addTo(map);

//       // create or update draggable handle positioned east of center at default radius
//       const handlePos = L.latLng(
//         latlng.lat,
//         latlng.lng + metersToLng(200, latlng.lat)
//       );
//       if (tempHandleRef.current) tempHandleRef.current.setLatLng(handlePos);
//       else {
//         tempHandleRef.current = L.marker(handlePos, {
//           draggable: true,
//           title: "Drag to resize radius",
//         }).addTo(map);
//         tempHandleRef.current.on("drag", (ev: any) => {
//           const markerLatLng = ev.target.getLatLng();
//           const center = tempCenter || latlng;
//           const newRadius = center.distanceTo(markerLatLng); // in meters
//           if (tempCircleRef.current) tempCircleRef.current.setRadius(newRadius);
//           // update radius input if present
//           const radiusInput = document.querySelector(
//             'input[name="radius"]'
//           ) as HTMLInputElement | null;
//           if (radiusInput) radiusInput.value = String(Math.round(newRadius));
//         });

//         tempHandleRef.current.on("dragend", () => {
//           // keep marker at new location; radius already set
//         });
//       }

//       // set pan to clicked point
//       map.panTo(latlng);
//     });

//     return () => {
//       map.remove();
//       mapRef.current = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // keep map circles in sync when geofences change
//   useEffect(() => {
//     if (!mapRef.current) {
//       console.log('Map ref not ready');
//       return;
//     }

//     console.log(`Updating map layers. Zones count: ${geofences.length}`);

//     // Remove all old zone layers from map
//     const layerIds = Object.keys(layersRef.current);
//     layerIds.forEach((zoneId) => {
//       const obj = layersRef.current[zoneId];
//       try {
//         if (obj.circle) {
//           mapRef.current!.removeLayer(obj.circle);
//         }
//         if (obj.polygon) {
//           mapRef.current!.removeLayer(obj.polygon);
//         }
//         if (obj.tooltip) {
//           mapRef.current!.removeLayer(obj.tooltip);
//         }
//       } catch (e) {
//         // Layer might already be removed, ignore
//       }
//     });
//     layersRef.current = {};

//     // Draw zones on the map (show all zones, not just ACTIVE)
//     // Filter can be adjusted if needed - for now showing all zones for debugging
//     const zonesToDraw = geofences; // Changed from filtering to show all zones
//     console.log(`Total zones: ${geofences.length}, Drawing ${zonesToDraw.length} zones on map`);
//     console.log('Zone statuses:', geofences.map(z => ({ name: z.name, status: z.status })));
    
//     zonesToDraw.forEach((zone) => {
//       try {
//         // Check if zone has valid data to draw
//         const hasValidCoordinates = zone.coordinates && 
//           zone.coordinates.lat !== 0 && zone.coordinates.lng !== 0 &&
//           zone.coordinates.lat !== null && zone.coordinates.lng !== null;
//         const hasValidGeometry = zone.geometry && 
//           (zone.geometry.type === 'Polygon' || zone.geometry.type === 'MultiPolygon' || zone.geometry.type === 'Point');
//         const hasValidRadius = zone.radius > 0;
        
//         // For circle zones, we need valid coordinates and radius
//         // For polygon zones, we need valid geometry
//         if (!hasValidCoordinates && !hasValidGeometry) {
//           console.warn(`Skipping zone ${zone.name}: no valid coordinates or geometry`, {
//             coordinates: zone.coordinates,
//             hasGeometry: !!zone.geometry,
//             geometryType: zone.geometry?.type
//           });
//           return;
//         }
        
//         // For circle zones without valid coordinates, skip
//         if (!hasValidGeometry && (!hasValidCoordinates || !hasValidRadius)) {
//           console.warn(`Skipping zone ${zone.name}: circle zone needs valid coordinates and radius`, {
//             hasCoordinates: hasValidCoordinates,
//             hasRadius: hasValidRadius
//           });
//           return;
//         }
        
//         console.log(`Drawing zone: ${zone.name}`, {
//           hasCoordinates: !!zone.coordinates,
//           coordinates: zone.coordinates,
//           hasRadius: zone.radius > 0,
//           radius: zone.radius,
//           hasGeometry: !!zone.geometry,
//           geometryType: zone.geometry?.type,
//           status: zone.status
//         });
//         drawZone(zone);
//       } catch (e) {
//         console.error('Error drawing zone:', zone.name, e);
//       }
//     });
    
//     // Force map to invalidate size in case of layout changes
//     setTimeout(() => {
//       if (mapRef.current) {
//         mapRef.current.invalidateSize();
//       }
//     }, 100);
//   }, [geofences]);

//   // toggle label visibility by adding/removing class on container
//   useEffect(() => {
//     if (!containerRef.current) return;
//     if (showLabels) containerRef.current.classList.remove("hide-zone-labels");
//     else containerRef.current.classList.add("hide-zone-labels");
//   }, [showLabels]);

//   function drawZone(zone: any) {
//     if (!mapRef.current) return;
//     const { id, coordinates, radius, type, geometry } = zone;

//     console.log(`drawZone called for: ${zone.name}`, {
//       id,
//       hasCoordinates: !!coordinates,
//       coordinates,
//       radius,
//       type,
//       hasGeometry: !!geometry,
//       geometryType: geometry?.type
//     });

//     // Validate required data
//     if (!id || !zone.name) {
//       console.warn('Zone missing required fields (id or name):', zone);
//       return;
//     }

//     const strokeColor = getZoneStrokeColor(type);
//     let tooltipLatLng: L.LatLng;

//     // Check if zone is a polygon or circle
//     const isPolygon = geometry && 
//       (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon');
    
//     // Check if zone is a Point geometry (circle zone stored as Point + radius)
//     const isPointGeometry = geometry && geometry.type === 'Point';
    
//     // For polygon zones, we can draw even without coordinates
//     if (isPolygon && geometry) {
//       console.log(`Drawing polygon for zone: ${zone.name}`);
//       // Draw polygon using GeoJSON
//       const geoJsonLayer = L.geoJSON(geometry as GeoJSON.Geometry, {
//         style: {
//           color: strokeColor,
//           weight: 2,
//           fillOpacity: 0.15,
//           fillColor: strokeColor,
//           className: "geofence-polygon",
//         },
//       }).addTo(mapRef.current!);
      
//       // Get centroid for tooltip placement
//       const polygonFeature = turf.feature(geometry);
//       const centroid = turf.centroid(polygonFeature);
//       tooltipLatLng = L.latLng(
//         centroid.geometry.coordinates[1],
//         centroid.geometry.coordinates[0]
//       );

//       // Add a permanent tooltip label
//       const tooltip = L.tooltip({
//         permanent: true,
//         direction: "center",
//         className: "zone-label",
//       })
//         .setContent(zone.name)
//         .setLatLng(tooltipLatLng);

//       tooltip.addTo(mapRef.current!);

//       // Store polygon layer reference
//       layersRef.current[id] = { polygon: geoJsonLayer, tooltip };
//     } else if (isPointGeometry && geometry && radius > 0) {
//       // Handle Point geometry with radius (circle zone)
//       const pointCoords = (geometry as GeoJSON.Point).coordinates;
//       if (pointCoords && pointCoords.length >= 2) {
//         const lat = pointCoords[1];
//         const lng = pointCoords[0];
//         console.log(`Drawing circle from Point geometry for zone: ${zone.name}`, {
//           center: [lat, lng],
//           radius
//         });
//         const circle = L.circle([lat, lng], {
//           radius,
//           color: strokeColor,
//           weight: 2,
//           fillOpacity: 0.15,
//           className: "geofence-circle",
//         }).addTo(mapRef.current!);

//         tooltipLatLng = L.latLng(lat, lng);

//         // Add a permanent tooltip label
//         const tooltip = L.tooltip({
//           permanent: true,
//           direction: "center",
//           className: "zone-label",
//         })
//           .setContent(zone.name)
//           .setLatLng(tooltipLatLng);

//         tooltip.addTo(mapRef.current!);

//         // Store circle layer reference
//         layersRef.current[id] = { circle, tooltip };
//       } else {
//         console.warn(`Zone ${zone.name} has Point geometry but invalid coordinates`);
//       }
//     } else if (radius > 0 && coordinates && coordinates.lat && coordinates.lng && coordinates.lat !== 0 && coordinates.lng !== 0) {
//       // Draw circle (existing behavior)
//       console.log(`Drawing circle for zone: ${zone.name}`, {
//         center: [coordinates.lat, coordinates.lng],
//         radius
//       });
//       const circle = L.circle([coordinates.lat, coordinates.lng], {
//         radius,
//         color: strokeColor,
//         weight: 2,
//         fillOpacity: 0.15,
//         className: "geofence-circle",
//       }).addTo(mapRef.current!);

//       tooltipLatLng = L.latLng(coordinates.lat, coordinates.lng);

//       // Add a permanent tooltip label
//       const tooltip = L.tooltip({
//         permanent: true,
//         direction: "center",
//         className: "zone-label",
//       })
//         .setContent(zone.name)
//         .setLatLng(tooltipLatLng);

//       tooltip.addTo(mapRef.current!);

//       // Store circle layer reference
//       layersRef.current[id] = { circle, tooltip };
//     } else {
//       // Fallback: skip if no valid geometry
//       console.warn(`Zone ${zone.name} has no valid geometry to draw`);
//       return;
//     }
//   }

//   // Helper for colors
//   function getZoneStrokeColor(type: string) {
//     switch (type) {
//       case "SAFE":
//         return "#16a34a";
//       case "RESTRICTED":
//         return "#ef4444";
//       case "MONITORED":
//         return "#f59e0b";
//       case "EMERGENCY":
//         return "#7c3aed";
//       default:
//         return "#94a3b8";
//     }
//   }

//   // Start watching user's location when component mounts
//   useEffect(() => {
//     if (!("geolocation" in navigator)) {
//       console.warn("Geolocation not supported");
//       return;
//     }

//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;
//         const accuracy = pos.coords.accuracy;
        
//         console.log(`📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} (accuracy: ${accuracy}m)`);
        
//         // Pass position object for tracking
//         handleUserLocation([lat, lng], pos);
//       },
//       (err) => {
//         console.error("Geolocation error", err);
//         if (err.code === err.PERMISSION_DENIED) {
//           alert('Location permission denied. Please enable location access for tracking.');
//         }
//       },
//       { 
//         enableHighAccuracy: true, // Use GPS on mobile
//         maximumAge: 5000, // Accept cached position up to 5 seconds
//         timeout: 15000 // 15 second timeout for mobile
//       }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [geofences, isTrackingEnabled]);

//   function handleUserLocation([lat, lng]: [number, number], position?: GeolocationPosition) {
//     if (!mapRef.current) {
//       console.warn('⚠️ Map ref not ready, cannot show user location');
//       return;
//     }
    
//     console.log('📍 handleUserLocation called:', lat, lng);

//     // Create custom blue dot icon for user location
//     const createUserLocationIcon = () => {
//       return L.divIcon({
//         className: 'user-location-marker',
//         html: `
//           <div style="
//             width: 30px;
//             height: 30px;
//             background: #3b82f6;
//             border: 4px solid white;
//             border-radius: 50%;
//             box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
//             position: relative;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             z-index: 10000;
//           ">
//             <div style="
//               width: 12px;
//               height: 12px;
//               background: white;
//               border-radius: 50%;
//               box-shadow: 0 1px 3px rgba(0,0,0,0.3);
//             "></div>
//           </div>
//         `,
//         iconSize: [30, 30],
//         iconAnchor: [15, 15],
//       });
//     };

//     // Update or create user marker
//     if (userMarkerRef.current) {
//       userMarkerRef.current.setLatLng([lat, lng]);
//       console.log('📍 User location updated:', lat.toFixed(6), lng.toFixed(6));
//     } else {
//       try {
//         const userIcon = createUserLocationIcon();
//         userMarkerRef.current = L.marker([lat, lng], {
//           icon: userIcon,
//           zIndexOffset: 1000, // Ensure it's on top
//         })
//         .addTo(mapRef.current)
//         .bindPopup('Your Location')
//         .openPopup();
        
//         // Center map on user location when marker is first created
//         mapRef.current.setView([lat, lng], 15, { animate: true });
        
//         console.log('✅ User location marker created at:', lat.toFixed(6), lng.toFixed(6));
//         console.log('✅ Map centered on user location');
//         console.log('✅ Marker object:', userMarkerRef.current);
//       } catch (error) {
//         console.error('❌ Error creating user location marker:', error);
//       }
//     }

//     // Store location for tracking (if enabled)
//     if (isTrackingEnabled) {
//       storeUserLocation(lat, lng, position);
//     }

//     // check each zone for entry/exit
//     geofences.forEach((zone) => {
//       const userPoint = turf.point([lng, lat]);
//       const wasInside = !!insideMapRef.current[zone.id];
//       let nowInside = false;

//       // Check if zone is a polygon
//       const isPolygon = zone.geometry && 
//         (zone.geometry.type === 'Polygon' || zone.geometry.type === 'MultiPolygon');

//       if (isPolygon && zone.geometry) {
//         // Use booleanPointInPolygon for polygon zones
//         const polygonFeature = turf.feature(zone.geometry);
//         nowInside = turf.booleanPointInPolygon(userPoint, polygonFeature as any);
//       } else if (zone.radius > 0 && zone.coordinates) {
//         // Use distance check for circle zones
//         const center = turf.point([zone.coordinates.lng, zone.coordinates.lat]);
//         const distanceKm = turf.distance(center, userPoint, { units: "kilometers" });
//         const distanceMeters = distanceKm * 1000;
//         nowInside = distanceMeters <= zone.radius;
//       }

//       if (nowInside && !wasInside) {
//         insideMapRef.current[zone.id] = true;
//         onZoneEnter(zone, lat, lng);
//       } else if (!nowInside && wasInside) {
//         insideMapRef.current[zone.id] = false;
//         onZoneExit(zone, lat, lng);
//       }
//     });
//   }

//   async function onZoneEnter(zone: any, lat: number, lng: number) {
//     const now = Date.now();
//     const lastEvent = lastEventTimeRef.current[zone.id] || 0;
//     const cooldown = 30000; // 30 seconds cooldown to prevent duplicate events

//     if (now - lastEvent < cooldown) {
//       return; // Skip if within cooldown period
//     }

//     lastEventTimeRef.current[zone.id] = now;

//     // Log event to Supabase
//     const user = await getCurrentUser();
//     const userId = user?.id || null;

//     try {
//       // Calculate distance
//       const distance = zone.center_lat && zone.center_lng
//         ? turf.distance(
//             turf.point([zone.center_lng, zone.center_lat]),
//             turf.point([lng, lat]),
//             { units: 'kilometers' }
//           ) * 1000 // Convert to meters
//         : null;

//       // Insert event into zone_events table
//       const { error: eventError } = await supabase
//         .from('zone_events')
//         .insert({
//           zone_id: zone.id,
//           user_id: userId,
//           event_type: 'ENTER',
//           latitude: lat,
//           longitude: lng,
//           distance_meters: distance,
//           device_info: {
//             userAgent: navigator.userAgent,
//             platform: navigator.platform,
//           },
//         });

//       if (eventError) {
//         // Don't log RLS policy errors as errors (they're expected when not logged in)
//         if (!eventError.message?.includes('row-level security')) {
//           console.error('Error logging ENTER event:', eventError);
//         } else {
//           console.warn('⚠️ Event not logged (not logged in):', eventError.message);
//         }
//       } else {
//         console.info(`✅ Entered zone: ${zone.name} - Event logged to Supabase`);
        
//         // Show on-screen notification
//         showNotification({
//           type: 'ENTER',
//           zoneName: zone.name,
//           zoneType: zone.zone_type || zone.type,
//           message: `You entered ${zone.name}`,
//         });
//       }

//       // Trigger notification if enabled
//       if (zone.notifications?.entry && userId) {
//         // Call notify edge function
//         const { data: edgeFunctionUrl } = supabase.functions.invoke('notify', {
//           body: {
//             userId,
//             zoneId: zone.id,
//             zoneName: zone.name,
//             zoneType: zone.zone_type || zone.type,
//             eventType: 'ENTER',
//             methods: ['push', 'whatsapp'],
//           },
//         });
//       }

//       // Update local state
//       setGeofences((prev) =>
//         prev.map((z) =>
//           z.id === zone.id
//             ? {
//                 ...z,
//                 activeVisitors: (z.activeVisitors || 0) + 1,
//                 totalVisits: (z.totalVisits || 0) + 1,
//               }
//             : z
//         )
//       );

//       // Increment alerts for RESTRICTED zones
//       if ((zone.zone_type || zone.type) === "RESTRICTED") {
//         setGeofences((prev) =>
//           prev.map((z) =>
//             z.id === zone.id ? { ...z, alerts: (z.alerts || 0) + 1 } : z
//           )
//         );
//       }
//     } catch (err: any) {
//       console.error('Error in onZoneEnter:', err);
//     }
//   }

//   async function onZoneExit(zone: any, lat: number, lng: number) {
//     const now = Date.now();
//     const lastEvent = lastEventTimeRef.current[`${zone.id}_exit`] || 0;
//     const cooldown = 30000; // 30 seconds cooldown

//     if (now - lastEvent < cooldown) {
//       return;
//     }

//     lastEventTimeRef.current[`${zone.id}_exit`] = now;

//     // Log event to Supabase
//     const user = await getCurrentUser();
//     const userId = user?.id || null;

//     try {
//       // Calculate distance
//       const distance = zone.center_lat && zone.center_lng
//         ? turf.distance(
//             turf.point([zone.center_lng, zone.center_lat]),
//             turf.point([lng, lat]),
//             { units: 'kilometers' }
//           ) * 1000
//         : null;

//       // Insert event into zone_events table
//       const { error: eventError } = await supabase
//         .from('zone_events')
//         .insert({
//           zone_id: zone.id,
//           user_id: userId,
//           event_type: 'EXIT',
//           latitude: lat,
//           longitude: lng,
//           distance_meters: distance,
//           device_info: {
//             userAgent: navigator.userAgent,
//             platform: navigator.platform,
//           },
//         });

//       if (eventError) {
//         // Don't log RLS policy errors as errors (they're expected when not logged in)
//         if (!eventError.message?.includes('row-level security')) {
//           console.error('Error logging EXIT event:', eventError);
//         } else {
//           console.warn('⚠️ Event not logged (not logged in):', eventError.message);
//         }
//       } else {
//         console.info(`✅ Exited zone: ${zone.name} - Event logged to Supabase`);
        
//         // Show on-screen notification
//         showNotification({
//           type: 'EXIT',
//           zoneName: zone.name,
//           zoneType: zone.zone_type || zone.type,
//           message: `You exited ${zone.name}`,
//         });
//       }

//       // Trigger notification if enabled
//       if (zone.notifications?.exit && userId) {
//         supabase.functions.invoke('notify', {
//           body: {
//             userId,
//             zoneId: zone.id,
//             zoneName: zone.name,
//             zoneType: zone.zone_type || zone.type,
//             eventType: 'EXIT',
//             methods: ['push', 'whatsapp'],
//           },
//         });
//       }

//       // Update local state
//       setGeofences((prev) =>
//         prev.map((z) =>
//           z.id === zone.id
//             ? { ...z, activeVisitors: Math.max((z.activeVisitors || 1) - 1, 0) }
//             : z
//         )
//       );
//     } catch (err: any) {
//       console.error('Error in onZoneExit:', err);
//     }
//   }

//   // Create geofence form submit - Save to Supabase
//   async function handleCreateZone(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const form = e.currentTarget;
//     const formData = new FormData(form);
//     const name = String(formData.get("name") || "New Zone");
//     const lat =
//       Number(formData.get("lat")) || (tempCenter ? tempCenter.lat : 0);
//     const lng =
//       Number(formData.get("lng")) || (tempCenter ? tempCenter.lng : 0);
//     const radius =
//       Number(formData.get("radius")) ||
//       (tempCircleRef.current ? tempCircleRef.current.getRadius() : 200);
//     const type = String(formData.get("type") || "MONITORED") as Zone['zone_type'];
//     const risk = String(formData.get("risk") || "MEDIUM") as Zone['risk_level'];
//     const description = String(formData.get("description") || "");

//     const user = await getCurrentUser();
//     if (!user) {
//       alert("You must be logged in to create zones.");
//       return;
//     }

//     // Create GeoJSON geometry for circle zone
//     const geometry: GeoJSON.Geometry = {
//       type: "Point",
//       coordinates: [lng, lat],
//       properties: { radius },
//     };

//     try {
//       // Insert zone into Supabase
//       const { data: newZone, error: insertError } = await supabase
//         .from('zones')
//         .insert({
//           name,
//           description: description || null,
//           zone_type: type,
//           risk_level: risk,
//           geometry: geometry as any,
//           status: 'ACTIVE',
//           notifications: {
//             entry: true,
//             exit: true,
//             extended_stay: false,
//           },
//           rules: [],
//           region: 'Northeast India',
//           created_by: user.id,
//         })
//         .select()
//         .single();

//       if (insertError) {
//         throw insertError;
//       }

//       // Reload zones to get updated data from database
//       await loadZones();

//       setShowCreateForm(false);

//       // Remove preview and handle
//       if (tempCircleRef.current) {
//         tempCircleRef.current.remove();
//         tempCircleRef.current = null;
//       }
//       if (tempHandleRef.current) {
//         tempHandleRef.current.remove();
//         tempHandleRef.current = null;
//       }
//       setTempCenter(null);

//       // Pan map to new zone
//       if (mapRef.current) mapRef.current.panTo([lat, lng]);

//       console.info("✅ Zone created successfully in Supabase!");
//     } catch (err: any) {
//       console.error("Error creating zone:", err);
//       alert(`Failed to create zone: ${err.message}`);
//     }
//   }

//   // Helpers: convert meters east to difference in longitude at given latitude
//   function metersToLng(meters: number, lat: number) {
//     // approximate: 1 deg lon = 111320*cos(lat)
//     return meters / (111320 * Math.cos((lat * Math.PI) / 180));
//   }

//   // Show on-screen notification
//   function showNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
//     const newNotification: Notification = {
//       ...notification,
//       id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
//       timestamp: new Date(),
//     };
    
//     setNotifications((prev) => [...prev, newNotification]);
    
//     // Auto-remove notification after 10 seconds
//     setTimeout(() => {
//       setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
//     }, 10000);
//   }

//   // Helper small UI functions
//   const getZoneTypeColor = (type: string) => {
//     switch (type) {
//       case "SAFE":
//         return "text-green-400 bg-green-500/20 border-green-500/30";
//       case "RESTRICTED":
//         return "text-red-400 bg-red-500/20 border-red-500/30";
//       case "MONITORED":
//         return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
//       case "EMERGENCY":
//         return "text-purple-400 bg-purple-500/20 border-purple-500/30";
//       default:
//         return "text-gray-400 bg-gray-500/20 border-gray-500/30";
//     }
//   };

//   const getRiskLevelColor = (level: string) => {
//     switch (level) {
//       case "LOW":
//         return "text-green-400 bg-green-500/20";
//       case "MEDIUM":
//         return "text-yellow-400 bg-yellow-500/20";
//       case "HIGH":
//         return "text-orange-400 bg-orange-500/20";
//       case "CRITICAL":
//         return "text-red-400 bg-red-500/20";
//       default:
//         return "text-gray-400 bg-gray-500/20";
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       className="space-y-6 relative"
//     >
//       {/* Notification Toast Container */}
//       <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
//         <AnimatePresence>
//           {notifications.map((notification) => (
//             <motion.div
//               key={notification.id}
//               initial={{ opacity: 0, x: 400, scale: 0.8 }}
//               animate={{ opacity: 1, x: 0, scale: 1 }}
//               exit={{ opacity: 0, x: 400, scale: 0.8 }}
//               transition={{ type: "spring", stiffness: 500, damping: 30 }}
//               className={`pointer-events-auto crypto-card p-4 min-w-[320px] max-w-md border-2 ${
//                 notification.type === 'ENTER'
//                   ? notification.zoneType === 'RESTRICTED'
//                     ? 'border-red-500/50 bg-red-500/10'
//                     : notification.zoneType === 'EMERGENCY'
//                     ? 'border-purple-500/50 bg-purple-500/10'
//                     : 'border-green-500/50 bg-green-500/10'
//                   : 'border-blue-500/50 bg-blue-500/10'
//               } shadow-2xl`}
//             >
//               <div className="flex items-start space-x-3">
//                 <div className={`flex-shrink-0 p-2 rounded-lg ${
//                   notification.type === 'ENTER'
//                     ? notification.zoneType === 'RESTRICTED'
//                       ? 'bg-red-500/20'
//                       : notification.zoneType === 'EMERGENCY'
//                       ? 'bg-purple-500/20'
//                       : 'bg-green-500/20'
//                     : 'bg-blue-500/20'
//                 }`}>
//                   {notification.type === 'ENTER' ? (
//                     <CheckCircle className={`h-5 w-5 ${
//                       notification.zoneType === 'RESTRICTED'
//                         ? 'text-red-400'
//                         : notification.zoneType === 'EMERGENCY'
//                         ? 'text-purple-400'
//                         : 'text-green-400'
//                     }`} />
//                   ) : (
//                     <MapPin className="h-5 w-5 text-blue-400" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between mb-1">
//                     <h4 className={`text-sm font-semibold ${
//                       notification.type === 'ENTER'
//                         ? notification.zoneType === 'RESTRICTED'
//                           ? 'text-red-300'
//                           : notification.zoneType === 'EMERGENCY'
//                           ? 'text-purple-300'
//                           : 'text-green-300'
//                         : 'text-blue-300'
//                     }`}>
//                       {notification.type === 'ENTER' ? '📍 Entered Zone' : '📍 Exited Zone'}
//                     </h4>
//                     <button
//                       onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
//                       className="text-slate-400 hover:text-white transition-colors"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </div>
//                   <p className="text-white font-medium text-base mb-1">{notification.zoneName}</p>
//                   <div className="flex items-center space-x-2">
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
//                       notification.zoneType === 'SAFE'
//                         ? 'text-green-400 bg-green-500/20 border-green-500/30'
//                         : notification.zoneType === 'RESTRICTED'
//                         ? 'text-red-400 bg-red-500/20 border-red-500/30'
//                         : notification.zoneType === 'MONITORED'
//                         ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
//                         : 'text-purple-400 bg-purple-500/20 border-purple-500/30'
//                     }`}>
//                       {notification.zoneType}
//                     </span>
//                     <span className="text-xs text-slate-400">
//                       {notification.timestamp.toLocaleTimeString()}
//                     </span>
//                   </div>
//                   {notification.type === 'ENTER' && notification.zoneType === 'RESTRICTED' && (
//                     <p className="text-xs text-red-300 mt-2 font-medium">
//                       ⚠️ High Risk Zone - Exercise Caution
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//       {/* Full Screen Map Section */}
//       <div className="relative w-full mb-6" style={{ height: "calc(100vh - 160px)", minHeight: "700px" }}>
//         {/* Floating Controls Bar */}
//         <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-slate-900/95 backdrop-blur-md rounded-lg p-4 border border-crypto-border/30 shadow-xl">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
//                 <MapPin className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-white">
//                   Zone Management Map
//                 </h2>
//                 <p className="text-xs text-slate-400">
//                   Configure and monitor geographical boundaries
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-3">
//             <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
//               <input
//                 type="checkbox"
//                 checked={showLabels}
//                 onChange={() => setShowLabels((v) => !v)}
//                 className="rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500"
//               />
//               <span>Show Labels</span>
//             </label>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {
//                 const newTrackingState = !isTrackingEnabled;
//                 setIsTrackingEnabled(newTrackingState);
                
//                 if (newTrackingState) {
//                   // Start tracking - get current location immediately and show marker
//                   console.log('🟢 Starting location tracking...');
                  
//                   // Check if map is ready
//                   if (!mapRef.current) {
//                     console.warn('⚠️ Map not ready yet, waiting...');
//                     setTimeout(() => {
//                       if (!mapRef.current) {
//                         alert('Map is not ready. Please wait a moment and try again.');
//                         setIsTrackingEnabled(false);
//                         return;
//                       }
//                     }, 1000);
//                   }
                  
//                   if (navigator.geolocation) {
//                     // Use watchPosition instead of getCurrentPosition to avoid timeout
//                     // The watcher is already running, so just ensure marker is visible
//                     if (mapRef.current && userMarkerRef.current) {
//                       // Marker already exists, just center map on it
//                       const currentLatLng = userMarkerRef.current.getLatLng();
//                       mapRef.current.setView([currentLatLng.lat, currentLatLng.lng], 15, { animate: true });
//                       console.log('✅ Map centered on existing marker');
//                     } else {
//                       // Try to get location once with longer timeout
//                       navigator.geolocation.getCurrentPosition(
//                         (pos) => {
//                           const lat = pos.coords.latitude;
//                           const lng = pos.coords.longitude;
//                           console.log('📍 Got location:', lat, lng);
                          
//                           // Ensure map is ready
//                           if (!mapRef.current) {
//                             console.error('❌ Map ref is null!');
//                             setIsTrackingEnabled(false);
//                             alert('Map is not ready. Please refresh the page.');
//                             return;
//                           }
                          
//                           // Show marker on map immediately
//                           handleUserLocation([lat, lng], pos);
                          
//                           // Store location for tracking
//                           storeUserLocation(lat, lng, pos);
//                         },
//                         (err) => {
//                           console.error('❌ Error getting location:', err);
//                           // Don't disable tracking - the watcher will handle it
//                           if (err.code === err.PERMISSION_DENIED) {
//                             alert('Location permission denied. Please enable location access in your browser settings.');
//                             setIsTrackingEnabled(false);
//                           } else if (err.code === err.TIMEOUT) {
//                             // Timeout is OK - the watcher will get location eventually
//                             console.warn('⚠️ Initial location timeout, but watcher will continue...');
//                           }
//                         },
//                         {
//                           enableHighAccuracy: false, // Use cached location first
//                           timeout: 5000,
//                           maximumAge: 60000 // Accept location up to 1 minute old
//                         }
//                       );
//                     }
//                   } else {
//                     alert('Geolocation is not supported by your browser.');
//                     setIsTrackingEnabled(false);
//                   }
//                 } else {
//                   // Stop tracking
//                   if (locationTrackingIntervalRef.current) {
//                     clearInterval(locationTrackingIntervalRef.current);
//                     locationTrackingIntervalRef.current = null;
//                   }
//                   // Optionally remove marker when stopping (comment out to keep it visible)
//                   // if (userMarkerRef.current && mapRef.current) {
//                   //   mapRef.current.removeLayer(userMarkerRef.current);
//                   //   userMarkerRef.current = null;
//                   // }
//                 }
//               }}
//               className={`crypto-btn flex items-center space-x-2 text-sm px-4 py-2 ${
//                 isTrackingEnabled ? 'bg-green-600 hover:bg-green-700' : ''
//               }`}
//               title={isTrackingEnabled ? 'Stop Location Tracking' : 'Start Location Tracking'}
//             >
//               <MapPin className="h-4 w-4" />
//               <span>{isTrackingEnabled ? 'Stop Tracking' : 'Start Tracking'}</span>
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setShowImportForm(true)}
//               className="crypto-btn flex items-center space-x-2 text-sm px-4 py-2"
//             >
//               <Upload className="h-4 w-4" />
//               <span>Import from MAPOG</span>
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setShowCreateForm(true)}
//               className="crypto-btn flex items-center space-x-2 text-sm px-4 py-2"
//             >
//               <Plus className="h-4 w-4" />
//               <span>Create Geofence</span>
//             </motion.button>
//           </div>
//         </div>

//         {/* Full Screen Map Container */}
//         <div className="w-full h-full rounded-xl overflow-hidden border border-crypto-border/30 shadow-2xl relative bg-crypto-surface">
//           <div
//             ref={containerRef}
//             className="absolute inset-0 w-full h-full"
//             style={{ height: "100%" }}
//           />
//         </div>
//       </div>

//       {/* Content Sections Below Map */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         {/* Active Zones Panel */}
//         <div className="crypto-card p-6">
//           <div className="flex items-center space-x-3 mb-6">
//             <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
//               <Settings className="h-5 w-5 text-white" />
//             </div>
//             <h2 className="text-xl font-semibold text-crypto-text-primary">
//               Active Zones
//             </h2>
//           </div>

//           <div className="space-y-4 max-h-[500px] overflow-y-auto">
//             {geofences.filter((z) => z.status === 'ACTIVE').map((zone) => (
//               <div
//                 key={zone.id}
//                 className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200"
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-medium text-sm text-crypto-text-primary">
//                     {zone.name}
//                   </h3>
//                   <div className="flex items-center space-x-1">
//                     <button
//                       onClick={() => setSelectedZone(zone)}
//                       className="p-1 text-crypto-text-secondary hover:text-crypto-accent"
//                     >
//                       <Eye className="h-3 w-3" />
//                     </button>
//                     <button className="p-1 text-crypto-text-secondary hover:text-crypto-accent">
//                       <Edit className="h-3 w-3" />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
//                       zone.type
//                     )}`}
//                   >
//                     {zone.type}
//                   </span>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
//                       zone.riskLevel
//                     )}`}
//                   >
//                     {zone.riskLevel}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2 text-xs text-crypto-text-secondary">
//                   <div>
//                     Visitors:{" "}
//                     <span className="text-crypto-text-primary font-medium">
//                       {zone.activeVisitors}
//                     </span>
//                   </div>
//                   <div>
//                     Alerts:{" "}
//                     <span className="text-crypto-text-primary font-medium">
//                       {zone.alerts}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div className="crypto-card p-6 text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
//           <p className="text-slate-400">Loading zones from Supabase...</p>
//         </div>
//       )}

//       {/* Error State */}
//       {error && (
//         <div className="crypto-card p-6 bg-red-500/20 border border-red-500/50 rounded-lg">
//           <div className="flex items-center space-x-3">
//             <AlertCircle className="h-5 w-5 text-red-400" />
//             <div>
//               <p className="text-red-300 font-semibold">Error loading zones</p>
//               <p className="text-red-400 text-sm">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Import Modal */}
//       {showImportForm && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
//           <GeoImport
//             onImportSuccess={(zone) => {
//               console.info('Zone imported:', zone);
//               loadZones();
//               setShowImportForm(false);
//             }}
//             onClose={() => setShowImportForm(false)}
//           />
//         </div>
//       )}

//       {/* Zone Configuration Table - Full Width Below */}
//       <div className="crypto-card overflow-hidden">
//         <div className="p-6 border-b border-crypto-border/30">
//           <h2 className="text-xl font-semibold text-crypto-text-primary">
//             Zone Configuration
//           </h2>
//           <p className="text-sm text-crypto-text-secondary mt-1">
//             Detailed view of all zones and their configurations
//           </p>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-crypto-surface/30">
//               <tr className="text-left text-crypto-text-secondary text-sm">
//                 <th className="p-4">Zone Name</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Risk Level</th>
//                 <th className="p-4">Radius</th>
//                 <th className="p-4">Active Visitors</th>
//                 <th className="p-4">Alerts</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {geofences.filter((z) => z.status === 'ACTIVE').map((zone) => (
//                 <tr
//                   key={zone.id}
//                   className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200"
//                 >
//                   <td className="p-4 font-medium">{zone.name}</td>
//                   <td className="p-4">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
//                         zone.type
//                       )}`}
//                     >
//                       {zone.type}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
//                         zone.riskLevel
//                       )}`}
//                     >
//                       {zone.riskLevel}
//                     </span>
//                   </td>
//                   <td className="p-4 text-sm text-slate-400">{zone.radius}m</td>
//                   <td className="p-4 text-sm">{zone.activeVisitors}</td>
//                   <td className="p-4 text-sm">{zone.alerts}</td>
//                   <td className="p-4">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         zone.status === "ACTIVE"
//                           ? "bg-green-500/20 text-green-400"
//                           : "bg-yellow-500/20 text-yellow-400"
//                       }`}
//                     >
//                       {zone.status}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => handleEditZone(zone)}
//                         className="p-2 bg-teal-400 hover:bg-teal-500 rounded-lg transition-colors"
//                         title="Edit Zone"
//                       >
//                         <Edit className="h-3 w-3 text-white" />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteZone(zone.id, zone.name)}
//                         className="p-2 bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
//                         title="Delete Zone"
//                       >
//                         <Trash2 className="h-3 w-3 text-white" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Selected zone modal */}
//       {selectedZone && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-slate-700">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold">{selectedZone.name}</h2>
//                 <button
//                   onClick={() => setSelectedZone(null)}
//                   className="text-slate-400 hover:text-white"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>
//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">
//                     Zone Information
//                   </h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Type:</span>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
//                           selectedZone.type
//                         )}`}
//                       >
//                         {selectedZone.type}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Risk Level:</span>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
//                           selectedZone.riskLevel
//                         )}`}
//                       >
//                         {selectedZone.riskLevel}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Radius:</span>
//                       <span>{selectedZone.radius}m</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Status:</span>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           selectedZone.status === "ACTIVE"
//                             ? "bg-green-500/20 text-green-400"
//                             : "bg-yellow-500/20 text-yellow-400"
//                         }`}
//                       >
//                         {selectedZone.status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Statistics</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Active Visitors:</span>
//                       <span className="font-medium">
//                         {selectedZone.activeVisitors}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Total Visits:</span>
//                       <span className="font-medium">
//                         {selectedZone.totalVisits.toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Alerts Generated:</span>
//                       <span className="font-medium">{selectedZone.alerts}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">
//                   Notification Settings
//                 </h3>
//                 <div className="space-y-3">
//                   {Object.entries(selectedZone.notifications).map(
//                     ([key, value]) => (
//                       <div
//                         key={key}
//                         className="flex items-center justify-between"
//                       >
//                         <span className="text-slate-400 capitalize">
//                           {key.replace("_", " ")}:
//                         </span>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             value
//                               ? "bg-green-500/20 text-green-400"
//                               : "bg-red-500/20 text-red-400"
//                           }`}
//                         >
//                           {value ? "Enabled" : "Disabled"}
//                         </span>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Zone Rules</h3>
//                 <div className="bg-slate-900/50 rounded-lg p-4">
//                   <ul className="space-y-2">
//                     {selectedZone.rules.map((rule: string, index: number) => (
//                       <li
//                         key={index}
//                         className="text-sm text-slate-400 flex items-start space-x-2"
//                       >
//                         <span className="text-teal-400 mt-1">•</span>
//                         <span>{rule}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//               <div className="flex space-x-4">
//                 <button
//                   onClick={() => {
//                     handleEditZone(selectedZone);
//                     setSelectedZone(null); // Close details modal
//                   }}
//                   className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 py-2 px-4 rounded-lg transition-all duration-200"
//                 >
//                   Edit Zone
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (selectedZone) {
//                       handleDeleteZone(selectedZone.id, selectedZone.name);
//                       setSelectedZone(null); // Close details modal
//                     }
//                   }}
//                   className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors"
//                 >
//                   Delete Zone
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Geofence Modal */}
//       {showCreateForm && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-800 rounded-xl w-full max-w-md p-6">
//             <h3 className="text-xl font-semibold mb-4">Create Geofence</h3>
//             <p className="text-sm text-slate-400 mb-2">
//               Click a point on the map to set the center (preview will appear).
//               Or enter coordinates manually. Drag the handle to resize the
//               radius visually.
//             </p>
//             <form onSubmit={handleCreateZone} className="space-y-3">
//               <div>
//                 <label className="block text-sm text-slate-400">Name</label>
//                 <input
//                   name="name"
//                   className="w-full bg-slate-900/40 p-2 rounded-md mt-1"
//                   defaultValue="New Zone"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-sm text-slate-400">
//                     Latitude
//                   </label>
//                   <input
//                     name="lat"
//                     type="number"
//                     step="any"
//                     className="w-full bg-slate-900/40 p-2 rounded-md mt-1"
//                     defaultValue={tempCenter ? tempCenter.lat : 26.5775}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-slate-400">
//                     Longitude
//                   </label>
//                   <input
//                     name="lng"
//                     type="number"
//                     step="any"
//                     className="w-full bg-slate-900/40 p-2 rounded-md mt-1"
//                     defaultValue={tempCenter ? tempCenter.lng : 93.1711}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm text-slate-400">
//                   Radius (meters)
//                 </label>
//                 <input
//                   name="radius"
//                   type="number"
//                   className="w-full bg-slate-900/40 p-2 rounded-md mt-1"
//                   defaultValue={200}
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <select name="type" className="bg-slate-900/40 p-2 rounded-md">
//                   <option>MONITORED</option>
//                   <option>SAFE</option>
//                   <option>RESTRICTED</option>
//                   <option>EMERGENCY</option>
//                 </select>
//                 <select name="risk" className="bg-slate-900/40 p-2 rounded-md">
//                   <option>LOW</option>
//                   <option>MEDIUM</option>
//                   <option>HIGH</option>
//                   <option>CRITICAL</option>
//                 </select>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     // quick-fill lat/lng from temp center
//                     if (tempCenter) {
//                       const latInput = document.querySelector(
//                         'input[name="lat"]'
//                       ) as HTMLInputElement;
//                       const lngInput = document.querySelector(
//                         'input[name="lng"]'
//                       ) as HTMLInputElement;
//                       if (latInput && lngInput) {
//                         latInput.value = String(tempCenter.lat);
//                         lngInput.value = String(tempCenter.lng);
//                       }
//                     } else {
//                       alert("Click on the map to set center first.");
//                     }
//                   }}
//                   className="ml-auto px-3 py-1 rounded-md bg-slate-700"
//                 >
//                   Use Map Center
//                 </button>
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateForm(false);
//                     if (tempCircleRef.current) {
//                       tempCircleRef.current.remove();
//                       tempCircleRef.current = null;
//                     }
//                     if (tempHandleRef.current) {
//                       tempHandleRef.current.remove();
//                       tempHandleRef.current = null;
//                     }
//                     setTempCenter(null);
//                   }}
//                   className="px-4 py-2 rounded-md bg-slate-700"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-md bg-teal-500"
//                 >
//                   Create
//                 </button>
//               </div>
//             </form>
//             <div className="mt-3 text-xs text-slate-400">
//               Tip: Click a point on the map while this modal is open to preview
//               the geofence center and drag the handle to adjust radius.
//             </div>
//           </div>
//         </div>
//       )}

//       {/* GeoImport Modal */}
//       {showImportForm && (
//         <GeoImport
//           onClose={() => setShowImportForm(false)}
//           onImportSuccess={() => {
//             // Reload zones from Supabase after successful import
//             loadZones();
//             setShowImportForm(false);
//           }}
//         />
//       )}

//       {/* Edit Zone Modal */}
//       {showEditForm && zoneToEdit && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
//           <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-semibold text-white">Edit Zone</h3>
//               <button
//                 onClick={() => {
//                   setShowEditForm(false);
//                   setZoneToEdit(null);
//                 }}
//                 className="text-slate-400 hover:text-white"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <form onSubmit={handleSaveEdit} className="space-y-3">
//               <div>
//                 <label className="block text-sm text-slate-400 mb-1">Zone Name</label>
//                 <input
//                   name="name"
//                   type="text"
//                   required
//                   className="w-full bg-slate-900/40 p-2 rounded-md text-white"
//                   defaultValue={zoneToEdit.name}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-slate-400 mb-1">Description</label>
//                 <textarea
//                   name="description"
//                   rows={2}
//                   className="w-full bg-slate-900/40 p-2 rounded-md text-white"
//                   defaultValue={zoneToEdit.description || ''}
//                 />
//               </div>
              
//               {/* Only show coordinates/radius for circle zones */}
//               {zoneToEdit.geometry?.type === 'Point' && zoneToEdit.coordinates && (
//                 <>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-sm text-slate-400 mb-1">Latitude</label>
//                       <input
//                         name="lat"
//                         type="number"
//                         step="any"
//                         required
//                         className="w-full bg-slate-900/40 p-2 rounded-md text-white"
//                         defaultValue={zoneToEdit.coordinates.lat}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-slate-400 mb-1">Longitude</label>
//                       <input
//                         name="lng"
//                         type="number"
//                         step="any"
//                         required
//                         className="w-full bg-slate-900/40 p-2 rounded-md text-white"
//                         defaultValue={zoneToEdit.coordinates.lng}
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm text-slate-400 mb-1">Radius (meters)</label>
//                     <input
//                       name="radius"
//                       type="number"
//                       step="any"
//                       min="1"
//                       required
//                       className="w-full bg-slate-900/40 p-2 rounded-md text-white"
//                       defaultValue={zoneToEdit.radius || 0}
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-sm text-slate-400 mb-1">Zone Type</label>
//                   <select name="type" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.type}>
//                     <option value="SAFE">SAFE</option>
//                     <option value="MONITORED">MONITORED</option>
//                     <option value="RESTRICTED">RESTRICTED</option>
//                     <option value="EMERGENCY">EMERGENCY</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-slate-400 mb-1">Risk Level</label>
//                   <select name="risk" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.riskLevel}>
//                     <option value="LOW">LOW</option>
//                     <option value="MEDIUM">MEDIUM</option>
//                     <option value="HIGH">HIGH</option>
//                     <option value="CRITICAL">CRITICAL</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm text-slate-400 mb-1">Status</label>
//                 <select name="status" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.status}>
//                   <option value="ACTIVE">ACTIVE</option>
//                   <option value="INACTIVE">INACTIVE</option>
//                   <option value="STANDBY">STANDBY</option>
//                 </select>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowEditForm(false);
//                     setZoneToEdit(null);
//                   }}
//                   className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </motion.div>
//   );
// };






/**
 * Geofences Component - Full Supabase Integration
 * 
 * Complete geofencing system for Northeast India with:
 * - Supabase/PostGIS backend integration
 * - Real-time location detection with ENTER/EXIT event logging
 * - Leaflet map with polygon and circle zone support
 * - MAPOG GeoJSON import
 * - Color-coded zones (SAFE, MONITORED, RESTRICTED, EMERGENCY)
 * - Interactive zone creation with draggable radius handle
 */


// export const Geofences: React.FC = () => {
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedZone, setSelectedZone] = useState<any>(null);

//   const geofences = [
//     {
//       id: 'GF-001',
//       name: 'Marina Beach Safe Zone',
//       type: 'SAFE',
//       riskLevel: 'LOW',
//       coordinates: { lat: 13.0475, lng: 80.2824 },
//       radius: 500,
//       activeVisitors: 342,
//       totalVisits: 2847,
//       alerts: 5,
//       status: 'ACTIVE',
//       notifications: {
//         entry: true,
//         exit: true,
//         extended_stay: false
//       },
//       rules: ['No swimming after 6 PM', 'Stay in designated areas']
//     },
//     {
//       id: 'GF-002',
//       name: 'High Crime Area - Sector 7',
//       type: 'RESTRICTED',
//       riskLevel: 'HIGH',
//       coordinates: { lat: 13.0525, lng: 80.2750 },
//       radius: 300,
//       activeVisitors: 12,
//       totalVisits: 156,
//       alerts: 23,
//       status: 'ACTIVE',
//       notifications: {
//         entry: true,
//         exit: true,
//         extended_stay: true
//       },
//       rules: ['Immediate alert on entry', 'Police dispatch required', 'Tourist advisory sent']
//     },
//     {
//       id: 'GF-003',
//       name: 'Fort Kochi Heritage Zone',
//       type: 'MONITORED',
//       riskLevel: 'MEDIUM',
//       coordinates: { lat: 9.9658, lng: 76.2427 },
//       radius: 750,
//       activeVisitors: 89,
//       totalVisits: 1923,
//       alerts: 8,
//       status: 'ACTIVE',
//       notifications: {
//         entry: false,
//         exit: false,
//         extended_stay: true
//       },
//       rules: ['Heritage site guidelines', 'Guided tours recommended']
//     },
//     {
//       id: 'GF-004',
//       name: 'Emergency Assembly Point',
//       type: 'EMERGENCY',
//       riskLevel: 'CRITICAL',
//       coordinates: { lat: 19.0760, lng: 72.8777 },
//       radius: 200,
//       activeVisitors: 0,
//       totalVisits: 45,
//       alerts: 0,
//       status: 'STANDBY',
//       notifications: {
//         entry: true,
//         exit: true,
//         extended_stay: false
//       },
//       rules: ['Emergency evacuation point', 'Medical assistance available']
//     }
//   ];

//   const getZoneTypeColor = (type: string) => {
//     switch (type) {
//       case 'SAFE': return 'text-green-400 bg-green-500/20 border-green-500/30';
//       case 'RESTRICTED': return 'text-red-400 bg-red-500/20 border-red-500/30';
//       case 'MONITORED': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
//       case 'EMERGENCY': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
//       default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
//     }
//   };

//   const getRiskLevelColor = (level: string) => {
//     switch (level) {
//       case 'LOW': return 'text-green-400 bg-green-500/20';
//       case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
//       case 'HIGH': return 'text-orange-400 bg-orange-500/20';
//       case 'CRITICAL': return 'text-red-400 bg-red-500/20';
//       default: return 'text-gray-400 bg-gray-500/20';
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       className="space-y-6"
//     >
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.6 }}
//         className="flex items-center justify-between"
//       >
//         <div>
//           <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>
//             Geofence & Risk Zone Management
//           </h1>
//           <p className="text-crypto-text-secondary mt-1">Configure and monitor geographical boundaries</p>
//         </div>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setShowCreateForm(true)}
//           className="crypto-btn flex items-center space-x-2"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Create Geofence</span>
//         </motion.button>
//       </motion.div>

//       {/* Zone Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4, duration: 0.6 }}
//           className="crypto-card p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-crypto-text-secondary text-sm font-medium">Active Zones</p>
//               <p className="text-2xl font-bold text-crypto-text-primary">12</p>
//             </div>
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
//             >
//               <MapPin className="h-6 w-6 text-white" />
//             </motion.div>
//           </div>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5, duration: 0.6 }}
//           className="crypto-card p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-crypto-text-secondary text-sm font-medium">High Risk Zones</p>
//               <p className="text-2xl font-bold text-red-400">3</p>
//             </div>
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg"
//             >
//               <AlertTriangle className="h-6 w-6 text-white" />
//             </motion.div>
//           </div>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6, duration: 0.6 }}
//           className="crypto-card p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-crypto-text-secondary text-sm font-medium">Zone Violations</p>
//               <p className="text-2xl font-bold text-yellow-400">18</p>
//             </div>
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
//             >
//               <Shield className="h-6 w-6 text-white" />
//             </motion.div>
//           </div>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.7, duration: 0.6 }}
//           className="crypto-card p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-crypto-text-secondary text-sm font-medium">Tourists in Zones</p>
//               <p className="text-2xl font-bold text-green-400">443</p>
//             </div>
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
//             >
//               <Users className="h-6 w-6 text-white" />
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Interactive Map */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8, duration: 0.6 }}
//           className="lg:col-span-2 crypto-card p-6"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <motion.div
//                 whileHover={{ scale: 1.1, rotate: 5 }}
//                 className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
//               >
//                 <MapPin className="h-5 w-5 text-white" />
//               </motion.div>
//               <h2 className="text-xl font-semibold text-crypto-text-primary">Zone Management Map</h2>
//             </div>
//             <div className="flex items-center space-x-2">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="text-sm text-crypto-text-secondary hover:text-crypto-text-primary px-3 py-1 rounded-lg glass transition-all duration-200"
//               >
//                 Drawing Tools
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="text-sm text-crypto-text-secondary hover:text-crypto-text-primary px-3 py-1 rounded-lg glass transition-all duration-200"
//               >
//                 Layers
//               </motion.button>
//             </div>
//           </div>
//           <div className="bg-crypto-surface/30 rounded-xl h-96 flex items-center justify-center relative overflow-hidden border border-crypto-border/30">
//             <div className="absolute inset-0 bg-gradient-to-br from-crypto-accent/20 via-crypto-surface to-green-900/20"></div>

//             {/* Simulated geofence zones */}
//             <div className="absolute top-20 left-32 w-16 h-16 border-2 border-green-400 rounded-full opacity-60 animate-pulse"></div>
//             <div className="absolute top-32 right-40 w-12 h-12 border-2 border-red-400 rounded-full opacity-60 animate-pulse"></div>
//             <div className="absolute bottom-24 left-40 w-20 h-20 border-2 border-yellow-400 rounded-full opacity-60 animate-pulse"></div>
//             <div className="absolute bottom-32 right-32 w-8 h-8 border-2 border-purple-400 rounded-full opacity-60 animate-pulse"></div>

//             {/* Tourist markers */}
//             <div className="absolute top-24 left-36 w-2 h-2 bg-blue-400 rounded-full"></div>
//             <div className="absolute top-36 right-44 w-2 h-2 bg-blue-400 rounded-full"></div>
//             <div className="absolute bottom-28 left-44 w-2 h-2 bg-blue-400 rounded-full"></div>

//             <div className="relative z-10 text-center">
//               <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
//                 <MapPin className="h-12 w-12 text-crypto-accent mx-auto mb-4" />
//               </motion.div>
//               <p className="text-crypto-text-primary font-medium">Interactive Geofence Map</p>
//               <p className="text-sm text-crypto-text-secondary mt-2">Draw zones • Set boundaries • Configure alerts</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Zone List */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1, duration: 0.6 }}
//           className="crypto-card p-6"
//         >
//           <div className="flex items-center space-x-3 mb-6">
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
//             >
//               <Settings className="h-5 w-5 text-white" />
//             </motion.div>
//             <h2 className="text-xl font-semibold text-crypto-text-primary">Active Zones</h2>
//           </div>
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {geofences.map((zone, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
//                 className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200"
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-medium text-sm text-crypto-text-primary">{zone.name}</h3>
//                   <div className="flex items-center space-x-1">
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       onClick={() => setSelectedZone(zone)}
//                       className="p-1 text-crypto-text-secondary hover:text-crypto-accent transition-colors"
//                     >
//                       <Eye className="h-3 w-3" />
//                     </motion.button>
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.9 }}
//                       className="p-1 text-crypto-text-secondary hover:text-crypto-accent transition-colors"
//                     >
//                       <Edit className="h-3 w-3" />
//                     </motion.button>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(zone.type)}`}>
//                     {zone.type}
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
//                     {zone.riskLevel}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2 text-xs text-crypto-text-secondary">
//                   <div>
//                     <span>Visitors: </span>
//                     <span className="text-crypto-text-primary font-medium">{zone.activeVisitors}</span>
//                   </div>
//                   <div>
//                     <span>Alerts: </span>
//                     <span className="text-crypto-text-primary font-medium">{zone.alerts}</span>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       {/* Zone Details Table */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 1.2, duration: 0.6 }}
//         className="crypto-card overflow-hidden"
//       >
//         <div className="p-6 border-b border-crypto-border/30">
//           <h2 className="text-xl font-semibold text-crypto-text-primary">Zone Configuration</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-crypto-surface/30">
//               <tr className="text-left text-crypto-text-secondary text-sm">
//                 <th className="p-4">Zone Name</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Risk Level</th>
//                 <th className="p-4">Radius</th>
//                 <th className="p-4">Active Visitors</th>
//                 <th className="p-4">Alerts</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {geofences.map((zone, index) => (
//                 <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
//                   <td className="p-4 font-medium">{zone.name}</td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(zone.type)}`}>
//                       {zone.type}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
//                       {zone.riskLevel}
//                     </span>
//                   </td>
//                   <td className="p-4 text-sm text-slate-400">{zone.radius}m</td>
//                   <td className="p-4 text-sm">{zone.activeVisitors}</td>
//                   <td className="p-4 text-sm">{zone.alerts}</td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       zone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
//                     }`}>
//                       {zone.status}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex items-center space-x-2">
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className="p-2 bg-teal-400 hover:bg-teal-500 rounded-lg transition-colors"
//                       >
//                         <Edit className="h-3 w-3 text-white" />
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className="p-2 bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
//                       >
//                         <Trash2 className="h-3 w-3 text-white" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>

//       {/* Zone Detail Modal */}
//       {selectedZone && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-slate-700">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold">{selectedZone.name}</h2>
//                 <button
//                   onClick={() => setSelectedZone(null)}
//                   className="text-slate-400 hover:text-white"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Zone Information</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Type:</span>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(selectedZone.type)}`}>
//                         {selectedZone.type}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Risk Level:</span>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(selectedZone.riskLevel)}`}>
//                         {selectedZone.riskLevel}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Radius:</span>
//                       <span>{selectedZone.radius}m</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Status:</span>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         selectedZone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
//                       }`}>
//                         {selectedZone.status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Statistics</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Active Visitors:</span>
//                       <span className="font-medium">{selectedZone.activeVisitors}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Total Visits:</span>
//                       <span className="font-medium">{selectedZone.totalVisits.toLocaleString()}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400">Alerts Generated:</span>
//                       <span className="font-medium">{selectedZone.alerts}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
//                 <div className="space-y-3">
//                   {Object.entries(selectedZone.notifications).map(([key, value]) => (
//                     <div key={key} className="flex items-center justify-between">
//                       <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
//                       }`}>
//                         {value ? 'Enabled' : 'Disabled'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Zone Rules</h3>
//                 <div className="bg-slate-900/50 rounded-lg p-4">
//                   <ul className="space-y-2">
//                     {selectedZone.rules.map((rule: string, index: number) => (
//                       <li key={index} className="text-sm text-slate-400 flex items-start space-x-2">
//                         <span className="text-teal-400 mt-1">•</span>
//                         <span>{rule}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>

//               <div className="flex space-x-4">
//                 <button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 py-2 px-4 rounded-lg transition-all duration-200">
//                   Edit Zone
//                 </button>
//                 <button className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors">
//                   Delete Zone
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import { MapPin, Plus, Edit, Trash2, Settings, Eye, Upload, AlertCircle, CheckCircle, X, Phone, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, Zone, getCurrentUser } from "../lib/supabaseClient";
import { GeoImport } from "./GeoImport";

// Notification type for on-screen alerts
interface Notification {
  id: string;
  type: 'ENTER' | 'EXIT';
  zoneName: string;
  zoneType: string;
  message: string;
  timestamp: Date;
}

// This file adds interactive geofence creation on the map in realtime
// with full Supabase/PostGIS integration:
// 1) Load zones from Supabase database
// 2) Real-time location detection with ENTER/EXIT event logging
// 3) Interactive zone creation with draggable radius handle
// 4) MAPOG GeoJSON import support
// 5) Color-coded zones (SAFE, MONITORED, RESTRICTED, EMERGENCY)

export const Geofences: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneToEdit, setZoneToEdit] = useState<any | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State for map info box
  const [mapInfoBox, setMapInfoBox] = useState<{ zone: any; position: { x: number; y: number } } | null>(null);
  
  // Notifications for on-screen display
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Zones loaded from Supabase
  const [geofences, setGeofences] = useState<Zone[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger

  // Location tracking state
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [lastTrackedLocation, setLastTrackedLocation] = useState<[number, number] | null>(null);
  const locationTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const geolocationErrorShownRef = useRef<boolean>(false);

  // Track which zones the user is currently inside
  const insideMapRef = useRef<Record<string, boolean>>({});
  const lastEventTimeRef = useRef<Record<string, number>>({}); // Cooldown tracking

  // SMS Service status
  const [smsStatus, setSmsStatus] = useState<{ smsServiceReady: boolean; watcher: { isWatching: boolean } } | null>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Load SMS service status and user phone
  useEffect(() => {
    const loadSMSStatus = async () => {
      try {
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
        const response = await fetch(`${API_BASE_URL}/sms/status`);
        if (response.ok) {
          const data = await response.json();
          setSmsStatus(data);
        }
      } catch (error) {
        console.error('Error loading SMS status:', error);
      }
    };

    const loadUserPhone = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Try users table first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('contact_number')
            .eq('id', user.id)
            .single();

          if (!userError && userData?.contact_number) {
            setUserPhoneNumber(String(userData.contact_number));
          } else {
            // Fallback to user_profiles
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('phone_number')
              .eq('id', user.id)
              .single();

            if (profileData?.phone_number) {
              setUserPhoneNumber(profileData.phone_number);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user phone:', error);
      }
    };

    loadSMSStatus();
    loadUserPhone();

    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      loadSMSStatus();
      loadUserPhone();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to extract coordinates from geometry
  function extractCoordinatesFromGeometry(geometry: GeoJSON.Geometry): { lat: number; lng: number } {
    if (geometry.type === 'Point') {
      return { lat: geometry.coordinates[1], lng: geometry.coordinates[0] };
    }
    // For polygons, get centroid
    const polygon = turf.feature(geometry);
    const centroid = turf.centroid(polygon);
    return { lat: centroid.geometry.coordinates[1], lng: centroid.geometry.coordinates[0] };
  }

  // Helper function to format zone data consistently
  const formatZone = (zone: Zone) => {
    // Handle geometry - check if it's in the new format or old format
    let geometry = zone.geometry;
    let coords = null;
    let radius = zone.radius_meters || 0;
    const shapeType = (zone as any).shape_type || 'circle';

    // Handle both column name variations (latitude/longitude vs center_lat/center_lng)
    const lat = (zone as any).latitude || zone.center_lat;
    const lng = (zone as any).longitude || zone.center_lng;

    console.log('Formatting zone:', zone.name, {
      shape_type: shapeType,
      has_lat_lng: !!(lat && lng),
      latitude: lat,
      longitude: lng,
      center_lat: zone.center_lat,
      center_lng: zone.center_lng,
      has_radius: !!zone.radius_meters,
      has_geometry: !!geometry,
      has_polygon_coords: !!(zone as any).polygon_coordinates
    });

    // Check if zone uses shape_type and polygon_coordinates (new format)
    if (shapeType === 'polygon' && (zone as any).polygon_coordinates) {
      // Convert polygon_coordinates to GeoJSON format
      const coordsArray = (zone as any).polygon_coordinates;
      geometry = {
        type: 'Polygon',
        coordinates: [coordsArray]
      } as GeoJSON.Polygon;
      coords = extractCoordinatesFromGeometry(geometry);
      console.log('Created polygon geometry:', geometry);
    } else if (shapeType === 'circle' && lat && lng) {
      // Circle zone - ensure we have coordinates (check both column name variations)
      coords = { 
        lat: parseFloat(lat.toString()), 
        lng: parseFloat(lng.toString()) 
      };
      radius = zone.radius_meters ? parseFloat(zone.radius_meters.toString()) : 0;
      geometry = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
        properties: { radius }
      } as GeoJSON.Point;
      console.log('Created circle geometry:', { coords, radius });
    } else if (lat && lng) {
      // Legacy circle format (no shape_type specified) - check both column name variations
      coords = { 
        lat: parseFloat(lat.toString()), 
        lng: parseFloat(lng.toString()) 
      };
      radius = zone.radius_meters ? parseFloat(zone.radius_meters.toString()) : 0;
      geometry = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
        properties: { radius }
      } as GeoJSON.Point;
      console.log('Created legacy circle geometry:', { coords, radius });
    } else if (geometry) {
      // Use existing geometry
      coords = extractCoordinatesFromGeometry(geometry);
      console.log('Using existing geometry:', geometry);
    } else {
      // No valid data - this zone cannot be drawn
      console.warn(`Zone "${zone.name}" has no valid location data (no lat/lng or geometry)`);
    }

    return {
      ...zone,
      type: zone.zone_type,
      riskLevel: zone.risk_level,
      coordinates: coords || { lat: 0, lng: 0 },
      radius: radius,
      activeVisitors: zone.active_visitors || 0,
      totalVisits: zone.total_visits || 0,
      alerts: zone.total_alerts || 0,
      notifications: zone.notifications as { entry: boolean; exit: boolean; extended_stay: boolean },
      rules: Array.isArray(zone.rules) ? zone.rules : [],
      geometry: geometry || undefined,
      shape_type: shapeType,
      polygon_coordinates: (zone as any).polygon_coordinates || null,
    };
  };

  // Debug: Log when showCreateForm changes
  useEffect(() => {
    console.log('showCreateForm state changed:', showCreateForm);
  }, [showCreateForm]);

  // Load zones from Supabase on mount and subscribe to real-time changes
  // NOTE: Make sure Realtime is enabled for 'zones' table in Supabase Dashboard
  // (Database → Replication → toggle ON for zones table)
  useEffect(() => {
    loadZones();
    getCurrentUser().then(setCurrentUser);

    // Subscribe to real-time changes on zones table
    const channel = supabase
      .channel('zones-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'zones'
        },
        (payload) => {
          console.log('Zone change detected:', payload.eventType, payload.new || payload.old);
          
          if (payload.eventType === 'INSERT') {
            // New zone added
            const newZone = payload.new as Zone;
            const formattedZone = formatZone(newZone);
            
            setGeofences(prev => {
              // Check if zone already exists (avoid duplicates)
              if (prev.some(z => z.id === formattedZone.id)) {
                return prev;
              }
              return [formattedZone as any, ...prev];
            });
            setRefreshKey(prev => prev + 1);
            
            // Show notification
            showNotification({
              type: 'ENTER',
              zoneName: newZone.name,
              zoneType: newZone.zone_type || 'MONITORED',
              message: `New zone "${newZone.name}" created`,
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            // Zone updated
            const updatedZone = payload.new as Zone;
            const formattedZone = formatZone(updatedZone);
            
            setGeofences(prev =>
              prev.map(zone =>
                zone.id === updatedZone.id ? formattedZone as any : zone
              )
            );
            setRefreshKey(prev => prev + 1);
          } 
          else if (payload.eventType === 'DELETE') {
            // Zone deleted
            const deletedZone = payload.old as Zone;
            setGeofences(prev => prev.filter(zone => zone.id !== deletedZone.id));
            setRefreshKey(prev => prev + 1);
            
            // Remove from map layers if it exists
            if (layersRef.current[deletedZone.id]) {
              const layerObj = layersRef.current[deletedZone.id];
              try {
                if (layerObj.circle && mapRef.current) {
                  mapRef.current.removeLayer(layerObj.circle);
                }
                if (layerObj.polygon && mapRef.current) {
                  mapRef.current.removeLayer(layerObj.polygon);
                }
                if (layerObj.tooltip && mapRef.current) {
                  mapRef.current.removeLayer(layerObj.tooltip);
                }
              } catch (e) {
                // Layer might already be removed
              }
              delete layersRef.current[deletedZone.id];
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to zones real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to zones:', status);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadZones(silent = false) {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching zones from Supabase:', fetchError);
        throw fetchError;
      }

      console.log(`📦 Loaded ${data?.length || 0} zones from database:`, data);

      // Convert database format to component format using formatZone helper
      const formattedZones = (data || []).map((zone: Zone) => {
        const formatted = formatZone(zone);
        console.log(`Formatted zone "${zone.name}":`, {
          original: { 
            center_lat: zone.center_lat, 
            center_lng: zone.center_lng, 
            radius_meters: zone.radius_meters,
            shape_type: (zone as any).shape_type,
            has_geometry: !!zone.geometry
          },
          formatted: {
            coordinates: formatted.coordinates,
            radius: formatted.radius,
            hasGeometry: !!formatted.geometry
          }
        });
        return formatted;
      });

      // Filter out zones without valid coordinates
      const validZones = formattedZones.filter(zone => {
        const isValid = (zone.coordinates && zone.coordinates.lat && zone.coordinates.lng) || 
                        (zone.geometry && (zone.geometry.type === 'Polygon' || zone.geometry.type === 'MultiPolygon'));
        if (!isValid) {
          console.warn(`⚠️ Zone "${zone.name}" filtered out - no valid location data`);
        }
        return isValid;
      });

      console.log(`✅ ${validZones.length} valid zones ready to display`);

      // Update state - this will trigger map re-render via useEffect
      setGeofences([...validZones] as any); // Create new array reference
      setRefreshKey(prev => prev + 1); // Force refresh
    } catch (err: any) {
      console.error('Error loading zones:', err);
      setError(err.message || 'Failed to load zones');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  // Store user location to database for tracking
  async function storeUserLocation(lat: number, lng: number, position?: GeolocationPosition) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id || null;

      // Don't store if same location (within 10 meters)
      if (lastTrackedLocation) {
        const distance = turf.distance(
          turf.point([lastTrackedLocation[1], lastTrackedLocation[0]]),
          turf.point([lng, lat]),
          { units: 'meters' }
        );
        
        // Only store if moved more than 10 meters
        if (distance < 10) {
          return;
        }
      }

      // Prepare location data
      const locationData: any = {
        user_id: userId,
        latitude: lat,
        longitude: lng,
        accuracy_m: position?.coords.accuracy || null,
        altitude: position?.coords.altitude || null,
        heading: position?.coords.heading || null,
        speed: position?.coords.speed || null,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
      };

      // Insert into user_locations table
      const { error } = await supabase
        .from('user_locations')
        .insert(locationData);

      if (error) {
        // Don't log RLS errors as critical (expected when not logged in)
        if (!error.message?.includes('row-level security')) {
          console.error('Error storing location:', error);
        }
      } else {
        console.log(`📍 Location stored: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLastTrackedLocation([lat, lng]);
        
        // Update user_profiles current location directly (faster)
        if (userId) {
          await supabase
            .from('user_profiles')
            .update({
              current_latitude: lat,
              current_longitude: lng,
              location_updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
      }
    } catch (err: any) {
      console.error('Error in storeUserLocation:', err);
    }
  }

  // Delete zone handler
  async function handleDeleteZone(zoneId: string, zoneName: string) {
    if (!confirm(`Are you sure you want to delete "${zoneName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // First, remove from map immediately
      if (layersRef.current[zoneId]) {
        try {
          const layerObj = layersRef.current[zoneId];
          if (layerObj.circle && mapRef.current) {
            mapRef.current.removeLayer(layerObj.circle);
          }
          if (layerObj.polygon && mapRef.current) {
            mapRef.current.removeLayer(layerObj.polygon);
          }
          if (layerObj.tooltip && mapRef.current) {
            mapRef.current.removeLayer(layerObj.tooltip);
          }
          delete layersRef.current[zoneId];
        } catch (e) {
          console.warn('Error removing layer:', e);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      // Clear selected zone if it was deleted
      if (selectedZone?.id === zoneId) {
        setSelectedZone(null);
      }

      // Remove from state immediately (creates new array reference)
      // Don't reload from DB - state update is immediate and correct
      setGeofences((prev) => {
        const filtered = prev.filter((z) => z.id !== zoneId);
        console.log(`Deleted zone from state. Remaining: ${filtered.length}`);
        return [...filtered]; // Ensure new array reference
      });
      setRefreshKey(prev => prev + 1); // Force refresh

      console.log(`✅ Zone "${zoneName}" deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting zone:', err);
      alert(`Failed to delete zone: ${err.message}`);
    }
  }

  // Edit zone handler - opens edit modal
  function handleEditZone(zone: any) {
    setZoneToEdit(zone);
    setShowEditForm(true);
  }

  // Save edited zone handler
  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!zoneToEdit) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const zone_type = formData.get('type') as string;
    const risk_level = formData.get('risk') as string;
    const status = formData.get('status') as string;

    try {
      const updateData: any = {
        name,
        description: description || null,
        zone_type,
        risk_level,
        status,
        updated_at: new Date().toISOString(),
      };

      // Update geometry if it's a circle zone and coordinates/radius changed
      const isCircle = zoneToEdit.geometry?.type === 'Point';
      if (isCircle) {
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const radius = parseFloat(formData.get('radius') as string);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
          updateData.geometry = {
            type: 'Point',
            coordinates: [lng, lat],
            properties: { radius }
          };
          updateData.center_lat = lat;
          updateData.center_lng = lng;
          updateData.radius_meters = radius;
        }
      }

      // First, remove old layer from map if geometry changed
      const editedZoneId = zoneToEdit.id;
      if (layersRef.current[editedZoneId]) {
        try {
          const layerObj = layersRef.current[editedZoneId];
          if (layerObj.circle && mapRef.current) {
            mapRef.current.removeLayer(layerObj.circle);
          }
          if (layerObj.polygon && mapRef.current) {
            mapRef.current.removeLayer(layerObj.polygon);
          }
          if (layerObj.tooltip && mapRef.current) {
            mapRef.current.removeLayer(layerObj.tooltip);
          }
          delete layersRef.current[editedZoneId];
        } catch (e) {
          console.warn('Error removing layer:', e);
        }
      }

      // Update in database
      const { error } = await supabase
        .from('zones')
        .update(updateData)
        .eq('id', editedZoneId);

      if (error) throw error;

      // Update state immediately with edited zone data
      setGeofences((prev) => {
        return prev.map((z) => {
          if (z.id === editedZoneId) {
            // Create updated zone object
            const updated: any = {
              ...z,
              name,
              description: description || null,
              zone_type,
              risk_level,
              status,
              type: zone_type,
              riskLevel: risk_level,
            };

            // Update geometry if circle zone
            if (isCircle) {
              const lat = parseFloat(formData.get('lat') as string);
              const lng = parseFloat(formData.get('lng') as string);
              const radius = parseFloat(formData.get('radius') as string);

              if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
                const newGeometry = {
                  type: 'Point',
                  coordinates: [lng, lat],
                  properties: { radius }
                } as GeoJSON.Point;
                updated.geometry = newGeometry;
                updated.center_lat = lat;
                updated.center_lng = lng;
                updated.radius_meters = radius;
                updated.coordinates = { lat, lng };
                updated.radius = radius;
              }
            }

            return updated;
          }
          return z;
        });
      });
      setRefreshKey(prev => prev + 1); // Force refresh

      // Close edit modal
      setShowEditForm(false);
      setZoneToEdit(null);
      
      // Update selected zone if it was edited
      setSelectedZone((prev) => {
        if (prev?.id === editedZoneId) {
          return {
            ...prev,
            name,
            description: description || null,
            zone_type: zone_type as any,
            risk_level: risk_level as any,
            status: status as any,
            type: zone_type,
            riskLevel: risk_level,
          } as any;
        }
        return prev;
      });

      console.log(`✅ Zone "${name}" updated successfully`);
    } catch (err: any) {
      console.error('Error updating zone:', err);
      alert(`Failed to update zone: ${err.message}`);
    }
  }

  // Leaflet map refs
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<
    Record<string, { circle?: L.Circle; polygon?: L.GeoJSON; tooltip?: L.Tooltip }>
  >({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Create-mode helpers
  const [tempCenter, setTempCenter] = useState<L.LatLng | null>(null);
  const tempCircleRef = useRef<L.Circle | null>(null);
  const tempHandleRef = useRef<L.Marker | null>(null);

  // inject component CSS on mount (outline/shadow + label hide rule via container class)
  useEffect(() => {
    const css = `
      .zone-label { background: rgba(0,0,0,0.65) !important; color: #fff !important; border: none !important; padding: 4px 8px !important; border-radius: 6px !important; font-size: 12px !important; line-height: 1 !important; white-space: nowrap !important; pointer-events: auto !important; cursor: pointer !important; transition: background 0.2s !important; box-shadow: 0 2px 6px rgba(0,0,0,0.4); }
      .zone-label:hover { background: rgba(0,0,0,0.85) !important; }
      .geofence-circle { filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35)); }
      .geofence-circle .leaflet-interactive { stroke-linejoin: round; }
      .hide-zone-labels .zone-label { display: none !important; }
      .user-location-marker {
        background: transparent !important;
        border: none !important;
        z-index: 10000 !important;
      }
      .user-location-marker > div {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
        }
        50% {
          box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 12px rgba(59, 130, 246, 0.2);
        }
        100% {
          box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
        }
      }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-generated", "geofence-styles");
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      try {
        document.head.removeChild(style);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // init once

    const map = L.map(containerRef.current).setView([26.0, 92.0], 6); // center on Northeast India
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // draw initial geofences
    geofences.forEach((zone) => drawZone(zone));

    // map click handler used for create mode and closing info box
    map.on("click", (e: L.LeafletMouseEvent) => {
      // Close info box when clicking on map (but not on zones)
      if (mapInfoBox) {
        setMapInfoBox(null);
      }
      
      if (!showCreateForm) return; // only place temp center when modal open

      const { latlng } = e;
      setTempCenter(latlng);

      // draw or update preview circle
      if (tempCircleRef.current) tempCircleRef.current.remove();
      tempCircleRef.current = L.circle(latlng, {
        radius: 200, // default preview radius
        color: "#38bdf8",
        dashArray: "6",
        weight: 2,
        fillOpacity: 0.06,
      }).addTo(map);

      // create or update draggable handle positioned east of center at default radius
      const handlePos = L.latLng(
        latlng.lat,
        latlng.lng + metersToLng(200, latlng.lat)
      );
      if (tempHandleRef.current) tempHandleRef.current.setLatLng(handlePos);
      else {
        tempHandleRef.current = L.marker(handlePos, {
          draggable: true,
          title: "Drag to resize radius",
        }).addTo(map);
        tempHandleRef.current.on("drag", (ev: any) => {
          const markerLatLng = ev.target.getLatLng();
          const center = tempCenter || latlng;
          const newRadius = center.distanceTo(markerLatLng); // in meters
          if (tempCircleRef.current) tempCircleRef.current.setRadius(newRadius);
          // update radius input if present
          const radiusInput = document.querySelector(
            'input[name="radius"]'
          ) as HTMLInputElement | null;
          if (radiusInput) radiusInput.value = String(Math.round(newRadius));
        });

        tempHandleRef.current.on("dragend", () => {
          // keep marker at new location; radius already set
        });
      }

      // set pan to clicked point
      map.panTo(latlng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep map circles in sync when geofences change
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map ref not ready');
      return;
    }

    console.log(`Updating map layers. Zones count: ${geofences.length}`);

    // Remove all old zone layers from map
    const layerIds = Object.keys(layersRef.current);
    layerIds.forEach((zoneId) => {
      const obj = layersRef.current[zoneId];
      try {
        if (obj.circle) {
          mapRef.current!.removeLayer(obj.circle);
        }
        if (obj.polygon) {
          mapRef.current!.removeLayer(obj.polygon);
        }
        if (obj.tooltip) {
          mapRef.current!.removeLayer(obj.tooltip);
        }
      } catch (e) {
        // Layer might already be removed, ignore
      }
    });
    layersRef.current = {};

    // Draw only ACTIVE zones on the map
    const activeZones = geofences.filter((zone) => zone.status === 'ACTIVE');
    console.log(`Drawing ${activeZones.length} active zones on map`);
    
    activeZones.forEach((zone) => {
      try {
        drawZone(zone);
      } catch (e) {
        console.error('Error drawing zone:', zone.name, e);
      }
    });
    
    // Force map to invalidate size in case of layout changes
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
  }, [geofences]);

  // toggle label visibility by adding/removing class on container
  useEffect(() => {
    if (!containerRef.current) return;
    if (showLabels) containerRef.current.classList.remove("hide-zone-labels");
    else containerRef.current.classList.add("hide-zone-labels");
  }, [showLabels]);

  function drawZone(zone: any) {
    if (!mapRef.current) {
      console.warn('Map ref not ready, cannot draw zone:', zone.name);
      return;
    }
    
    const { id, coordinates, radius, type, geometry, shape_type } = zone;
    console.log(`Drawing zone: ${zone.name}`, { id, coordinates, radius, type, hasGeometry: !!geometry, shape_type });

    const strokeColor = getZoneStrokeColor(type);
    let tooltipLatLng: L.LatLng;

    // Check if zone is a polygon or circle
    const isPolygon = (shape_type === 'polygon' || (geometry && 
      (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')));
    
    if (isPolygon && geometry) {
      // Draw polygon using GeoJSON
      const geoJsonLayer = L.geoJSON(geometry as GeoJSON.Geometry, {
        style: {
          color: strokeColor,
          weight: 2,
          fillOpacity: 0.15,
          fillColor: strokeColor,
          className: "geofence-polygon",
        },
      }).addTo(mapRef.current!);
      
      // Get centroid for tooltip placement
      const polygonFeature = turf.feature(geometry);
      const centroid = turf.centroid(polygonFeature);
      tooltipLatLng = L.latLng(
        centroid.geometry.coordinates[1],
        centroid.geometry.coordinates[0]
      );

      // Add a permanent tooltip label with click handler
      const tooltip = L.tooltip({
        permanent: true,
        direction: "center",
        className: "zone-label cursor-pointer hover:bg-opacity-80",
      })
        .setContent(`<span style="cursor: pointer; user-select: none;">${zone.name}</span>`)
        .setLatLng(tooltipLatLng);

      tooltip.addTo(mapRef.current!);

      // Add click handler to tooltip
      tooltip.getElement()?.addEventListener('click', (e) => {
        e.stopPropagation();
        const point = mapRef.current!.latLngToContainerPoint(tooltipLatLng);
        setMapInfoBox({ zone, position: { x: point.x, y: point.y } });
      });

      // Add click handler to polygon
      geoJsonLayer.on('click', (e: L.LeafletMouseEvent) => {
        const point = mapRef.current!.latLngToContainerPoint(e.latlng);
        setMapInfoBox({ zone, position: { x: point.x, y: point.y } });
      });

      // Store polygon layer reference
      layersRef.current[id] = { polygon: geoJsonLayer, tooltip };
      console.log(`✅ Polygon zone "${zone.name}" drawn on map`);
    } else if (radius > 0 && coordinates && coordinates.lat && coordinates.lng) {
      // Draw circle (existing behavior)
      console.log(`Drawing circle zone "${zone.name}" at`, coordinates, 'with radius', radius);
      const circle = L.circle([coordinates.lat, coordinates.lng], {
        radius,
        color: strokeColor,
        weight: 2,
        fillOpacity: 0.15,
        className: "geofence-circle",
      }).addTo(mapRef.current!);

      tooltipLatLng = L.latLng(coordinates.lat, coordinates.lng);

      // Add a permanent tooltip label with click handler
      const tooltip = L.tooltip({
        permanent: true,
        direction: "center",
        className: "zone-label cursor-pointer hover:bg-opacity-80",
      })
        .setContent(`<span style="cursor: pointer; user-select: none;">${zone.name}</span>`)
        .setLatLng(tooltipLatLng);

      tooltip.addTo(mapRef.current!);

      // Add click handler to tooltip
      tooltip.getElement()?.addEventListener('click', (e) => {
        e.stopPropagation();
        const point = mapRef.current!.latLngToContainerPoint(tooltipLatLng);
        setMapInfoBox({ zone, position: { x: point.x, y: point.y } });
      });

      // Add click handler to circle
      circle.on('click', (e: L.LeafletMouseEvent) => {
        const point = mapRef.current!.latLngToContainerPoint(e.latlng);
        setMapInfoBox({ zone, position: { x: point.x, y: point.y } });
      });

      // Store circle layer reference
      layersRef.current[id] = { circle, tooltip };
      console.log(`✅ Circle zone "${zone.name}" drawn on map`);
    } else {
      // Fallback: skip if no valid geometry
      console.warn(`⚠️ Zone "${zone.name}" (ID: ${id}) cannot be drawn:`, {
        hasCoordinates: !!coordinates,
        coordinatesValue: coordinates,
        hasRadius: radius > 0,
        radiusValue: radius,
        hasGeometry: !!geometry,
        geometryType: geometry?.type,
        shapeType: shape_type
      });
      return;
    }
  }

  // Helper for colors
  function getZoneStrokeColor(type: string) {
    switch (type) {
      case "SAFE":
        return "#16a34a";
      case "RESTRICTED":
        return "#ef4444";
      case "MONITORED":
        return "#f59e0b";
      case "EMERGENCY":
        return "#7c3aed";
      default:
        return "#94a3b8";
    }
  }

  // Start watching user's location when component mounts
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        
        console.log(`📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} (accuracy: ${accuracy}m)`);
        
        // Pass position object for tracking
        handleUserLocation([lat, lng], pos);
      },
      (err) => {
        // Only log error once to avoid spam in console
        if (!geolocationErrorShownRef.current) {
          const errorMessage = err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enable location access in browser settings for tracking.'
            : err.code === err.POSITION_UNAVAILABLE
            ? 'Location information unavailable.'
            : err.code === err.TIMEOUT
            ? 'Location request timed out.'
            : 'An unknown geolocation error occurred.';
          
          // Only show warning if tracking is explicitly enabled, otherwise silently ignore
          if (isTrackingEnabled && err.code === err.PERMISSION_DENIED) {
            console.warn('⚠️ Location tracking:', errorMessage);
          } else {
            // Silently ignore if tracking is not enabled (don't spam console)
          }
          
          geolocationErrorShownRef.current = true;
          
          // Reset error flag after 5 minutes to allow retry
          setTimeout(() => {
            geolocationErrorShownRef.current = false;
          }, 300000);
        }
      },
      { 
        enableHighAccuracy: true, // Use GPS on mobile
        maximumAge: 5000, // Accept cached position up to 5 seconds
        timeout: 15000 // 15 second timeout for mobile
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geofences, isTrackingEnabled]);

  function handleUserLocation([lat, lng]: [number, number], position?: GeolocationPosition) {
    if (!mapRef.current) {
      console.warn('⚠️ Map ref not ready, cannot show user location');
      return;
    }
    
    console.log('📍 handleUserLocation called:', lat, lng);

    // Create custom blue dot icon for user location
    const createUserLocationIcon = () => {
      return L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: #3b82f6;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 15px rgba(0,0,0,0.6), 0 0 0 6px rgba(59, 130, 246, 0.4);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    };

    // Update or create user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      console.log('📍 User location updated:', lat.toFixed(6), lng.toFixed(6));
    } else {
      try {
        const userIcon = createUserLocationIcon();
        userMarkerRef.current = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: 1000, // Ensure it's on top
        })
        .addTo(mapRef.current)
        .bindPopup('Your Location')
        .openPopup();
        
        // Center map on user location when marker is first created
        mapRef.current.setView([lat, lng], 15, { animate: true });
        
        console.log('✅ User location marker created at:', lat.toFixed(6), lng.toFixed(6));
        console.log('✅ Map centered on user location');
        console.log('✅ Marker object:', userMarkerRef.current);
      } catch (error) {
        console.error('❌ Error creating user location marker:', error);
      }
    }

    // Store location for tracking (if enabled)
    if (isTrackingEnabled) {
      storeUserLocation(lat, lng, position);
    }

    // check each zone for entry/exit
    geofences.forEach((zone) => {
      const userPoint = turf.point([lng, lat]);
      const wasInside = !!insideMapRef.current[zone.id];
      let nowInside = false;

      // Check if zone is a polygon
      const isPolygon = zone.geometry && 
        (zone.geometry.type === 'Polygon' || zone.geometry.type === 'MultiPolygon');

      if (isPolygon && zone.geometry) {
        // Use booleanPointInPolygon for polygon zones
        const polygonFeature = turf.feature(zone.geometry);
        nowInside = turf.booleanPointInPolygon(userPoint, polygonFeature as any);
      } else if (zone.radius > 0 && zone.coordinates) {
        // Use distance check for circle zones
        const center = turf.point([zone.coordinates.lng, zone.coordinates.lat]);
        const distanceKm = turf.distance(center, userPoint, { units: "kilometers" });
        const distanceMeters = distanceKm * 1000;
        nowInside = distanceMeters <= zone.radius;
      }

      if (nowInside && !wasInside) {
        insideMapRef.current[zone.id] = true;
        onZoneEnter(zone, lat, lng);
      } else if (!nowInside && wasInside) {
        insideMapRef.current[zone.id] = false;
        onZoneExit(zone, lat, lng);
      }
    });
  }

  async function onZoneEnter(zone: any, lat: number, lng: number) {
    const now = Date.now();
    const lastEvent = lastEventTimeRef.current[zone.id] || 0;
    const cooldown = 30000; // 30 seconds cooldown to prevent duplicate events

    if (now - lastEvent < cooldown) {
      return; // Skip if within cooldown period
    }

    lastEventTimeRef.current[zone.id] = now;

    // Log event to Supabase
    const user = await getCurrentUser();
    const userId = user?.id || null;

    try {
      // Calculate distance
      const distance = zone.center_lat && zone.center_lng
        ? turf.distance(
            turf.point([zone.center_lng, zone.center_lat]),
            turf.point([lng, lat]),
            { units: 'kilometers' }
          ) * 1000 // Convert to meters
        : null;

      // Insert event into zone_events table
      const { error: eventError } = await supabase
        .from('zone_events')
        .insert({
          zone_id: zone.id,
          user_id: userId,
          event_type: 'ENTER',
          latitude: lat,
          longitude: lng,
          distance_meters: distance,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        });

      if (eventError) {
        // Don't log RLS policy errors as errors (they're expected when not logged in)
        if (!eventError.message?.includes('row-level security')) {
          console.error('Error logging ENTER event:', eventError);
        } else {
          console.warn('⚠️ Event not logged (not logged in):', eventError.message);
        }
      } else {
        console.info(`✅ Entered zone: ${zone.name} - Event logged to Supabase`);
        
        // Check if this is a RESTRICTED or EMERGENCY zone (RED zones) - SMS will be sent automatically
        const isRestrictedZone = (zone.zone_type || zone.type) === 'RESTRICTED' || 
                                 (zone.zone_type || zone.type) === 'EMERGENCY';
        
        // Show on-screen notification
        showNotification({
          type: 'ENTER',
          zoneName: zone.name,
          zoneType: zone.zone_type || zone.type,
          message: isRestrictedZone 
            ? `⚠️ You entered ${zone.name}. SMS alert has been sent to your phone.`
            : `You entered ${zone.name}`,
        });

        // Log SMS trigger for restricted zones
        if (isRestrictedZone && userId) {
          console.info(`📱 SMS Alert: Restricted zone entry detected. SMS will be sent to user ${userId}`);
        }
      }

      // Trigger notification if enabled
      if (zone.notifications?.entry && userId) {
        // Call notify edge function
        const { data: edgeFunctionUrl } = supabase.functions.invoke('notify', {
          body: {
            userId,
            zoneId: zone.id,
            zoneName: zone.name,
            zoneType: zone.zone_type || zone.type,
            eventType: 'ENTER',
            methods: ['push', 'whatsapp'],
          },
        });
      }

      // Update local state
      setGeofences((prev) =>
        prev.map((z) =>
          z.id === zone.id
            ? {
                ...z,
                activeVisitors: (z.activeVisitors || 0) + 1,
                totalVisits: (z.totalVisits || 0) + 1,
              }
            : z
        )
      );

      // Increment alerts for RESTRICTED zones
      if ((zone.zone_type || zone.type) === "RESTRICTED") {
        setGeofences((prev) =>
          prev.map((z) =>
            z.id === zone.id ? { ...z, alerts: (z.alerts || 0) + 1 } : z
          )
        );
      }
    } catch (err: any) {
      console.error('Error in onZoneEnter:', err);
    }
  }

  async function onZoneExit(zone: any, lat: number, lng: number) {
    const now = Date.now();
    const lastEvent = lastEventTimeRef.current[`${zone.id}_exit`] || 0;
    const cooldown = 30000; // 30 seconds cooldown

    if (now - lastEvent < cooldown) {
      return;
    }

    lastEventTimeRef.current[`${zone.id}_exit`] = now;

    // Log event to Supabase
    const user = await getCurrentUser();
    const userId = user?.id || null;

    try {
      // Calculate distance
      const distance = zone.center_lat && zone.center_lng
        ? turf.distance(
            turf.point([zone.center_lng, zone.center_lat]),
            turf.point([lng, lat]),
            { units: 'kilometers' }
          ) * 1000
        : null;

      // Insert event into zone_events table
      const { error: eventError } = await supabase
        .from('zone_events')
        .insert({
          zone_id: zone.id,
          user_id: userId,
          event_type: 'EXIT',
          latitude: lat,
          longitude: lng,
          distance_meters: distance,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        });

      if (eventError) {
        // Don't log RLS policy errors as errors (they're expected when not logged in)
        if (!eventError.message?.includes('row-level security')) {
          console.error('Error logging EXIT event:', eventError);
        } else {
          console.warn('⚠️ Event not logged (not logged in):', eventError.message);
        }
      } else {
        console.info(`✅ Exited zone: ${zone.name} - Event logged to Supabase`);
        
        // Show on-screen notification
        showNotification({
          type: 'EXIT',
          zoneName: zone.name,
          zoneType: zone.zone_type || zone.type,
          message: `You exited ${zone.name}`,
        });
      }

      // Trigger notification if enabled
      if (zone.notifications?.exit && userId) {
        supabase.functions.invoke('notify', {
          body: {
            userId,
            zoneId: zone.id,
            zoneName: zone.name,
            zoneType: zone.zone_type || zone.type,
            eventType: 'EXIT',
            methods: ['push', 'whatsapp'],
          },
        });
      }

      // Update local state
      setGeofences((prev) =>
        prev.map((z) =>
          z.id === zone.id
            ? { ...z, activeVisitors: Math.max((z.activeVisitors || 1) - 1, 0) }
            : z
        )
      );
    } catch (err: any) {
      console.error('Error in onZoneExit:', err);
    }
  }

  // Create geofence form submit - Save to Supabase
  async function handleCreateZone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "New Zone").trim();
    const lat =
      Number(formData.get("lat")) || (tempCenter ? tempCenter.lat : 0);
    const lng =
      Number(formData.get("lng")) || (tempCenter ? tempCenter.lng : 0);
    const radius =
      Number(formData.get("radius")) ||
      (tempCircleRef.current ? tempCircleRef.current.getRadius() : 200);
    const type = String(formData.get("type") || "MONITORED") as Zone['zone_type'];
    const risk = String(formData.get("risk") || "MEDIUM") as Zone['risk_level'];
    const description = String(formData.get("description") || "").trim();
    const state = String(formData.get("state") || "").trim();
    const district = String(formData.get("district") || "").trim();
    const rulesText = String(formData.get("rules") || "").trim();
    
    // Parse rules from textarea (one per line)
    const rules = rulesText
      ? rulesText.split('\n').map(r => r.trim()).filter(r => r.length > 0)
      : [];

    // Get user if available (optional - not required)
    const user = await getCurrentUser();

    // Validate required fields
    if (!name || name.trim() === '') {
      alert("Please enter a zone name.");
      return;
    }
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates.");
      return;
    }
    if (!radius || radius <= 0) {
      alert("Please enter a valid radius (greater than 0).");
      return;
    }

    try {
      // Insert zone into Supabase according to the schema
      const { data: newZone, error: insertError } = await supabase
        .from('zones')
        .insert({
          name: name.trim(),
          description: description || null,
          zone_type: type,
          risk_level: risk,
          shape_type: 'circle', // Circle zone
          latitude: lat,
          longitude: lng,
          radius_meters: radius,
          polygon_coordinates: null, // Not used for circle zones
          status: 'ACTIVE',
          notifications: {
            entry: true,
            exit: true,
            extended_stay: false,
          },
          rules: rules,
          region: 'Northeast India',
          state: state || null,
          district: district || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      console.info("✅ Zone created successfully in Supabase:", newZone);

      // Real-time subscription will automatically update the UI
      // But we can also reload as a fallback to ensure consistency
      await loadZones(true); // Silent reload

      setShowCreateForm(false);

      // Remove preview and handle
      if (tempCircleRef.current) {
        tempCircleRef.current.remove();
        tempCircleRef.current = null;
      }
      if (tempHandleRef.current) {
        tempHandleRef.current.remove();
        tempHandleRef.current = null;
      }
      setTempCenter(null);

      // Pan map to new zone
      if (mapRef.current) mapRef.current.panTo([lat, lng]);

      // Show success notification
      showNotification({
        type: 'ENTER',
        zoneName: name,
        zoneType: type,
        message: `Zone "${name}" created successfully!`,
      });
    } catch (err: any) {
      console.error("Error creating zone:", err);
      alert(`Failed to create zone: ${err.message}`);
    }
  }

  // Helpers: convert meters east to difference in longitude at given latitude
  function metersToLng(meters: number, lat: number) {
    // approximate: 1 deg lon = 111320*cos(lat)
    return meters / (111320 * Math.cos((lat * Math.PI) / 180));
  }

  // Show on-screen notification
  function showNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
    }, 10000);
  }

  // Simulate geofence entry and send SMS + phone call alert
  const handleSimulateGeofenceAlert = async () => {
    if (isSendingAlert) return;

    setIsSendingAlert(true);
    try {
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
      
      // Get first RESTRICTED or EMERGENCY zone, or use defaults
      const restrictedZone = geofences.find(z => z.zone_type === 'RESTRICTED' || z.zone_type === 'EMERGENCY');
      const zoneName = restrictedZone?.name || 'High Risk Area';
      const zoneType = restrictedZone?.zone_type || 'RESTRICTED';

      const response = await fetch(`${API_BASE_URL}/sms/simulate-geofence-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: userPhoneNumber || undefined, // Use hardcoded if not provided
          zoneName,
          zoneType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification({
          type: 'ENTER',
          zoneName,
          zoneType,
          message: `✅ Alert sent! SMS and phone call delivered to ${result.details.phoneNumber}`,
        });
        alert(`✅ Success!\n\nSMS and phone call sent successfully!\n\nZone: ${zoneName}\nPhone: ${result.details.phoneNumber}\nSMS SID: ${result.smsSid}\nCall SID: ${result.callSid}`);
      } else {
        alert(`❌ Failed to send alert:\n\n${result.error || result.message}`);
      }
    } catch (error: any) {
      console.error('Error sending geofence alert:', error);
      alert(`❌ Error: ${error.message || 'Failed to send alert'}`);
    } finally {
      setIsSendingAlert(false);
    }
  };

  // Helper small UI functions
  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case "SAFE":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "RESTRICTED":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "MONITORED":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "EMERGENCY":
        return "text-purple-400 bg-purple-500/20 border-purple-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "text-green-400 bg-green-500/20";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/20";
      case "HIGH":
        return "text-orange-400 bg-orange-500/20";
      case "CRITICAL":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 relative"
    >
      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 400, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`pointer-events-auto crypto-card p-4 min-w-[320px] max-w-md border-2 ${
                notification.type === 'ENTER'
                  ? notification.zoneType === 'RESTRICTED'
                    ? 'border-red-500/50 bg-red-500/10'
                    : notification.zoneType === 'EMERGENCY'
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-green-500/50 bg-green-500/10'
                  : 'border-blue-500/50 bg-blue-500/10'
              } shadow-2xl`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  notification.type === 'ENTER'
                    ? notification.zoneType === 'RESTRICTED'
                      ? 'bg-red-500/20'
                      : notification.zoneType === 'EMERGENCY'
                      ? 'bg-purple-500/20'
                      : 'bg-green-500/20'
                    : 'bg-blue-500/20'
                }`}>
                  {notification.type === 'ENTER' ? (
                    <CheckCircle className={`h-5 w-5 ${
                      notification.zoneType === 'RESTRICTED'
                        ? 'text-red-400'
                        : notification.zoneType === 'EMERGENCY'
                        ? 'text-purple-400'
                        : 'text-green-400'
                    }`} />
                  ) : (
                    <MapPin className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${
                      notification.type === 'ENTER'
                        ? notification.zoneType === 'RESTRICTED'
                          ? 'text-red-300'
                          : notification.zoneType === 'EMERGENCY'
                          ? 'text-purple-300'
                          : 'text-green-300'
                        : 'text-blue-300'
                    }`}>
                      {notification.type === 'ENTER' ? '📍 Entered Zone' : '📍 Exited Zone'}
                    </h4>
                    <button
                      onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-white font-medium text-base mb-1">{notification.zoneName}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      notification.zoneType === 'SAFE'
                        ? 'text-green-400 bg-green-500/20 border-green-500/30'
                        : notification.zoneType === 'RESTRICTED'
                        ? 'text-red-400 bg-red-500/20 border-red-500/30'
                        : notification.zoneType === 'MONITORED'
                        ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                        : 'text-purple-400 bg-purple-500/20 border-purple-500/30'
                    }`}>
                      {notification.zoneType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {notification.type === 'ENTER' && notification.zoneType === 'RESTRICTED' && (
                    <p className="text-xs text-red-300 mt-2 font-medium">
                      ⚠️ High Risk Zone - Exercise Caution
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Full Screen Map Section */}
      <div className="relative w-full mb-6" style={{ height: "calc(100vh - 160px)", minHeight: "700px" }}>
        {/* Floating Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between bg-slate-900/95 backdrop-blur-md rounded-lg p-4 border border-crypto-border/30 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Zone Management Map
                </h2>
                <p className="text-xs text-slate-400">
                  Configure and monitor geographical boundaries
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={() => setShowLabels((v) => !v)}
                className="rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500"
              />
              <span>Show Labels</span>
            </label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newTrackingState = !isTrackingEnabled;
                setIsTrackingEnabled(newTrackingState);
                
                if (newTrackingState) {
                  // Start tracking - get current location immediately and show marker
                  console.log('🟢 Starting location tracking...');
                  
                  // Check if map is ready
                  if (!mapRef.current) {
                    console.warn('⚠️ Map not ready yet, waiting...');
                    setTimeout(() => {
                      if (!mapRef.current) {
                        alert('Map is not ready. Please wait a moment and try again.');
                        setIsTrackingEnabled(false);
                        return;
                      }
                    }, 1000);
                  }
                  
                  if (navigator.geolocation) {
                    // Use watchPosition instead of getCurrentPosition to avoid timeout
                    // The watcher is already running, so just ensure marker is visible
                    if (mapRef.current && userMarkerRef.current) {
                      // Marker already exists, just center map on it
                      const currentLatLng = userMarkerRef.current.getLatLng();
                      mapRef.current.setView([currentLatLng.lat, currentLatLng.lng], 15, { animate: true });
                      console.log('✅ Map centered on existing marker');
                    } else {
                      // Try to get location once with longer timeout
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          console.log('📍 Got location:', lat, lng);
                          
                          // Ensure map is ready
                          if (!mapRef.current) {
                            console.error('❌ Map ref is null!');
                            setIsTrackingEnabled(false);
                            alert('Map is not ready. Please refresh the page.');
                            return;
                          }
                          
                          // Show marker on map immediately
                          handleUserLocation([lat, lng], pos);
                          
                          // Store location for tracking
                          storeUserLocation(lat, lng, pos);
                        },
                        (err) => {
                          console.error('❌ Error getting location:', err);
                          // Don't disable tracking - the watcher will handle it
                          if (err.code === err.PERMISSION_DENIED) {
                            alert('Location permission denied. Please enable location access in your browser settings.');
                            setIsTrackingEnabled(false);
                          } else if (err.code === err.TIMEOUT) {
                            // Timeout is OK - the watcher will get location eventually
                            console.warn('⚠️ Initial location timeout, but watcher will continue...');
                          }
                        },
                        {
                          enableHighAccuracy: false, // Use cached location first
                          timeout: 5000,
                          maximumAge: 60000 // Accept location up to 1 minute old
                        }
                      );
                    }
                  } else {
                    alert('Geolocation is not supported by your browser.');
                    setIsTrackingEnabled(false);
                  }
                } else {
                  // Stop tracking
                  if (locationTrackingIntervalRef.current) {
                    clearInterval(locationTrackingIntervalRef.current);
                    locationTrackingIntervalRef.current = null;
                  }
                  // Optionally remove marker when stopping (comment out to keep it visible)
                  // if (userMarkerRef.current && mapRef.current) {
                  //   mapRef.current.removeLayer(userMarkerRef.current);
                  //   userMarkerRef.current = null;
                  // }
                }
              }}
              className={`crypto-btn flex items-center space-x-2 text-sm px-4 py-2 ${
                isTrackingEnabled ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
              title={isTrackingEnabled ? 'Stop Location Tracking' : 'Start Location Tracking'}
            >
              <MapPin className="h-4 w-4" />
              <span>{isTrackingEnabled ? 'Stop Tracking' : 'Start Tracking'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowImportForm(true)}
              className="crypto-btn flex items-center space-x-2 text-sm px-4 py-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import from MAPOG</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Create Geofence button clicked');
                setShowCreateForm(true);
              }}
              type="button"
              className="crypto-btn flex items-center space-x-2 text-sm px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Geofence</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSimulateGeofenceAlert}
              disabled={isSendingAlert}
              className="crypto-btn flex items-center space-x-2 text-sm px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Simulate user inside geofence and send SMS + phone call alert"
            >
              {isSendingAlert ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              <span>{isSendingAlert ? 'Sending...' : 'Test Alert (SMS + Call)'}</span>
            </motion.button>
          </div>
        </div>

        {/* Full Screen Map Container */}
        <div 
          className="w-full h-full rounded-xl overflow-hidden border border-crypto-border/30 shadow-2xl relative bg-crypto-surface"
          onClick={() => {
            // Close info box when clicking on map container background
            if (mapInfoBox) {
              setMapInfoBox(null);
            }
          }}
        >
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full"
            style={{ height: "100%" }}
          />
          
          {/* Floating Zone Info Box */}
          <AnimatePresence>
            {mapInfoBox && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute z-[10001] pointer-events-auto"
                style={{
                  left: `${mapInfoBox.position.x}px`,
                  top: `${mapInfoBox.position.y}px`,
                  transform: 'translate(-50%, -100%)',
                  marginTop: '-10px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 min-w-[320px] max-w-[400px] p-4 relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setMapInfoBox(null)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors z-10"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {/* Zone Header */}
                  <div className="pr-6 mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {mapInfoBox.zone.name}
                    </h3>
                    {mapInfoBox.zone.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {mapInfoBox.zone.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Zone Type and Risk Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(mapInfoBox.zone.type || mapInfoBox.zone.zone_type)}`}>
                      {mapInfoBox.zone.type || mapInfoBox.zone.zone_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(mapInfoBox.zone.riskLevel || mapInfoBox.zone.risk_level)}`}>
                      {mapInfoBox.zone.riskLevel || mapInfoBox.zone.risk_level}
                    </span>
                  </div>
                  
                  {/* Zone Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-slate-400">Radius:</span>
                      <span className="text-white ml-2 font-medium">
                        {mapInfoBox.zone.radius || mapInfoBox.zone.radius_meters || 0}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className={`ml-2 font-medium ${
                        mapInfoBox.zone.status === 'ACTIVE' ? 'text-green-400' : 
                        mapInfoBox.zone.status === 'INACTIVE' ? 'text-red-400' : 
                        'text-yellow-400'
                      }`}>
                        {mapInfoBox.zone.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Visitors:</span>
                      <span className="text-white ml-2 font-medium">
                        {mapInfoBox.zone.activeVisitors || mapInfoBox.zone.active_visitors || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Alerts:</span>
                      <span className="text-white ml-2 font-medium">
                        {mapInfoBox.zone.alerts || mapInfoBox.zone.total_alerts || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Location Info */}
                  {(mapInfoBox.zone.state || mapInfoBox.zone.district) && (
                    <div className="text-sm text-slate-400 mb-3">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {[mapInfoBox.zone.district, mapInfoBox.zone.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                  
                  {/* Rules */}
                  {mapInfoBox.zone.rules && Array.isArray(mapInfoBox.zone.rules) && mapInfoBox.zone.rules.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1">Rules:</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {mapInfoBox.zone.rules.slice(0, 3).map((rule: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-teal-400 mr-2">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                        {mapInfoBox.zone.rules.length > 3 && (
                          <li className="text-slate-500 italic">
                            +{mapInfoBox.zone.rules.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        handleEditZone(mapInfoBox.zone);
                        setMapInfoBox(null);
                      }}
                      className="flex-1 px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-sm font-medium transition-colors"
                      type="button"
                    >
                      <Edit className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${mapInfoBox.zone.name}"?`)) {
                          handleDeleteZone(mapInfoBox.zone.id, mapInfoBox.zone.name);
                          setMapInfoBox(null);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Arrow pointing down */}
                <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-800"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Sections Below Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Zones Panel */}
        <div className="crypto-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-crypto-text-primary">
              Active Zones
            </h2>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {geofences.filter((z) => z.status === 'ACTIVE').map((zone) => (
              <div
                key={zone.id}
                className="bg-crypto-surface/30 rounded-lg p-4 border border-crypto-border/30 hover:border-crypto-accent/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm text-crypto-text-primary">
                    {zone.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedZone(zone)}
                      className="p-1 text-crypto-text-secondary hover:text-crypto-accent"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button className="p-1 text-crypto-text-secondary hover:text-crypto-accent">
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
                      zone.type
                    )}`}
                  >
                    {zone.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                      zone.riskLevel
                    )}`}
                  >
                    {zone.riskLevel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-crypto-text-secondary">
                  <div>
                    Visitors:{" "}
                    <span className="text-crypto-text-primary font-medium">
                      {zone.activeVisitors}
                    </span>
                  </div>
                  <div>
                    Alerts:{" "}
                    <span className="text-crypto-text-primary font-medium">
                      {zone.alerts}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="crypto-card p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
          <p className="text-slate-400">Loading zones from Supabase...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="crypto-card p-6 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-red-300 font-semibold">Error loading zones</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning: Zones exist but no valid location data */}
      {!loading && geofences.length === 0 && !error && (
        <div className="crypto-card p-6 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-yellow-300 font-semibold">No zones to display</p>
              <p className="text-yellow-400 text-sm">
                Zones exist in the database but are missing location data (latitude/longitude/radius or geometry).
                Check the browser console for details. Zones need center_lat, center_lng, and radius_meters for circles,
                or polygon_coordinates for polygons.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <GeoImport
            onImportSuccess={(zone) => {
              console.info('Zone imported:', zone);
              loadZones();
              setShowImportForm(false);
            }}
            onClose={() => setShowImportForm(false)}
          />
        </div>
      )}

      {/* Zone Configuration Table - Full Width Below */}
      <div className="crypto-card overflow-hidden">
        <div className="p-6 border-b border-crypto-border/30">
          <h2 className="text-xl font-semibold text-crypto-text-primary">
            Zone Configuration
          </h2>
          <p className="text-sm text-crypto-text-secondary mt-1">
            Detailed view of all zones and their configurations
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-crypto-surface/30">
              <tr className="text-left text-crypto-text-secondary text-sm">
                <th className="p-4">Zone Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Radius</th>
                <th className="p-4">Active Visitors</th>
                <th className="p-4">Alerts</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {geofences.filter((z) => z.status === 'ACTIVE').map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200"
                >
                  <td className="p-4 font-medium">{zone.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
                        zone.type
                      )}`}
                    >
                      {zone.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                        zone.riskLevel
                      )}`}
                    >
                      {zone.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{zone.radius}m</td>
                  <td className="p-4 text-sm">{zone.activeVisitors}</td>
                  <td className="p-4 text-sm">{zone.alerts}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        zone.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {zone.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditZone(zone)}
                        className="p-2 bg-teal-400 hover:bg-teal-500 rounded-lg transition-colors"
                        title="Edit Zone"
                      >
                        <Edit className="h-3 w-3 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone.id, zone.name)}
                        className="p-2 bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
                        title="Delete Zone"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected zone modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedZone.name}</h2>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Zone Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getZoneTypeColor(
                          selectedZone.type
                        )}`}
                      >
                        {selectedZone.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Risk Level:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                          selectedZone.riskLevel
                        )}`}
                      >
                        {selectedZone.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Radius:</span>
                      <span>{selectedZone.radius}m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedZone.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {selectedZone.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Visitors:(Approox)</span>
                      <span className="font-medium">
                        {selectedZone.activeVisitors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Visits:</span>
                      <span className="font-medium">
                        {selectedZone.totalVisits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Alerts Generated:</span>
                      <span className="font-medium">{selectedZone.alerts}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Notification Settings
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedZone.notifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-400 capitalize">
                          {key.replace("_", " ")}:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            value
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {value ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Zone Rules</h3>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedZone.rules.map((rule: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-slate-400 flex items-start space-x-2"
                      >
                        <span className="text-teal-400 mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleEditZone(selectedZone);
                    setSelectedZone(null); // Close details modal
                  }}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Edit Zone
                </button>
                <button
                  onClick={() => {
                    if (selectedZone) {
                      handleDeleteZone(selectedZone.id, selectedZone.name);
                      setSelectedZone(null); // Close details modal
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Geofence Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={(e) => {
            // Close modal when clicking backdrop (only if clicking the backdrop itself, not children)
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowCreateForm(false);
              if (tempCircleRef.current) {
                tempCircleRef.current.remove();
                tempCircleRef.current = null;
              }
              if (tempHandleRef.current) {
                tempHandleRef.current.remove();
                tempHandleRef.current = null;
              }
              setTempCenter(null);
            }
          }}
        >
          <div 
            className="bg-slate-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl border border-slate-700"
            onClick={(e) => {
              // Prevent clicks inside modal from closing it
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create Geofence</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  if (tempCircleRef.current) {
                    tempCircleRef.current.remove();
                    tempCircleRef.current = null;
                  }
                  if (tempHandleRef.current) {
                    tempHandleRef.current.remove();
                    tempHandleRef.current = null;
                  }
                  setTempCenter(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              Click a point on the map to set the center (preview will appear).
              Or enter coordinates manually. Drag the handle to resize the
              radius visually.
            </p>
            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400">Name *</label>
                <input
                  name="name"
                  required
                  className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                  defaultValue="New Zone"
                  placeholder="Enter zone name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                  placeholder="Enter zone description (optional)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slate-400">
                    Latitude *
                  </label>
                  <input
                    name="lat"
                    type="number"
                    step="any"
                    required
                    className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                    defaultValue={tempCenter ? tempCenter.lat : 26.5775}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">
                    Longitude *
                  </label>
                  <input
                    name="lng"
                    type="number"
                    step="any"
                    required
                    className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                    defaultValue={tempCenter ? tempCenter.lng : 93.1711}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400">
                  Radius (meters) *
                </label>
                <input
                  name="radius"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                  defaultValue={200}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Zone Type *</label>
                  <select name="type" required defaultValue="MONITORED" className="w-full bg-slate-900/40 p-2 rounded-md text-white">
                    <option value="MONITORED">MONITORED</option>
                    <option value="SAFE">SAFE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Risk Level *</label>
                  <select name="risk" required defaultValue="MEDIUM" className="w-full bg-slate-900/40 p-2 rounded-md text-white">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slate-400">State</label>
                  <input
                    name="state"
                    type="text"
                    className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                    placeholder="e.g., Assam"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">District</label>
                  <input
                    name="district"
                    type="text"
                    className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                    placeholder="e.g., Guwahati"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400">Rules (one per line)</label>
                <textarea
                  name="rules"
                  rows={3}
                  className="w-full bg-slate-900/40 p-2 rounded-md mt-1 text-white"
                  placeholder="Enter rules, one per line (optional)"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    // quick-fill lat/lng from temp center
                    if (tempCenter) {
                      const latInput = document.querySelector(
                        'input[name="lat"]'
                      ) as HTMLInputElement;
                      const lngInput = document.querySelector(
                        'input[name="lng"]'
                      ) as HTMLInputElement;
                      if (latInput && lngInput) {
                        latInput.value = String(tempCenter.lat);
                        lngInput.value = String(tempCenter.lng);
                      }
                    } else {
                      alert("Click on the map to set center first.");
                    }
                  }}
                  className="px-3 py-1 rounded-md bg-slate-700 text-white text-sm"
                >
                  Use Map Center
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    if (tempCircleRef.current) {
                      tempCircleRef.current.remove();
                      tempCircleRef.current = null;
                    }
                    if (tempHandleRef.current) {
                      tempHandleRef.current.remove();
                      tempHandleRef.current = null;
                    }
                    setTempCenter(null);
                  }}
                  className="px-4 py-2 rounded-md bg-slate-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600"
                >
                  Create Geofence
                </button>
              </div>
            </form>
            <div className="mt-3 text-xs text-slate-400">
              Tip: Click a point on the map while this modal is open to preview
              the geofence center and drag the handle to adjust radius.
            </div>
          </div>
        </div>
      )}

      {/* GeoImport Modal */}
      {showImportForm && (
        <GeoImport
          onClose={() => setShowImportForm(false)}
          onImportSuccess={() => {
            // Reload zones from Supabase after successful import
            loadZones();
            setShowImportForm(false);
          }}
        />
      )}

      {/* Edit Zone Modal */}
      {showEditForm && zoneToEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Edit Zone</h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setZoneToEdit(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Zone Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-slate-900/40 p-2 rounded-md text-white"
                  defaultValue={zoneToEdit.name}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full bg-slate-900/40 p-2 rounded-md text-white"
                  defaultValue={zoneToEdit.description || ''}
                />
              </div>
              
              {/* Only show coordinates/radius for circle zones */}
              {zoneToEdit.geometry?.type === 'Point' && zoneToEdit.coordinates && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Latitude</label>
                      <input
                        name="lat"
                        type="number"
                        step="any"
                        required
                        className="w-full bg-slate-900/40 p-2 rounded-md text-white"
                        defaultValue={zoneToEdit.coordinates.lat}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Longitude</label>
                      <input
                        name="lng"
                        type="number"
                        step="any"
                        required
                        className="w-full bg-slate-900/40 p-2 rounded-md text-white"
                        defaultValue={zoneToEdit.coordinates.lng}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Radius (meters)</label>
                    <input
                      name="radius"
                      type="number"
                      step="any"
                      min="1"
                      required
                      className="w-full bg-slate-900/40 p-2 rounded-md text-white"
                      defaultValue={zoneToEdit.radius || 0}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Zone Type</label>
                  <select name="type" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.type}>
                    <option value="SAFE">SAFE</option>
                    <option value="MONITORED">MONITORED</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Risk Level</label>
                  <select name="risk" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.riskLevel}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select name="status" className="w-full bg-slate-900/40 p-2 rounded-md text-white" required defaultValue={zoneToEdit.status}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="STANDBY">STANDBY</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setZoneToEdit(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};