import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Upload, 
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '../services/api.service';
import { generateJournalismArticle } from '../lib/gemini';
import type { UserProfile } from '../types';

export default function JournalMaker({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Silakan masukkan teks sumber draf atau artikel jurnal.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Mocking an audit report structure with the input text
      const mockReport = {
        id: `journal-${Date.now()}`,
        input_text: inputText,
        title: "Pembuatan Jurnal Otomatis",
        category: "Academic",
        score: 100,
        findings: [],
        timestamp: new Date().toISOString()
      };

      const result = await generateJournalismArticle(mockReport as any, 'academic');
      
      const articleData = {
        audit_id: mockReport.id,
        category: 'Academic Journal',
        content: result.content,
        excerpt: result.headline || result.title,
        title: result.title || result.headline,
        headline: result.headline || result.title,
        tags: result.tags || ['akademik', 'jurnal', 'sinta'],
        author_id: profile.uid,
        image_url: '',
        status: 'published', // Langsung tayang di Lensa News sesuai permintaan
        type: 'academic',
        detectedField: result.detectedField,
        journalRecommendation: result.journalRecommendation,
        matchPercentage: result.matchPercentage,
        auditScore: result.auditScore,
        auditFindings: result.auditFindings,
        auditImprovements: result.auditImprovements
      };
      
      const response = await ApiService.saveArticle(articleData);
      setSuccess(true);
      
      // Navigate to the news detail directly after successful generation
      setTimeout(() => {
        navigate(`/news/${response.id}`);
      }, 1500);

    } catch (err: any) {
      console.error("Generate Journal Error:", err);
      setError(err.message || "Gagal memproses jurnal. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex items-center space-x-4 border-b-2 border-red-600 pb-4">
        <div className="p-3 bg-red-600 text-white rounded">
          <BookOpen size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Jurnal Akademi AKP</h1>
          <p className="text-gray-500 font-medium tracking-wide">
            Transformasi naskah menjadi Artikel Jurnal Ilmiah (Standar Google Scholar & SINTA)
          </p>
        </div>
      </header>

      <div className="bg-white p-6 shadow-xl border border-gray-100 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-gray-700 flex justify-between items-end">
            <span>Teks Sumber Naskah / Draf Artikel</span>
            <span className="text-[10px] text-gray-400 font-normal normal-case">
              *Copy-paste teks mentah dari PDF/Word ke sini
            </span>
          </label>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isGenerating || success}
            className="w-full h-[400px] p-4 border border-gray-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors font-mono text-sm leading-relaxed resize-none"
            placeholder="Tempelkan (Paste) naskah lengkap atau hasil ekstrak PDF di sini..."
          />
        </div>

        {error && (
          <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 border-l-4 border-red-600">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-3 text-green-600 bg-green-50 p-4 border-l-4 border-green-600">
            <CheckCircle2 size={20} />
            <span className="text-sm font-bold">Jurnal berhasil ditulis ulang dan dipublikasikan ke Lensa News! Mengalihkan...</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || success || !inputText.trim()}
          className="w-full py-5 bg-[#141414] hover:bg-red-600 text-white flex items-center justify-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-3">
              <Zap size={20} className="animate-pulse text-yellow-400" />
              <span className="text-sm font-black uppercase tracking-widest animate-pulse">Menulis Ulang Jurnal... (Harap Tunggu)</span>
            </div>
          ) : (
            <>
              <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest">Tulis Ulang Ke Format Jurnal SINTA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
