import { Request, Response } from 'express';
import multer from 'multer';
import { BlockchainService } from '../services/blockchainService';
import { SessionService } from '../services/sessionService';
import { IdGeneratorService } from '../services/idGeneratorService';
import { QRCodeService } from '../services/qrCodeService';
import supabase from '../config/database';

const blockchainService = new BlockchainService();
const sessionService = new SessionService();
const qrCodeService = new QRCodeService();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

interface AirportOnboardingRequest extends Request {
  body: {
    name: string;
    email: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    address: string;
    country: string;
    state: string;
    itineraryStartDate: string;
    itineraryEndDate: string;
  };
  file?: Express.Multer.File;
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImageToSupabase(
  file: Express.Multer.File,
  touristId: string
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${touristId}-${Date.now()}.${fileExt}`;
    // Don't include bucket name in path - just the filename
    const filePath = fileName;

    console.log('Uploading image to Supabase Storage...');
    console.log('Bucket: tourist-photos');
    console.log('File path:', filePath);
    console.log('File size:', file.buffer.length, 'bytes');
    console.log('File type:', file.mimetype);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tourist-photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned');
    }

    console.log('Image uploaded successfully:', data.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tourist-photos')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Image upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

/**
 * Complete onboarding - Register tourist and generate Blockchain ID
 */
export const completeAirportOnboarding = [
  upload.single('photo'),
  async (req: AirportOnboardingRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        aadhaarNumber,
        dob,
        gender,
        address,
        country,
        state,
        itineraryStartDate,
        itineraryEndDate,
      } = req.body;

      // Validate required fields
      if (!name || !email || !aadhaarNumber || !dob || !itineraryEndDate) {
        res.status(400).json({
          error: 'Missing required fields: name, email, aadhaarNumber, dob, and itineraryEndDate are required',
        });
        return;
      }

      // Validate Aadhaar number format (12 digits)
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        res.status(400).json({
          error: 'Invalid Aadhaar number format. Must be 12 digits.',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Invalid email format',
        });
        return;
      }

      // Check if user already exists by Aadhaar number
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('document_number', aadhaarNumber)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        throw new Error(`Database error: ${findError.message}`);
      }

      // Generate tourist ID
      const touristId =
        existingUser?.tourist_id ||
        IdGeneratorService.generateTouristId(aadhaarNumber);

      // Upload image if provided
      let imageUrl: string | null = null;
      if (req.file) {
        try {
          console.log('Processing image upload...');
          imageUrl = await uploadImageToSupabase(req.file, touristId);
          console.log('Image uploaded successfully, URL:', imageUrl);
        } catch (error: any) {
          console.error('Image upload failed:', error);
          // Return error - image is required
          res.status(400).json({ 
            error: 'Failed to upload image. Please try again.',
            details: error.message 
          });
          return;
        }
      } else {
        console.warn('No image file provided in request');
        res.status(400).json({ 
          error: 'Photo is required. Please capture or upload your photo.' 
        });
        return;
      }

      // Prepare document data
      const documentData = {
        documentType: 'aadhaar',
        documentNumber: aadhaarNumber,
        name,
        dob,
        gender,
        address,
      };

      // Generate document hash
      const documentHash = IdGeneratorService.generateDocumentHash(documentData);

      let user;
      if (!existingUser) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            tourist_id: touristId,
            email,
            name,
            document_type: 'aadhaar',
            document_number: aadhaarNumber,
            document_hash: documentHash,
            country: country || 'India',
            state: state || '',
            itinerary_start_date: itineraryStartDate
              ? new Date(itineraryStartDate).toISOString()
              : new Date().toISOString(),
            itinerary_end_date: new Date(itineraryEndDate).toISOString(),
            verification_status: 'verified',
            verification_method: 'manual',
            image_url: imageUrl,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`);
        }
        user = newUser;
      } else {
        // Update existing user
        const updateData: any = {
          name,
          email,
          country: country || existingUser.country,
          state: state || existingUser.state,
          itinerary_start_date: itineraryStartDate
            ? new Date(itineraryStartDate).toISOString()
            : existingUser.itinerary_start_date,
          itinerary_end_date: new Date(itineraryEndDate).toISOString(),
          document_hash: documentHash,
          verification_status: 'verified',
          verification_method: 'manual',
        };

        // Update image only if new one is provided
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`);
        }
        user = updatedUser;
      }

      // Generate Blockchain ID and register on blockchain
      const blockchainData = await blockchainService.registerTourist(
        touristId,
        documentData
      );

      // Update user with blockchain ID
      const { data: finalUser, error: blockchainUpdateError } = await supabase
        .from('users')
        .update({ blockchain_id: blockchainData.blockchainId })
        .eq('id', user.id)
        .select()
        .single();

      if (blockchainUpdateError) {
        throw new Error(
          `Failed to update blockchain ID: ${blockchainUpdateError.message}`
        );
      }
      user = finalUser;

      // Create session
      const { token } = await sessionService.createSession({
        touristId,
        blockchainId: blockchainData.blockchainId,
        itineraryEndDate: new Date(itineraryEndDate),
      });

      // Generate QR code for one-time login
      let qrCodeData = null;
      try {
        qrCodeData = await qrCodeService.generateQRCode(
          touristId,
          blockchainData.blockchainId
        );
        console.log('QR code generated successfully');
      } catch (error: any) {
        console.error('QR code generation failed:', error);
        // Continue without QR code - it's optional
      }

      res.json({
        success: true,
        message: 'Onboarding completed successfully',
        touristId,
        blockchainId: blockchainData.blockchainId,
        transactionHash: blockchainData.transactionHash,
        token,
        imageUrl: user.image_url,
        qrCode: qrCodeData ? {
          qrCodeImage: qrCodeData.qrCodeImage,
          qrCodeUrl: qrCodeData.qrCodeUrl,
          expiresAt: qrCodeData.expiresAt,
        } : null,
        user: {
          id: user.id,
          touristId: user.tourist_id,
          name: user.name,
          email: user.email,
          blockchainId: user.blockchain_id,
          imageUrl: user.image_url,
        },
        instructions: {
          message: 'Save your Blockchain ID securely',
          loginInfo: 'You can now login using your Blockchain ID or scan the QR code',
          blockchainId: blockchainData.blockchainId,
        },
      });
    } catch (error: any) {
      console.error('Airport onboarding error:', error);
      res.status(500).json({ error: error.message });
    }
  },
];

/**
 * Verify QR code and login (one-time use)
 * Accepts blockchain ID directly from QR code
 */
export async function verifyQRCode(req: Request, res: Response): Promise<void> {
  try {
    const { blockchainId, token } = req.query;

    let verification;

    // If blockchain ID is provided (new format), use it
    if (blockchainId && typeof blockchainId === 'string') {
      // Validate blockchain ID format
      if (!/^0x[a-fA-F0-9]{40}$/.test(blockchainId)) {
        res.status(400).json({ error: 'Invalid blockchain ID format' });
        return;
      }
      verification = await qrCodeService.verifyAndUseQRCodeByBlockchainId(blockchainId);
    } 
    // Legacy: If token is provided (old format), use it
    else if (token && typeof token === 'string') {
      verification = await qrCodeService.verifyAndUseQRCode(token);
    } 
    else {
      res.status(400).json({ error: 'Blockchain ID or token is required' });
      return;
    }

    if (!verification.valid) {
      res.status(400).json({
        error: verification.error || 'Invalid QR code',
        used: verification.used,
        expired: verification.expired,
      });
      return;
    }

    if (!verification.touristId || !verification.blockchainId) {
      res.status(400).json({ error: 'QR code data is invalid' });
      return;
    }

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('blockchain_id', verification.blockchainId)
      .single();

    if (findError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if itinerary is still valid
    const itineraryEndDate = new Date(user.itinerary_end_date);
    if (new Date() > itineraryEndDate) {
      res.status(403).json({
        error: 'Your itinerary has expired. Please complete onboarding again.',
      });
      return;
    }

    // Create new session
    const { token: sessionToken } = await sessionService.createSession({
      touristId: user.tourist_id,
      blockchainId: user.blockchain_id,
      itineraryEndDate,
    });

    res.json({
      success: true,
      message: 'QR code verified successfully. Login successful.',
      token: sessionToken,
      user: {
        id: user.id,
        touristId: user.tourist_id,
        name: user.name,
        email: user.email,
        blockchainId: user.blockchain_id,
        itineraryEndDate: user.itinerary_end_date,
        imageUrl: user.image_url,
      },
    });
  } catch (error: any) {
    console.error('QR code verification error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Generate new QR code for existing user
 */
export async function generateNewQRCode(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { blockchainId } = req.body;

    if (!blockchainId) {
      res.status(400).json({ error: 'Blockchain ID is required' });
      return;
    }

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('blockchain_id', blockchainId)
      .single();

    if (findError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate new QR code
    const qrCodeData = await qrCodeService.generateQRCode(
      user.tourist_id,
      user.blockchain_id
    );

    res.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: {
        qrCodeImage: qrCodeData.qrCodeImage,
        qrCodeUrl: qrCodeData.qrCodeUrl,
        expiresAt: qrCodeData.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Login using Blockchain ID
 */
export async function loginWithBlockchainId(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { blockchainId } = req.body;

    if (!blockchainId) {
      res.status(400).json({ error: 'Blockchain ID is required' });
      return;
    }

    // Validate blockchain ID format (Ethereum address format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(blockchainId)) {
      res.status(400).json({ error: 'Invalid blockchain ID format' });
      return;
    }

    // Find user by blockchain ID
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('blockchain_id', blockchainId)
      .single();

    if (findError || !user) {
      res.status(404).json({
        error: 'User not found. Please complete onboarding first.',
      });
      return;
    }

    // Check if itinerary is still valid
    const itineraryEndDate = new Date(user.itinerary_end_date);
    if (new Date() > itineraryEndDate) {
      res.status(403).json({
        error: 'Your itinerary has expired. Please complete onboarding again.',
      });
      return;
    }

    // Create new session
    const { token } = await sessionService.createSession({
      touristId: user.tourist_id,
      blockchainId: user.blockchain_id,
      itineraryEndDate,
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        touristId: user.tourist_id,
        name: user.name,
        email: user.email,
        blockchainId: user.blockchain_id,
        itineraryEndDate: user.itinerary_end_date,
        imageUrl: user.image_url,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
}
