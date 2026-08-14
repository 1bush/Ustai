// Groq AI Key - Më i shpejtë se Gemini për analizë
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export interface AIDiagnosisResult {
  kategoria_sugjeruar: string;
  pershkrimi_teknik: string;
  materialet_e_nevojshme: string[];
  urgjenca_sugjeruar: 'e_ulet' | 'mesatare' | 'e_larte';
}

export class AIDiagnosisService {
  /**
   * Analizon foton e problemit duke përdorur Groq AI (Llama 3.2 Vision).
   */
  static async analyzeProblem(base64Image: string): Promise<AIDiagnosisResult | null> {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('VENDOS')) {
      console.warn('Groq API Key mungon ose është placeholder.');
      return null;
    }

    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';

      const prompt = `
        Je një ekspert ndërtimi dhe riparimesh shtëpiake në Shqipëri.
        Analizo këtë foto të një problemi në shtëpi dhe kthe një përgjigje në formatin JSON saktësisht si ky bllok:
        {
          "kategoria_sugjeruar": "Emri i kategorisë (p.sh. Hidraulik, Elektricist, etj)",
          "pershkrimi_teknik": "Një përshkrim i shkurtër teknik i asaj që sheh",
          "materialet_e_nevojshme": ["Materiali 1", "Materiali 2"],
          "urgjenca_sugjeruar": "e_ulet" | "mesatare" | "e_larte"
        }
        Përgjigju VETËM me JSON, pa tekst tjetër. Gjuha: Shqip.
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error('Përgjigje e zbrazët nga Groq');
      }

      const content = data.choices[0].message.content;
      return JSON.parse(content);

    } catch (error) {
      console.error('Groq AI Diagnosis Error:', error);
      return null;
    }
  }
}
