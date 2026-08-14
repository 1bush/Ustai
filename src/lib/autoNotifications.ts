import { pb } from '@/lib/pocketbase';

export class AutoNotificationService {
  /**
   * Merr preferencat e njoftimeve
   */
  static async getNotificationPreferences(userId: string) {
    try {
      const res = await pb.collection('notification_preferences').getList(1, 1, {
        filter: `user_id = '${userId}'`
      });
      return res.items[0] || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Përditëso preferencat
   */
  static async updateNotificationPreferences(userId: string, prefs: any) {
    try {
      const existing = await this.getNotificationPreferences(userId);
      if (existing) {
        await pb.collection('notification_preferences').update(existing.id, prefs);
      } else {
        await pb.collection('notification_preferences').create({ user_id: userId, ...prefs });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Shto njoftim në radhë (Internal)
   */
  private static async queueNotification(userId: string, templateName: string, variables: any, lloji: 'sms' | 'email') {
    try {
      const template = await pb.collection('notification_templates').getFirstListItem(`emri = '${templateName}'`);

      if (!template) return;

      await pb.collection('notification_queue').create({
        user_id: userId,
        template_id: template.id,
        variabla: JSON.stringify(variables),
        lloji: lloji,
        status: 'ne_pritje'
      });
    } catch (e) {
      console.error('Gabim në queueNotification:', e);
    }
  }

  /**
   * Njofto për punë të re
   */
  static async notifyNewJob(jobId: string, ustaiIds: string[]) {
    for (const id of ustaiIds) {
      await this.queueNotification(id, 'pune_e_re', { jobId }, 'sms');
    }
  }

  /**
   * Njofto për ofertë të re
   */
  static async notifyNewBid(bidId: string, klientId: string) {
    await this.queueNotification(klientId, 'oferte_e_re', { bidId }, 'email');
  }

  /**
   * Proceso radhën e njoftimeve
   */
  static async processNotificationQueue() {
    try {
      const res = await pb.collection('notification_queue').getList(1, 10, {
        filter: "status = 'ne_pritje'"
      });
      const queueItems = res.items;

      if (!queueItems || queueItems.length === 0) return;

      for (const item of queueItems) {
        try {
          // Këtu do të ishte integrimi me Twilio/SendGrid
          // Në PocketBase mund të përdorim expand nese eshte konfiguruar,
          // ose t'i marrim manualisht si këtu
          const template = await pb.collection('notification_templates').getOne(item.template_id);
          console.log(`Duke dërguar ${item.lloji} te ${item.user_id}: ${template?.permbajtja}`);

          await pb.collection('notification_queue').update(item.id, {
            status: 'derguar',
            provuar_me: new Date().toISOString()
          });

          await pb.collection('notification_logs').create({
            user_id: item.user_id,
            lloji: item.lloji,
            template_name: template?.emri
          });
        } catch (e: any) {
          await pb.collection('notification_queue').update(item.id, {
            status: 'deshtuar',
            gabim: e.message,
            provuar_me: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('Gabim në processNotificationQueue:', e);
    }
  }

  static async notifyPaymentConfirmation(userId: string, amount: number, type: string) {
    await this.queueNotification(userId, 'konfirmim_pagese', { amount, type }, 'email');
  }

  static async notifyJobReminder(jobId: string, userId: string, daysBefore: number) {
    await this.queueNotification(userId, 'kujtese_pune', { jobId, daysBefore }, 'sms');
  }

  static async notifyJobCompletion(jobId: string, klientId: string, ustaiId: string) {
    await this.queueNotification(klientId, 'puna_perfundoi', { jobId }, 'email');
    await this.queueNotification(ustaiId, 'puna_perfundoi', { jobId }, 'sms');
  }

  static async getUnreadCount(userId: string) {
    try {
      const res = await pb.collection('notification_queue').getList(1, 1, {
        filter: `user_id = '${userId}' && status = 'ne_pritje'`
      });
      return res.totalItems || 0;
    } catch (e) {
      return 0;
    }
  }
}
