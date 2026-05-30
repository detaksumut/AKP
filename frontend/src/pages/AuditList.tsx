import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { AuditReport, UserProfile } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  ShieldAlert, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Scale,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuditList({ profile }: { profile: UserProfile | null }) {
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    async function fetchAudits() {
      try {
        const auditsData = await ApiService.getAudits();
        
        let filtered = auditsData;
        if (filter !== 'all') {
          filtered = auditsData.filter((a: any) => a.status === filter);
        }

        setAudits(filtered);
      } catch (err) {
        console.error("Fetch Audits Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAudits();
  }, [filter]);

  const filteredAudits = audits.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a as any).summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <header className="mb-16">
        <div className="flex items-center space-x-3 mb-6">
          <span className="h-px w-8 bg-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic">Central Archive</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic mb-8">
          ARSIP <span className="text-red-600">AUDIT</span> AKP
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest max-w-2xl leading-relaxed italic">
          Data komprehensif seluruh hasil audit kebijakan dan pengadaan yang telah diverifikasi oleh Sistem AKP Nasional Indonesia.
        </p>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 border border-gray-100 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="CARI AUDIT..."
            className="w-full bg-white border border-gray-100 py-3 pl-12 pr-4 outline-none focus:border-red-600 text-[10px] font-black uppercase tracking-widest transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
           <Filter size={16} className="text-gray-400 mr-2" />
           {['all', 'published', 'draft'].map((f) => (
             <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-red-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          <AnimatePresence>
            {filteredAudits.map((audit) => (
              <motion.div
                layout
                key={audit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${audit.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                      {audit.riskLevel || 'NOT RATED'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                      {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'Draft'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-red-600 transition-colors mb-4 line-clamp-2 italic">
                    {audit?.title || 'Tanpa Judul'}
                  </h3>
                  
                  <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight mb-8 line-clamp-3 italic">
                    {audit.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center">
                         <span className="text-[10px] font-black italic">{audit.score || 0}</span>
                         <span className="text-[7px] font-bold text-gray-300 uppercase tracking-widest">Score</span>
                      </div>
                      <div className="w-px h-6 bg-gray-100" />
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Verifikator</span>
                         <span className="text-[8px] font-black uppercase italic leading-none">{(audit.authorId || '').slice(0, 8)}...</span>
                      </div>
                   </div>
                   
                   <Link 
                    to={`/audit/${audit.id}`}
                    className="p-3 bg-gray-50 hover:bg-black hover:text-white transition-all text-black group-hover:scale-110"
                   >
                     <ArrowRight size={16} />
                   </Link>
                </div>

                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldAlert size={60} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredAudits.length === 0 && (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-100">
          <FileText size={48} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-300">Data Audit Tidak Ditemukan</h3>
        </div>
      )}
    </div>
  );
}
