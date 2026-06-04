const fs = require('fs');
let data = fs.readFileSync('src/services/api.service.ts', 'utf8');

const replacement = `static async generateArticle(auditData: any, articleType: string) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    
    let prompt = '';
    let isJsonRequest = true;

    if (articleType === 'academic') {
      isJsonRequest = false;
      prompt = \`Anda adalah Academic Journal Rewriter AI.

Tugas Anda KHUSUS untuk menyalin dan menulis ulang naskah dokumen menjadi artikel jurnal ilmiah berstandar Google Scholar dan SINTA.

Instruksi Utama:
1. BACA dan PAHAMI dokumen sumber.
2. TULIS ULANG dokumen sumber tersebut ke dalam format jurnal ilmiah yang sempurna.
3. JANGAN mengubah makna, JANGAN menambah data fiktif. Hanya "copy-paste" dengan penyesuaian kalimat agar menjadi bahasa akademik formal.

Aturan Penulisan:
* Tulis SEPANJANG dan SEDETAIL mungkin (target 8.000 kata). Silakan habiskan seluruh batas token Anda untuk menulis isi jurnal ini.
* LANGSUNG tuliskan isi artikel dalam format Markdown murni.
* JANGAN gunakan format JSON. JANGAN sertakan markdown json block.
* WAJIB diawali dengan Judul Utama menggunakan heading 1 (# Judul Artikel).
* Wajib memiliki Abstrak (ID & EN), Pendahuluan, Tinjauan Pustaka, Metode, Hasil dan Pembahasan, Kesimpulan, Daftar Pustaka (APA 7th).

Data Sumber:
\${JSON.stringify(auditData, null, 2)}\`;
    } else {
      prompt = \`Tulis sebuah artikel berita jurnalistik berdasarkan data audit berikut.
Gaya Bahasa: \${articleType} (misalnya Tajam, Investigatif, atau Informatif)

Data Audit:
\${JSON.stringify(auditData, null, 2)}

Tolong kembalikan respons dalam format JSON murni persis seperti ini:
{
  "title": "Judul Berita",
  "content": "Isi berita lengkap (dalam format teks biasa atau markdown ringan)",
  "tags": ["tag1", "tag2"]
}\`;
    }

    const textResult = await this.callGeminiApi(prompt, apiKey, isJsonRequest);
    
    if (!isJsonRequest && articleType === 'academic') {
      const titleMatch = textResult.match(/^#\\s+(.*)/m);
      const title = titleMatch ? titleMatch[1].trim() : 'Jurnal Akademik';
      return {
        title: title,
        category: 'Academic Journal',
        headline: title,
        detectedField: 'Akademik',
        journalRecommendation: 'Jurnal Terakreditasi SINTA / Scopus',
        matchPercentage: 100,
        auditScore: 100,
        auditFindings: 'Tidak dievaluasi (Mode Salin Jurnal)',
        auditImprovements: 'Tidak dievaluasi (Mode Salin Jurnal)',
        content: textResult,
        tags: ['akademik', 'jurnal', 'sinta']
      };
    }

    try {
      return JSON.parse(textResult);
    } catch (e) {
      throw new Error("Gagal mem-parsing artikel. Respons AI: " + textResult);
    }
  }

  static async chat`;

data = data.replace(/static async generateArticle[\s\S]*?static async chat/, replacement);
fs.writeFileSync('src/services/api.service.ts', data);
console.log("Done");
