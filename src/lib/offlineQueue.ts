import AsyncStorage from '@react-native-async-storage/async-storage';

type QueuedMutation = {
  id: string;
  collection: string;
  action: 'create' | 'update';
  recordId?: string;
  data: Record<string, unknown>;
  createdAt: string;
  attempts: number;
};

const QUEUE_KEY = 'ustai_offline_queue_v1';
let flushing = false;

export function isRetryableError(error: any) {
  const status = error?.status ?? error?.response?.status;
  return status === 0 || status === 408 || status === 429 || (typeof status === 'number' && status >= 500);
}

export async function enqueueMutation(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>) {
  const queue = await readQueue();
  const signature = JSON.stringify({ collection: mutation.collection, action: mutation.action, recordId: mutation.recordId, data: mutation.data });
  if (queue.some((item) => JSON.stringify({ collection: item.collection, action: item.action, recordId: item.recordId, data: item.data }) === signature)) return;
  queue.push({
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function pendingMutationCount() {
  return (await readQueue()).length;
}

export async function flushMutations(pb: any) {
  if (flushing || !pb || typeof pb.collection !== 'function') return;
  flushing = true;
  try {
    const queue = await readQueue();
    const remaining: QueuedMutation[] = [];
    for (const item of queue) {
      // Një 'update' pa recordId nuk mund të dërgohet — hiqet përgjithmonë.
      if (item.action === 'update' && !item.recordId) {
        console.warn('Mutacion pa recordId u hoq nga outbox.', item);
        continue;
      }
      try {
        const collection = pb.collection(item.collection);
        if (item.action === 'create') await collection.create(item.data);
        else await collection.update(item.recordId!, item.data);
      } catch (error) {
        const attempts = item.attempts + 1;
        // Bëhu vetëm deri në 5 përpjekje; pastaj hiqet, që outbox-i të mos rritet pafund.
        if (attempts >= 5) {
          console.warn('Mutacioni dështoi 5 herë; hiqet nga outbox.', item);
          continue;
        }
        remaining.push({ ...item, attempts });
      }
    }
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } finally {
    flushing = false;
  }
}

async function readQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Outbox-u nuk mund të lexohet.', error);
    return [];
  }
}
