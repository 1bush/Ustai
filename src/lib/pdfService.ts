import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AIEstimate } from './aiVisionService';

export class PDFService {
  static async krijoDheDergoPreventiv(preventivi: AIEstimate, emriKlientit: string) {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; background: #fff; color: #333; }
            h1 { color: #FF7A1A; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>PREVENTIV PUNE - USTAI-IM</h1>
          <p><strong>Klienti:</strong> ${emriKlientit}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>

          <table>
            <thead>
              <tr><th>Materiali</th><th>Sasia</th><th>Kosto (Afersisht)</th></tr>
            </thead>
            <tbody>
              ${preventivi.materialet.map(m => `
                <tr><td>${m.emri}</td><td>${m.sasia}</td><td>${m.kosto_afersisht}</td></tr>
              `).join('')}
            </tbody>
          </table>

          <p><strong>Puna e dorës:</strong> ${preventivi.puna_dore}</p>
          <p><strong>Kohëzgjatja e parashikuar:</strong> ${preventivi.kohezgjatja}</p>
          <div class="total">TOTALI: ${preventivi.total_afersisht}</div>

          <p style="margin-top: 50px; font-size: 0.8em; text-align: center; color: #9CA3AF;">
            Gjeneruar automatikisht nga AI Ustai-im. Ky është një vlerësim paraprak.
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }
}
