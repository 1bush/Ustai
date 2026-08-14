const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

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

export class AIVisionService {
  /**
   * Planifikues Universal për Kuzhina, Dhoma Gjumi, Tualete dhe Kopshte.
   */
  static async planifikoHapesiren(base64Image: string, lloji: 'kuzhine' | 'dhome_gjumi' | 'tualet' | 'kopsht'): Promise<AIRoomPlan | null> {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const prompt = `
        Analizo këtë foto të një hapesire për: ${lloji}.
        Detyra:
        1. Përcakto dimensionet e përafërta (gjerësi x gjatësi në metra).
        2. Sugjero vendosjen ideale për elementet kryesore:
           - Nëse është kopsht: pemë dekorative, lule, stola, ndriçim, rrugica.
           - Nëse është kuzhinë: Frigorifer, Sobë, Lavaman.
           - Nëse është dhomë gjumi: Krevat, Dollap.
        3. Përcakto një stil modern dhe 3 ngjyra kryesore.
        Kthe përgjigjen VETËM si JSON bllok:
        {
          "lloji_dhomes": "${lloji}",
          "dimensionet": {"gjeresi": 0, "gjatesi": 0},
          "vendosja_elementeve": [
            {"emri": "Emri", "pozicioni_sugjeruar": "Pozicioni", "arsyeja": "Arsyeja"}
          ],
          "stili_sugjeruar": "Stili",
          "ngjyrat_rekomanduara": ["#hex1", "#hex2", "#hex3"]
        }
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Room Planner Error:', e);
      return null;
    }
  }

  /**
   * Gjeneron një planimetri dhe vendosje elementesh për tualetin.
   */
  static async planifikoTualetin(base64Image: string): Promise<AIBathroomDesign | null> {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const prompt = `
        Analizo këtë foto të një hapësire tualeti (ose vendi ku do bëhet).
        Detyra:
        1. Përcakto dimensionet e përafërta (gjerësi x gjatësi në metra).
        2. Sugjero vendosjen ideale për: Lavamanin, WC, Dushen/Vaskën.
        3. Përcakto një stil modern (psh. Industrial, Minimalist).
        Kthe përgjigjen VETËM si JSON bllok:
        {
          "lloji": "Tualet",
          "dimensionet": {"gjeresi": 2.5, "gjatesi": 3.0},
          "vendosja_elementeve": [
            {"emri": "WC", "pozicioni_sugjeruar": "Këndi majtas mbrapa", "arsyeja": "Për optimizim hapësire dhe afërsi me shkarkimin"},
            {"emri": "Lavaman", "pozicioni_sugjeruar": "Përballë derës", "arsyeja": "Për akses të shpejtë dhe estetikë"},
            {"emri": "Dush", "pozicioni_sugjeruar": "Këndi djathtas", "arsyeja": "Izolim i lagështisë"}
          ],
          "stili_sugjeruar": "Emri i stilit dhe ngjyrat"
        }
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Bathroom Planner Error:', e);
      return null;
    }
  }

  /**
   * Gjeneron një preventiv të detajuar bazuar në foto dhe përshkrim.
   */
  static async gjeneroPreventiv(base64Image: string, pershkrimi: string): Promise<AIEstimate | null> {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const prompt = `
        Analizo këtë foto të një pune ndërtimi dhe përshkrimin: "${pershkrimi}".
        Gjenero një preventiv të detajuar në formatin JSON:
        {
          "materialet": [{"emri": "Emri", "sasia": "Sasia (psh 5 thase)", "kosto_afersisht": "Vlera ne Lek"}],
          "puna_dore": "Vlera e punes se dores",
          "total_afersisht": "Shuma totale",
          "kohezgjatja": "Sa dite punë"
        }
        Përgjigju VETËM me JSON. Gjuha: Shqip.
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Preventiv Error:', e);
      return null;
    }
  }

  /**
   * Skanon dhomën për të gjetur llojin, përmasat dhe sugjerimet.
   */
  static async skanoDhomen(base64Image: string): Promise<AIRoomScan | null> {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const prompt = `
        Analizo këtë foto dhome. Përcakto:
        1. Llojin e dhomës (Banjo, Sallon, etj).
        2. Dimensionet e përafërta (metra).
        3. 3 Sygjerime të modeleve të fundit të dizajnit për këtë hapësirë.
        Kthe JSON:
        {
          "lloji": "Lloji",
          "dimensionet_afersisht": {"gjeresi": 0, "gjatesi": 0, "lartesi": 2.8},
          "sygjerime_dizajni": ["Sygjerim 1", "Sygjerim 2", "Sygjerim 3"],
          "planimetria_svg_data": "pika per vizatim"
        }
        Përgjigju VETËM me JSON.
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Scan Error:', e);
      return null;
    }
  }
}
