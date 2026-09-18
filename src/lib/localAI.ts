/**
 * AI LOKALE (offline) — zëvendëson plotësisht Ollama.
 *
 * Ollama është HEQUR nga projekti:
 *   - nuk ka më server në localhost:11434 / asnjë URL OLLAMA
 *   - nuk ka më asnjë thirrje rrjeti nga ky modul
 *   - nuk ka më varësi nga shërbime të jashtme
 *
 * Moduli kthen të dhëna demo DETERMINISTE sipas llojit të prompt-it, kështu që
 * të gjitha ekranet AI (Diagnozë, Skanim, Planifikues, Preventiv, Matje) mund të
 * testohen pa internet dhe pa server.
 *
 * Forma e të dhënave përputhet me validuesit në `aiVisionService.ts`
 * (validoPlan / validoTualet / validoPreventiv / validoSkanim / validoMatje)
 * dhe me `AIDiagnosisResult` në `aiDiagnosis.ts`.
 *
 * Për të rikthyer Ollama-n real:
 *   Copy-Item src/lib/ollama.ts.REAL.BAK src/lib/ollama.ts -Force
 *   pastaj ktheji importet në `./ollama` dhe emrin `thirrOllamaAI`.
 */

/** Vonesa e simuluar (ms) që gjendjet "duke u ngarkuar" të vihen re në UI. */
const VONESA_SIMULIMI_MS = 350;

export type LlojiKerkesAI =
  | 'diagnoze'
  | 'skanim_dhome'
  | 'plan_dhome'
  | 'plan_tualeti'
  | 'preventiv'
  | 'matje_planimetrie'
  | 'e_panjohur';

/**
 * Klasifikon prompt-in në një lloj kërkese.
 *
 * Radha e kontrollit është e RËNDËSISHME: prompt-i i skanimit përmban fjalën
 * "planimetria_svg_data", ndaj ai kontrollohet përpara kontrollit të
 * "planimetri" (i cili i takon matjes së planimetrisë).
 */
export function klasifikoKerkesen(prompt: string): LlojiKerkesAI {
  const p = prompt.toLowerCase();
  if (p.includes('hapesire tualeti')) return 'plan_tualeti';
  if (p.includes('hapesire per:')) return 'plan_dhome';
  if (p.includes('foto dhome')) return 'skanim_dhome';
  if (p.includes('preventiv')) return 'preventiv';
  if (p.includes('planimetri')) return 'matje_planimetrie';
  if (p.includes('ekspert ndertimi')) return 'diagnoze';
  return 'e_panjohur';
}

/**
 * Përgjigje demo sipas llojit të kërkesës.
 * `kaImazh` përdoret vetëm për të dhënë kontekst në tekstin demo.
 */
