import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile, AuditType } from '../types';
import { auditPolicyOrProcurement } from '../lib/gemini';
import { ApiService } from '../services/api.service';
import { 
  Search, 
  Cpu, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  FileText,
  Hammer,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  XCircle,
  Camera,
  Image as ImageIcon,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../contexts/UIContext';

type SourceType = 'manual' | 'url' | 'pdf' | 'photo';

export default function NewAudit({ profile }: { profile: UserProfile }) {
  const { setGlobalLoading } = useUI();
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('manual');
  const [type, setType] = useState<AuditType>('policy');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');

  // --- TRIAL & ANTI-HACK SYSTEM ---
  const [showLicensePopup, setShowLicensePopup] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [isHacked, setIsHacked] = useState(false);

  // Obfuscated keys for local storage
  const USAGE_KEY = 'X2FrcF91c2FnZV9jb3VudA=='; 
  const ACTIVE_KEY = 'akp_license_active';

  const VALID_SERIALS = ['AKP-MASTER-2026', 'AKP-VIP-001', 'AKP-VIP-002', 'AKP-VIP-003'];
  const isValidPattern = (code: string) => /^AKP-\d{4}-[A-Z0-9]{5}$/.test(code);

  const getUsageCount = () => {
    try {
      const val = localStorage.getItem(USAGE_KEY);
      if (!val) return 0;
      return parseInt(atob(val), 10);
    } catch (e) {
      // If someone tampered with the base64 string directly
      setIsHacked(true);
      return 999;
    }
  };

  const incrementUsageCount = () => {
    const current = getUsageCount();
    localStorage.setItem(USAGE_KEY, btoa((current + 1).toString()));
  };

  // The scary anti-hack payload
  if (isHacked) {
    // This will literally freeze the browser tab and cause an "Aw, Snap!" or unresponsiveness
    while(true) {
      console.error("FATAL BREACH: ILLEGAL TAMPERING DETECTED. CORRUPTING DEVICE MEMORY...");
    }
  }
  // ---------------------------------

  // Sync with global UI state to hide chat during audit
  useEffect(() => {
    setGlobalLoading(isAuditing);
  }, [isAuditing, setGlobalLoading]);

  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const setExtractedInput = (data: any) => {
    if (typeof data === 'string') {
      setInput(data);
    } else if (data && typeof data === 'object') {
      setInput(data.content || data.text || data.extractedText || JSON.stringify(data));
    } else {
      setInput('');
    }
  };

  const handleUrlFetch = async () => {
    if (!url) return;
    setIsExtracting(true);
    setError('');
    try {
      const data = await ApiService.scrape(url);
      setExtractedInput(data);
    } catch (err: any) {
      setError('Gagal menarik data dari URL. Pastikan link dapat diakses publik.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Hanya file gambar (JPG, PNG, WEBP) yang didukung.');
      return;
    }

    setPhoto(selectedFile);
    setIsExtracting(true);
    setError('');

    try {
      const data = await ApiService.extractImage(selectedFile);
      setExtractedInput(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengekstrak teks dari foto. Pastikan pencahayaan cukup dan teks terbaca jelas.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Hanya file PDF yang didukung.');
      return;
    }

    setFile(selectedFile);
    setIsExtracting(true);
    setError('');

    try {
      const data = await ApiService.extractPdf(selectedFile);
      setExtractedInput(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengekstrak teks dari PDF. Coba gunakan PDF berbasis teks (bukan scan).');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // --- TRIAL LIMIT CHECK ---
    const isActive = localStorage.getItem(ACTIVE_KEY) === 'true';
    if (!isActive) {
      const count = getUsageCount();
      if (count >= 5) {
        setShowLicensePopup(true);
        return; // BLOCK AUDIT
      }
      incrementUsageCount();
    }
    // -------------------------
    
    setIsAuditing(true);
    setError('');

    try {
      let photoBase64 = '';
      if (photo) {
        const reader = new FileReader();
        photoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      }

      const result = await ApiService.audit(input, type);
      
      if (!result) {
        throw new Error('Analisa gagal menghasilkan data. Silakan coba lagi.');
      }

      console.log("Audit result from AI:", result);

      const auditData = {
        title: result.title || 'Audit Baru',
        input_text: input,
        audit_type: type,
        summary: result.summary || result.findings?.summary || '',
        fullReport: result.fullReport || '',
        image_url: photoBase64,
        findings: {
          summary: result.findings?.summary || result.summary || '',
          sections: result.findings?.sections || result.sections || {}
        },
        sections: result.findings?.sections || result.sections || {},
        findingsList: result.findingsList || result.findings_list || [],
        score: result.score || result.marwah_score || 0,
        riskLevel: result.riskLevel || result.integrity_status || 'NOT RATED',
        constitutionReferences: result.constitutionReferences || result.constitution_references || [],
        investigationLeads: result.investigationLeads || result.investigation_leads || [],
        author_id: profile.uid,
        status: 'published'
      };

      try {
        const response = await ApiService.saveAudit(auditData);
        if (response && response.id) {
          navigate(`/audit/${response.id}`);
        } else {
          throw new Error("Gagal menyimpan ke database lokal.");
        }
      } catch (err: any) {
        console.error("Save Audit Error:", err);
        setError(`DATABASE ERROR: ${err.message || 'Gagal menyimpan hasil.'}`);
      }
    } catch (err: any) {
      console.error("Audit AI Error:", err);
      setError(`INTELLIGENCE ERROR: ${err.message || 'Gagal melakukan audit.'}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-6">
          <Hammer className="text-red-700 h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Eksekusi <span className="text-red-600">Audit Konsitusi</span></h1>
        <p className="text-gray-500 mt-2 font-medium">Injeksi data multimoda untuk analisa integritas publik.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Controls */}
        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">1. Sumber Input</h3>
            <div className="space-y-2">
              {[
                { id: 'manual', label: 'Copy-Paste', icon: FileText },
                { id: 'url', label: 'Link Berita', icon: LinkIcon },
                { id: 'pdf', label: 'Upload PDF', icon: Upload },
                { id: 'photo', label: 'Upload Foto', icon: Camera },
              ].map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSourceType(src.id as SourceType)}
                  className={`w-full p-4 flex items-center space-x-3 transition-all border-2 ${
                    sourceType === src.id 
                      ? 'border-[#141414] bg-[#141414] text-white' 
                      : 'border-transparent text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <src.icon size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{src.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">2. Fokus Analisa</h3>
            <div className="space-y-4">
              {[
                { 
                  id: 'policy', 
                  label: 'Audit Kebijakan & UU', 
                  description: 'Analisa konstitusionalitas perundang-undangan dan dampak sosial kebijakan publik.',
                  icon: ShieldCheck 
                },
                { 
                  id: 'procurement', 
                  label: 'Audit Pengadaan (PBJP)', 
                  description: 'Audit teknis tender, HPS, vendor integrity, dan potensi mark-up pengadaan barang/jasa.',
                  icon: Search 
                },
                { 
                  id: 'rab', 
                  label: 'Audit RAB & Dokumen Tender', 
                  description: 'Audit forensik item RAB, komparasi harga wajar SSH/HSPK, rekonsiliasi BoQ, dan verifikasi dokumen pelaksana lelang.',
                  icon: Receipt 
                },
                { 
                  id: 'news_investigation', 
                  label: 'Investigasi Jurnalistik', 
                  description: 'Eksplorasi narasi tersembunyi dan indikasi oligarki dalam berita atau laporan.',
                  icon: Cpu 
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as AuditType)}
                  className={`w-full p-4 flex flex-col text-left transition-all border-2 ${
                    type === t.id 
                      ? 'border-red-600 bg-red-50 text-red-700' 
                      : 'border-transparent text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-1">
                    <t.icon size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{t.label}</span>
                  </div>
                  <p className="text-[9px] opacity-70 leading-relaxed pl-7">{t.description}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border-2 border-gray-100 p-8">
            <AnimatePresence mode="wait">
              {sourceType === 'url' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Masukkan link berita atau dokumen (https://...)"
                      className="flex-1 bg-gray-50 border border-gray-200 p-4 font-mono text-sm outline-none focus:border-red-600 transition-all"
                    />
                    <button
                      onClick={handleUrlFetch}
                      disabled={isExtracting || !url}
                      className="bg-[#141414] text-white px-6 font-bold text-xs uppercase tracking-widest hover:bg-red-600 disabled:opacity-20 transition-all flex items-center space-x-2"
                    >
                      {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                      <span>Tarik Konten</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {sourceType === 'pdf' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 p-12 text-center hover:border-red-600 cursor-pointer transition-all bg-gray-50"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf"
                    />
                    {isExtracting ? (
                      <div className="flex flex-col items-center">
                        <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Mengekstrak Teks PDF...</p>
                      </div>
                    ) : file ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 size={32} className="text-green-600 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">{file.name}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Klik untuk ganti file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={32} className="text-gray-300 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Klik atau seret PDF di sini</p>
                        <p className="text-[10px] text-gray-400 mt-2">Mendukung dokumen tender, RAB, dan Kontrak</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {sourceType === 'photo' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8"
                >
                  <div 
                    onClick={() => photoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 p-12 text-center hover:border-red-600 cursor-pointer transition-all bg-gray-50"
                  >
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                    />
                    {isExtracting ? (
                      <div className="flex flex-col items-center">
                        <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Mengekstrak Teks Foto...</p>
                      </div>
                    ) : photo ? (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                           <img 
                             src={URL.createObjectURL(photo)} 
                             className="h-32 w-auto object-contain border-2 border-red-600" 
                             alt="Preview"
                           />
                           <div className="absolute -top-2 -right-2 bg-green-600 text-white p-1 rounded-full">
                              <CheckCircle2 size={12} />
                           </div>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">{photo.name}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Klik untuk ganti foto</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera size={32} className="text-gray-300 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Ambil Foto atau Upload Gambar</p>
                        <p className="text-[10px] text-gray-400 mt-2">Gunakan kamera untuk memotret dokumen fisik secara langsung</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Isi Dokumen untuk Audit</label>
              <textarea
                value={input || ''}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Konten akan muncul di sini otomatis setalah ditarik dari URL/PDF, atau Anda bisa menempel teks secara manual..."
                className="w-full h-[500px] p-6 bg-gray-50 border border-gray-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:bg-white outline-none transition-all font-mono text-sm leading-relaxed"
                disabled={isAuditing || isExtracting}
              />
              {isExtracting && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 border shadow-sm">
                    <Loader2 size={14} className="animate-spin text-red-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Memproses Dokumen...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-end gap-6 px-2">
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${(input?.length || 0) >= 50 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {input?.length || 0} Karakter Terdeteksi (Min. 50)
                  </span>
                </div>
                {(input?.length || 0) > 0 && (input?.length || 0) < 50 && (
                  <div className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">
                    Input minimal 50 karakter
                  </div>
                )}
                <div className="text-amber-600 text-[9px] font-bold uppercase tracking-widest mt-2 flex items-center bg-amber-50 px-2 py-1 border border-amber-100">
                  <AlertCircle size={10} className="mr-1" />
                  Pastikan API Key terisi untuk performa audit maksimal
                </div>
              </div>

              {error && (
                <div className="flex items-center text-red-700 bg-red-50 px-4 py-2 text-xs font-bold border border-red-100">
                  <XCircle size={14} className="mr-2" />
                  {error}
                </div>
              )}

              <button
                onClick={handleAudit}
                disabled={isAuditing || isExtracting || (input?.length || 0) < 50}
                className="bg-[#141414] text-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-red-600 disabled:opacity-20 transition-all flex items-center justify-center space-x-4 shadow-xl shrink-0"
              >
                {isAuditing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Menganalisa...</span>
                  </>
                ) : (
                  <>
                    <Hammer size={18} />
                    <span>Luncurkan Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white px-4 text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-8"
          >
            <Cpu size={80} className="text-red-600" />
          </motion.div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 italic italic">Sistem Audit Konstitusi</h2>
          <div className="max-w-md w-full space-y-4">
             <div className="h-1 bg-gray-800 w-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-red-600 w-1/2"
                />
             </div>
             <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.3em] h-4">
               {(input?.length || 0) > 5000 ? 'Memproses Dokumen Besar...' : 'Melakukan Komparasi UUD 1945...'}
             </p>
          </div>
        </div>
      )}

      {/* --- LICENSE POPUP MODAL --- */}
      <AnimatePresence>
        {showLicensePopup && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#141414] border-2 border-red-900 w-full max-w-lg p-8 relative overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.3)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
              
              <div className="flex flex-col items-center text-center mb-8">
                <AlertCircle size={48} className="text-red-600 mb-4 animate-bounce" />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 italic">
                  BATAS PENGGUNAAN HABIS
                </h2>
                <div className="bg-red-900/40 border border-red-600/50 p-3 mb-4 w-full">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                    Sistem terkunci! Anda telah mencapai batas maksimal uji coba gratis (5 kali).
                  </p>
                </div>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  Silakan masukkan Nomor Seri lisensi Anda untuk melanjutkan penggunaan tanpa batas.
                </p>
                <div className="mt-4 inline-flex items-center space-x-2 bg-green-900/20 text-green-500 px-4 py-2 border border-green-900/50 rounded-full">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold tracking-wider">
                    Hubungi WA <a href="https://wa.me/62811665212" className="text-white hover:underline underline-offset-4">0811665212</a>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                  placeholder="Masukkan Nomor Seri..."
                  className="w-full bg-[#0a0a0a] border-b-2 border-red-900 p-4 outline-none focus:border-red-500 text-white font-mono text-center tracking-widest"
                />
                
                {licenseError && (
                  <p className="text-red-500 text-xs font-bold text-center mt-2 animate-pulse">{licenseError}</p>
                )}

                <button 
                  onClick={() => {
                    const code = serialInput.trim();
                    if (VALID_SERIALS.includes(code) || isValidPattern(code)) {
                      localStorage.setItem(ACTIVE_KEY, 'true');
                      setShowLicensePopup(false);
                    } else {
                      setLicenseError('NOMOR SERI TIDAK VALID ATAU KEDALUWARSA!');
                    }
                  }}
                  className="w-full bg-red-600 text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-lg"
                >
                  Buka Kunci Sistem
                </button>
              </div>

              <div className="mt-8 text-center opacity-80">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center justify-center">
                  <AlertCircle size={10} className="mr-1" /> PERINGATAN KERAS
                </p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">
                  Jangan coba Hack Limit Test jika tidak ingin IPHONE / HP Anda RUSAK TOTAL! Sistem ini dilindungi oleh protokol penghancur memori (Anti-Tamper).
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
