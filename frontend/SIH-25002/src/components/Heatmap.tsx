// import React, { useState } from 'react';
// import { MapPin, Layers, Clock, Users, TrendingUp } from 'lucide-react';
// import { motion } from 'framer-motion';

// export const Heatmap: React.FC = () => {
//   const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
//   const [showIoTTourists, setShowIoTTourists] = useState(true);

//   const zones = [
//     { name: 'Marina Beach', riskScore: 8.5, touristCount: 342, coordinates: 'top-20 left-32' },
//     { name: 'Fort Kochi', riskScore: 6.2, touristCount: 156, coordinates: 'top-32 right-40' },
//     { name: 'Gateway of India', riskScore: 9.1, touristCount: 428, coordinates: 'bottom-32 left-40' },
//     { name: 'India Gate', riskScore: 4.8, touristCount: 89, coordinates: 'top-40 left-20' },
//     { name: 'Mysore Palace', riskScore: 3.2, touristCount: 67, coordinates: 'bottom-20 right-32' }
//   ];

//   const getRiskColor = (score: number) => {
//     if (score >= 8) return 'bg-red-500';
//     if (score >= 6) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const getRiskLevel = (score: number) => {
//     if (score >= 8) return 'High';
//     if (score >= 6) return 'Medium';
//     return 'Low';
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
//         <h1 className="text-3xl font-bold text-white font-medium" style={{ color: '#ffffff' }}>Risk Heatmap & High-Risk Zones</h1>
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2">
//             <Clock className="h-4 w-4 text-gray-400" />
//             <select
//               value={selectedTimeRange}
//               onChange={(e) => setSelectedTimeRange(e.target.value)}
//               className="crypto-input px-3 py-1 text-sm rounded-lg"
//             >
//               <option value="1h">Last Hour</option>
//               <option value="6h">Last 6 Hours</option>
//               <option value="24h">Last 24 Hours</option>
//               <option value="7d">Last 7 Days</option>
//             </select>
//           </div>
//           <button
//             onClick={() => setShowIoTTourists(!showIoTTourists)}
//             className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
//               showIoTTourists ? 'crypto-btn' : 'glass'
//             }`}
//           >
//             <Layers className="h-4 w-4" />
//             <span>IoT Tourists</span>
//           </button>
//         </div>
//       </motion.div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Full-Screen Heatmap */}
//         <motion.div 
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.4, duration: 0.6 }}
//           className="lg:col-span-3 crypto-card overflow-hidden"
//         >
//           <div className="p-4 border-b border-crypto-border/30">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl font-semibold text-crypto-text-primary">Interactive Risk Heatmap</h2>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2 text-sm text-crypto-text-secondary">
//                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                   <span>Low (0-5)</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-sm text-crypto-text-secondary">
//                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                   <span>Medium (5-8)</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-sm text-crypto-text-secondary">
//                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                   <span>High (8+)</span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 h-96 overflow-hidden">
//             {/* Map Background */}
//             <div className="absolute inset-0 opacity-20">
//               <div className="w-full h-full bg-gradient-to-br from-crypto-accent/30 via-green-900/20 to-emerald-900/30"></div>
//             </div>
            
//             {/* Risk Zone Indicators */}
//             {zones.map((zone, index) => (
//               <div
//                 key={index}
//                 className={`absolute ${zone.coordinates} transform -translate-x-1/2 -translate-y-1/2`}
//               >
//                 <div className={`w-6 h-6 rounded-full ${getRiskColor(zone.riskScore)} animate-pulse opacity-80`}></div>
//                 <div className={`absolute inset-0 w-12 h-12 rounded-full ${getRiskColor(zone.riskScore)} opacity-20 animate-ping`}></div>
//                 <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 rounded px-2 py-1 text-xs whitespace-nowrap">
//                   {zone.name}
//                 </div>
//               </div>
//             ))}

//             {/* Tourist Markers (if IoT enabled) */}
//             {showIoTTourists && (
//               <>
//                 <div className="absolute top-16 left-24 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//                 <div className="absolute top-28 right-28 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//                 <div className="absolute bottom-24 left-36 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//                 <div className="absolute bottom-16 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
//               </>
//             )}

