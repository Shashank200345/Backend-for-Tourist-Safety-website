import { contract } from '../config/blockchain';
import { IdGeneratorService } from './idGeneratorService';
import supabase from '../config/database';
import { ethers } from 'ethers';
import type { IPFSHTTPClient } from 'ipfs-http-client';

let cachedIpfsClient: IPFSHTTPClient | null = null;

async function getIpfsClient(): Promise<IPFSHTTPClient | null> {
  if (cachedIpfsClient) {
    return cachedIpfsClient;
  }

  // IPFS is optional - return null if not configured
  if (!process.env.IPFS_PROJECT_ID || !process.env.IPFS_PROJECT_SECRET) {
    return null;
  }

  const { create } = await import('ipfs-http-client');

  cachedIpfsClient = create({
    host: process.env.IPFS_API_URL?.split('://')[1]?.split(':')[0] || 'ipfs.infura.io',
    port: parseInt(process.env.IPFS_API_URL?.split(':')[2] || '5001', 10),
    protocol: 'https',
    headers: {
      authorization: `Basic ${Buffer.from(
        `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
      ).toString('base64')}`,
    },
  });

  return cachedIpfsClient;
}

export class BlockchainService {
  /**
   * Store document on IPFS and return hash
   */
  async storeDocumentOnIPFS(documentData: any): Promise<string> {
    try {
      const client = await getIpfsClient();
      if (!client) {
        // IPFS is optional - return a mock hash for development
        console.log('⚠️  IPFS not configured, using mock hash for development');
        return `mock-ipfs-hash-${Date.now()}`;
      }
      const documentBuffer = Buffer.from(JSON.stringify(documentData));
      const result = await client.add(documentBuffer);
      return result.path;
    } catch (error: any) {
      // If IPFS fails, use mock hash (IPFS is optional)
      console.warn('⚠️  IPFS storage failed, using mock hash:', error.message);
      return `mock-ipfs-hash-${Date.now()}`;
    }
  }

  /**
   * Create blockchain record for tourist
   */
  async createTouristRecord(
    touristId: string,
    documentHash: string
  ): Promise<{ transactionHash: string; blockNumber: bigint }> {
    try {
      if (!contract) {
        throw new Error('Blockchain contract not initialized. Check CONTRACT_ADDRESS and PRIVATE_KEY in .env');
      }

      // Store transaction on blockchain
      const tx = await contract.createRecord(touristId, documentHash);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      throw new Error(`Failed to create blockchain record: ${error.message}`);
    }
  }

  /**
   * Generate blockchain ID (wallet address) for tourist
   */
  async generateBlockchainId(touristId: string): Promise<string> {
    try {
      // Check if blockchain ID already exists
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('blockchain_id')
        .eq('tourist_id', touristId)
        .single();

      if (!findError && existingUser?.blockchain_id) {
        return existingUser.blockchain_id;
      }

      // Generate new wallet address
      const newWallet = ethers.Wallet.createRandom();
      const blockchainId = newWallet.address;

      // Update user with blockchain ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ blockchain_id: blockchainId })
        .eq('tourist_id', touristId);

      if (updateError) {
        throw new Error(`Failed to update blockchain ID: ${updateError.message}`);
      }

      return blockchainId;
    } catch (error: any) {
      throw new Error(`Failed to generate blockchain ID: ${error.message}`);
    }
  }

  /**
   * Verify record on blockchain
   */
  async verifyRecord(touristId: string): Promise<boolean> {
    try {
      if (!contract) {
        throw new Error('Blockchain contract not initialized. Check CONTRACT_ADDRESS and PRIVATE_KEY in .env');
      }
      const isValid = await contract.verifyRecord(touristId);
      return isValid;
    } catch (error: any) {
      console.error(`Failed to verify record: ${error.message}`);
      return false;
    }
  }

  /**
   * Get blockchain record details
   */
  async getRecord(touristId: string): Promise<{
    documentHash: string;
    timestamp: bigint;
    isValid: boolean;
  } | null> {
    try {
      if (!contract) {
        throw new Error('Blockchain contract not initialized. Check CONTRACT_ADDRESS and PRIVATE_KEY in .env');
      }
      const [docHash, timestamp, isValid] = await contract.getRecord(touristId);
      return {
        documentHash: docHash,
        timestamp,
        isValid,
      };
    } catch (error: any) {
      console.error(`Failed to get record: ${error.message}`);
      return null;
    }
  }

  /**
   * Invalidate record on blockchain
   */
  async invalidateRecord(touristId: string): Promise<string> {
    try {
      if (!contract) {
        throw new Error('Blockchain contract not initialized. Check CONTRACT_ADDRESS and PRIVATE_KEY in .env');
      }
      const tx = await contract.invalidateRecord(touristId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to invalidate record: ${error.message}`);
    }
  }

  /**
   * Complete blockchain registration process
   */
  async registerTourist(
    touristId: string,
    documentData: any
  ): Promise<{
    blockchainId: string;
    transactionHash: string;
    ipfsHash: string;
    documentHash: string;
  }> {
    try {
      // 1. Generate document hash
      const documentHash = IdGeneratorService.generateDocumentHash(documentData);

      // 2. Store document on IPFS
      const ipfsHash = await this.storeDocumentOnIPFS(documentData);

      // 3. Generate blockchain ID
      const blockchainId = await this.generateBlockchainId(touristId);

      // 4. Create blockchain record (optional - only if contract is deployed)
      let transactionHash = 'not-configured';
      let blockNumber: bigint = BigInt(0);
      
      try {
        if (contract) {
          const result = await this.createTouristRecord(touristId, documentHash);
          transactionHash = result.transactionHash;
          blockNumber = result.blockNumber;

          // 5. Store blockchain record in database
          const { error: recordError } = await supabase
            .from('blockchain_records')
            .insert({
              tourist_id: touristId,
              transaction_hash: transactionHash,
              block_number: blockNumber.toString(),
              ipfs_hash: ipfsHash,
              document_hash: documentHash,
            });

          if (recordError) {
            console.warn('⚠️  Failed to store blockchain record in database:', recordError.message);
          }
        } else {
          console.log('⚠️  Blockchain contract not configured, skipping blockchain record creation');
        }
      } catch (error: any) {
        console.warn('⚠️  Blockchain record creation failed (optional):', error.message);
        // Continue without blockchain - it's optional for development
      }

      return {
        blockchainId,
        transactionHash,
        ipfsHash,
        documentHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to register tourist on blockchain: ${error.message}`);
    }
  }
}


