import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Helper for generating random IDs since we don't have a backend UUID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// LocalStorage wrappers
const getLocalData = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.message.includes('quota') || e.message.includes('exceeded')) {
      if (key === 'akp_audits' && Array.isArray(data)) {
        // Taktik 1: Buang semua image_url (foto/dokumen base64 raksasa) dari riwayat lama untuk menghemat kapasitas.
        // Hanya simpan foto di audit yang paling terbaru.
        let strippedData = data.map((item, idx) => {
          if (idx < data.length - 1 && item.image_url) {
            return { ...item, image_url: '' };
          }
          return item;
        });
        
        try {
          localStorage.setItem(key, JSON.stringify(strippedData));
          return;
        } catch (e2) {
          // Taktik 2: Kalau masih penuh juga, pangkas paksa sisakan 5 laporan audit terbaru saja.
          strippedData = strippedData.slice(-5);
          localStorage.setItem(key, JSON.stringify(strippedData));
          return;
        }
      }
    }
    throw e;
  }
};

export class ApiService {
  static async callGeminiApi(prompt: string, apiKey: string | null, isJson: boolean = false) {
    if (!apiKey || apiKey === 'TEST') {
      // MOCK MODE FOR TESTING
      console.log('Mode Uji Coba LLM (Mock) Aktif');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      if (prompt.includes('Jenis Audit:')) {
        return JSON.stringify({
          "title": "Laporan Audit Simulasi AI",
          "score": 45,
          "riskLevel": "TINGGI",
          "summary": "Ini adalah hasil simulasi. Dokumen yang diberikan menunjukkan beberapa kejanggalan administratif.",
          "sections": {
            "constitutionalAnalysis": "Terdapat potensi pelanggaran asas transparansi UUD 1945.",
            "publicImpact": "Dapat merugikan masyarakat jika anggaran tidak tersalurkan.",
            "corruptionRisk": "Risiko KKN tinggi pada bagian pengadaan.",
            "uud1945Deviations": "Pasal 33 tentang kesejahteraan rakyat mungkin terabaikan.",
            "akpRecommendations": "Segera lakukan investigasi lapangan.",
            "finalConclusion": "Proyek harus ditunda sampai audit forensik selesai.",
            "conflictOfInterest": "Ditemukan afiliasi antara vendor dan pejabat."
          },
          "findingsList": ["Dokumen tidak lengkap", "Mark-up harga terdeteksi"],
          "investigationLeads": ["Periksa rekening vendor", "Panggil panitia lelang"],
          "constitutionReferences": ["Pasal 33", "Pasal 27"]
        });
      } else if (prompt.includes('Gaya Bahasa:')) {
        return JSON.stringify({
          "title": "Berita Simulasi: Investigasi Kasus",
          "content": "Ini adalah isi berita simulasi yang digenerate tanpa API Key. Semuanya tampak normal, namun ada rahasia di baliknya.",
          "tags": ["simulasi", "ai", "berita"]
        });
      }
      return "Halo! Ini adalah pesan simulasi dari asisten AI karena API Key belum dimasukkan.";
    }
    
    // We use gemini-2.5-flash as the standard fast model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            ...(isJson ? { responseMimeType: "application/json" } : {})
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gagal menghubungi Gemini API');
      }

