import { pb } from '@/lib/pocketbase';

export class AISchedulingService {
  /**
   * Krijo një slot disponueshmërie
   */
  static async createSlot(ustaiId: string, date: string, startTime: string, endTime: string) {
    try {
      // Kontrollo për konflikte
      const res = await pb.collection('scheduling_slots').getList(1, 100, {
        filter: `ustai_id = '${ustaiId}' && data = '${date}'`
      });

      const conflicts = res.items.filter((s: any) => {
        return (s.ora_fillimit <= startTime && s.ora_mbarimit > startTime) ||
               (s.ora_fillimit < endTime && s.ora_mbarimit >= endTime);
      });

      if (conflicts.length > 0) throw new Error('Ky slot ka konflikt me një tjetër ekzistues.');

      const data = await pb.collection('scheduling_slots').create({
        ustai_id: ustaiId,
        data: date,
        ora_fillimit: startTime,
        ora_mbarimit: endTime
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Merr slotet e një ustai
   */
  static async getSlots(ustaiId: string, startDate?: string) {
    try {
      let filter = `ustai_id = '${ustaiId}'`;
      if (startDate) {
        filter += ` && data >= '${startDate}'`;
      }

      const res = await pb.collection('scheduling_slots').getList(1, 50, {
        filter,
        sort: 'data,ora_fillimit'
      });

      return res.items || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fshij një slot
   */
  static async deleteSlot(slotId: string) {
    try {
      await pb.collection('scheduling_slots').delete(slotId);
    } catch (error) {
      throw error;
    }
  }
}
