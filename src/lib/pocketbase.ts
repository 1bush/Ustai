import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * MOCK LOKAL — PocketBase është HEQUR PËRKOHËSISHT (serveri nuk punon).
 * Ky modul ruan të njëjtin API sipërfaqësor (pb + pbReady) që të mos
 * thyhet asnjë import në app, por NUK bën asnjë thirrje rrjeti.
 * Të gjitha metodat kthejnë të dhëna boshe.
 *
 * Për ta rikthyer serverin real:
 *   Copy-Item src/lib/pocketbase.ts.REAL.BAK src/lib/pocketbase.ts -Force
 */

type Listener = (token: string | null, model: any) => void;

class MockAuthStore {
  token: string | null = null;
  model: any = null;
  private listeners = new Set<Listener>();

  save(token: string, model: any) {
    this.token = token;
    this.model = model;
    AsyncStorage.setItem('pb_auth_mock', JSON.stringify({ token, model })).catch(() => {});
    this.listeners.forEach((l) => l(token, model));
  }

  clear() {
    this.token = null;
    this.model = null;
    AsyncStorage.removeItem('pb_auth_mock').catch(() => {});
    this.listeners.forEach((l) => l(null, null));
  }

  loadFromCookie(_data: string) {}

  onChange(cb: Listener) {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }
}

class MockCollection {
  constructor(private name: string) {}
  async getFullList(_opts?: any): Promise<any[]> { return []; }
  async getList(_p = 1, _pp = 20, _o?: any): Promise<{ items: any[]; totalItems: number }> {
    return { items: [], totalItems: 0 };
  }
  async getOne(_id: string, _o?: any): Promise<any> {
    throw { status: 404, message: 'MOCK: serveri PocketBase është hequr (koleksioni ' + this.name + ')' };
  }
  async getFirstListItem(_f: string, _o?: any): Promise<any> {
    throw { status: 404, message: 'MOCK: serveri PocketBase është hequr (koleksioni ' + this.name + ')' };
  }
  async create(data: any): Promise<any> {
    return { id: 'mock-' + Date.now(), created: new Date().toISOString(), ...data };
  }
  async update(_id: string, data: any): Promise<any> {
    return { id: _id, ...data };
  }
  async delete(_id: string): Promise<boolean> { return true; }
  async subscribe(_t: string, _cb: (e: any) => void): Promise<void> {}
  async unsubscribe(_t?: string): Promise<void> {}
  async authWithPassword(_u: string, _p: string): Promise<any> {
    throw { status: 0, message: 'MOCK: login me server është hequr — përdor butonin ADMIN.' };
  }
  async authWithOAuth(_o: any): Promise<any> {
    throw { status: 0, message: 'MOCK: OAuth është hequr — përdor butonin ADMIN.' };
  }
}

class MockPocketBase {
  authStore = new MockAuthStore();
  collection(name: string) { return new MockCollection(name); }
  health = { check: async () => ({ message: 'MOCK: serveri është hequr', code: 200 }) };
  files = { getUrl: (_r: any, _f: any) => '' };
}

export const pb: any = new MockPocketBase();

export const pbReady: Promise<void> = (async () => {
  try {
    const data = await AsyncStorage.getItem('pb_auth_mock');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.token && parsed?.model) pb.authStore.save(parsed.token, parsed.model);
    }
  } catch (error) {
    console.warn('Sesioni i ruajtur nuk mund të lexohet; po vazhdohet pa sesion.', error);
  }
})();

export default pb;

