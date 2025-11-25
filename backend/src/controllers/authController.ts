import { Request, Response } from 'express';
import crypto from 'crypto';
import { DigiLockerService } from '../services/digilockerService';
import { BlockchainService } from '../services/blockchainService';
import { SessionService } from '../services/sessionService';
import { IdGeneratorService } from '../services/idGeneratorService';
import supabase from '../config/database';

const digiLockerService = new DigiLockerService();
const blockchainService = new BlockchainService();
const sessionService = new SessionService();

interface AuthRequest extends Request {
  body: {
    email?: string;
    password?: string;
    name?: string;
    country?: string;
    state?: string;
    itineraryStartDate?: string;
    itineraryEndDate?: string;
    documentType?: 'aadhaar' | 'passport';
    documentNumber?: string;
    documentData?: Record<string, any>;
    code?: string; // OAuth code from DigiLocker
  };
  user?: {
    id: string;
    touristId: string;
    blockchainId: string;
  };
}

/**
 * Initiate DigiLocker OAuth flow
 */
export async function initiateDigiLockerAuth(req: AuthRequest, res: Response): Promise<void> {
  try {
    const state = crypto.randomUUID();
    const authUrl = digiLockerService.getAuthorizationUrl(state);

    res.json({
      authUrl,
      state,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Handle DigiLocker OAuth callback
 */
export async function handleDigiLockerCallback(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, documentType, documentNumber } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    // Get access token
    const accessToken = await digiLockerService.getAccessToken(code);

    // Fetch document from DigiLocker
    const docType = documentType || 'aadhaar';
    const documentData = await digiLockerService.fetchDocument(accessToken, docType);

    // Verify document
    const verification = await digiLockerService.verifyDocument(documentData);

    if (!verification.verified || !verification.documentData) {
      res.status(400).json({ error: verification.error || 'Document verification failed' });
      return;
    }

    res.json({
      verified: true,
      documentData: verification.documentData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Simulate DigiLocker verification (for development)
 */
export async function simulateDigiLockerVerification(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { documentType, documentNumber } = req.body;

    if (!documentType || !documentNumber) {
      res.status(400).json({ error: 'Document type and number are required' });
      return;
    }

    const verification = await digiLockerService.simulateVerification(
      documentType,
      documentNumber
    );

    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Complete registration and create session
 */
export async function completeRegistration(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      email,
      name,
      country,
      state,
      itineraryStartDate,
      itineraryEndDate,
      documentType,
      documentNumber,
      documentData,
    } = req.body;

    // Validate required fields
    if (!email || !name || !documentType || !documentNumber || !itineraryEndDate) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Database error: ${findError.message}`);
    }

    // Generate tourist ID
    const touristId = existingUser?.tourist_id || IdGeneratorService.generateTouristId(documentNumber);

    const resolvedDocumentData = documentData || {
      documentNumber,
      documentType,
    };

    // Generate document hash
    const documentHash = IdGeneratorService.generateDocumentHash(resolvedDocumentData);

    let user;
    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          tourist_id: touristId,
          email,
          name,
          document_type: documentType,
          document_number: documentNumber,
          document_hash: documentHash,
          country,
          state,
          itinerary_start_date: itineraryStartDate ? new Date(itineraryStartDate).toISOString() : null,
          itinerary_end_date: new Date(itineraryEndDate).toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      user = newUser;
    } else {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name,
          country,
          state,
          itinerary_start_date: itineraryStartDate ? new Date(itineraryStartDate).toISOString() : null,
          itinerary_end_date: new Date(itineraryEndDate).toISOString(),
          document_hash: documentHash,
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
      user = updatedUser;
    }

    // Register on blockchain
    const blockchainData = await blockchainService.registerTourist(touristId, resolvedDocumentData);

    // Update user with blockchain ID
    const { data: finalUser, error: blockchainUpdateError } = await supabase
      .from('users')
      .update({ blockchain_id: blockchainData.blockchainId })
      .eq('id', user.id)
      .select()
      .single();

    if (blockchainUpdateError) {
      throw new Error(`Failed to update blockchain ID: ${blockchainUpdateError.message}`);
    }
    user = finalUser;

    // Create session
    const { token } = await sessionService.createSession({
      touristId,
      blockchainId: blockchainData.blockchainId,
      itineraryEndDate: new Date(itineraryEndDate),
    });

    res.json({
      success: true,
      touristId,
      blockchainId: blockchainData.blockchainId,
      transactionHash: blockchainData.transactionHash,
      token,
      user: {
        id: user.id,
        touristId: user.tourist_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get user profile by blockchain ID (requires authentication)
 */
export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const blockchainId = req.user?.blockchainId;

    if (!blockchainId) {
      res.status(400).json({ error: 'Blockchain ID not found in token' });
      return;
    }

    // Fetch user from database using blockchain ID
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('blockchain_id', blockchainId)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      throw new Error(`Database error: ${findError.message}`);
    }

    // Fetch blockchain records for this user
    const { data: blockchainRecords } = await supabase
      .from('blockchain_records')
      .select('transaction_hash, block_number, ipfs_hash, created_at')
      .eq('tourist_id', user.tourist_id)
      .order('created_at', { ascending: false });

    // Return user profile with formatted data
    res.json({
      success: true,
      user: {
        id: user.id,
        touristId: user.tourist_id,
        blockchainId: user.blockchain_id,
        name: user.name,
        email: user.email,
        documentType: user.document_type,
        country: user.country,
        state: user.state,
        itineraryStartDate: user.itinerary_start_date,
        itineraryEndDate: user.itinerary_end_date,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      blockchainRecords: blockchainRecords || [],
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Logout (invalidate session)
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await sessionService.invalidateSessionByToken(token);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}