      const result = await response.json();
      let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!isJson) {
        // Extract JSON block using regex if wrapped in markdown (legacy fallback)
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          text = jsonMatch[1];
        } else {
          text = text.trim();
        }
      }
      
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  static async audit(input: string, type: string) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    
    // Construct the prompt similar to what backend did
    const prompt = `Anda adalah sistem Audit Kebijakan Publik (AKP) Republik Indonesia.
Lakukan analisis dan audit mendalam terhadap informasi berikut.
Jenis Audit: ${type}

Data/Informasi:
${input}

Tolong keluarkan hasil dalam format JSON murni dengan struktur berikut persis:
{
  "title": "Judul Laporan Singkat",
  "score": 85, 
  "riskLevel": "TINGGI/SEDANG/RENDAH",
  "summary": "Ringkasan Eksekutif",
  "sections": {
    "constitutionalAnalysis": "Analisis Konstitusi UUD 1945",
    "publicImpact": "Dampak Publik",
    "corruptionRisk": "Risiko KKN",
    "uud1945Deviations": "Penyimpangan UUD 1945",
    "akpRecommendations": "Rekomendasi AKP",
    "finalConclusion": "Kesimpulan Akhir",
    "conflictOfInterest": "Potensi Konflik Kepentingan"
  },
  "findingsList": ["Temuan 1", "Temuan 2"],
  "investigationLeads": ["Jejak 1", "Jejak 2"],
  "constitutionReferences": ["Pasal 33", "Pasal 27"]
}`;

    const textResult = await this.callGeminiApi(prompt, apiKey, true);
    
    try {
      const parsed = JSON.parse(textResult);
      return parsed; // Returns the findings object
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", textResult);
      throw new Error(`Respons AI bukan JSON valid. Info: ${textResult.substring(0, 100)}...`);
    }
  }

  static async generateArticle(auditData: any, articleType: string) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    
    const prompt = `Tulis sebuah artikel berita jurnalistik berdasarkan data audit berikut.
Gaya Bahasa: ${articleType} (misalnya Tajam, Investigatif, atau Informatif)

Data Audit:
${JSON.stringify(auditData, null, 2)}

Tolong kembalikan respons dalam format JSON murni persis seperti ini:
{
  "title": "Judul Berita",
  "content": "Isi berita lengkap (dalam format teks biasa atau markdown ringan)",
  "tags": ["tag1", "tag2"]
}`;

    const textResult = await this.callGeminiApi(prompt, apiKey, true);
    
    try {
      return JSON.parse(textResult);
    } catch (e) {
      throw new Error("Gagal mem-parsing artikel. Respons AI: " + textResult);
    }
  }

  static async chat(message: string, history: any[]) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    const prompt = `Anda adalah asisten AI dari AKP (Audit Kebijakan Publik).\nRiwayat percakapan: ${JSON.stringify(history)}\nPesan Baru: ${message}`;
    const textResult = await this.callGeminiApi(prompt, apiKey);
    return { response: textResult };
  }

  static async scrape(urlToScrape: string) {
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(urlToScrape)}`);
      const html = await response.text();
      const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                       .replace(/<[^>]+>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
      return { content: text.substring(0, 15000) };
    } catch (e) {
      throw new Error("Gagal menarik link berita. Pastikan URL dapat diakses publik.");
    }
  }

  static async extractPdf(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      return { content: fullText.trim() };
    } catch (e: any) {
      console.error('PDF Extraction Error:', e);
      throw new Error('Gagal membaca PDF: ' + e.message);
    }
  }

  static async extractImage(file: File) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) throw new Error("API Key diperlukan untuk ekstrak foto.");
    
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Ekstrak seluruh teks yang ada dalam gambar ini secara akurat:" },
            { inlineData: { mimeType: file.type, data: base64 } }
          ]
        }]
      })
    });
    
    if (!response.ok) throw new Error("Gagal mengekstrak teks dari foto via AI.");
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { content: text };
  }

  // Local Data Operations: AUDITS
  static async getAudits() {
    return getLocalData('akp_audits');
  }

  static async getAudit(id: string) {
    const audits = getLocalData('akp_audits');
    return audits.find((a: any) => a.id === id) || null;
  }

  static async saveAudit(data: any) {
    const audits = getLocalData('akp_audits');
    const newAudit = { ...data, id: data.id || generateId(), createdAt: data.createdAt || new Date().toISOString() };
    audits.push(newAudit);
    saveLocalData('akp_audits', audits);
    return newAudit;
  }

  static async updateAudit(id: string, data: any) {
    const audits = getLocalData('akp_audits');
    const index = audits.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      audits[index] = { ...audits[index], ...data };
      saveLocalData('akp_audits', audits);
      return audits[index];
    }
    throw new Error('Audit tidak ditemukan');
  }

  static async deleteAudit(id: string) {
    let audits = getLocalData('akp_audits');
    audits = audits.filter((a: any) => a.id !== id);
    saveLocalData('akp_audits', audits);
    return { success: true };
  }

  // Local Data Operations: USERS
  static async getUser(phone: string) {
    const users = getLocalData('akp_users');
    return users.find((u: any) => u.phone === phone) || null;
  }

  static async getUsers() {
    return getLocalData('akp_users');
  }

  static async createUser(data: any) {
    const users = getLocalData('akp_users');
    const newUser = { ...data, id: generateId() };
    users.push(newUser);
    saveLocalData('akp_users', users);
    return newUser;
  }

  static async updateUser(id: string, data: any) {
    const users = getLocalData('akp_users');
    const index = users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveLocalData('akp_users', users);
      return users[index];
    }
    throw new Error('User tidak ditemukan');
  }

  static async deleteUser(id: string) {
    let users = getLocalData('akp_users');
    users = users.filter((u: any) => u.id !== id);
    saveLocalData('akp_users', users);
    return { success: true };
  }

  // Local Data Operations: ARTICLES
  static async getArticles() {
    return getLocalData('akp_articles');
  }

  static async getArticle(id: string) {
    const articles = getLocalData('akp_articles');
    return articles.find((a: any) => a.id === id) || null;
  }

  static async saveArticle(data: any) {
    const articles = getLocalData('akp_articles');
    const newArticle = { ...data, id: generateId(), createdAt: data.createdAt || new Date().toISOString() };
    articles.push(newArticle);
    saveLocalData('akp_articles', articles);
    return newArticle;
  }

  static async updateArticle(id: string, data: any) {
    const articles = getLocalData('akp_articles');
    const index = articles.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...data };
      saveLocalData('akp_articles', articles);
      return articles[index];
    }
    throw new Error('Artikel tidak ditemukan');
  }

  static async deleteArticle(id: string) {
    let articles = getLocalData('akp_articles');
    articles = articles.filter((a: any) => a.id !== id);
    saveLocalData('akp_articles', articles);
    return { success: true };
  }

  static async checkConfig() {
    // In standalone mode, we pretend the backend is always OK, 
    // and rely on LocalStorage for API KEY.
    return { status: 'ok', isPackaged: true, has_gemini: !!localStorage.getItem('GEMINI_API_KEY') };
  }

  static async saveSettings(config: any) {
    if (config.apiKey) {
      localStorage.setItem('GEMINI_API_KEY', config.apiKey);
    }
    return { success: true };
  }

  static async exportDatabase() {
    const data = {
      audits: getLocalData('akp_audits'),
      articles: getLocalData('akp_articles'),
      users: getLocalData('akp_users')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `akp-database-offline-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return { success: true };
  }

  static async importDatabase(data?: any) {
    if (data && data.audits) saveLocalData('akp_audits', data.audits);
    if (data && data.articles) saveLocalData('akp_articles', data.articles);
    if (data && data.users) saveLocalData('akp_users', data.users);
    return { success: true };
  }

  static async clearDatabase() {
    localStorage.removeItem('akp_audits');
    localStorage.removeItem('akp_articles');
    localStorage.removeItem('akp_users');
    return { success: true };
  }
}
