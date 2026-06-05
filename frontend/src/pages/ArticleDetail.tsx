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
  X,
  BookOpen,
  Download,
  FileText
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
  const [printMode, setPrintMode] = useState<'all' | 'audit' | 'article'>('all');
  const [activeTab, setActiveTab] = useState<'audit' | 'article'>('audit');

  useEffect(() => {
    if (printMode !== 'all') {
      window.print();
      const timer = setTimeout(() => {
        setPrintMode('all');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printMode]);

  const handlePrintAudit = () => {
    setPrintMode('audit');
  };

  const handlePrintArticle = () => {
    setPrintMode('article');
  };

  const getScoreInfo = (score: number) => {
    if (score >= 90) return { label: 'Sangat Baik', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 80) return { label: 'Baik', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 70) return { label: 'Cukup', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (score >= 60) return { label: 'Perlu Revisi Mayor', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'Belum Layak Submit', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const handleDownloadAuditDOC = () => {
    if (!article) return;
    const score = article.auditScore || 0;
    const scoreInfo = getScoreInfo(score);
    
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>\n`;
    html += `<head>\n`;
    html += `<meta charset="utf-8">\n`;
    html += `<title>Laporan Audit Akademik - ${article.title}</title>\n`;
    html += `<style>\n`;
    html += `  body { font-family: 'Calibri', sans-serif; line-height: 1.5; color: #1a1a1a; }\n`;
    html += `  h1 { font-family: 'Arial Black', sans-serif; color: #990000; border-bottom: 2px solid #990000; padding-bottom: 5px; }\n`;
    html += `  h2 { font-family: 'Arial', sans-serif; border-bottom: 1px solid #cccccc; padding-bottom: 3px; margin-top: 20px; }\n`;
    html += `  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }\n`;
    html += `  td, th { border: 1px solid #dddddd; padding: 8px; text-align: left; }\n`;
    html += `  .label { font-weight: bold; background-color: #f5f5f5; width: 30%; }\n`;
    html += `</style>\n`;
    html += `</head>\n`;
    html += `<body>\n`;
    html += `<h1>LAPORAN AUDIT AKADEMIK AI</h1>\n`;
    html += `<p>Dihasilkan secara otomatis oleh AKP Journalism AKP Platform</p>\n`;
    
    html += `<table>\n`;
    html += `  <tr><td class="label">Judul Naskah</td><td>${article.headline || article.title}</td></tr>\n`;
    html += `  <tr><td class="label">Bidang Ilmu Terdeteksi</td><td>${article.detectedField || 'N/A'}</td></tr>\n`;
    html += `  <tr><td class="label">Rekomendasi Jurnal</td><td>${article.journalRecommendation || 'N/A'}</td></tr>\n`;
    html += `  <tr><td class="label">Tingkat Kecocokan</td><td>${article.matchPercentage ? `${article.matchPercentage}%` : 'N/A'}</td></tr>\n`;
    html += `  <tr><td class="label">Skor Audit Akademik</td><td><b>${score} / 100</b> (${scoreInfo.label})</td></tr>\n`;
    html += `</table>\n`;

    html += `<h2>Temuan Audit Akademik</h2>\n`;
    html += `<div style="white-space: pre-wrap;">${ensureString(article.auditFindings).replace(/\n/g, '<br/>')}</div>\n`;

    html += `<h2>Daftar Perbaikan yang Diperlukan</h2>\n`;
    html += `<div style="white-space: pre-wrap;">${ensureString(article.auditImprovements).replace(/\n/g, '<br/>')}</div>\n`;

    html += `</body>\n`;
    html += `</html>`;

    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LAPORAN_AUDIT_AKADEMIK_${article.title.replace(/[^a-z0-9]+/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadArticleDOC = () => {
    if (!article) return;
    
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>\n`;
    html += `<head>\n`;
    html += `<meta charset="utf-8">\n`;
    html += `<title>${article.title}</title>\n`;
    html += `<style>\n`;
    html += `  body { font-family: 'Georgia', serif; line-height: 1.6; color: #111111; text-align: justify; margin: 1in; }\n`;
    html += `  h1 { font-family: 'Arial', sans-serif; text-align: center; font-size: 22pt; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }\n`;
    html += `  h2 { font-family: 'Arial', sans-serif; font-size: 14pt; font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #777777; padding-bottom: 3px; }\n`;
    html += `  h3 { font-family: 'Arial', sans-serif; font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 5px; }\n`;
    html += `  p { margin-bottom: 15px; text-indent: 0.5in; }\n`;
    html += `  .no-indent { text-indent: 0; }\n`;
    html += `</style>\n`;
    html += `</head>\n`;
    html += `<body>\n`;
    html += `<h1>${article.headline || article.title}</h1>\n`;
    
    let contentHtml = ensureString(article.content);
    contentHtml = contentHtml.replace(/^### (.*$)/gim, '<h3>$1</h3>')
                             .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                             .replace(/^# (.*$)/gim, '<h1>$1</h1>');
                             
    contentHtml = contentHtml.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    contentHtml = contentHtml.replace(/\*(.*?)\*/g, '<i>$1</i>');
    
    const paragraphs = contentHtml.split(/\n\n+/);
    const parsedHtml = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('</h')) return p;
      if (p.startsWith('- ')) {
        const items = p.split('\n');
        return '<ul>' + items.map(li => `<li>${li.replace(/^- /, '')}</li>`).join('') + '</ul>';
      }
      return `<p>${p}</p>`;
    }).join('\n');

    html += parsedHtml;
    html += `</body>\n`;
    html += `</html>`;

    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ARTIKEL_VERSI_PERBAIKAN_${article.title.replace(/[^a-z0-9]+/gi, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAuditReportPrintable = () => {
    if (!article) return null;
    const score = article.auditScore || 0;
    const scoreInfo = getScoreInfo(score);
    return (
      <div className="space-y-8">
        <div className="text-center border-b pb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-red-600">LAPORAN AUDIT AKADEMIK AI</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Sistem Penilaian & Evaluasi Jurnal Ilmiah AKP</p>
        </div>
        
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-bold w-1/3 text-gray-500 uppercase tracking-wider text-[10px]">Judul Naskah</td>
              <td className="py-2 text-gray-900 font-bold">{article.headline || article.title}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Bidang Ilmu Terdeteksi</td>
              <td className="py-2 text-gray-900 font-bold">{article.detectedField || 'N/A'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Rekomendasi Jurnal</td>
              <td className="py-2 text-red-600 font-bold">{article.journalRecommendation || 'N/A'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tingkat Kecocokan</td>
              <td className="py-2 text-gray-900 font-bold">{article.matchPercentage ? `${article.matchPercentage}%` : 'N/A'}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Skor Audit Akademik</td>
              <td className="py-2 text-gray-900 font-bold">
                <span className="font-extrabold text-lg text-red-600">{score}</span> / 100 ({scoreInfo.label})
              </td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-red-600 border-b pb-2">Temuan Audit Akademik</h2>
          <div className="prose prose-sm leading-relaxed max-w-none font-sans text-gray-800">
            <ReactMarkdown>{article.auditFindings || 'Tidak ada temuan audit.'}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-red-600 border-b pb-2">Daftar Perbaikan yang Diperlukan</h2>
          <div className="prose prose-sm leading-relaxed max-w-none font-sans text-gray-800">
            <ReactMarkdown>{article.auditImprovements || 'Tidak ada daftar perbaikan.'}</ReactMarkdown>
          </div>
        </div>

        <div className="pt-12 text-center border-t text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Dihasilkan otomatis oleh AKP Academic Editor AI
        </div>
      </div>
    );
  };

  const renderArticlePrintable = () => {
    if (!article) return null;
    return (
      <div className="space-y-8 font-serif leading-relaxed max-w-none text-justify">
        <h1 className="text-3xl font-bold text-center leading-tight uppercase mb-8">{article.headline || article.title}</h1>
        
        <div className="prose max-w-none font-serif text-gray-900 leading-relaxed">
          <ReactMarkdown>{ensureString(article.content)}</ReactMarkdown>
        </div>
        
        <div className="pt-12 text-center border-t text-[10px] text-gray-400 font-sans font-bold uppercase tracking-widest">
          Dihasilkan oleh AKP Academic Editor AI - Naskah Siap Submit
        </div>
      </div>
    );
  };

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

  if (printMode === 'audit') {
    return (
      <div className="p-12 max-w-4xl mx-auto bg-white font-sans text-gray-900">
        {renderAuditReportPrintable()}
      </div>
    );
  }

  if (printMode === 'article') {
    return (
      <div className="p-12 max-w-4xl mx-auto bg-white font-serif text-gray-900 leading-relaxed">
        {renderArticlePrintable()}
      </div>
    );
  }

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
      <main className={`mx-auto px-4 -mt-12 relative z-20 pb-32 transition-all duration-300 ${
        article.type === 'academic' ? 'max-w-6xl' : 'max-w-3xl'
      }`}>
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
          {article.type === 'academic' ? (
            <div className="space-y-8">
              {/* Artikel Versi Perbaikan (Academic Editor AI) */}
              <div className="bg-gray-50/50 border border-gray-150 p-6 md:p-12 shadow-inner">
                <div className="max-w-none font-serif text-justify text-gray-900 leading-relaxed select-text">
                  {isEditing ? (
                    <textarea
                      value={editContent || ''}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[500px] p-6 bg-white border border-gray-200 outline-none font-serif text-base leading-relaxed"
                    />
                  ) : (
                    <div className="prose prose-red max-w-none">
                      <ReactMarkdown>{ensureString(article.content)}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Exports */}
              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center no-print">
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">Export Naskah Jurnal</h4>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">Unduh hasil rewrite Academic Editor AI siap submit.</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto select-none">
                  <button
                    onClick={handleDownloadArticleDOC}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-zinc-950 border border-zinc-800 text-white hover:bg-black px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>Export DOCX</span>
                  </button>
                  <button
                    onClick={handlePrintArticle}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-red-600 text-white hover:bg-red-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <Printer size={12} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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
