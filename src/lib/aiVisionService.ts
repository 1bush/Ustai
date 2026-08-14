// Ollama - AI lokal (pa API key)
// Shkarko: https://ollama.com, modelo: llama3.2-vision:11b
const OLLAMA_URL = process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.EXPO_PUBLIC_OLLAMA_MODEL || 'llama3.2-vision:11b';

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
  lloji_dhomes: "kuzhine" | "dhome_gjumi" | "tualet" | "kopsht";
  dimensionet: { gjeresi: number; gjatesi: number };
  vendosja_elementeve: AIFixture[];
  stili_sugjeruar: string;
  ngjyrat_rekomanduara: string[];
}

/** Thirrje e perbashket per Ollama me JSON output */
async function ollamaChat(prompt: string, imageBase64?: string): Promise<any> {
  const body: any = {
    model: OLLAMA_MODEL,
    prompt: prompt + "\nPergjigju VETEM me JSON, pa tekst tjeter.",
    stream: false,
    format: "json",
  };
  if (imageBase64) {
    body.images = [imageBase64];
  }
  const res = await fetch(OLLAMA_URL + "/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.response) throw new Error("Ollama nuk u pergjigj");
  return JSON.parse(data.response);
}

export class AIVisionService {
  static async planifikoHapesiren(base64Image: string, lloji: "kuzhine" | "dhome_gjumi" | "tualet" | "kopsht"): Promise<AIRoomPlan | null> {
    try {
      const prompt = "Analizo kete foto te nje hapesire per: " + lloji + ".\n" +
        "1. Percakto dimensionet e peraferta (gjeresi x gjatesi ne metra).\n" +
        "2. Sugjero vendosjen ideale per elementet kryesore.\n" +
        "3. Percakto nje stil modern dhe 3 ngjyra kryesore.\n" +
        "Kthe JSON: { \"lloji_dhomes\": \"" + lloji + "\", \"dimensionet\": {\"gjeresi\": 0, \"gjatesi\": 0}, \"vendosja_elementeve\": [{\"emri\": \"Emri\", \"pozicioni_sugjeruar\": \"Pozicioni\", \"arsyeja\": \"Arsyeja\"}], \"stili_sugjeruar\": \"Stili\", \"ngjyrat_rekomanduara\": [\"#hex1\", \"#hex2\", \"#hex3\"] }";
      return await ollamaChat(prompt, base64Image);
    } catch (e) {
      console.error("Room Planner Error:", e);
      return null;
    }
  }

  static async planifikoTualetin(base64Image: string): Promise<AIBathroomDesign | null> {
    try {
      const prompt = "Analizo kete foto te nje hapesire tualeti.\n" +
        "1. Percakto dimensionet e peraferta (gjeresi x gjatesi ne metra).\n" +
        "2. Sugjero vendosjen ideale per: Lavamanin, WC, Dushen/Vasken.\n" +
        "3. Percakto nje stil modern.\n" +
        "Kthe JSON: { \"lloji\": \"tualet\", \"dimensionet\": {\"gjeresi\": 0, \"gjatesi\": 0}, \"vendosja_elementeve\": [{\"emri\": \"Emri\", \"pozicioni_sugjeruar\": \"Pozicioni\", \"arsyeja\": \"Arsyeja\"}], \"stili_sugjeruar\": \"Stili\" }";
      return await ollamaChat(prompt, base64Image);
    } catch (e) {
      console.error("Bathroom Planner Error:", e);
      return null;
    }
  }

  static async gjeneroPreventiv(base64Image: string, pershkrimi: string): Promise<AIEstimate | null> {
    try {
      const prompt = "Analizo kete foto te nje pune ndertimi dhe pershkrimin: \"" + pershkrimi + "\".\n" +
        "Gjenero nje preventiv te detajuar ne JSON.\n" +
        "Kthe JSON: { \"materialet\": [{\"emri\": \"Emri\", \"sasia\": \"Sasia\", \"kosto_afersisht\": \"Vlera ne Lek\"}], \"puna_dore\": \"Vlera e punes\", \"total_afersisht\": \"Shuma totale\", \"kohezgjatja\": \"Sa dite pune\" }";
      return await ollamaChat(prompt, base64Image);
    } catch (e) {
      console.error("Preventiv Error:", e);
      return null;
    }
  }

  static async skanoDhomen(base64Image: string): Promise<AIRoomScan | null> {
    try {
      const prompt = "Analizo kete foto dhome.\n" +
        "1. Llojin e dhomes (Banjo, Sallon, etj).\n" +
        "2. Dimensionet e peraferta (metra).\n" +
        "3. 3 Sygjerime te modeleve te fundit te dizajnit.\n" +
        "Kthe JSON: { \"lloji\": \"Lloji\", \"dimensionet_afersisht\": {\"gjeresi\": 0, \"gjatesi\": 0, \"lartesi\": 2.8}, \"sygjerime_dizajni\": [\"Sygjerim 1\", \"Sygjerim 2\", \"Sygjerim 3\"], \"planimetria_svg_data\": \"pika per vizatim\" }";
      return await ollamaChat(prompt, base64Image);
    } catch (e) {
      console.error("Scan Error:", e);
      return null;
    }
  }
}
