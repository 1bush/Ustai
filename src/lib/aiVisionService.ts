// AI — Ollama lokale (me fallback automatik offline nëse serveri nuk arrihet).
import { thirrAI } from './ollama';
import { AIFailedError } from './errors';

export interface AIEstimate {
  materialet: { emri: string; sasia: string; kosto_afersisht: string }[];
  puna_dore: string;
  total_afersisht: string;
  kohezgjatja: string;
}

export interface AIRoomScan {
  lloji: string;
  dimensionet_afersisht: { gjeresi: number; gjatesi: number; lartesi: number };
  sygjerime_dizajni: string[];
  planimetria_svg_data: string;
}

export interface AIFixture {
  emri: string;
  pozicioni_sugjeruar: string;
  arsyeja: string;
}

export interface AIBathroomDesign {
  lloji: string;
  dimensionet: { gjeresi: number; gjatesi: number };
  vendosja_elementeve: AIFixture[];
  stili_sugjeruar: string;
}

export interface AIRoomPlan {
  lloji_dhomes: 'kuzhine' | 'dhome_gjumi' | 'tualet' | 'kopsht';
  dimensionet: { gjeresi: number; gjatesi: number };
  vendosja_elementeve: AIFixture[];
  stili_sugjeruar: string;
  ngjyrat_rekomanduara: string[];
}

/** Rezultati i matjes se planimetrise */
export interface AIRoomMeasurement {
  lloji_hapesires: string;
  dimensionet_m: { muri: string; gjatesia_m: number }[];
  siperfaqja_m2: number;
  perimetri_m: number;
  forma: string;
  zgjedhje_murale: string;
}

/** Thirrje e AI (Ollama, me fallback demo); kthen objekt ose hedh AIFailedError. */
async function aiChat(prompt: string, imageBase64?: string): Promise<unknown> {
  try {
    return await thirrAI(prompt, imageBase64);
  } catch (e) {
    // Në vend që të hidhet një mesazh i papërpunuar, hidhet një gabim i tipizuar.
    throw new AIFailedError(undefined, e);
  }
}

/* ──────────────────────────────────────────────────────────────
 * Ndihmës validimi.
 * Përgjigja e modelit AI është "external input" — duhet validuar
 * përpara përdorimit (sipas `react-native-patterns`). Këto funksione
 * kthejnë një rezultat të sigurt të tipizuar; forma e gabuar filtrohet.
 * ────────────────────────────────────────────────────────────── */
function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function janNr(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function janTekst(value: unknown): value is string {
  return typeof value === 'string';
}

function siListeTekstesh(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(janTekst) : [];
}

function siListeFiksuesish(value: unknown): AIFixture[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isObj)
    .map((v) => ({
      emri: janTekst(v['emri']) ? v['emri'] : '',
      pozicioni_sugjeruar: janTekst(v['pozicioni_sugjeruar']) ? v['pozicioni_sugjeruar'] : '',
      arsyeja: janTekst(v['arsyeja']) ? v['arsyeja'] : '',
    }))
    .filter((f) => f.emri !== '');
}

function validoPlan(paras: unknown): AIRoomPlan | null {
  if (!isObj(paras)) return null;
  const d = paras['dimensionet'];
  if (!isObj(d) || !janNr(d['gjeresi']) || !janNr(d['gjatesi'])) return null;
  return {
    lloji_dhomes: janTekst(paras['lloji_dhomes'])
      ? (paras['lloji_dhomes'] as AIRoomPlan['lloji_dhomes'])
      : 'dhome_gjumi',
    dimensionet: { gjeresi: d['gjeresi'], gjatesi: d['gjatesi'] },
    vendosja_elementeve: siListeFiksuesish(paras['vendosja_elementeve']),
    stili_sugjeruar: janTekst(paras['stili_sugjeruar']) ? paras['stili_sugjeruar'] : '',
    ngjyrat_rekomanduara: siListeTekstesh(paras['ngjyrat_rekomanduara']),
  };
}

function validoTualet(paras: unknown): AIBathroomDesign | null {
  if (!isObj(paras)) return null;
  const d = paras['dimensionet'];
  if (!isObj(d) || !janNr(d['gjeresi']) || !janNr(d['gjatesi'])) return null;
  return {
    lloji: janTekst(paras['lloji']) ? paras['lloji'] : 'tualet',
    dimensionet: { gjeresi: d['gjeresi'], gjatesi: d['gjatesi'] },
    vendosja_elementeve: siListeFiksuesish(paras['vendosja_elementeve']),
    stili_sugjeruar: janTekst(paras['stili_sugjeruar']) ? paras['stili_sugjeruar'] : '',
  };
}

