// AI lokale offline — Ollama është hequr nga projekti.
import { thirrAILokale } from './localAI';

export interface AIDiagnosisResult {
  kategoria_sugjeruar: string;
  pershkrimi_teknik: string;
  materialet_e_nevojshme: string[];
  urgjenca_sugjeruar: 'e_ulet' | 'mesatare' | 'e_larte';
}

/**
 * AI lokale (offline) — pa server dhe pa thirrje rrjeti.
 */
async function aiChatDiagnosis(prompt: string, imageBase64?: string): Promise<any> {
  return thirrAILokale(prompt, imageBase64, 0.1);
}

export class AIDiagnosisService {
  static async analyzeProblem(base64Image: string): Promise<AIDiagnosisResult | null> {
    try {
      const prompt = 'Je nje ekspert ndertimi dhe riparimesh shtepiake ne Shqiperi.\n' +
        'Analizo kete foto te nje problemi ne shtepi dhe kthe JSON:\n' +
        '{ "kategoria_sugjeruar": "Emri i kategorise", "pershkrimi_teknik": "Pershkrim", "materialet_e_nevojshme": ["Mat1", "Mat2"], "urgjenca_sugjeruar": "e_ulet" | "mesatare" | "e_larte" }\n' +
        'Pergjigju VETEM me JSON. Gjuha: Shqip.';
      return await aiChatDiagnosis(prompt, base64Image);
    } catch (error) {
      console.error('AI Diagnosis Error:', error);
      return null;
    }
  }
}