function pergjigjeDemo(lloji: LlojiKerkesAI, kaImazh: boolean): Record<string, unknown> {
  const burimi = kaImazh ? 'nga foto e ngarkuar' : 'nga përshkrimi i dhënë';

  switch (lloji) {
    case 'diagnoze':
      return {
        kategoria_sugjeruar: 'Hidraulike',
        pershkrimi_teknik:
          `Bazuar ${burimi}, problemi duket të jetë një rrjedhje uji në lidhjen e ` +
          'tubit nën lavaman. Rekomandohet zëvendësimi i tubit fleksibël dhe ' +
          'rivendosja e lidhjes me teflon, plus kontroll i sifonit për bllokime.',
        materialet_e_nevojshme: [
          'Tub fleksibël 1/2"',
          'Teflon (shirit hidraulik)',
          'Silikon sanitar',
          'Çelës hidraulik',
        ],
        urgjenca_sugjeruar: 'mesatare',
      };

    case 'skanim_dhome':
      return {
        lloji: 'Sallon',
        dimensionet_afersisht: { gjeresi: 4.2, gjatesi: 5.6, lartesi: 2.8 },
        sygjerime_dizajni: [
          'Stil minimalist skandinav me mure të çelëta dhe dysheme druri',
          'Ndriçim indirekt me LED përgjatë tavanit për thellësi',
          'Zonë e veçantë punë/e leximi pranë dritares kryesore',
        ],
        planimetria_svg_data: '0,0 420,0 420,280 0,280',
      };

    case 'plan_dhome':
      return {
        lloji_dhomes: 'dhome_gjumi',
        dimensionet: { gjeresi: 4.0, gjatesi: 5.0 },
        vendosja_elementeve: [
          { emri: 'Krevat', pozicioni_sugjeruar: 'Muri verior, në qendër', arsyeja: 'Larg derës, më shumë privatësi' },
          { emri: 'Gardërobë', pozicioni_sugjeruar: 'Muri lindor', arsyeja: 'Shfrytëzon lartësinë e plotë të murit' },
          { emri: 'Komodinë', pozicioni_sugjeruar: 'Të dyja anët e krevatit', arsyeja: 'Akses i lehtë dhe simetri vizuale' },
        ],
        stili_sugjeruar: 'Modern minimal',
        ngjyrat_rekomanduara: ['#F5F5F0', '#8E9AAF', '#2E2E2E', '#C9A227'],
      };

    case 'plan_tualeti':
      return {
        lloji: 'tualet',
        dimensionet: { gjeresi: 2.2, gjatesi: 2.8 },
        vendosja_elementeve: [
          { emri: 'Dush', pozicioni_sugjeruar: 'Këndi i pasëm djathtas', arsyeja: 'Zonë e thatë për pjesën tjetër të banjos' },
          { emri: 'WC', pozicioni_sugjeruar: 'Muri i majtë', arsyeja: 'Akses i drejtpërdrejtë pa pengesa' },
          { emri: 'Lavaman', pozicioni_sugjeruar: 'Pranë derës', arsyeja: 'Përdorim i shpejtë dhe instalim i lehtë hidraulik' },
        ],
        stili_sugjeruar: 'Modern sanitare me pllaka matte',
      };

    case 'preventiv':
      return {
        materialet: [
          { emri: 'Bojë akrilike e brendshme', sasia: '40 L', kosto_afersisht: '32.000 Lek' },
          { emri: 'Astari për mure', sasia: '30 kg', kosto_afersisht: '12.000 Lek' },
          { emri: 'Rula dhe furça profesionale', sasia: '1 set', kosto_afersisht: '4.500 Lek' },
          { emri: 'Shirit maskues + fletë mbrojtëse', sasia: '10 copë', kosto_afersisht: '3.000 Lek' },
        ],
        puna_dore: '45.000 Lek',
        total_afersisht: '96.500 Lek',
        kohezgjatja: '3-4 ditë pune',
      };

    case 'matje_planimetrie':
      return {
        lloji_hapesires: 'Dhomë ndenjeje',
        dimensionet_m: [
          { muri: 'Muri A', gjatesia_m: 5.0 },
          { muri: 'Muri B', gjatesia_m: 4.0 },
          { muri: 'Muri C', gjatesia_m: 5.0 },
          { muri: 'Muri D', gjatesia_m: 4.0 },
        ],
        siperfaqja_m2: 20.0,
        perimetri_m: 18.0,
        forma: 'drejtekendshe',
        zgjedhje_murale: 'Bojë e brendshme gjysmë-matte në ton të ngrohtë (RAL 9001)',
      };

    default:
      return {
        verejtje:
          'AI lokale offline nuk njeh këtë lloj kërkese. Kjo përgjigje është vendosje (fallback) demo.',
      };
  }
}

/**
 * Thirrje e AI lokale (offline) — NUK bën asnjë thirrje rrjeti.
 *
 * Zë vendin e `thirrOllamaAI` me të njëjtën nënshkrim, kështu që thirrësit
 * nuk kanë nevojë për ndryshime të tjera logjike.
 *
 * @param prompt          Prompt-i i kërkesës (përdoret për klasifikim)
 * @param imageBase64     Foto opsionale (vetëm për kontekst demo)
 * @param _temperature    Ruajtur për përputhshmëri me API-n e vjetër; nuk përdoret
 */
export async function thirrAILokale(
  prompt: string,
  imageBase64?: string,
  _temperature: number = 0.1
): Promise<any> {
  const lloji = klasifikoKerkesen(prompt);

  // Vonesë e simuluar: mban të dukshme gjendjet e ngarkimit në UI.
  await new Promise((resolve) => setTimeout(resolve, VONESA_SIMULIMI_MS));

  console.log(`[localAI] Përgjigje lokale offline (pa server). Lloji: ${lloji}`);

  return pergjigjeDemo(lloji, Boolean(imageBase64));
}
