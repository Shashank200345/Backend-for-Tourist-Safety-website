import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

export const generateEFIR = async (req: Request, res: Response) => {
  try {
    const { touristId, incidentType, location, description, dateTime, witnesses, evidence } = req.body;

    // Validate required fields
    if (!touristId || !incidentType || !location || !description || !dateTime) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide: touristId, incidentType, location, description, and dateTime.' 
      });
    }

    // Generate FIR number and metadata
    const currentYear = new Date().getFullYear();
    const firNo = `FIR-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gdEntryNo = `GD-${Math.floor(100 + Math.random() * 900)}`;
    
    // Extract location details
    const locationParts = location.split(',').map((part: string) => part.trim());
    const city = locationParts[0] || 'Unknown';
    const district = locationParts[1] || locationParts[0] || 'Unknown';
    const state = locationParts[2] || locationParts[1] || 'Unknown';

    // Format date and time
    const incidentDate = new Date(dateTime);
    const formattedDate = incidentDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = incidentDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Generate PDF
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=EFIR-${firNo}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('First Information Report (e-FIR)', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('TOURIST SAFETY SYSTEM', { align: 'center' });
    doc.moveDown();

    // FIR Details Section
    doc.fontSize(14).font('Helvetica-Bold').text('FIR Details', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    doc.text(`FIR No.: ${firNo}`, { indent: 10 });
    doc.text(`Year: ${currentYear}`, { indent: 10 });
    doc.text(`Police Station: Tourist Police Station, ${city}`, { indent: 10 });
    doc.text(`District: ${district}`, { indent: 10 });
    doc.text(`State: ${state}`, { indent: 10 });
    doc.text(`GD/DD Entry No.: ${gdEntryNo}`, { indent: 10 });
    doc.moveDown();

    // Complainant Details Section
    doc.fontSize(14).font('Helvetica-Bold').text('Complainant Details', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Tourist ID: ${touristId}`, { indent: 10 });
    doc.text(`Date of Report: ${new Date().toLocaleDateString('en-IN')}`, { indent: 10 });
    doc.text(`Time of Report: ${new Date().toLocaleTimeString('en-IN')}`, { indent: 10 });
    doc.moveDown();

    // Incident Information Section
    doc.fontSize(14).font('Helvetica-Bold').text('Incident Information', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Type of Incident: ${incidentType}`, { indent: 10 });
    doc.text(`Date of Incident: ${formattedDate}`, { indent: 10 });
    doc.text(`Time of Incident: ${formattedTime}`, { indent: 10 });
    doc.text(`Location of Incident: ${location}`, { indent: 10 });
    doc.moveDown();

    // Statement of Facts Section
    doc.fontSize(14).font('Helvetica-Bold').text('Statement of Facts', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');
    
    doc.text('Description:', { indent: 10, continued: false });
    doc.moveDown(0.2);
    
    // Format description with proper wrapping
    const descriptionParagraphs = description.split('\n').filter((p: string) => p.trim());
    descriptionParagraphs.forEach((paragraph: string, index: number) => {
      if (index > 0) doc.moveDown(0.3);
      doc.text(paragraph.trim(), { 
        indent: 20,
        align: 'left',
        lineGap: 2
      });
    });
    
    doc.moveDown();

    // Witnesses Section (if provided)
    if (witnesses && witnesses.trim()) {
      doc.fontSize(14).font('Helvetica-Bold').text('Witnesses', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica');
      const witnessLines = witnesses.split('\n').filter((p: string) => p.trim());
      witnessLines.forEach((witness: string) => {
        doc.text(witness.trim(), { indent: 10, lineGap: 2 });
      });
      doc.moveDown();
    }

    // Evidence Section (if provided)
    if (evidence && evidence.trim()) {
      doc.fontSize(14).font('Helvetica-Bold').text('Evidence/Supporting Information', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica');
      const evidenceLines = evidence.split('\n').filter((p: string) => p.trim());
      evidenceLines.forEach((item: string) => {
        doc.text(item.trim(), { indent: 10, lineGap: 2 });
      });
      doc.moveDown();
    }

    // Declaration Section
    doc.fontSize(12).font('Helvetica-Bold').text('Declaration', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text('I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that providing false information is punishable under law.', {
      indent: 10,
      align: 'left',
      lineGap: 2
    });
    doc.moveDown();

    // Footer
    doc.moveDown();
    const pageHeight = doc.page.height;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, {
      align: 'right'
    });
    doc.moveDown(0.5);
    doc.text(`E-FIR Document | Tourist Safety System`, {
      align: 'center'
    });

    doc.end();

  } catch (error: any) {
    console.error('❌ Error generating EFIR:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return error as JSON (not PDF) so frontend can display it
    return res.status(500).json({ 
      error: 'Failed to generate EFIR',
      details: error.message || 'Unknown error occurred',
      hint: 'Check backend console for detailed error logs'
    });
  }
};
