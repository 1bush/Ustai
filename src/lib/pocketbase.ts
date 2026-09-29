import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase from 'pocketbase';
import Constants from 'expo-constants';
import { enqueueMutation, isRetryableError } from './offlineQueue';

const STORAGE_KEY = 'pb_auth_v1';
const configuredUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL?.trim();
const isReal = Boolean(configuredUrl);

function createPb() {
  if (!isReal) return null;
  const baseUrl = configuredUrl!.replace(/\/$/, '');
  const client = new PocketBase(baseUrl);
  if (Constants.expoConfig?.extra?.pbUrl) {
    // The URL is already injected through EXPO_PUBLIC_POCKETBASE_URL.
    void Constants.expoConfig.extra.pbUrl;
  }
  return client;
}

const realPb: PocketBase | null = createPb();

class MockAuthStore {
  token: string | null = null;
  model: any = null;
  private listeners = new Set<(token: string | null, model: any) => void>();

  save(token: string, model: any) {
    this.token = token;
    this.model = model;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, model, mock: true })).catch((error) => {
      console.warn('Sesioni lokal nuk u ruajt.', error);
    });
    this.listeners.forEach((listener) => listener(token, model));
  }

  clear() {
    this.token = null;
    this.model = null;
    AsyncStorage.removeItem(STORAGE_KEY).catch((error) => console.warn('Sesioni lokal nuk u pastrua.', error));
    this.listeners.forEach((listener) => listener(null, null));
  }

  loadFromCookie(_data: string) {}
  onChange(callback: (token: string | null, model: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

class MockCollection {
  private subscribers = new Map<string, (event: any) => void>();
  /** Zinxhir i promisave — pengon humbjen e regjistrave kur create() quhet njëkohësisht. */
  private writeChain: Promise<any> = Promise.resolve();

  constructor(private name: string, private notify: (event: any) => void) {}

  registerSubscriber(topic: string, callback: (event: any) => void) {
    // Regjistro PA mbivendosur notify-n: mban të gjitha subscriptions të gjallë.
    this.subscribers.set(topic, callback);
  }

  private emit(event: any) {
    const perTopic = this.subscribers.get('*');
    if (perTopic) perTopic(event);
    this.notify(event);
  }

  private storageKey() { return `mock_pb_${this.name}`; }
  private async records(): Promise<any[]> {
    const raw = await AsyncStorage.getItem(this.storageKey());
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`Të dhënat e "${this.name}" janë të dëmtuara; po fillojmë me listë bosh.`, error);
      return [];
    }
  }
  /** Serializon shkrimin: lejon që thirrjet paralele të mos mbivendosen. */
  private async persist(records: any[]) {
    this.writeChain = this.writeChain.then(() => AsyncStorage.setItem(this.storageKey(), JSON.stringify(records)));
    return this.writeChain;
  }
  async getFullList(options: any = {}): Promise<any[]> {
    const records = await this.records();
    if (options.sort) {
      const key = String(options.sort).split('-')[0];
      return [...records].sort((a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? '')));
    }
    return records;
  }
  async getList(_page = 1, _perPage = 20, _options?: any): Promise<{ items: any[]; totalItems: number }> {
    const items = await this.records();
    return { items, totalItems: items.length };
  }
  async getOne(id: string, _options?: any): Promise<any> {
    const record = (await this.records()).find((item) => item.id === id);
    if (!record) throw { status: 404, message: `MOCK: ${id} nuk u gjet.` };
    return record;
  }
  async getFirstListItem(filter: string, _options?: any): Promise<any> {
    const records = await this.records();
    const match = records.find((item) => filter.split('&&').every((part) => {
      const [key, raw] = part.split('=').map((value) => value.trim());
      return item[key] === raw.replaceAll('"', '');
    }));
    if (!match) throw { status: 404, message: 'MOCK: element nuk u gjet.' };
    return match;
  }
  async create(data: any): Promise<any> {
    const record = { id: `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`, created: new Date().toISOString(), ...data };
    await this.persist([...(await this.records()), record]);
    this.emit({ action: 'create', record });
    return record;
  }
  async update(id: string, data: any): Promise<any> {
    const records = await this.records();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) throw { status: 404, message: `MOCK: ${id} nuk u gjet.` };
    const record = { ...records[index], ...data, id, updated: new Date().toISOString() };
    records[index] = record;
    await this.persist(records);
    this.emit({ action: 'update', record });
    return record;
  }
  async delete(id: string): Promise<boolean> {
    await this.persist((await this.records()).filter((item) => item.id !== id));
    return true;
  }
  async subscribe(topic: string, callback: (event: any) => void): Promise<() => void> {
    this.registerSubscriber(topic, callback);
    // Kthen funksion që heq VETËM këtë subscriber (përndryshe zhduken të gjitha).
    return () => { this.subscribers.delete(topic); };
  }
  async unsubscribe(topic = '*'): Promise<void> { this.subscribers.delete(topic); }
  async authWithPassword(_username: string, _password: string): Promise<any> {
    throw { status: 0, message: 'MOCK: autentikimi real kërkon EXPO_PUBLIC_POCKETBASE_URL.' };
  }
  async authWithOAuth(_options: any): Promise<any> {
    throw { status: 0, message: 'MOCK: OAuth kërkon PocketBase real.' };
  }
}

