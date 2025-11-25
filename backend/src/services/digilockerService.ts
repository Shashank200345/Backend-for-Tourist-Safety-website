import axios from 'axios';
import crypto from 'crypto';

interface DigiLockerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
}

interface DocumentData {
  name: string;
  dob: string;
  gender?: string;
  address?: string;
  photo?: string;
  documentNumber: string;
  documentType: 'aadhaar' | 'passport';
}

interface VerificationResult {
  verified: boolean;
  documentData: DocumentData | null;
  error?: string;
}

export class DigiLockerService {
  private config: DigiLockerConfig;

  constructor() {
    this.config = {
      clientId: process.env.DIGILOCKER_CLIENT_ID || '',
      clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || '',
      redirectUri: process.env.DIGILOCKER_REDIRECT_URI || '',
      apiBaseUrl: process.env.DIGILOCKER_API_BASE_URL || 'https://api.digilocker.gov.in',
    };
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state || crypto.randomUUID(),
      scope: 'read',
    });

    return `${this.config.apiBaseUrl}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.apiBaseUrl}/oauth2/token`,
        {
          grant_type: 'authorization_code',
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Fetch document from DigiLocker
   */
  async fetchDocument(
    accessToken: string,
    documentType: 'aadhaar' | 'passport'
  ): Promise<DocumentData> {
    try {
      const endpoint =
        documentType === 'aadhaar'
          ? '/v1/aadhaar/details'
          : '/v1/passport/details';

      const response = await axios.get(`${this.config.apiBaseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      return {
        name: data.name || data.full_name,
        dob: data.dob || data.date_of_birth,
        gender: data.gender,
        address: data.address,
        photo: data.photo,
        documentNumber: data.uid || data.passport_number,
        documentType,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }

  /**
   * Verify document authenticity
   */
  async verifyDocument(documentData: DocumentData): Promise<VerificationResult> {
    try {
      // In production, this would make additional API calls to verify
      // For now, we'll do basic validation
      if (!documentData.name || !documentData.dob || !documentData.documentNumber) {
        return {
          verified: false,
          documentData: null,
          error: 'Missing required document fields',
        };
      }

      // Validate document number format
      if (documentData.documentType === 'aadhaar') {
        if (!/^\d{12}$/.test(documentData.documentNumber)) {
          return {
            verified: false,
            documentData: null,
            error: 'Invalid Aadhaar number format',
          };
        }
      } else if (documentData.documentType === 'passport') {
        if (documentData.documentNumber.length < 6) {
          return {
            verified: false,
            documentData: null,
            error: 'Invalid passport number format',
          };
        }
      }

      return {
        verified: true,
        documentData,
      };
    } catch (error: any) {
      return {
        verified: false,
        documentData: null,
        error: error.message,
      };
    }
  }

  /**
   * Simulate DigiLocker verification (for development/testing)
   */
  async simulateVerification(
    documentType: 'aadhaar' | 'passport',
    documentNumber: string
  ): Promise<VerificationResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock verification - in production, this would call real DigiLocker API
    const mockData: DocumentData = {
      name: 'John Doe',
      dob: '1990-01-01',
      gender: 'M',
      documentNumber,
      documentType,
    };

    return {
      verified: true,
      documentData: mockData,
    };
  }
}
