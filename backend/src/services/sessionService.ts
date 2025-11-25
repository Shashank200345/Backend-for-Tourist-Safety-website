import jwt from 'jsonwebtoken';
import supabase from '../config/database';
import redisClient from '../config/redis';
import { IdGeneratorService } from './idGeneratorService';

interface SessionData {
  touristId: string;
  blockchainId: string;
  itineraryEndDate: Date;
}

interface SessionToken {
  id: string;
  touristId: string;
  blockchainId: string;
  iat: number;
  exp: number;
}

export class SessionService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Create a new session for tourist
   */
  async createSession(sessionData: SessionData): Promise<{ token: string; sessionId: string }> {
    const { touristId, blockchainId, itineraryEndDate } = sessionData;

    // Calculate expiration (use itinerary end date or default expiry, whichever is earlier)
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7); // 7 days default

    const expiresAt = itineraryEndDate < defaultExpiry ? itineraryEndDate : defaultExpiry;

    // Generate JWT token
    const sessionId = IdGeneratorService.generateTouristId(touristId);
    const token = jwt.sign(
      {
        id: sessionId,
        touristId,
        blockchainId,
      },
      this.jwtSecret,
      {
        expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000), // seconds
      }
    );

    // Store session in database
    const { data: session, error: createError } = await supabase
      .from('sessions')
      .insert({
        tourist_id: touristId,
        token,
        blockchain_id: blockchainId,
        expires_at: expiresAt.toISOString(),
        itinerary_end_date: itineraryEndDate.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (createError || !session) {
      throw new Error(`Failed to create session: ${createError?.message || 'Unknown error'}`);
    }

    // Store session in Redis for fast access
    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    // Ensure TTL is positive (Redis requires positive integer)
    if (ttlSeconds > 0) {
      await redisClient.setEx(
        `session:${token}`,
        ttlSeconds,
        JSON.stringify({
          id: session.id,
          touristId,
          blockchainId,
          expiresAt: expiresAt.toISOString(),
        })
      );
    } else {
      console.warn('⚠️  Session expiration time is in the past, skipping Redis cache');
    }

    return { token, sessionId: session.id };
  }

  /**
   * Verify and get session data
   */
  async verifySession(token: string): Promise<SessionToken | null> {
    try {
      // Check Redis cache first
      const cachedSession = await redisClient.get(`session:${token}`);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession);
        // Verify JWT
        const decoded = jwt.verify(token, this.jwtSecret) as SessionToken;
        return decoded;
      }

      // Check database
      const { data: session, error: findError } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .single();

      if (findError || !session || !session.is_active) {
        return null;
      }

      // Check if expired
      if (new Date() > new Date(session.expires_at)) {
        await this.invalidateSession(session.id);
        return null;
      }

      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret) as SessionToken;

      // Update last accessed time
      await supabase
        .from('sessions')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', session.id);

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const { data: session, error: findError } = await supabase
      .from('sessions')
      .select('token')
      .eq('id', sessionId)
      .single();

    if (!findError && session) {
      // Update database
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      // Remove from Redis
      await redisClient.del(`session:${session.token}`);
    }
  }

  /**
   * Invalidate session by token
   */
  async invalidateSessionByToken(token: string): Promise<void> {
    const { data: session, error: findError } = await supabase
      .from('sessions')
      .select('id')
      .eq('token', token)
      .single();

    if (!findError && session) {
      await this.invalidateSession(session.id);
    }
  }

  /**
   * Get active sessions for a tourist
   */
  async getActiveSessions(touristId: string): Promise<any[]> {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('tourist_id', touristId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get active sessions: ${error.message}`);
    }

    return sessions || [];
  }

  /**
   * Expire sessions based on itinerary end date
   */
  async expireSessionsByItinerary(): Promise<number> {
    const now = new Date().toISOString();

    // Find all sessions that should be expired
    // Use separate queries for OR condition as Supabase .or() syntax can be tricky
    const { data: expiredByItinerary, error: error1 } = await supabase
      .from('sessions')
      .select('id')
      .eq('is_active', true)
      .lte('itinerary_end_date', now);

    const { data: expiredByExpiry, error: error2 } = await supabase
      .from('sessions')
      .select('id')
      .eq('is_active', true)
      .lte('expires_at', now);

    if (error1 || error2) {
      throw new Error(`Failed to find expired sessions: ${error1?.message || error2?.message}`);
    }

    // Combine and deduplicate session IDs
    const expiredSessionIds = new Set([
      ...(expiredByItinerary || []).map(s => s.id),
      ...(expiredByExpiry || []).map(s => s.id),
    ]);

    // Invalidate each session
    for (const sessionId of expiredSessionIds) {
      await this.invalidateSession(sessionId);
    }

    return expiredSessionIds.size;
  }
}