function validoPreventiv(paras: unknown): AIEstimate | null {
  if (!isObj(paras) || !Array.isArray(paras['materialet'])) return null;
  return {
    materialet: paras['materialet']
      .filter(isObj)
      .map((m) => ({
        emri: janTekst(m['emri']) ? m['emri'] : '',
        sasia: janTekst(m['sasia']) ? m['sasia'] : '',
        kosto_afersisht: janTekst(m['kosto_afersisht']) ? m['kosto_afersisht'] : '',
      }))
      .filter((m) => m.emri !== ''),
    puna_dore: janTekst(paras['puna_dore']) ? paras['puna_dore'] : '',
    total_afersisht: janTekst(paras['total_afersisht']) ? paras['total_afersisht'] : '',
    kohezgjatja: janTekst(paras['kohezgjatja']) ? paras['kohezgjatja'] : '',
  };
}

function validoSkanim(paras: unknown): AIRoomScan | null {
  if (!isObj(paras)) return null;
  const d = paras['dimensionet_afersisht'];
  // Kushte: gjeresi/gjatesi nuk mund të jenë 0 — UI-ja ndan me to (NaN / Infinity).
  const gjeresi = isObj(d) && janNr(d['gjeresi']) && d['gjeresi'] > 0 ? d['gjeresi'] : 0.1;
  const gjatesi = isObj(d) && janNr(d['gjatesi']) && d['gjatesi'] > 0 ? d['gjatesi'] : 0.1;
  const lartesi = isObj(d) && janNr(d['lartesi']) && d['lartesi'] > 0 ? d['lartesi'] : 2.8;
  return {
    lloji: janTekst(paras['lloji']) ? paras['lloji'] : '',
    dimensionet_afersisht: isObj(d)
      ? { gjeresi, gjatesi, lartesi }
      : { gjeresi, gjatesi, lartesi },
    sygjerime_dizajni: siListeTekstesh(paras['sygjerime_dizajni']),
    planimetria_svg_data: janTekst(paras['planimetria_svg_data']) ? paras['planimetria_svg_data'] : '',
  };
}

function validoMatje(paras: unknown): AIRoomMeasurement | null {
  if (!isObj(paras)) return null;
  return {
    lloji_hapesires: janTekst(paras['lloji_hapesires']) ? paras['lloji_hapesires'] : '',
    dimensionet_m: Array.isArray(paras['dimensionet_m'])
      ? paras['dimensionet_m']
          .filter(isObj)
          .map((m) => ({
            muri: janTekst(m['muri']) ? m['muri'] : '',
            gjatesia_m: janNr(m['gjatesia_m']) ? m['gjatesia_m'] : 0,
          }))
          .filter((m) => m.muri !== '')
      : [],
    // siperfaqja_m2 nuk mund të jetë 0 — përdoruesi e ndan për cm²/m² (Infinity).
    siperfaqja_m2: janNr(paras['siperfaqja_m2']) && paras['siperfaqja_m2'] > 0 ? paras['siperfaqja_m2'] : 0.01,
    perimetri_m: janNr(paras['perimetri_m']) ? paras['perimetri_m'] : 0,
    forma: janTekst(paras['forma']) ? paras['forma'] : '',
    zgjedhje_murale: janTekst(paras['zgjedhje_murale']) ? paras['zgjedhje_murale'] : '',
  };
}


export class AIVisionService {
  static async planifikoHapesiren(base64Image: string, lloji: 'kuzhine' | 'dhome_gjumi' | 'tualet' | 'kopsht'): Promise<AIRoomPlan | null> {
    try {
      const prompt = 'Analizo kete foto te nje hapesire per: ' + lloji + '.\n' +
        '1. Percakto dimensionet e peraferta (gjeresi x gjatesi ne metra).\n' +
        '2. Sugjero vendosjen ideale per elementet kryesore.\n' +
        '3. Percakto nje stil modern dhe 3 ngjyra kryesore.\n' +
        'Kthe JSON: { "lloji_dhomes": "' + lloji + '", "dimensionet": {"gjeresi": 0, "gjatesi": 0}, "vendosja_elementeve": [{"emri": "Emri", "pozicioni_sugjeruar": "Pozicioni", "arsyeja": "Arsyeja"}], "stili_sugjeruar": "Stili", "ngjyrat_rekomanduara": ["#hex1", "#hex2", "#hex3"] }';
      return validoPlan(await aiChat(prompt, base64Image));
    } catch (e) {
      console.error('Room Planner Error:', e);
      return null;
    }
  }

