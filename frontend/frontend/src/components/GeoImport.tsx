/**
 * GeoImport Component
 * 
 * Allows admins to import GeoJSON from MAPOG or other sources
 * and convert them into geofence zones in the database.
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, MapPin, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Zone } from '../lib/supabaseClient';
import * as turf from '@turf/turf';

interface GeoImportProps {
  onImportSuccess?: (zone: Zone) => void;
  onClose?: () => void;
}

interface ImportError {
  message: string;
  field?: string;
}

export const GeoImport: React.FC<GeoImportProps> = ({ onImportSuccess, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ImportError | null>(null);
  const [success, setSuccess] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const geoJson = JSON.parse(text);

      // Validate GeoJSON structure
      if (!geoJson.type || !['Feature', 'FeatureCollection', 'Point', 'Polygon', 'MultiPolygon'].includes(geoJson.type)) {
        throw new Error('Invalid GeoJSON format. Expected Feature, FeatureCollection, Point, Polygon, or MultiPolygon.');
      }

      // Normalize GeoJSON to FeatureCollection
      let features: any[] = [];
      if (geoJson.type === 'FeatureCollection') {
        features = geoJson.features || [];
      } else if (geoJson.type === 'Feature') {
        features = [geoJson];
      } else {
        // If it's a raw geometry, wrap it in a Feature
        features = [{
          type: 'Feature',
          geometry: geoJson,
          properties: {}
        }];
      }

      if (features.length === 0) {
        throw new Error('No features found in GeoJSON file.');
      }

      setImportedData({
        features,
        originalFile: file.name,
      });
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to parse GeoJSON file',
        field: 'file',
      });
    } finally {
      setLoading(false);
    }
  };

  const processImportedFeatures = async () => {
    if (!importedData) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get user if logged in (optional for testing)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      const zones = [];
      for (const feature of importedData.features) {
        const geometry = feature.geometry;
        const properties = feature.properties || {};

        // Extract zone information from properties
        // MAPOG format usually has: name, description, radius (for circles), etc.
        const zoneName = properties.name || properties.NAME || `Imported Zone ${Date.now()}`;
        const zoneType = mapZoneType(properties.zone_type || properties.type || properties.ZONE_TYPE || 'MONITORED');
        const riskLevel = mapRiskLevel(properties.risk_level || properties.risk || properties.RISK_LEVEL || 'MEDIUM');
        const radius = properties.radius || properties.RADIUS || null;
        const description = properties.description || properties.DESCRIPTION || null;

        // Prepare geometry based on type
        let geometryJson: any;

        if (geometry.type === 'Point') {
          // Point with radius = circle zone
          if (!radius) {
            throw new Error(`Point feature "${zoneName}" is missing radius property. Please add radius in MAPOG properties.`);
          }
          geometryJson = {
            type: 'Point',
            coordinates: geometry.coordinates,
            properties: { radius: parseFloat(radius) },
          };
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
          // Polygon = polygon zone
          geometryJson = geometry;
        } else {
          console.warn(`Skipping unsupported geometry type: ${geometry.type}`);
          continue;
        }

        // Extract rules from properties if available
        const rules: string[] = [];
        if (properties.rules) {
          rules.push(...(Array.isArray(properties.rules) ? properties.rules : [properties.rules]));
        }

        // Create zone in database
        const { data: zone, error: insertError } = await supabase
          .from('zones')
          .insert({
            name: zoneName,
            description,
            zone_type: zoneType,
            risk_level: riskLevel,
            geometry: geometryJson,
            status: 'ACTIVE',
            notifications: {
              entry: properties.notify_entry !== false,
              exit: properties.notify_exit !== false,
              extended_stay: properties.notify_extended === true,
            },
            rules,
            region: 'Northeast India',
            state: properties.state || properties.STATE || null,
            district: properties.district || properties.DISTRICT || null,
            created_by: userId, // null if not logged in (for testing)
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create zone "${zoneName}": ${insertError.message}`);
        }

        zones.push(zone);
      }

      setSuccess(true);
      if (zones.length > 0 && onImportSuccess) {
        onImportSuccess(zones[0]); // Call callback with first zone
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setImportedData(null);
        setSuccess(false);
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to import zones',
      });
    } finally {
      setLoading(false);
    }
  };

  const mapZoneType = (type: string): Zone['zone_type'] => {
    const upper = type.toUpperCase();
    if (['SAFE', 'MONITORED', 'RESTRICTED', 'EMERGENCY'].includes(upper)) {
      return upper as Zone['zone_type'];
    }
    return 'MONITORED';
  };

  const mapRiskLevel = (level: string): Zone['risk_level'] => {
    const upper = level.toUpperCase();
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(upper)) {
      return upper as Zone['risk_level'];
    }
    return 'MEDIUM';
  };

  if (!isOpen && !onClose) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="crypto-btn flex items-center space-x-2"
      >
        <Upload className="h-4 w-4" />
        <span>Import from MAPOG</span>
      </button>
    );
  }

  const modalContent = (
    <div className="bg-slate-800 rounded-xl w-full max-w-2xl p-6 relative z-[10001] shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white flex items-center space-x-2">
          <MapPin className="h-6 w-6" />
          <span>Import GeoJSON from MAPOG</span>
        </h3>
        {(onClose || isOpen) && (
          <button
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-white mb-2">How to export from MAPOG:</h4>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
          <li>Draw your polygon or place a point on MAPOG</li>
          <li>For circle zones: Add <code className="bg-slate-800 px-1 rounded">radius</code> property to the point</li>
          <li>Click "Export" → Choose "GeoJSON" format</li>
          <li>Download the file and upload it here</li>
        </ol>
        <div className="mt-3 text-xs text-slate-400">
          <strong>Optional properties:</strong> name, description, zone_type, risk_level, state, district, rules (array)
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Upload GeoJSON File
        </label>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.geojson"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-400">
            GeoJSON files only (.json, .geojson)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white"
            disabled={loading}
          >
            Select File
          </button>
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {importedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/50 rounded-lg p-4 mb-6"
          >
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Preview: {importedData.features.length} feature(s) found</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              {importedData.features.map((feature: any, idx: number) => (
                <div key={idx} className="p-2 bg-slate-800/50 rounded">
                  <div>
                    <strong>Feature {idx + 1}:</strong> {feature.properties?.name || feature.properties?.NAME || 'Unnamed'}
                  </div>
                  <div className="text-slate-400">
                    Type: {feature.geometry.type}
                    {feature.geometry.type === 'Point' && feature.properties?.radius && (
                      <> • Radius: {feature.properties.radius}m</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-300 text-sm">{error.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="text-green-300 text-sm">
              Successfully imported {importedData?.features.length} zone(s)!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsOpen(false);
            setImportedData(null);
            setError(null);
            if (onClose) onClose();
          }}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={processImportedFeatures}
          disabled={!importedData || loading}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Importing...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Import Zones</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {modalContent}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="crypto-btn flex items-center space-x-2"
      >
        <Upload className="h-4 w-4" />
        <span>Import from MAPOG</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {modalContent}
        </div>
      )}
    </>
  );
};

export default GeoImport;

