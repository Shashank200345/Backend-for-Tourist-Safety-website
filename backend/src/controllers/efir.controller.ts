import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google API key is not configured. Please set GEMINI_API_KEY in environment variables.' 
      });
    }

    // 1. Generate FIR content using Google Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash (faster, cheaper) or gemini-pro (more capable)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Generate a formal First Information Report (FIR) based on the following details:
      Tourist ID: ${touristId}
      Incident Type: ${incidentType}
      Location: ${location}
      Date & Time: ${dateTime}
      Description: ${description}
      Witnesses: ${witnesses}
      
      The output should be structured and professional, suitable for official police records. 
      Include sections for:
      - Incident Details
      - Complainant Details (Tourist ID)
      - Statement of Facts
      - Preliminary Observations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const firText = response.text();

    // 2. Generate PDF
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=EFIR-${Date.now()}.pdf`);

    doc.pipe(res);

    // Add Header
    doc.fontSize(20).text('First Information Report (e-FIR)', { align: 'center' });
    doc.moveDown();
    
    // Add Metadata (Mock data for now as per requirements)
    const currentYear = new Date().getFullYear();
    const firNo = `FIR-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gdEntryNo = `GD-${Math.floor(100 + Math.random() * 900)}`;

    doc.fontSize(12).text(`FIR No.: ${firNo}`);
    doc.text(`Year: ${currentYear}`);
    doc.text(`Police Station Name: Tourist Police Station, ${location.split(',')[0]}`); // Simple extraction
    doc.text(`District: ${location.split(',')[1] || 'Unknown'}`);
    doc.text(`GD/DD Entry No.: ${gdEntryNo}`);
    doc.moveDown();
    doc.moveDown();

    // Add Generated Content
    doc.fontSize(14).text('Incident Report Details', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(firText, {
      align: 'justify'
    });

    // Add Footer
    doc.moveDown();
    doc.moveDown();
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right', fontSize: 10 });

    doc.end();

  } catch (error: any) {
    console.error('Error generating EFIR:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid Google API key. Please check your GOOGLE_API_KEY environment variable.' 
      });
    }
    
    if (error.message?.includes('MODEL_NOT_FOUND') || error.message?.includes('model')) {
      return res.status(400).json({ 
        error: `Model not found. Please check GEMINI_MODEL environment variable or use a valid model name.` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate EFIR',
      details: error.message || 'Unknown error occurred'
    });
  }
};