//             {/* Center Info */}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="bg-crypto-surface/90 rounded-lg p-6 text-center">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: 360 }}
//                   transition={{ duration: 0.6 }}
//                 >
//                   <MapPin className="h-12 w-12 text-crypto-accent mx-auto mb-4" />
//                 </motion.div>
//                 <p className="text-lg font-semibold mb-2 text-crypto-text-primary">Real-Time Risk Analysis</p>
//                 <p className="text-crypto-text-secondary text-sm">Interactive heatmap with cluster analysis</p>
//                 <p className="text-crypto-text-muted text-xs mt-2">Zoom and pan to explore zones</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Zone List Sidebar */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.6, duration: 0.6 }}
//           className="crypto-card"
//         >
//           <div className="p-4 border-b border-crypto-border/30">
//             <h3 className="text-lg font-semibold text-crypto-text-primary">Risk Zones</h3>
//           </div>
//           <div className="p-4 space-y-4">
//             {zones.map((zone, index) => (
//               <motion.div 
//                 key={index} 
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.8 + index * 0.1 }}
//                 className="bg-crypto-surface/30 rounded-lg p-4 hover:bg-crypto-surface/50 transition-all duration-200"
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="font-medium text-crypto-text-primary">{zone.name}</h4>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     zone.riskScore >= 8 ? 'bg-red-600/20 text-red-400' :
//                     zone.riskScore >= 6 ? 'bg-yellow-600/20 text-yellow-400' :
//                     'bg-green-600/20 text-green-400'
//                   }`}>
//                     {getRiskLevel(zone.riskScore)}
//                   </span>
//                 </div>
//                 <div className="space-y-2 text-sm text-crypto-text-secondary">
//                   <div className="flex items-center justify-between">
//                     <span>Risk Score:</span>
//                     <span className="font-medium text-crypto-text-primary">{zone.riskScore}/10</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Tourists:</span>
//                     <div className="flex items-center space-x-1">
//                       <Users className="h-3 w-3" />
//                       <span className="font-medium text-crypto-text-primary">{zone.touristCount}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <div className="w-full bg-crypto-border/30 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         zone.riskScore >= 8 ? 'bg-red-500' :
//                         zone.riskScore >= 6 ? 'bg-yellow-500' :
//                         'bg-green-500'
//                       }`}
//                       style={{ width: `${(zone.riskScore / 10) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//     </motion.div>
//   );
// };





import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { motion } from 'framer-motion';

const Heatmap: React.FC = () => {
  const [geojsonLoaded, setGeojsonLoaded] = useState(false);
  const [useEmbed, setUseEmbed] = useState(false); // if true we'll show MapOG embed iframe
   const [fullScreen, setFullScreen] = useState(false);

     useEffect(() => {
    if (fullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullScreen]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletHeatRef = useRef<any>(null);

  // NOTE: copy the sandbox file /mnt/data/eastern_states_mapbox.geojson into your React public/ folder
  // path inside app should be: public/eastern_states_mapbox.geojson
  const GEOJSON_PUBLIC_URL = '/eastern_states_mapbox.geojson'; // ensure file is in public/

  useEffect(() => {
    if (useEmbed) return; // don't init leaflet when showing embed

    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const map = L.map(containerRef.current, {
      center: [23.5, 85.0],
      zoom: 5,
      preferCanvas: true
    });
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetch(GEOJSON_PUBLIC_URL)
      .then(res => {
        if (!res.ok) throw new Error('GeoJSON not found: ' + res.status);
        return res.json();
      })
      .then((data: GeoJSON.FeatureCollection) => {
        const heatPoints: [number, number, number][] = data.features.map((f: any) => {
          const [lon, lat] = f.geometry.coordinates;
          const intensity = Number(f.properties?.intensity ?? 1);
          return [lat, lon, intensity];
        });

        leafletHeatRef.current = (L as any).heatLayer(heatPoints, { radius: 25, blur: 18 }).addTo(map);

        data.features.forEach((f: any) => {
          const [lon, lat] = f.geometry.coordinates;
          L.circle([lat, lon], { radius: 30000, color: '#ff6f00', fillOpacity: 0.12 })
            .addTo(map)
            .bindPopup(`${f.properties?.place ?? 'Place'} — intensity: ${f.properties?.intensity ?? ''}`);
        });

        const coords = data.features.map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);
        if (coords.length) {
          const bounds = L.latLngBounds(coords as any);
          map.fitBounds(bounds, { maxZoom: 8 });
        }

        setGeojsonLoaded(true);
      })
      .catch(err => {
        console.error('GeoJSON fetch error:', err);
      });

    return () => {
      map.remove();
      leafletMapRef.current = null;
      leafletHeatRef.current = null;
    };
  }, [useEmbed]);

  // simple UI: toggle between embed and leaflet heatmap
  return (
    <motion.div 
      className="relative w-full" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      style={{ height: 'calc(100vh - 100px)' }}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <button
          onClick={() => setUseEmbed(prev => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition-colors"
        >
          {useEmbed ? 'Use Leaflet Heatmap' : 'Use MapOG Embed'}
        </button>
      </div>

      <div className="relative w-full h-full bg-black">
        {useEmbed ? (
          // Replace the src below with your MapOG embed URL (from app.mapog.com -> Share/Embed)
          <iframe
            title="MapOG embed"
            src="https://story.mapog.com/public/heatmap/MTkxNTYy"
            style={{ width: '100%', height: '100%', border: 0 }}
            allowFullScreen
          />
        ) : (
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </motion.div>
  );
};

export default Heatmap;