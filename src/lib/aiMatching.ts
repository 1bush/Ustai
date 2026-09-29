import { pb } from '@/lib/pocketbase';

export interface MatchingWeights {
  pesha_kategorise: number;
  pesha_vendndodhjes: number;
  pesha_vleresimit: number;
  pesha_cmimit: number;
}

export class AIMatchingService {
  /** Escapon një vlerë për filter-in e PocketBase; pa këtë, një `'` thyen filtrin. */
  private static escape(vleri: unknown): string {
    return String(vleri ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /**
   * Gjen 10 ustallarët më të përshtatshëm për një punë
   * Përdor peshat e dhëna për renditjen finale (më parë injoroheheshin plotësisht).
   */
  static async findBestMatches(jobId: string, customWeights?: MatchingWeights) {
    try {
      const job = await pb.collection('jobs').getOne(jobId);
      if (!job?.category_id) return [];

      const res = await pb.collection('profiles').getList(1, 50, {
        filter: `role = 'ustai' && category_id = '${this.escape(job.category_id)}'`,
        sort: '-rating'
      });

      const ustallet = res.items || [];
      if (!customWeights || ustallet.length === 0) return ustallet.slice(0, 10);

      // Renditje e peshuar: vlerësimi mbi të gjitha, me pesha të normalizuara.
      const shumaPeshave = (Object.values(customWeights) as number[]).reduce((a, b) => a + (b || 0), 0) || 1;
      const pNorm = (k: keyof MatchingWeights) => (customWeights[k] || 0) / shumaPeshave;

      const meScore = ustallet.map((u: any) => {
        const vleresimi = Number(u.rating) || 0;
        const cmimi = Number(u.cmimi_mesatar ?? job.cmimi) || 0;
        // Cmimi më i ulët = më i mirë; normalizohet në 0..1.
        const cmimiNorm = cmimi > 0 ? 1 / cmimi : 0;
        return {
          ...u,
          _score:
            pNorm('pesha_vleresimit') * (vleresimi / 5) +
            pNorm('pesha_kategorise') * 1 +
            pNorm('pesha_cmimit') * cmimiNorm,
        };
      });

      return meScore.sort((a: any, b: any) => b._score - a._score).slice(0, 10);
    } catch (error) {
      console.error('Gabim në gjetjen e përputhjeve:', error);
      return [];
    }
  }

  /**
   * Rekomandime të personalizuara bazuar në historikun e klientit
   */
  static async getPersonalizedRecommendations(klientId: string) {
    try {
      // 1. Gjej kategoritë që klienti ka përdorur më shumë
      const resJobs = await pb.collection('jobs').getList(1, 50, {
        filter: `klient_id = '${this.escape(klientId)}'`
      });
      const previousJobs = resJobs.items;

      if (!previousJobs || previousJobs.length === 0) return [];

      const categoryCounts = previousJobs.reduce((acc: any, job: any) => {
        acc[job.category_id] = (acc[job.category_id] || 0) + 1;
        return acc;
      }, {});

      const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

      // 2. Gjej ustallarët më të mirë në këtë kategori
      const resUstai = await pb.collection('profiles').getList(1, 5, {
        filter: `role = 'ustai' && category_id = '${this.escape(topCategory)}'`,
        sort: '-rating'
      });

      return resUstai.items || [];
    } catch (e) {
      console.error('Gabim në rekomandime:', e);
      return [];
    }
  }
}
