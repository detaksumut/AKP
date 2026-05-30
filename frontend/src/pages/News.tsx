import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { JournalismArticle, UserProfile } from '../types';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Tag, 
  ArrowRight, 
  Search, 
  Loader2,
  ShieldCheck,
  TrendingUp,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function News({ profile }: { profile: UserProfile | null }) {
  const [articles, setArticles] = useState<JournalismArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    async function fetchNews() {
      try {
        const allArticles = await ApiService.getArticles();
        
        let filtered = allArticles;
        if (category !== 'ALL') {
          filtered = allArticles.filter((a: any) => a.category === category);
        }

        setArticles(filtered);
      } catch (err) {
        console.error("Fetch News Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [category]);

  const filteredArticles = articles.filter(a => 
    a.headline?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a as any).content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['ALL', 'Politik', 'Hukum', 'Ekonomi', 'Investigasi'];

  return (
    <div className="bg-[#FDFDFD] min-h-screen">
      {/* Featured Header */}
      <header className="bg-[#141414] text-white py-24 md:py-32 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Globe size={600} className="absolute -top-40 -right-40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className="h-px w-12 bg-red-600" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Lensa Berita Rakyat</span>
            <span className="h-px w-12 bg-red-600" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-12">
            AKP <span className="text-red-600">NEWSROOM</span>
          </h1>
          <p className="text-sm md:text-lg font-bold text-gray-400 uppercase tracking-tight max-w-2xl mx-auto leading-relaxed border-t border-white/5 pt-12">
            Portal jurnalisme berbasis audit kebijakan nasional. 
            Mengungkap narasi dibalik setiap keputusan publik melalui lensa Konstitusi.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-32">
        {/* Search & Filter Bar */}
        <div className="bg-white shadow-2xl border border-gray-100 p-6 md:p-10 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
             <div className="md:col-span-4 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="CARI BERITA..."
                  className="w-full bg-gray-50 border-white border-2 py-3 pl-12 pr-4 outline-none focus:border-red-600 transition-all text-[10px] font-black uppercase tracking-widest italic"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="md:col-span-8 flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-gray-100">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} featured={index === 0} />
            ))}
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-32 bg-white border border-gray-100">
             <Newspaper size={64} className="mx-auto text-gray-100 mb-8" />
             <h3 className="text-2xl font-black uppercase tracking-tighter italic text-gray-300">Belum Ada Berita Diterbitkan</h3>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <section className="bg-white py-20 border-t border-gray-100 text-center">
         <div className="max-w-2xl mx-auto px-4">
            <ShieldCheck size={48} className="mx-auto text-red-600 mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4">INTEGRITAS JURNALISME</h2>
            <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest mb-12">
               Setiap artikel yang diterbitkan melalui Portal News AKP telah melalui proses audit manual 
               dan verifikasi data primer sesuai dengan marwah Konstitusi UUD 1945.
            </p>
         </div>
      </section>
    </div>
  );
}

function ArticleCard({ article, featured }: { article: JournalismArticle, featured?: boolean }) {
  const formatDate = (date: any) => {
    if (!date) return 'Draft';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Draft';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Draft';
    }
  };

  return (
    <Link 
      to={`/news/${article.id}`} 
      className={`group bg-white p-8 md:p-12 border border-gray-50 flex flex-col justify-between hover:z-30 hover:shadow-[0_0_100px_rgba(0,0,0,0.1)] transition-all ${featured ? 'md:col-span-2' : ''}`}
    >
       <div>
          <div className="flex items-center justify-between mb-8 overflow-hidden">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">{article.category}</span>
             <span className="h-px w-12 bg-gray-100 group-hover:w-full transition-all duration-700" />
          </div>
          
          <h2 className={`${featured ? 'text-2xl md:text-4xl' : 'text-xl'} font-black uppercase tracking-tighter leading-tight mb-6 italic group-hover:text-red-700 transition-colors`}>
            {article.headline || article.title}
          </h2>
          
          <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
             <div className="flex items-center">
                <Calendar size={12} className="mr-2 text-red-600" />
                {formatDate(article.createdAt || (article as any).created_at)}
             </div>
             <div className="flex items-center">
                <User size={12} className="mr-2 text-red-600" />
                AKP TEAM
             </div>
          </div>
          
          {(article.thumbnailUrl || article.image_url) && (
            <div className="mb-8 overflow-hidden h-64 border border-gray-100 bg-gray-50">
               <img 
                 src={article.thumbnailUrl || article.image_url} 
                 alt={article.headline || article.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                 referrerPolicy="no-referrer" 
               />
            </div>
          )}
          
          <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight mb-12 line-clamp-3 italic">
            {article.title}
          </p>
       </div>

       <div className="flex items-center justify-between pt-8 border-t border-gray-50">
          <div className="flex space-x-2">
             {article.tags?.slice(0, 3).map(tag => (
               <span key={tag} className="text-[8px] font-black uppercase text-gray-300">#{tag}</span>
             ))}
          </div>
          <ArrowRight size={20} className="text-gray-200 group-hover:text-red-600 group-hover:translate-x-2 transition-all" />
       </div>
    </Link>
  );
}
