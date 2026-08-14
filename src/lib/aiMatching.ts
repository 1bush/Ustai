import { pb } from '@/lib/pocketbase';

export interface MatchingWeights {
  pesha_kategorise: number;
  pesha_vendndodhjes: number;
  pesha_vleresimit: number;
  pesha_cmimit: number;
}

export class AIMatchingService {
  /**
   * Gjen 10 ustallarët më të përshtatshëm për një punë
   */
  static async findBestMatches(jobId: string, customWeights?: MatchingWeights) {
    try {
      const job = await pb.collection('jobs').getOne(jobId);
      const res = await pb.collection('profiles').getList(1, 10, {
        filter: `role = 'ustai' && category_id = '${job.category_id}'`,
        sort: '-rating'
      });

      return res.items || [];
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
        filter: `klient_id = '${klientId}'`
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
        filter: `role = 'ustai' && category_id = '${topCategory}'`,
        sort: '-rating'
      });

      return resUstai.items || [];
    } catch (e) {
      console.error('Gabim në rekomandime:', e);
      return [];
    }
  }
}
