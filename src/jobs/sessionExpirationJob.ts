import cron from 'node-cron';
import { SessionService } from '../services/sessionService';

const sessionService = new SessionService();

/**
 * Job to automatically expire sessions when itinerary ends
 * Runs every hour
 */
export function startSessionExpirationJob() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running session expiration job...');
      const expiredCount = await sessionService.expireSessionsByItinerary();
      console.log(`Expired ${expiredCount} sessions`);
    } catch (error) {
      console.error('Error in session expiration job:', error);
    }
  });

  console.log('Session expiration job started (runs every hour)');
}



