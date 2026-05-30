import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle,
  Database,
  Download,
  Upload,
  HardDrive,
  Trash2,
  X
} from 'lucide-react';
import { ApiService } from '../services/api.service';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) setApiKey(stored);
    const storedProvider = localStorage.getItem('LLM_PROVIDER');
    if (storedProvider) setProvider(storedProvider);
    const storedUrl = localStorage.getItem('OLLAMA_URL');
    if (storedUrl) setOllamaUrl(storedUrl);
    const storedModel = localStorage.getItem('OLLAMA_MODEL');
    if (storedModel) setOllamaModel(storedModel);
  }, []);

  const handleSave = async () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    localStorage.setItem('LLM_PROVIDER', provider);
    localStorage.setItem('OLLAMA_URL', ollamaUrl);
    localStorage.setItem('OLLAMA_MODEL', ollamaModel);
    await ApiService.saveSettings({ apiKey, provider, ollamaUrl, ollamaModel });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    try {
      const result = await ApiService.exportDatabase();
      if (result?.success) {
        if (result.path) {
          alert(`Database berhasil diekspor ke: ${result.path}`);
        } else {
          alert("Database berhasil diekspor dan diunduh ke komputer Anda.");
        }
      }
    } catch (err: any) {
      alert("Gagal mengekspor database: " + err.message);
    }
  };

  const handleImport = async () => {
    if (window.electronAPI) {
      // Electron native file dialog import
      try {
        const result = await ApiService.importDatabase();
        if (result?.success) {
          alert('Database berhasil diimpor. Aplikasi akan memuat ulang data.');
          window.location.reload();
        }
      } catch (err: any) {
        alert("Gagal mengimpor database: " + err.message);
      }
    } else {
      // Web browser file picker model for database JSON import
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt: any) => {
          try {
            const contents = JSON.parse(evt.target.result);
            const result = await ApiService.importDatabase(contents);
            if (result?.success) {
              alert('Database berhasil diimpor ke server backend. Aplikasi akan memuat ulang data.');
              window.location.reload();
            } else {
              alert('Gagal mengimpor database.');
            }
          } catch (err: any) {
            alert('Gagal membaca file JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  };

  const handleClearDatabase = async () => {
    const confirmClear = window.confirm(
      "Apakah Anda yakin ingin menghapus semua data dokumen audit lama, draf, dan hasil berita jurnalistik? Tindakan ini tidak dapat dibatalkan dan akan membuat aplikasi bersih kembali untuk pengujian yang baru."
    );
    if (confirmClear) {
      await ApiService.clearDatabase();
      alert("Seluruh data dokumen telah berhasil dibersihkan! Aplikasi akan memuat ulang.");
      window.location.reload();
    }
  };

  const steps = [
    {
      title: "Login ke Google AI Studio",
      desc: "Buka browser dan kunjungi aistudio.google.com. Login menggunakan akun Google Anda.",
      link: "https://aistudio.google.com/"
    },
    {
      title: "Buka Menu API Key",
      desc: "Pada sidebar sebelah kiri, klik ikon kunci atau tulisan 'Get API key'.",
    },
    {
      title: "Buat API Key Baru",
      desc: "Klik tombol biru bertuliskan 'Create API key in new project' (atau pilih project yang sudah ada).",
    },
    {
      title: "Salin API Key",
      desc: "Setelah key muncul, klik tombol 'Copy' untuk menyalin kode unik tersebut.",
    },
    {
      title: "Tempel di Aplikasi AKP",
      desc: "Kembali ke halaman ini, tempel (Paste) kode tadi ke kotak input 'Gemini API Key' di atas.",
    },
    {
      title: "Simpan Konfigurasi",
      desc: "Klik tombol 'SIMPAN KONFIGURASI'. Selesai! Aplikasi siap digunakan untuk audit.",
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 pt-24 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-white/20 p-4 sm:p-8 bg-zinc-900 rounded-lg shadow-2xl relative overflow-hidden"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl -mr-16 -mt-16 rounded-full" />

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-red-600 rounded-full">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">Konfigurasi Sistem</h1>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-tight">Setup Standalone Audit Kebijakan</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-1 bg-black/40 rounded border border-white/10">
              <button 
                onClick={() => setProvider('gemini')}
                className={`flex-1 py-3 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded transition-all ${provider === 'gemini' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Gemini (Cloud)
              </button>
              <button 
                onClick={() => setProvider('ollama')}
                className={`flex-1 py-3 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded transition-all ${provider === 'ollama' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Ollama (Local LLM)
              </button>
            </div>

            {provider === 'gemini' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Key className="w-4 h-4" /> Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Masukkan API Key Anda..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full bg-black border-2 border-white/10 p-4 pr-12 font-mono text-sm focus:border-red-600 outline-none transition-colors"
                  />
                  {apiKey && (
                    <button 
                      onClick={() => setApiKey('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
                      title="Hapus API Key"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                  Key ini digunakan untuk memproses audit menggunakan AI Gemini. 
                  Dapatkan key di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-red-500 hover:underline inline-flex items-center gap-1">
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-[11px] text-blue-200 leading-relaxed">
                    💡 Untuk performa analisa yang <strong className="text-white">prima dan stabil</strong> juga untuk kenyamanan Anda, sebaiknya gunakan <strong className="text-white">API Key Private</strong> Anda sendiri. Dapatkan API Key <strong className="text-white">gratis</strong> dari Google{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 font-bold hover:underline hover:text-blue-300"
                    >
                      di sini <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                </div>
              </div>
            )}

            {provider === 'ollama' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Ollama URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full bg-black border-2 border-white/10 p-4 font-mono text-sm focus:border-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Ollama Model
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="Contoh: llama3, mistral, gemma"
                    className="w-full bg-black border-2 border-white/10 p-4 font-mono text-sm focus:border-blue-600 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                    Pastikan Anda telah mengunduh model ini dengan menjalankan <code className="text-blue-400">ollama run {ollamaModel || 'llama3'}</code> di terminal Anda.
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded flex gap-4 items-start">
              <HardDrive className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <div className="text-[10px] text-blue-500 font-black uppercase leading-relaxed">
                  Penyimpanan Lokal & Offline:
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">
                  Seluruh data audit disimpan secara aman di folder lokal PC Anda (JSON Store). Aplikasi tidak mengirim data audit ke server eksternal kecuali ke Gemini AI saat proses analisa aktif.
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {saved ? 'BERHASIL TERSIMPAN!' : 'SIMPAN KONFIGURASI'}
            </button>
          </div>
        </motion.div>

        {/* Data Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-white/10 p-4 sm:p-8 bg-zinc-900/50 rounded-lg space-y-6"
        >
           <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Manajemen Database Lokal</h2>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                onClick={handleExport}
                className="p-6 border border-white/10 bg-black/40 hover:bg-white/5 transition-colors flex flex-col items-center text-center group"
               >
                 <Download className="w-8 h-8 text-zinc-600 group-hover:text-white mb-4 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Eksport Database (JSON)</span>
                 <span className="text-[8px] text-zinc-500 mt-2 font-bold uppercase">Cadangkan seluruh data audit & user</span>
               </button>

               <button 
                onClick={handleImport}
                className="p-6 border border-white/10 bg-black/40 hover:bg-white/5 transition-colors flex flex-col items-center text-center group"
               >
                 <Upload className="w-8 h-8 text-zinc-600 group-hover:text-white mb-4 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Import Database (JSON)</span>
                 <span className="text-[8px] text-zinc-500 mt-2 font-bold uppercase">Timpa database lokal dengan file cadangan</span>
               </button>
            </div>

          <div className="pt-2">
            <button
              onClick={handleClearDatabase}
              className="w-full bg-red-950/40 hover:bg-red-900/40 border-2 border-red-950 hover:border-red-600 text-red-500 font-black py-4 uppercase tracking-widest flex items-center justify-center gap-2 transition-all group rounded"
            >
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform text-red-500" />
              HAPUS SEMUA DATA DOKUMEN UJI COBA (FRESH RESET)
            </button>
            <p className="text-[10px] text-zinc-600 font-bold uppercase text-center mt-3 tracking-wider leading-relaxed">
              *Tindakan ini akan mengosongkan seluruh draf audit dan hasil artikel jurnalistik untuk memulai uji coba baru.
            </p>
          </div>
        </motion.div>

        <div className="pt-6 text-center">
          <p className="text-[#FDFDFD]/30 text-[11px] font-bold uppercase tracking-[0.2em] italic leading-relaxed">
            "Dan kebanyakan manusia itu tidak mengikuti (kebenaran) selain dugaan (semata)"
          </p>
          <p className="text-red-600/40 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
            — Al Qur'an Surah Yunus 35
          </p>
        </div>

        {/* Manual Guide Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-white/10 bg-zinc-900/50 rounded-lg overflow-hidden"
        >
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-black uppercase tracking-tighter">Petunjuk Manual (Cara Buat API Key)</h2>
            </div>
            <div className={`transform transition-transform ${showGuide ? 'rotate-180' : ''}`}>
              <Save className="w-5 h-5 rotate-90" /> {/* Using Save as a chevron replacement or similar */}
            </div>
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 pt-0 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative p-4 border border-white/5 bg-black/30 rounded group hover:border-red-600/50 transition-colors">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white flex items-center justify-center font-black rounded-lg shadow-lg">
                          {idx + 1}
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-sm mb-2 mt-2">{step.title}</h3>
                        <p className="text-xs text-zinc-400 font-bold leading-relaxed uppercase">{step.desc}</p>
                        {step.link && (
                          <a 
                            href={step.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-red-500 mt-2 hover:underline font-black"
                          >
                            GOTO LINK <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 bg-red-600/10 border-l-4 border-red-600 rounded">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2 italic">Tips Keamanan:</p>
                    <p className="text-[10px] text-zinc-300 font-bold uppercase leading-relaxed">
                      Gunakan API Key tipe "Free" jika Anda baru mencoba. Google menyediakan kuota gratis yang cukup besar untuk penggunaan pribadi. 
                      Anda tidak perlu memasukkan kartu kredit untuk mendapatkan API Key gratis ini.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
