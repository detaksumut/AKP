const fs = require('fs');
let data = fs.readFileSync('src/services/api.service.ts', 'utf8');

const replacement = `if (articleType === 'academic') {
      prompt = \`Anda adalah Academic Journal Rewriter AI.

Tugas Anda KHUSUS untuk menyalin dan menulis ulang naskah dokumen menjadi artikel jurnal ilmiah berstandar Google Scholar dan SINTA.
PENTING: JANGAN MELAKUKAN AUDIT. Tugas Anda BUKAN mengaudit, melainkan HANYA menulis ulang, menata struktur, dan merapikan tata bahasa agar memenuhi standar publikasi ilmiah sebenarnya.

Instruksi Utama:
1. BACA dan PAHAMI dokumen sumber.
2. TULIS ULANG dokumen sumber tersebut ke dalam format jurnal ilmiah yang sempurna.
3. JANGAN mengubah makna, JANGAN menambah data fiktif, JANGAN mengurangi esensi isi. Hanya "copy-paste" dengan penyesuaian kalimat, struktur, dan diksi agar menjadi bahasa akademik formal yang sangat baik.
4. BENAR-BENAR MEMPERHATIKAN FORMAT JURNAL SEBENARNYA DAN IKUTI STANDAR GOOGLE SCHOLAR DAN SINTA.
5. Karena ini bukan audit, untuk kolom audit (auditScore, auditFindings, auditImprovements) cukup isi dengan teks singkat "Tidak dievaluasi (Mode Salin Jurnal)" atau skor 100 agar menghemat token. Fokuskan seluruh token Anda untuk isi artikel (content).

Aturan Penulisan Artikel (Content):
* Panjang maksimal 4.000 - 5.000 kata (BATAS MAKSIMUM API TOKEN. Pastikan JSON ditutup sempurna dengan '\}').
* Menggunakan bahasa akademik formal tingkat tinggi.
* Struktur WAJIB mengikuti standar jurnal terindeks Google Scholar & Sinta.
* Wajib memiliki:
  * Judul
  * Abstrak Indonesia
  * Kata Kunci
  * Abstract English
  * Keywords
  * Pendahuluan
  * Tinjauan Pustaka
  * Metode Penelitian
  * Hasil dan Pembahasan
  * Kesimpulan
  * Daftar Pustaka (APA 7th, rapikan dari dokumen sumber jika ada)

Data Audit:
\${JSON.stringify(auditData, null, 2)}

Tolong kembalikan respons dalam format JSON murni persis seperti ini:
{
  "title": "Judul asli dari data audit",
  "category": "Academic Journal",
  "headline": "Judul asli dari data audit",
  "detectedField": "Bidang ilmu jurnal",
  "journalRecommendation": "Rekomendasi Jurnal",
  "matchPercentage": 100,
  "auditScore": 100,
  "auditFindings": "Tidak dievaluasi (Mode Salin Jurnal)",
  "auditImprovements": "Tidak dievaluasi (Mode Salin Jurnal)",
  "content": "Isi lengkap tulisan ulang jurnal dalam format Markdown yang sangat panjang dan detail sesuai standar.",
  "tags": ["akademik", "jurnal"]
}\`;
    } else {`;

data = data.replace(/if\s*\(articleType\s*===\s*'academic'\)\s*\{[\s\S]*?\}\s*else\s*\{/, replacement);
fs.writeFileSync('src/services/api.service.ts', data);
console.log("Done");
