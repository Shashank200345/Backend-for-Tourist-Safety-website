import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Generates a unique tourist ID based on airport code, timestamp, and document hash
 * Format: TID-{AIRPORT_CODE}-{TIMESTAMP}-{HASH}
 */
export class IdGeneratorService {
  private static readonly AIRPORT_CODE = process.env.AIRPORT_CODE || 'DEL';

  /**
   * Generate unique tourist ID
   */
  static generateTouristId(documentNumber: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const hash = crypto
      .createHash('sha256')
      .update(documentNumber + Date.now().toString())
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();

    return `TID-${this.AIRPORT_CODE}-${timestamp}-${hash}`;
  }

  /**
   * Generate blockchain ID (wallet address)
   */
  static async generateBlockchainId(): Promise<string> {
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  }

  /**
   * Generate document hash for blockchain storage
   */
  static generateDocumentHash(documentData: any): string {
    const dataString = JSON.stringify(documentData);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
}

