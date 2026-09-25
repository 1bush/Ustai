/**
 * AI — OLLAMA (lokal), me fallback automatik offline.
 *
 * Pa API key cloud dhe pa asnjë shërbim të jashtëm: e gjithë AI-ja është lokale.
 * E gjithë AI-ja vjen nga serveri lokal Ollama.
 *
 * Sjellja:
 *   - Ollama i arritshëm  → përgjigje reale (JSON) nga modeli
 *   - Ollama i paarritshëm (i pa instaluar, pa rrjet, timeout) → kalon automatikisht
 *     te `thirrAILokale()` (të dhëna demo deterministe), kështu që aplikacioni nuk
 *     thyhet dhe ekranet AI mbeten të testueshme pa server.
 *   - Ollama përgjigjet por JSON-i është i pavlefshëm → GABIM i qartë, nuk fshihet
 *     pas të dhënave demo (përndryshe do të shfaqeshin përfundime të rreme).
 *
 * Konfigurimi (`.env`):
 *   EXPO_PUBLIC_OLLAMA_URL    default http://localhost:11434
 *   EXPO_PUBLIC_OLLAMA_MODEL  default llama3.2-vision:11b
 *
 * Rrugët e sakta:
 *   Android emulator  → http://10.0.2.2:11434
 *   Telefon real      → http://<IP-e-PC-se>:11434  (duhet `OLLAMA_HOST=0.0.0.0 ollama serve`)
 *   iOS simulator/web → http://localhost:11434
 */
import { thirrAILokale } from './localAI';

const OLLAMA_URL = (process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL || 'llama3.2-vision:11b';

/** Modelet vision 11B janë të ngadaltë në CPU — prandaj timeout i gjatë. */
const TIMEOUT_MS = 120000;

/** Konfigurimi aktiv, për diagnostikim / ekranet e testimit. */
export const OLLAMA_KONFIG = { url: OLLAMA_URL, model: OLLAMA_MODEL, timeoutMs: TIMEOUT_MS } as const;

/**
 * Gabim i shënuar "serveri nuk u arrit".
 * Përdoret flamur në vend të `instanceof` që të mos thyhet nëse klasa humbet
 * identitetin gjatë transpilimit.
 */
type GabimPaArritshme = Error & { paArritshme: true };

function gabimPaArritshme(mesazhi: string): GabimPaArritshme {
  const gabimi = new Error(mesazhi) as GabimPaArritshme;
  gabimi.paArritshme = true;
  return gabimi;
}

function eshtePaArritshme(error: unknown): boolean {
  return Boolean(error && (error as { paArritshme?: boolean }).paArritshme === true);
}

async function krijoKontrolluesin(ms: number) {
  if (typeof AbortController === 'undefined') return { kontrolluesi: null, pastro: () => {} };
  const kontrolluesi = new AbortController();
  const timer = setTimeout(() => kontrolluesi.abort(), ms);
  return { kontrolluesi, pastro: () => clearTimeout(timer) };
}

/**
 * Nxjerr JSON-in nga përgjigja e modelit.
 * Ndonjëherë modeli e mbështjell JSON-in me tekst, prandaj provohet edhe ekstraktimi.
 */
function nxirrJSON(teksti: string): unknown {
  try {
    return JSON.parse(teksti);
  } catch {
    const gjetja = teksti.match(/\{[\s\S]*\}/);
    if (gjetja) return JSON.parse(gjetja[0]);
    throw new Error('Ollama nuk ktheu JSON të vlefshëm.');
  }
}

/** Kontroll i shpejtë nëse Ollama përgjigjet (për diagnostikim / UI). */
export async function kontrolloOllama(): Promise<boolean> {
  const { kontrolluesi, pastro } = await krijoKontrolluesin(3000);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: kontrolluesi?.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    pastro();
  }
}

/**
 * Thirrje e papërpunuar ndaj Ollama (pa fallback).
 * Hedh gabim me `paArritshme: true` kur serveri nuk arrihet.
 */
export async function thirrOllamaAI(
  prompt: string,
  imageBase64?: string,
  temperature: number = 0.1
): Promise<any> {
  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    prompt,
    format: 'json',
    stream: false,
    options: { temperature },
  };

  if (imageBase64) {
    // Ollama pret vetëm pjesën e të dhënave, pa headerin 'data:image/...;base64,'
    body.images = [imageBase64.replace(/^data:image\/\w+;base64,/, '')];
  }

  const { kontrolluesi, pastro } = await krijoKontrolluesin(TIMEOUT_MS);
  let res: any;
  try {
    res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: kontrolluesi?.signal,
    });
  } catch (error) {
    throw gabimPaArritshme(`Ollama nuk u arrit në ${OLLAMA_URL}: ${error}`);
  } finally {
    pastro();
  }

  if (!res.ok) {
    // 404 = modeli mungon, 5xx = serveri i prishur → të dyja: i papërdorshëm.
    throw gabimPaArritshme(`Ollama API ${res.status} (${OLLAMA_URL}, modeli ${OLLAMA_MODEL})`);
  }

  const data = await res.json();
  if (typeof data?.response !== 'string') {
    throw new Error('Ollama nuk ktheu fushën "response".');
  }

  return nxirrJSON(data.response);
}

/**
 * Hyrja kryesore që përdorin shërbimet e aplikacionit.
 * Provo Ollama; nëse serveri nuk arrihet, bie në AI-në demo offline.
 */
export async function thirrAI(
  prompt: string,
  imageBase64?: string,
  temperature: number = 0.1
): Promise<any> {
  try {
    return await thirrOllamaAI(prompt, imageBase64, temperature);
  } catch (error) {
    if (eshtePaArritshme(error)) {
      console.warn(`[ai] Ollama e paarritshme (${OLLAMA_URL}) — kalohet në AI demo offline.`);
      return thirrAILokale(prompt, imageBase64, temperature);
    }
    console.error('[ai] Ollama u përgjigj, por përgjigja nuk u përpunua:', error);
    throw error;
  }
}
