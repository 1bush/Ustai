import { pb } from '@/lib/pocketbase';
import * as Location from 'expo-location';

export class RealTimeMonitoringService {
  private static locationSubscription: Location.LocationSubscription | null = null;

  /**
   * Nis një sesion monitorimi
   */
  static async startWorkSession(jobId: string, ustaiId: string, klientId: string) {
    const data = await pb.collection('work_sessions').create({
      job_id: jobId,
      ustai_id: ustaiId,
      klient_id: klientId,
      status: 'ne_proces'
    });

    return data;
  }

  /**
   * Nis gjurmimin e vendndodhjes dhe e RUAN abonimin, që stopLocationTracking()
   * ta mbyllë vërtet. Më parë fusha ishte statike bosh dhe nuk ndalonte asgjë.
   */
  static async startLocationTracking(sessionId: string, intervalMs = 30000) {
    await this.stopLocationTracking();
    try {
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: intervalMs },
        (pozicioni) => {
          this.updateLocation(sessionId, {
            lat: pozicioni.coords.latitude,
            lng: pozicioni.coords.longitude,
          }).catch((error) => console.warn('Përditësimi i vendndodhjes dështoi.', error));
        }
      );
      this.locationSubscription = subscription;
      return subscription;
    } catch (error) {
      console.warn('Gjurmimi i vendndodhjes nuk u nis.', error);
      return null;
    }
  }

  /**
   * Përditëso vendndodhjen
   */
  static async updateLocation(sessionId: string, coords: { lat: number; lng: number }) {
    try {
      await pb.collection('work_updates').create({
        session_id: sessionId,
        vendndodhja: JSON.stringify(coords) // PocketBase nuk ka tip gjeometrik fiks si Supabase, zakonisht ruhet JSON ose fusha lat/lng
      });
    } catch (error) {
      console.error('Gabim në përditësimin e vendndodhjes:', error);
    }
  }

  /**
   * Përditëso statusin e sesionit
   */
  static async updateSessionStatus(sessionId: string, status: 'ne_pritje' | 'ne_proces' | 'pezulluar' | 'kompletuar') {
    const updates: any = { status };
    if (status === 'kompletuar') {
      updates.mbaruar_me = new Date().toISOString();
    }

    try {
      await pb.collection('work_sessions').update(sessionId, updates);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Përditëso progresin
   */
  static async updateProgress(sessionId: string, percent: number, message?: string) {
    try {
      await pb.collection('work_updates').create({
        session_id: sessionId,
        progres_perqindje: percent,
        mesazh: message
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Shto foto gjatë punës
   */
  static async addPhoto(sessionId: string, lloji: 'para' | 'gjat' | 'pas', photoUrl: string) {
    // photoUrl MË PARË nuk përdorehej fare — fotot nuk shkruheshin kurrë.
    await pb.collection('work_updates').create({
      session_id: sessionId,
      mesazh: `Foto ${lloji}`,
      foto_url: photoUrl,
    });
  }

  /**
   * Merr sesionet aktive për klientin
   */
  static async getActiveSessionsForClient(klientId: string) {
    try {
      const res = await pb.collection('work_sessions').getList(1, 50, {
        filter: `klient_id = '${klientId}' && status != 'kompletuar'`
      });
      return res.items || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Ndalo gjurmimin e vendndodhjes (client-side)
   */
  static stopLocationTracking() {
    if (this.locationSubscription) {
      try {
        this.locationSubscription.remove();
      } catch (error) {
        console.warn('Abonimi i vendndodhjes nuk u hoq.', error);
      }
      this.locationSubscription = null;
    }
  }

  /**
   * Gjenero raport sesioni
   */
  static async generateSessionReport(sessionId: string) {
    try {
      const session = await pb.collection('work_sessions').getOne(sessionId);
      return session;
    } catch (e) {
      return null;
    }
  }
}