class MockPocketBase {
  authStore = new MockAuthStore();
  private collectionSubscribers = new Set<(event: any) => void>();
  collection(_name: string) { return new MockCollection(_name, (event) => this.collectionSubscribers.forEach((fn) => fn(event))); }
  files = { getUrl: (_record: any, _file: any) => '' };
  health = { check: async () => ({ code: 200, message: 'MOCK: backend i konfiguruar? jo.' }) };
}

function withOfflineQueue(name: string, collection: any) {
  return new Proxy(collection, {
    get(target, property, receiver) {
      if (property === 'create') {
        return async (data: any) => {
          try {
            return await target.create(data);
          } catch (error) {
            if (!isRetryableError(error)) throw error;
            await enqueueMutation({ collection: name, action: 'create', data });
            return { id: `queued-${Date.now()}`, queued: true, ...data };
          }
        };
      }
      if (property === 'update') {
        return async (id: string, data: any) => {
          try {
            return await target.update(id, data);
          } catch (error) {
            if (!isRetryableError(error)) throw error;
            await enqueueMutation({ collection: name, action: 'update', recordId: id, data });
            return { id, queued: true, ...data };
          }
        };
      }
      if (property === 'delete') {
        return async (id: string) => {
          try {
            return await target.delete(id);
          } catch (error) {
            if (!isRetryableError(error)) throw error;
            await enqueueMutation({ collection: name, action: 'update', recordId: id, data: { _deleted: true } });
            return true;
          }
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

function proxyPocketBase(client: PocketBase) {
  return new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'collection') {
        return (name: string) => withOfflineQueue(name, target.collection(name));
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

export const isPocketBaseConfigured = isReal;
export const pb: any = realPb ? proxyPocketBase(realPb) : new MockPocketBase();

export const pbReady: Promise<void> = (async () => {
  if (realPb) {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) await (realPb.authStore as any).load(saved);
      realPb.authStore.onChange((token, model) => {
        const value = token && model ? JSON.stringify({ token, model }) : null;
        const action = value ? AsyncStorage.setItem(STORAGE_KEY, value) : AsyncStorage.removeItem(STORAGE_KEY);
        action.catch((error) => console.warn('Sesioni real nuk u ruajt.', error));
      });
    } catch (error) {
      console.warn('Sesioni real nuk mund të rikthehet; po vazhdohet pa sesion.', error);
    }
    return;
  }
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.token && parsed?.model) pb.authStore.save(parsed.token, parsed.model);
    }
  } catch (error) {
    console.warn('Sesioni i ruajtur nuk mund të lexohet; po vazhdohet pa sesion.', error);
  }
})();

export default pb;

