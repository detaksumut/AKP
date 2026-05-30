import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { JournalismArticle, UserProfile } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Globe, 
  Share2, 
  Printer, 
  Tag, 
  Loader2, 
  Newspaper,
  ShieldCheck,
  TrendingUp,
  Trash2,
  PenTool,
  CheckCircle2,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import ConfirmDialog from '../components/ConfirmDialog';
import ConstitutionalWarning from '../components/ConstitutionalWarning';

export default function ArticleDetail({ profile }: { profile: UserProfile | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<JournalismArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const ensureString = (val: any) => {
    if (Array.isArray(val)) return val.join('\n\n');
    if (typeof val === 'string') {
      // Unescape double escaped \n sequences
      let cleaned = val.replace(/\\n/g, '\n');
      // Clean up any leaked JSON-like trailing parts that end in the content
      cleaned = cleaned.replace(/(?:\\")?",\s*(?:\\")?(?:category|tags|headline|title)(?:\\")?\s*:\s*[\s\S]*$/gi, '');
      return cleaned.trim();
    }
    return val || '';
  };

  const startEditing = () => {
    if (!article) return;
    setEditHeadline(article.headline || '');
    setEditContent(ensureString(article.content));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id || !article) return;
    setSaving(true);
    try {
      await ApiService.updateArticle(id, {
        title: editHeadline,
        content: editContent
      });
      setArticle({ ...article, headline: editHeadline, content: editContent } as any);
      setIsEditing(false);
      setConfirmState({
        isOpen: true,
        title: 'Berhasil',
        message: 'Berita berhasil diperbarui (Override AKP).',
        variant: 'success',
        showCancel: false,
        onConfirm: () => {}
      });
    } catch (err) {
      console.error("Update Article Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !article) return;
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    setConfirmState({
      isOpen: true,
      title: 'Ubah Status Berita',
      message: `Ubah status berita menjadi ${nextStatus.toUpperCase()}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await ApiService.updateArticle(id, { status: nextStatus });
          setArticle({ ...article, status: nextStatus });
        } catch (err) {
          console.error("Toggle Status Error:", err);
        }
      }
    });
  };

  useEffect(() => {
    async function fetchArticle() {
      if (!id) return;
      try {
        const snap = await ApiService.getArticle(id);
        if (snap) {
          const art = {
            ...snap,
            headline: snap.headline || snap.title, // Keep headline or fallback to title
          };
          setArticle(art as any);
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error("Fetch Article Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setConfirmState({
      isOpen: true,
      title: 'Hapus Berita',
      message: 'Apakah Anda yakin ingin menghapus berita ini secara permanen?',
      variant: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await ApiService.deleteArticle(id);
          navigate('/news');
        } catch (err: any) {
          console.error("Delete Article Error:", err);
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print call error:", err);
    }

    // Jika berjalan di dalam iframe sandbox (seperti preview AI Studio) yang memblokir window.print()
    if (window.self !== window.top) {
      setConfirmState({
        isOpen: true,
        title: 'Petunjuk Cetak (Iframe Detected)',
        message: (
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold text-gray-900 text-xs">
              Aplikasi dideteksi sedang dalam bingkai (iframe) AI Studio yang membatasi pembuangan dialog cetak langsung dari browser.
            </p>
            <p className="text-[11px] leading-relaxed">
              Untuk mencetak artikel / berita investigasi dengan format bersih & rapi, silakan buka aplikasi di tab mandiri yang bersih:
            </p>
            <div className="bg-red-50 border-l-2 border-red-600 p-3 my-2 text-[11px] text-red-900 rounded-sm">
              <strong>Info Browser:</strong> Browser melarang dialog cetak pada elemen bersarang (iframe) demi privasi, sehingga tombol cetak harus dijalankan dari luar frame.
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm inline-block"
              >
                Buka Aplikasi di Tab Baru ↗
              </a>
              <p className="text-[10px] text-gray-400 text-center italic mt-1">
                Setelah tab baru terbuka, klik kembali ikon Printer di halaman tersebut untuk meluncurkan dialog cetak bawaan browser Anda seutuhnya.
              </p>
            </div>
          </div>
        ),
        variant: 'info',
        showCancel: false,
        onConfirm: () => {}
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!id || !file) return;
    
    if (file.size > 800 * 1024) {
      setConfirmState({
        isOpen: true,
        title: 'File Terlalu Besar',
        message: 'Ukuran gambar terlalu besar. Maksimum 800KB.',
        variant: 'danger',
        showCancel: false,
        onConfirm: () => {}
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await ApiService.updateArticle(id, { image_url: base64String });
        setArticle(prev => prev ? { ...prev, thumbnailUrl: base64String, image_url: base64String } : null);
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleShare = async () => {
    if (!article) return;
    const shareData = {
      title: article.headline,
      text: article.content.substring(0, 100) + '...',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setConfirmState({
          isOpen: true,
          title: 'Tautan Disalin',
          message: 'Tautan berita telah disalin ke papan klip.',
          variant: 'success',
          showCancel: false,
          onConfirm: () => {}
        });
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  if (!article) return (
    <div className="max-w-xl mx-auto py-32 text-center">
      <h1 className="text-3xl font-black uppercase tracking-tighter italic">Berita Tidak Ditemukan</h1>
      <Link to="/news" className="text-red-600 font-bold uppercase mt-8 inline-block underline">Kembali ke Lensa News</Link>
    </div>
  );

  const formatDate = (date: any) => {
    if (!date) return 'Draft';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Draft';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Draft';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Editor Control Desk */}
      <div className="sticky top-0 z-[50] bg-[#1a1a1a] border-b border-white/10 text-white py-3 px-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print select-none">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-200">AKP EDITOR DESK</span>
          <span className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-[9px] py-0.5 px-3.5 bg-red-950 text-red-400 border border-red-900/40 font-bold uppercase tracking-widest rounded-full">
            {article.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 select-none">
          <button
             onClick={isEditing ? handleSaveEdit : startEditing}
             disabled={saving}
             className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white px-3 sm:px-4 py-2 border border-zinc-700 transition-colors rounded-sm shadow-sm cursor-pointer"
          >
            {saving ? <Loader2 size={10} className="animate-spin" /> : isEditing ? <CheckCircle2 size={12} className="text-green-500" /> : <PenTool size={12} className="text-blue-400" />}
            <span>{isEditing ? 'Simpan Perubahan' : 'Override AKP'}</span>
          </button>
          
          {isEditing && (
             <button 
               onClick={() => setIsEditing(false)} 
               className="text-[9px] font-black uppercase tracking-widest bg-zinc-800 hover:bg-red-850 px-3 sm:px-4 py-2 border border-zinc-700 transition-colors rounded-sm text-gray-300 cursor-pointer"
             >
               Batal
             </button>
          )}

          <button
             onClick={handleToggleStatus}
             className={`flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest px-3 sm:px-4 py-2 border transition-colors rounded-sm shadow-sm cursor-pointer ${
               article.status === 'published' 
                 ? 'bg-amber-950 text-amber-300 border-amber-900/40 hover:bg-amber-900' 
                 : 'bg-green-950 text-green-300 border-green-900/40 hover:bg-green-900'
             }`}
          >
            <Globe size={12} />
            <span>{article.status === 'published' ? 'Unpublish' : 'Publish'}</span>
          </button>

          <button
             onClick={handleDelete}
             disabled={deleting}
             className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest bg-red-950 hover:bg-red-900 active:bg-red-950 text-red-300 px-3 sm:px-4 py-2 border border-red-900/40 transition-colors rounded-sm shadow-sm cursor-pointer"
          >
            {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={12} />}
            <span>Hapus Data</span>
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
               onClick={handleShare}
               className="p-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-gray-300 transition-colors border border-zinc-750 rounded-sm cursor-pointer"
               title="Bagikan Tautan"
            >
              <Share2 size={14} />
            </button>
            <button 
               onClick={handlePrint}
               className="p-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-gray-300 transition-colors border border-zinc-750 rounded-sm cursor-pointer"
               title="Cetak Berita"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative py-24 bg-[#141414] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <ShieldCheck size={400} className="absolute -top-20 -right-20" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Link to="/news" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white transition-colors mb-12">
            <ArrowLeft size={12} className="mr-2" /> Kembali ke Newsroom
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className="h-px w-8 bg-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">{article.category}</span>
            <span className="h-px w-8 bg-red-600" />
          </div>

          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight italic">
            {isEditing ? (
              <textarea 
                value={editHeadline || ''}
                onChange={(e) => setEditHeadline(e.target.value)}
                className="w-full bg-white/10 p-4 border-2 border-dashed border-red-600 outline-none text-white text-center"
              />
            ) : (
              article.headline
            )}
          </h1>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="flex items-center">
              <Calendar size={12} className="mr-2 text-red-600" />
              {formatDate(article.createdAt || (article as any).created_at)}
            </div>
            <div className="flex items-center">
              <User size={12} className="mr-2 text-red-600" />
              AKP AKP JOURNALIST
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 -mt-12 relative z-20 pb-32">
        <article className="bg-white p-8 md:p-16 border border-gray-100 shadow-2xl">
          {(article.thumbnailUrl || article.image_url) ? (
            <div className="mb-12 -mx-8 md:-mx-16 -mt-8 md:-mt-16 overflow-hidden relative group">
              <img 
                src={article.thumbnailUrl || article.image_url} 
                alt={article.headline} 
                className="w-full h-auto object-cover max-h-[500px]" 
                referrerPolicy="no-referrer"
              />
              <label className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                 <Camera size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Ubah Foto</span>
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) handleImageUpload(file);
                   }}
                 />
              </label>
            </div>
          ) : (
            <div className="mb-12 -mx-8 md:-mx-16 -mt-8 md:-mt-16 bg-gray-50 h-64 border-b border-gray-100 flex flex-col items-center justify-center text-gray-400">
              <label className="flex flex-col items-center cursor-pointer hover:text-red-600 transition-colors">
                <Camera size={48} className="mb-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Upload Foto Headline</span>
                <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) handleImageUpload(file);
                   }}
                 />
              </label>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-12 py-4 border-y border-gray-100 select-none">
             <div className="flex flex-wrap gap-2 max-w-full">
               {article.tags?.map(tag => (
                 <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-gray-400">#{tag}</span>
               ))}
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center">
               <ShieldCheck size={14} className="mr-2 text-red-600 animate-pulse" /> HASIL INVESTIGASI RESMI AKP
             </div>
          </div>

          <div className="prose max-w-none">
             {isEditing ? (
               <textarea 
                 value={editContent || ''}
                 onChange={(e) => setEditContent(e.target.value)}
                 className="w-full min-h-[500px] p-6 bg-gray-50 border-2 border-dashed border-red-200 outline-none font-serif text-lg"
               />
             ) : (
               <ReactMarkdown>{ensureString(article.content)}</ReactMarkdown>
             )}
          </div>

          <ConstitutionalWarning className="my-12" />

          {/* Footer Card */}
          <div className="mt-20 p-10 bg-gray-50 border border-gray-100 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <ShieldCheck size={120} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4 flex items-center">
              <Newspaper size={14} className="mr-2" /> AKURASI & INTEGRITAS
            </h4>
            <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
              Artikel ini diciptakan secara otomatis oleh AKP Journalism AKP melalui audit kebijakan berbasis 
              data dan Konstitusi UUD 1945. Seluruh fakta berasal dari verifikasi auditor bersertifikat AKP.
            </p>
            <div className="mt-8 flex items-center justify-between">
               <Link 
                 to={`/audit/${article.auditId}`} 
                 className="text-[10px] font-black uppercase tracking-widest text-black hover:text-red-600 underline"
               >
                 Lihat Dokumen Audit Asli
               </Link>
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">AKP VERIFIED B01</span>
            </div>
          </div>
        </article>
      </main>

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
      />
    </div>
  );
}
