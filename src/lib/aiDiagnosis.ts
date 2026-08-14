// Ollama - AI lokal (pa API key)
// Shkarko: https://ollama.com, modelo: llama3.2-vision:11b
const OLLAMA_URL = process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL || 'llama3.2-vision:11b';

export interface AIDiagnosisResult {
  kategoria_sugjeruar: string;
  pershkrimi_teknik: string;
  materialet_e_nevojshme: string[];
  urgjenca_sugjeruar: 'e_ulet' | 'mesatare' | 'e_larte';
}

export class AIDiagnosisService {
  /**
   * Analizon foton e problemit duke perdorur Ollama (Llama 3.2 Vision lokal).
   */
  static async analyzeProblem(base64Image: string): Promise<AIDiagnosisResult | null> {
    try {
      const prompt = `Je nje ekspert ndertimi dhe riparimesh shtepiake ne Shqiperi.
Analizo kete foto te nje problemi ne shtepi dhe kthe nje pergjigje ne formatin JSON:
{
  "kategoria_sugjeruar": "Emri i kategorise (p.sh. Hidraulik, Elektricist)",
  "pershkrimi_teknik": "Pershkrim i shkurter teknik",
  "materialet_e_nevojshme": ["Materiali 1", "Materiali 2"],
  "urgjenca_sugjeruar": "e_ulet" | "mesatare" | "e_larte"
}
Pergjigju VETEM me JSON. Gjuha: Shqip.`;

      const res = await fetch(OLLAMA_URL + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          images: [base64Image],
          stream: false,
          format: 'json',
        }),
      });

      const data = await res.json();
      if (!data.response) throw new Error('Ollama nuk u pergjigj');
      return JSON.parse(data.response);

    } catch (error) {
      console.error('Ollama Diagnosis Error:', error);
      return null;
    }
  }
}
