// AI — Ollama lokale (me fallback automatik offline nëse serveri nuk arrihet).
import { thirrAI } from './ollama';

export interface AIDiagnosisResult {
  kategoria_sugjeruar: string;
  pershkrimi_teknik: string;
  materialet_e_nevojshme: string[];
  urgjenca_sugjeruar: 'e_ulet' | 'mesatare' | 'e_larte';
}

/**
 * Thirrja e përbashkët: Ollama lokale, me fallback demo kur serveri mungon.
 */
function aiChatDiagnosis(prompt: string, imageBase64?: string): Promise<any> {
  return thirrAI(prompt, imageBase64, 0.1);
}

const URGJENCAT = ['e_ulet', 'mesatare', 'e_larte'] as const;

/**
 * Modeli mund të kthejë JSON pakonforme. Pa këtë, ekrani bën .map() mbi
 * materialet_e_nevojshme undefined → "TypeError: undefined is not iterable".
 */
function validoDiagnoze(raw: any): AIDiagnosisResult | null {
  if (!raw || typeof raw !== 'object') return null;

  const materialet = Array.isArray(raw.materialet_e_nevojshme)
    ? raw.materialet_e_nevojshme.filter((m: unknown) => typeof m === 'string' && m.trim() !== '')
    : [];

  const urgjenca = URGJENCAT.find((u) => u === raw.urgjenca_sugjeruar);

  return {
    kategoria_sugjeruar: typeof raw.kategoria_sugjeruar === 'string' ? raw.kategoria_sugjeruar : '',
    pershkrimi_teknik: typeof raw.pershkrimi_teknik === 'string' ? raw.pershkrimi_teknik : '',
    materialet_e_nevojshme: materialet,
    urgjenca_sugjeruar: urgjenca ?? 'mesatare',
  };
}

export class AIDiagnosisService {
  static async analyzeProblem(base64Image: string): Promise<AIDiagnosisResult | null> {
    try {
      const prompt = 'Je nje ekspert ndertimi dhe riparimesh shtepiake ne Shqiperi.\n' +
        'Analizo kete foto te nje problemi ne shtepi dhe kthe JSON:\n' +
        '{ "kategoria_sugjeruar": "Emri i kategorise", "pershkrimi_teknik": "Pershkrim", "materialet_e_nevojshme": ["Mat1", "Mat2"], "urgjenca_sugjeruar": "e_ulet" | "mesatare" | "e_larte" }\n' +
        'Pergjigju VETEM me JSON. Gjuha: Shqip.';
      const raw = await aiChatDiagnosis(prompt, base64Image);
      const rez = validoDiagnoze(raw);
      if (!rez) {
        console.warn('AI Diagnosis ktheu përgjigje të pavlefshme.');
        return null;
      }
      return rez;
    } catch (error) {
      console.error('AI Diagnosis Error:', error);
      return null;
    }
  }
}
