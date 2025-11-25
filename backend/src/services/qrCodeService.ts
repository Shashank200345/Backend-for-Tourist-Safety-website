import QRCode from 'qrcode';
import crypto from 'crypto';
import supabase from '../config/database';

interface QRCodeData {
  qrToken: string;
  qrCodeImage: string; // Base64 image data
  qrCodeUrl: string; // URL to scan
  expiresAt: Date;
}

interface QRVerificationResult {
  valid: boolean;
  used: boolean;
  expired: boolean;
  touristId?: string;
  blockchainId?: string;
  error?: string;
}

export class QRCodeService {
  private readonly QR_EXPIRY_HOURS = 24; // QR code expires in 24 hours
  private readonly QR_BASE_URL = process.env.QR_VERIFICATION_URL || 'http://localhost:3001/api/airport/verify-qr';

  /**
   * Generate a unique QR token
   */
  private generateQRToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate QR code for a blockchain ID
   */
  async generateQRCode(
    touristId: string,
    blockchainId: string
  ): Promise<QRCodeData> {
    try {
      // Generate unique token
      const qrToken = this.generateQRToken();

      // Calculate expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.QR_EXPIRY_HOURS);

      // Create QR code data - encode blockchain ID directly
      // Format: "BLOCKCHAIN_ID:blockchainId"
      const qrCodeData = `BLOCKCHAIN_ID:${blockchainId}`;

      // Generate QR code image (base64)
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Store QR code in database (still store token for verification)
      const { data: qrCode, error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          tourist_id: touristId,
          blockchain_id: blockchainId,
          qr_token: qrToken,
          qr_code_data: qrCodeData, // Store blockchain ID data
          is_used: false,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to store QR code: ${insertError.message}`);
      }

      return {
        qrToken,
        qrCodeImage,
        qrCodeUrl: qrCodeData, // Return blockchain ID data instead of URL
        expiresAt,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Verify and use QR code by blockchain ID (one-time use)
   */
  async verifyAndUseQRCodeByBlockchainId(blockchainId: string): Promise<QRVerificationResult> {
    try {
      // Find active (unused and not expired) QR code for this blockchain ID
      const { data: qrCode, error: findError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('blockchain_id', blockchainId)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findError || !qrCode) {
        return {
          valid: false,
          used: false,
          expired: false,
          error: 'No valid QR code found for this blockchain ID',
        };
      }

      // Check if expired
      const expiresAt = new Date(qrCode.expires_at);
      if (new Date() > expiresAt) {
        return {
          valid: false,
          used: false,
          expired: true,
          error: 'QR code has expired',
        };
      }

      // Mark as used
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', qrCode.id);

      if (updateError) {
        throw new Error(`Failed to mark QR code as used: ${updateError.message}`);
      }

      return {
        valid: true,
        used: false,
        expired: false,
        touristId: qrCode.tourist_id,
        blockchainId: qrCode.blockchain_id,
      };
    } catch (error: any) {
      return {
        valid: false,
        used: false,
        expired: false,
        error: error.message || 'QR code verification failed',
      };
    }
  }

  /**
   * Verify and use QR code by token (one-time use) - Legacy method
   */
  async verifyAndUseQRCode(qrToken: string): Promise<QRVerificationResult> {
    try {
      // Find QR code by token
      const { data: qrCode, error: findError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('qr_token', qrToken)
        .single();

      if (findError || !qrCode) {
        return {
          valid: false,
          used: false,
          expired: false,
          error: 'Invalid QR code',
        };
      }

      // Check if already used
      if (qrCode.is_used) {
        return {
          valid: false,
          used: true,
          expired: false,
          error: 'QR code has already been used',
        };
      }

      // Check if expired
      const expiresAt = new Date(qrCode.expires_at);
      if (new Date() > expiresAt) {
        return {
          valid: false,
          used: false,
          expired: true,
          error: 'QR code has expired',
        };
      }

      // Mark as used
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', qrCode.id);

      if (updateError) {
        throw new Error(`Failed to mark QR code as used: ${updateError.message}`);
      }

      return {
        valid: true,
        used: false,
        expired: false,
        touristId: qrCode.tourist_id,
        blockchainId: qrCode.blockchain_id,
      };
    } catch (error: any) {
      return {
        valid: false,
        used: false,
        expired: false,
        error: error.message || 'QR code verification failed',
      };
    }
  }

  /**
   * Get active QR codes for a tourist
   */
  async getActiveQRCodes(touristId: string): Promise<any[]> {
    try {
      const { data: qrCodes, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('tourist_id', touristId)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get QR codes: ${error.message}`);
      }

      return qrCodes || [];
    } catch (error: any) {
      throw new Error(`Failed to get active QR codes: ${error.message}`);
    }
  }

  /**
   * Invalidate all QR codes for a tourist (optional - for security)
   */
  async invalidateAllQRCodes(touristId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('tourist_id', touristId)
        .eq('is_used', false);

      if (error) {
        throw new Error(`Failed to invalidate QR codes: ${error.message}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to invalidate QR codes: ${error.message}`);
    }
  }
}

