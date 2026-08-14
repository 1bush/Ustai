// Groq AI (cloud) + Ollama (lokal) - fallback automatik
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const OLLAMA_URL = process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL || 'llama3.2-vision:11b';

export interface AIDiagnosisResult {
  kategoria_sugjeruar: string;
  pershkrimi_teknik: string;
  materialet_e_nevojshme: string[];
  urgjenca_sugjeruar: 'e_ulet' | 'mesatare' | 'e_larte';
}

/** Groq (nese ka key) -> Ollama (fallback) */
async function aiChatDiagnosis(prompt: string, imageBase64?: string): Promise<any> {
  if (GROQ_API_KEY && !GROQ_API_KEY.includes('VENDOS')) {
    try {
      const body: any = {
        model: 'llama-3.2-11b-vision-preview',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      };
      if (imageBase64) {
        body.messages[0].content.push({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageBase64 } });
      }
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.choices && data.choices[0]) return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.warn('Groq deshtoi, kaloj ne Ollama:', e);
    }
  }

  const res = await fetch(OLLAMA_URL + '/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt: prompt + '\nPergjigju VETEM me JSON.', images: imageBase64 ? [imageBase64] : undefined, stream: false, format: 'json' }),
  });
  const data = await res.json();
  if (!data.response) throw new Error('Asnje AI nuk u pergjigj');
  return JSON.parse(data.response);
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