  static async planifikoTualetin(base64Image: string): Promise<AIBathroomDesign | null> {
    try {
      const prompt = 'Analizo kete foto te nje hapesire tualeti.\n' +
        '1. Percakto dimensionet e peraferta (gjeresi x gjatesi ne metra).\n' +
        '2. Sugjero vendosjen ideale per: Lavamanin, WC, Dushen/Vasken.\n' +
        '3. Percakto nje stil modern.\n' +
        'Kthe JSON: { "lloji": "tualet", "dimensionet": {"gjeresi": 0, "gjatesi": 0}, "vendosja_elementeve": [{"emri": "Emri", "pozicioni_sugjeruar": "Pozicioni", "arsyeja": "Arsyeja"}], "stili_sugjeruar": "Stili" }';
      return validoTualet(await aiChat(prompt, base64Image));
    } catch (e) {
      console.error('Bathroom Planner Error:', e);
      return null;
    }
  }

  static async gjeneroPreventiv(base64Image: string, pershkrimi: string): Promise<AIEstimate | null> {
    try {
      const prompt = 'Analizo kete foto te nje pune ndertimi dhe pershkrimin: "' + pershkrimi + '".\n' +
        'Gjenero nje preventiv te detajuar ne JSON.\n' +
        'Kthe JSON: { "materialet": [{"emri": "Emri", "sasia": "Sasia", "kosto_afersisht": "Vlera ne Lek"}], "puna_dore": "Vlera e punes", "total_afersisht": "Shuma totale", "kohezgjatja": "Sa dite pune" }';
      return validoPreventiv(await aiChat(prompt, base64Image));
    } catch (e) {
      console.error('Preventiv Error:', e);
      return null;
    }
  }

  static async skanoDhomen(base64Image: string): Promise<AIRoomScan | null> {
    try {
      const prompt = 'Analizo kete foto dhome.\n' +
        '1. Llojin e dhomes (Banjo, Sallon, etj).\n' +
        '2. Dimensionet e peraferta (metra).\n' +
        '3. 3 Sygjerime te modeleve te fundit te dizajnit.\n' +
        'Kthe JSON: { "lloji": "Lloji", "dimensionet_afersisht": {"gjeresi": 0, "gjatesi": 0, "lartesi": 2.8}, "sygjerime_dizajni": ["Sygjerim 1", "Sygjerim 2", "Sygjerim 3"], "planimetria_svg_data": "pika per vizatim" }';
      return validoSkanim(await aiChat(prompt, base64Image));
    } catch (e) {
      console.error('Scan Error:', e);
      return null;
    }
  }

  /**
   * Mat dhome/banjo nga nje foto e planimetrise dhe llogarit m2.
   @param base64Image - Foto e planimetrise
   @param shtoDimensionReferimi - Nje dimension i njohur per shkallezim (psh. "muri i gjate 5m")
   */
  static async matHapesiren(base64Image: string, shtoDimensionReferimi: string = ''): Promise<AIRoomMeasurement | null> {
    try {
      const prompt = 'Analizo kete foto te nje planimetrie (panimetri) ndertimi.\n' +
        'Detyra:\n' +
        '1. Identifiko llojin e hapesires (dhome, banjo, kuzhine, sallon, etj).\n' +
        '2. Lexo cdo mur dhe gjatesine e tij ne metra.\n' +
        '3. Llogarisiperfaqjen totale ne m2 dhe perimetrin ne metra.\n' +
        '4. Percakto formen e hapesires (drejtekendshe, ne forme L, jo rregullte).\n' +
        '5. Sugjero zgjedhje murale (boje, letra, pllaka, etj) bazuar ne llojin e hapesires.\n' +
        (shtoDimensionReferimi ? 'Keto dimensione jane per referim: "' + shtoDimensionReferimi + '". Perdori per te shkalluar matjet.\n' : '') +
        'Kthe JSON: { "lloji_hapesires": "Lloji", "dimensionet_m": [{"muri": "Muri A", "gjatesia_m": 0}], "siperfaqja_m2": 0, "perimetri_m": 0, "forma": "drejtekendshe", "zgjedhje_murale": "sugjerimi" }';
      return validoMatje(await aiChat(prompt, base64Image));
    } catch (e) {
      console.error('Measure Error:', e);
      return null;
    }
  }
}
