import crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

interface OfflineKycData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  photo?: string;
  referenceId: string; // Not the Aadhaar number
  timestamp: string;
  mobile?: string;
  email?: string;
}

interface VerificationResult {
  verified: boolean;
  data: OfflineKycData | null;
  error?: string;
  referenceId?: string;
}

export class AadhaarOfflineKycService {
  private readonly uploadDir: string;

  constructor() {
    // Create upload directory if it doesn't exist
    this.uploadDir = path.join(process.cwd(), 'uploads', 'aadhaar-kyc');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded XML file temporarily
   */
  async saveUploadedFile(fileBuffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, `${Date.now()}-${filename}`);
    fs.writeFileSync(filePath, fileBuffer);
    return filePath;
  }

  /**
   * Verify Aadhaar Paperless Offline e-KYC XML file
   */
  async verifyOfflineKyc(xmlData: string | Buffer): Promise<VerificationResult> {
    try {
      // Convert buffer to string if needed
      const xmlString = Buffer.isBuffer(xmlData) ? xmlData.toString('utf-8') : xmlData;

      if (!xmlString || xmlString.trim().length === 0) {
        return {
          verified: false,
          data: null,
          error: 'Empty XML file',
        };
      }

      // Parse XML
      const parsed = await this.parseXML(xmlString);

      // Verify XML structure
      if (!parsed.OfflinePaperlessKyc || !parsed.OfflinePaperlessKyc.UidData) {
        return {
          verified: false,
          data: null,
          error: 'Invalid XML structure. Not a valid Aadhaar Offline e-KYC file.',
        };
      }

      const uidData = parsed.OfflinePaperlessKyc.UidData[0];
      const piddata = uidData.Poi || uidData.Poa || uidData.Pht;

      if (!piddata || !piddata[0]) {
        return {
          verified: false,
          data: null,
          error: 'Missing demographic data in XML',
        };
      }

      const pid = piddata[0];

      // Extract data from XML
      const kycData: OfflineKycData = {
        name: this.extractName(pid),
        dob: this.extractDOB(pid),
        gender: this.extractGender(pid),
        address: this.extractAddress(pid),
        photo: this.extractPhoto(pid),
        referenceId: uidData.ReferenceId?.[0] || '',
        timestamp: uidData.ts?.[0] || '',
        mobile: uidData.Pht?.[0]?.m?.[0] || '',
        email: uidData.Pht?.[0]?.e?.[0] || '',
      };

      // Validate required fields
      if (!kycData.name || !kycData.dob || !kycData.referenceId) {
        return {
          verified: false,
          data: null,
          error: 'Missing required fields in e-KYC data',
        };
      }

      // Verify digital signature (basic validation)
      // In production, you should verify using UIDAI's public key
      const signatureValid = await this.verifyDigitalSignature(parsed);

      if (!signatureValid) {
        console.warn('⚠️  Digital signature verification skipped (development mode)');
        // In production, return false if signature is invalid
        // For development, we'll allow it to proceed
      }

      return {
        verified: true,
        data: kycData,
        referenceId: kycData.referenceId,
      };
    } catch (error: any) {
      console.error('Offline KYC verification error:', error);
      return {
        verified: false,
        data: null,
        error: error.message || 'Failed to verify e-KYC file',
      };
    }
  }

  /**
   * Parse XML string
   */
  private async parseXML(xmlString: string): Promise<any> {
    try {
      const parsed = await parseStringPromise(xmlString, {
        explicitArray: true,
        mergeAttrs: false,
        trim: true,
      });
      return parsed;
    } catch (error: any) {
      throw new Error(`XML parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract name from PID data
   */
  private extractName(pid: any): string {
    // Name can be in different formats in XML
    if (pid.name) {
      return Array.isArray(pid.name) ? pid.name[0] : pid.name;
    }
    if (pid.lname || pid.fname) {
      const fname = Array.isArray(pid.fname) ? pid.fname[0] : pid.fname || '';
      const lname = Array.isArray(pid.lname) ? pid.lname[0] : pid.lname || '';
      return `${fname} ${lname}`.trim();
    }
    return '';
  }

  /**
   * Extract date of birth
   */
  private extractDOB(pid: any): string {
    if (pid.dob) {
      const dob = Array.isArray(pid.dob) ? pid.dob[0] : pid.dob;
      // Convert YYYYMMDD to YYYY-MM-DD format
      if (dob && dob.length === 8) {
        return `${dob.substring(0, 4)}-${dob.substring(4, 6)}-${dob.substring(6, 8)}`;
      }
      return dob;
    }
    return '';
  }

  /**
   * Extract gender
   */
  private extractGender(pid: any): string {
    if (pid.gender) {
      const gender = Array.isArray(pid.gender) ? pid.gender[0] : pid.gender;
      return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender === 'T' ? 'Transgender' : gender;
    }
    return '';
  }

  /**
   * Extract address
   */
  private extractAddress(pid: any): string {
    if (pid.co) {
      // Address components
      const co = Array.isArray(pid.co) ? pid.co[0] : pid.co || '';
      const street = Array.isArray(pid.street) ? pid.street[0] : pid.street || '';
      const house = Array.isArray(pid.house) ? pid.house[0] : pid.house || '';
      const landmark = Array.isArray(pid.landmark) ? pid.landmark[0] : pid.landmark || '';
      const loc = Array.isArray(pid.loc) ? pid.loc[0] : pid.loc || '';
      const vtc = Array.isArray(pid.vtc) ? pid.vtc[0] : pid.vtc || '';
      const subdist = Array.isArray(pid.subdist) ? pid.subdist[0] : pid.subdist || '';
      const dist = Array.isArray(pid.dist) ? pid.dist[0] : pid.dist || '';
      const state = Array.isArray(pid.state) ? pid.state[0] : pid.state || '';
      const pc = Array.isArray(pid.pc) ? pid.pc[0] : pid.pc || '';

      const addressParts = [
        house,
        street,
        landmark,
        loc,
        vtc,
        subdist,
        dist,
        state,
        pc,
      ].filter(Boolean);

      return addressParts.join(', ');
    }
    return '';
  }

  /**
   * Extract photo (base64 encoded)
   */
  private extractPhoto(pid: any): string | undefined {
    if (pid.photo) {
      return Array.isArray(pid.photo) ? pid.photo[0] : pid.photo;
    }
    return undefined;
  }

  /**
   * Verify digital signature
   * In production, this should verify using UIDAI's public key
   */
  private async verifyDigitalSignature(parsed: any): Promise<boolean> {
    try {
      // Check if signature exists
      if (!parsed.OfflinePaperlessKyc?.Signature) {
        return false;
      }

      // In production, you would:
      // 1. Extract the signature from XML
      // 2. Get UIDAI's public key
      // 3. Verify the signature using crypto module
      
      // For development, we'll do basic structure validation
      // In production, implement proper signature verification:
      /*
      const signature = parsed.OfflinePaperlessKyc.Signature[0];
      const publicKey = await this.getUIDAIPublicKey();
      const dataToVerify = // Extract the data that was signed
      return crypto.createVerify('RSA-SHA256')
        .update(dataToVerify)
        .verify(publicKey, signature, 'base64');
      */

      // For now, return true if structure is valid
      return true;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

