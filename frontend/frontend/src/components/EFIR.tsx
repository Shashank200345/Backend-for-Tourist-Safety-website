import React, { useEffect, useState } from 'react';
import { FileText, Calendar, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';

export const EFIR: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<{ firs: number; complaints: number; lastUpdate: string | null }>({
    firs: 0,
    complaints: 0,
    lastUpdate: null,
  });

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateIIF1Pdf = (data: any) => {
  const doc = new jsPDF();
  const left = 14;
  let y = 16;
  const label = (t: string, lx: number = left, ly: number = 0, options?: any) =>
    doc.text(t, lx, ly, options as any);

  doc.setFontSize(12).setFont('helvetica', 'bold');
  label('FIRST INFORMATION REPORT', 105, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9).setFont('helvetica', 'normal');
  label('(Under Section 154 Cr.P.C.)', 105, y, { align: 'center' });
  y += 10;

  label(`1. District: ${data.district_name || data.district_id || ''}`, left, y);
  label(`P.S.: ${data.police_station_name || data.police_station_id || ''}`, 105, y);
  label(`Year: ${data.year || ''}`, 170, y);
  y += 6;
  label(`FIR No.: ${data.fir_number || ''}`, left, y);
  label(`Date: ${data.fir_date || ''}`, 105, y);
  y += 10;

  label('2.', left - 4, y);
  label(`(i) Act: ${data.act1 || ''} Sections: ${data.act1_sections || ''}`, left + 4, y);
  y += 6;
  label(`(ii) Act: ${data.act2 || ''} Sections: ${data.act2_sections || ''}`, left + 4, y);
  y += 6;
  label(`(iii) Act: ${data.act3 || ''} Sections: ${data.act3_sections || ''}`, left + 4, y);
  y += 6;
  label(`(iv) Other Acts & Sections: ${data.other_acts_sections || ''}`, left + 4, y);
  y += 10;

  label('3. Occurrence of offence:', left, y); y += 6;
  label(`Day: ${data.occurrence_day || ''}   Date from: ${data.occurrence_date_from || ''}   Date to: ${data.occurrence_date_to || ''}`, left + 4, y); y += 6;
  label(`Time from: ${data.occurrence_time_from || ''}   Time to: ${data.occurrence_time_to || ''}`, left + 4, y); y += 6;
  label(`Information received at P.S.: ${data.info_received_datetime || ''}`, left + 4, y); y += 6;
  label(`General Diary Reference: Entry No.: ${data.gd_entry_no || ''}  Time: ${data.info_received_datetime || ''}`, left + 4, y); y += 10;

  label(`4. Type of Information: ${data.type_of_info || ''}`, left, y); y += 10;

  label('5. Place of Occurrence:', left, y); y += 6;
  label(`Distance & direction from P.S.: ${data.place_distance_direction || ''}  Beat No.: ${data.place_beat_no || ''}`, left + 4, y); y += 6;
  label(`Address: ${data.place_address || ''}`, left + 4, y); y += 6;
  label(`Outside this P.S.: Name of P.S.: ${data.outside_ps_name || ''}  District: ${data.outside_ps_district || ''}`, left + 4, y); y += 10;

  label('6. Complainant / Informant:', left, y); y += 6;
  label(`Name: ${data.complainant_name || ''}`, left + 4, y); y += 6;
  label(`Father’s/Husband’s Name: ${data.complainant_father_spouse || ''}`, left + 4, y); y += 6;
  label(`Date/Year of Birth: ${data.complainant_dob || ''}   Nationality: ${data.complainant_nationality || ''}`, left + 4, y); y += 6;
  label(`Passport No.: ${data.complainant_passport_no || ''}  Date of Issue: ${data.complainant_passport_issue_date || ''}  Place of Issue: ${data.complainant_passport_issue_place || ''}`, left + 4, y); y += 6;
  label(`Occupation: ${data.complainant_occupation || ''}`, left + 4, y); y += 6;
  label(`Address: ${data.complainant_address || ''}`, left + 4, y); y += 10;

  label('7. Details of known/suspected/unknown accused (full particulars):', left, y); y += 6;
  doc.text(data.accused_details || '', left + 4, y, { maxWidth: 180 }); y += 10;

  label('8. Reasons for delay in reporting:', left, y); y += 6;
  doc.text(data.delay_reason || '', left + 4, y, { maxWidth: 180 }); y += 10;

  label('9. Particulars of properties stolen:', left, y); y += 6;
  doc.text(data.stolen_property_details || '', left + 4, y, { maxWidth: 180 }); y += 10;

  label(`10. Total value of property stolen: ${data.total_value_stolen || ''}`, left, y); y += 6;
  label(`11. Inquest Report / U.D. case No., if any: ${data.inquest_report_no || ''}`, left, y); y += 6;
  label('12. First Information contents:', left, y); y += 6;
  doc.text(data.first_information_contents || '', left + 4, y, { maxWidth: 180 });

  doc.save(`FIR-${data.fir_number || 'EFIR'}.pdf`);
};
  
  const [formData, setFormData] = useState({
    districtId: '',
    policeStationId: '',
    firNumber: '',
    year: '',
    firDate: '',
    act1: '',
    act1Sections: '',
    act2: '',
    act2Sections: '',
    act3: '',
    act3Sections: '',
    otherActsSections: '',
    occurrenceDay: '',
    occurrenceDateFrom: '',
    occurrenceDateTo: '',
    occurrenceTimeFrom: '',
    occurrenceTimeTo: '',
    infoReceivedDatetime: '',
    gdEntryNo: '',
    typeOfInfo: 'written',
    placeDistanceDirection: '',
    placeBeatNo: '',
    placeAddress: '',
    outsidePsName: '',
    outsidePsDistrict: '',
    complainantName: '',
    complainantFatherSpouse: '',
    complainantDob: '',
    complainantNationality: '',
    complainantPassportNo: '',
    complainantPassportIssueDate: '',
    complainantPassportIssuePlace: '',
    complainantOccupation: '',
    complainantAddress: '',
    accusedDetails: '',
    delayReason: '',
    stolenPropertyDetails: '',
    totalValueStolen: '',
    inquestReportNo: '',
    firstInformationContents: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const safeDistrictId =
        formData.districtId && uuidRegex.test(formData.districtId.trim())
          ? formData.districtId.trim()
          : null;
      const safePsId =
        formData.policeStationId && uuidRegex.test(formData.policeStationId.trim())
          ? formData.policeStationId.trim()
          : null;

      const { error: insertError } = await supabase.from('efir_forms').insert({
        district_id: safeDistrictId,
        police_station_id: safePsId,
        fir_number: formData.firNumber || null,
        year: formData.year ? Number(formData.year) : null,
        fir_date: formData.firDate || null,
        act1: formData.act1 || null,
        act1_sections: formData.act1Sections || null,
        act2: formData.act2 || null,
        act2_sections: formData.act2Sections || null,
        act3: formData.act3 || null,
        act3_sections: formData.act3Sections || null,
        other_acts_sections: formData.otherActsSections || null,
        occurrence_day: formData.occurrenceDay || null,
        occurrence_date_from: formData.occurrenceDateFrom || null,
        occurrence_date_to: formData.occurrenceDateTo || null,
        occurrence_time_from: formData.occurrenceTimeFrom || null,
        occurrence_time_to: formData.occurrenceTimeTo || null,
        info_received_datetime: formData.infoReceivedDatetime || null,
        gd_entry_no: formData.gdEntryNo || null,
        type_of_info: formData.typeOfInfo || null,
        place_distance_direction: formData.placeDistanceDirection || null,
        place_beat_no: formData.placeBeatNo || null,
        place_address: formData.placeAddress || null,
        outside_ps_name: formData.outsidePsName || null,
        outside_ps_district: formData.outsidePsDistrict || null,
        complainant_name: formData.complainantName || null,
        complainant_father_spouse: formData.complainantFatherSpouse || null,
        complainant_dob: formData.complainantDob || null,
        complainant_nationality: formData.complainantNationality || null,
        complainant_passport_no: formData.complainantPassportNo || null,
        complainant_passport_issue_date: formData.complainantPassportIssueDate || null,
        complainant_passport_issue_place: formData.complainantPassportIssuePlace || null,
        complainant_occupation: formData.complainantOccupation || null,
        complainant_address: formData.complainantAddress || null,
        accused_details: formData.accusedDetails || null,
        delay_reason: formData.delayReason || null,
        stolen_property_details: formData.stolenPropertyDetails || null,
        total_value_stolen: formData.totalValueStolen ? Number(formData.totalValueStolen) : null,
        inquest_report_no: formData.inquestReportNo || null,
        first_information_contents: formData.firstInformationContents || null,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess('E-FIR saved successfully to Supabase.');
      setShowForm(false);
      setFormData({
        districtId: '',
        policeStationId: '',
        firNumber: '',
        year: '',
        firDate: '',
        act1: '',
        act1Sections: '',
        act2: '',
        act2Sections: '',
        act3: '',
        act3Sections: '',
        otherActsSections: '',
        occurrenceDay: '',
        occurrenceDateFrom: '',
        occurrenceDateTo: '',
        occurrenceTimeFrom: '',
        occurrenceTimeTo: '',
        infoReceivedDatetime: '',
        gdEntryNo: '',
        typeOfInfo: 'written',
        placeDistanceDirection: '',
        placeBeatNo: '',
        placeAddress: '',
        outsidePsName: '',
        outsidePsDistrict: '',
        complainantName: '',
        complainantFatherSpouse: '',
        complainantDob: '',
        complainantNationality: '',
        complainantPassportNo: '',
        complainantPassportIssueDate: '',
        complainantPassportIssuePlace: '',
        complainantOccupation: '',
        complainantAddress: '',
        accusedDetails: '',
        delayReason: '',
        stolenPropertyDetails: '',
        totalValueStolen: '',
        inquestReportNo: '',
        firstInformationContents: '',
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('❌ Error saving EFIR:', err);
      let errorMessage = err.message || 'Failed to save E-FIR. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Realtime counts from Supabase
  useEffect(() => {
    const fetchCounts = async () => {
      const [{ count: firCount }, { count: compCount }] = await Promise.all([
        supabase.from('firs').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        firs: firCount || 0,
        complaints: compCount || 0,
        lastUpdate: new Date().toISOString(),
      });
    };

    fetchCounts();

    const channel = supabase
      .channel('efir-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'firs' }, fetchCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      {/* CCTNS CAS Replica v1.0 - Schema & Realtime Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="crypto-card"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-crypto-text-primary">CCTNS CAS Replica v1.0</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-crypto-surface text-crypto-text-secondary border border-crypto-border">
              Complaint → FIR → Investigation → Court
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-crypto-text-secondary">
            <div>
              <p className="font-semibold text-crypto-text-primary">Master data</p>
              <ul className="list-disc list-inside space-y-1">
                <li>states → districts → police_stations → ps_staff</li>
                <li>crime_heads, acts → sections</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-crypto-text-primary">Complaint & FIR</p>
              <ul className="list-disc list-inside space-y-1">
                <li>complaints (type/status, PS link)</li>
                <li>firs (IIF-1, unique fir_number+ps+year)</li>
                <li>fir_acts_sections (acts/sections, primary)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-crypto-text-primary">Investigation</p>
              <ul className="list-disc list-inside space-y-1">
                <li>investigations (1:1 FIR, officer, status)</li>
                <li>victims, accused, witnesses, properties, evidences</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-crypto-text-primary">Court / Prosecution</p>
              <ul className="list-disc list-inside space-y-1">
                <li>court_cases (per FIR, case_number)</li>
                <li>summons (accused/witness), bails (accused)</li>
              </ul>
            </div>
          </div>

          {/* Realtime counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-crypto-surface/60 border border-crypto-border">
              <p className="text-xs text-crypto-text-secondary">Complaints (live)</p>
              <p className="text-xl font-semibold text-crypto-text-primary">{stats.complaints}</p>
            </div>
            <div className="p-3 rounded-lg bg-crypto-surface/60 border border-crypto-border">
              <p className="text-xs text-crypto-text-secondary">FIRs (live)</p>
              <p className="text-xl font-semibold text-crypto-text-primary">{stats.firs}</p>
            </div>
            <div className="p-3 rounded-lg bg-crypto-surface/60 border border-crypto-border">
              <p className="text-xs text-crypto-text-secondary">Last update</p>
              <p className="text-sm text-crypto-text-primary">
                {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>

          {/* Sample queries */}
          <div className="bg-crypto-surface/60 border border-crypto-border rounded-lg p-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-crypto-text-primary mb-1">Get all FIRs for a police station in 2025</p>
              <code className="block text-xs whitespace-pre-wrap text-crypto-text-secondary">
{`SELECT f.*
FROM firs f
JOIN police_stations ps ON ps.id = f.police_station_id
WHERE f.year = 2025
  AND ps.name ILIKE '%<station name>%';`}
              </code>
            </div>
            <div>
              <p className="font-semibold text-crypto-text-primary mb-1">Full investigation details for FIR XYZ</p>
              <code className="block text-xs whitespace-pre-wrap text-crypto-text-secondary">
{`WITH target_fir AS (
  SELECT id FROM firs WHERE fir_number = 'XYZ' AND year = 2025
)
SELECT f.fir_number, f.year, i.status AS investigation_status,
       vo.name AS investigating_officer,
       v.name AS victim_name, a.name AS accused_name,
       w.name AS witness_name, p.type AS property_type,
       e.type AS evidence_type, cc.court_name, cc.case_number,
       s.status AS summons_status, b.amount AS bail_amount
FROM target_fir tf
JOIN firs f ON f.id = tf.id
LEFT JOIN investigations i ON i.fir_id = f.id
LEFT JOIN ps_staff vo ON vo.id = i.investigating_officer_id
LEFT JOIN victims v ON v.investigation_id = i.id
LEFT JOIN accused a ON a.investigation_id = i.id
LEFT JOIN witnesses w ON w.investigation_id = i.id
LEFT JOIN properties p ON p.investigation_id = i.id
LEFT JOIN evidences e ON e.investigation_id = i.id
LEFT JOIN court_cases cc ON cc.fir_id = f.id
LEFT JOIN summons s ON s.court_case_id = cc.id
LEFT JOIN bails b ON b.court_case_id = cc.id;`}
              </code>
            </div>
          </div>

          <p className="text-xs text-crypto-text-secondary">
            Supabase schema is normalized, indexed, FK-constrained, and labeled “CCTNS CAS Replica v1.0” to mirror the official CAS PDF.
          </p>
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
            {/* FIR Identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  District (UUID from master data)
                </label>
                <input
                  type="text"
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Police Station (UUID from master data)
                </label>
                <input
                  type="text"
                  value={formData.policeStationId}
                  onChange={(e) => setFormData({ ...formData, policeStationId: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">FIR Number</label>
                <input
                  type="text"
                  value={formData.firNumber}
                  onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="FIR-001"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="2025"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">FIR Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-crypto-text-secondary" />
                  <input
                    type="date"
                    value={formData.firDate}
                    onChange={(e) => setFormData({ ...formData, firDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* Acts & Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Act (i)</label>
                <input
                  type="text"
                  value={formData.act1}
                  onChange={(e) => setFormData({ ...formData, act1: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="IPC"
                  disabled={isGenerating}
                />
                <input
                  type="text"
                  value={formData.act1Sections}
                  onChange={(e) => setFormData({ ...formData, act1Sections: e.target.value })}
                  className="w-full mt-2 px-4 py-2 crypto-input"
                  placeholder="Sections e.g. 420, 468"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Act (ii)</label>
                <input
                  type="text"
                  value={formData.act2}
                  onChange={(e) => setFormData({ ...formData, act2: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="Special Act"
                  disabled={isGenerating}
                />
                <input
                  type="text"
                  value={formData.act2Sections}
                  onChange={(e) => setFormData({ ...formData, act2Sections: e.target.value })}
                  className="w-full mt-2 px-4 py-2 crypto-input"
                  placeholder="Sections"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Act (iii)</label>
                <input
                  type="text"
                  value={formData.act3}
                  onChange={(e) => setFormData({ ...formData, act3: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="Other Act"
                  disabled={isGenerating}
                />
                <input
                  type="text"
                  value={formData.act3Sections}
                  onChange={(e) => setFormData({ ...formData, act3Sections: e.target.value })}
                  className="w-full mt-2 px-4 py-2 crypto-input"
                  placeholder="Sections"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Other Acts & Sections</label>
                <textarea
                  value={formData.otherActsSections}
                  onChange={(e) => setFormData({ ...formData, otherActsSections: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  placeholder="Any additional acts/sections"
                  disabled={isGenerating}
                ></textarea>
              </div>
            </div>

            {/* Occurrence & GD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Occurrence Day</label>
                <input
                  type="text"
                  value={formData.occurrenceDay}
                  onChange={(e) => setFormData({ ...formData, occurrenceDay: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="Monday / Tuesday ..."
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Date from / to</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.occurrenceDateFrom}
                    onChange={(e) => setFormData({ ...formData, occurrenceDateFrom: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                  <input
                    type="date"
                    value={formData.occurrenceDateTo}
                    onChange={(e) => setFormData({ ...formData, occurrenceDateTo: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Time from / to</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={formData.occurrenceTimeFrom}
                    onChange={(e) => setFormData({ ...formData, occurrenceTimeFrom: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                  <input
                    type="time"
                    value={formData.occurrenceTimeTo}
                    onChange={(e) => setFormData({ ...formData, occurrenceTimeTo: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Information received at P.S.</label>
                <input
                  type="datetime-local"
                  value={formData.infoReceivedDatetime}
                  onChange={(e) => setFormData({ ...formData, infoReceivedDatetime: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
                <input
                  type="text"
                  value={formData.gdEntryNo}
                  onChange={(e) => setFormData({ ...formData, gdEntryNo: e.target.value })}
                  className="w-full mt-2 px-4 py-2 crypto-input"
                  placeholder="G.D. Entry No."
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* Type of information */}
            <div>
              <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Type of Information</label>
              <select
                value={formData.typeOfInfo}
                onChange={(e) => setFormData({ ...formData, typeOfInfo: e.target.value })}
                className="w-full px-4 py-2 crypto-input"
                disabled={isGenerating}
              >
                <option value="written">Written</option>
                <option value="oral">Oral</option>
              </select>
            </div>

            {/* Place of occurrence */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Distance & direction from P.S.
                </label>
                <input
                  type="text"
                  value={formData.placeDistanceDirection}
                  onChange={(e) => setFormData({ ...formData, placeDistanceDirection: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="e.g. 2 km North-East"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Beat No.</label>
                <input
                  type="text"
                  value={formData.placeBeatNo}
                  onChange={(e) => setFormData({ ...formData, placeBeatNo: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  placeholder="Beat number"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Address</label>
                <textarea
                  value={formData.placeAddress}
                  onChange={(e) => setFormData({ ...formData, placeAddress: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  placeholder="Full address of occurrence"
                  disabled={isGenerating}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  If outside this Police Station
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.outsidePsName}
                    onChange={(e) => setFormData({ ...formData, outsidePsName: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    placeholder="Name of P.S."
                    disabled={isGenerating}
                  />
                  <input
                    type="text"
                    value={formData.outsidePsDistrict}
                    onChange={(e) => setFormData({ ...formData, outsidePsDistrict: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    placeholder="District"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* Complainant / Informant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Complainant Name</label>
                <input
                  type="text"
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Father’s/Husband’s Name
                </label>
                <input
                  type="text"
                  value={formData.complainantFatherSpouse}
                  onChange={(e) => setFormData({ ...formData, complainantFatherSpouse: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Date/Year of Birth</label>
                <input
                  type="date"
                  value={formData.complainantDob}
                  onChange={(e) => setFormData({ ...formData, complainantDob: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Nationality</label>
                <input
                  type="text"
                  value={formData.complainantNationality}
                  onChange={(e) => setFormData({ ...formData, complainantNationality: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Passport No.</label>
                <input
                  type="text"
                  value={formData.complainantPassportNo}
                  onChange={(e) => setFormData({ ...formData, complainantPassportNo: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Passport Issue Date</label>
                  <input
                    type="date"
                    value={formData.complainantPassportIssueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, complainantPassportIssueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Place of Issue</label>
                  <input
                    type="text"
                    value={formData.complainantPassportIssuePlace}
                    onChange={(e) =>
                      setFormData({ ...formData, complainantPassportIssuePlace: e.target.value })
                    }
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Occupation</label>
                <input
                  type="text"
                  value={formData.complainantOccupation}
                  onChange={(e) => setFormData({ ...formData, complainantOccupation: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">Address</label>
                <textarea
                  value={formData.complainantAddress}
                  onChange={(e) => setFormData({ ...formData, complainantAddress: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  disabled={isGenerating}
                ></textarea>
              </div>
            </div>

            {/* Accused details */}
            <div>
              <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                Details of known/suspected/unknown accused (full particulars)
              </label>
              <textarea
                value={formData.accusedDetails}
                onChange={(e) => setFormData({ ...formData, accusedDetails: e.target.value })}
                className="w-full px-4 py-2 crypto-input"
                rows={4}
                placeholder="Add details or attach separate sheet"
                disabled={isGenerating}
              ></textarea>
            </div>

            {/* Delay / property / inquest / contents */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Reasons for delay in reporting
                </label>
                <textarea
                  value={formData.delayReason}
                  onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  disabled={isGenerating}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  Particulars of properties stolen
                </label>
                <textarea
                  value={formData.stolenPropertyDetails}
                  onChange={(e) => setFormData({ ...formData, stolenPropertyDetails: e.target.value })}
                  className="w-full px-4 py-2 crypto-input"
                  rows={3}
                  disabled={isGenerating}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Total value of property stolen
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalValueStolen}
                    onChange={(e) => setFormData({ ...formData, totalValueStolen: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                    Inquest Report / U.D. case No., if any
                  </label>
                  <input
                    type="text"
                    value={formData.inquestReportNo}
                    onChange={(e) => setFormData({ ...formData, inquestReportNo: e.target.value })}
                    className="w-full px-4 py-2 crypto-input"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-crypto-text-secondary mb-2">
                  First Information contents (attach separate sheet if required)
                </label>
                <textarea
                  value={formData.firstInformationContents}
                  onChange={(e) =>
                    setFormData({ ...formData, firstInformationContents: e.target.value })
                  }
                  className="w-full px-4 py-2 crypto-input"
                  rows={5}
                  disabled={isGenerating}
                ></textarea>
              </div>
            </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 flex-wrap">
                <motion.button
                  type="button"
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  onClick={() => setShowForm(false)}
                  disabled={isGenerating}
                  className="flex-1 min-w-[140px] glass py-3 px-4 rounded-lg font-medium text-crypto-text-primary hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isGenerating}
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                  className="flex-1 min-w-[180px] crypto-btn py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Save to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      <span>Save to Supabase</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateIIF1Pdf(formData)}
                  className="flex-1 min-w-[180px] bg-crypto-surface border border-crypto-border py-3 px-4 rounded-lg font-medium text-crypto-text-primary hover:text-white transition-all duration-200"
                  disabled={isGenerating}
                >
                  Download FIR PDF
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
