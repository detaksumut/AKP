import { useState } from 'react';
import { ApiService } from '../services/api.service';
import { motion } from 'motion/react';
import { Key, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupPage({ onComplete }: { onComplete: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await ApiService.saveApiKey(apiKey.trim());
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menyimpan API Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="mb-12 text-center">
          <div className="inline-block p-4 bg-red-600/10 rounded-2xl mb-6">
            <ShieldCheck size={48} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-3">
             Persiapan <span className="text-red-600">Sistem</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
             Aplikasi Standalone AKP memerlukan Google Gemini API Key untuk menjalankan modul kecerdasan buatan.
          </p>
        </div>

        <div className="bg-[#141414] border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan Kunci API..."
                  className="w-full bg-[#1c1c1c] border border-white/5 py-4 pl-12 pr-4 text-xs font-bold focus:border-red-600 outline-none transition-all"
                  required
                />
              </div>
              <p className="mt-4 text-[9px] text-gray-500 leading-relaxed italic">
                * Dapatkan kunci API gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-red-500 underline">Google AI Studio</a>.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  MENYIMPAN...
                </>
              ) : (
                'AKTIVASI SISTEM AI'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
            PROPERTI NASIONAL © 2026 - AKP STANDALONE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
