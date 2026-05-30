import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { AuditReport, UserProfile, JournalismArticle } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ShieldCheck, 
  Zap, 
  Newspaper, 
  Database, 
  ArrowUpRight, 
  PlusCircle, 
  Loader2,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState({
    audits: 0,
    articles: 0,
    riskSum: 0,
    avgScore: 0
  });
  const [latestAudits, setLatestAudits] = useState<AuditReport[]>([]);
  const [latestArticles, setLatestArticles] = useState<JournalismArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const auditsData = await ApiService.getAudits();
        const articlesData = await ApiService.getArticles();

        setLatestAudits((auditsData || []).slice(0, 5));
        setLatestArticles((articlesData || []).slice(0, 5));

        const totalScore = (auditsData || []).reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
        
        setStats({
          audits: (auditsData || []).length,
          articles: (articlesData || []).length,
          riskSum: (auditsData || []).filter((a: any) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length,
          avgScore: (auditsData || []).length > 0 ? Math.round(totalScore / (auditsData || []).length) : 0
        });

      } catch (err) {
        console.error("Dashboard DB Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile.uid]);

  const chartData = [
    { name: 'AUDITS', value: stats.audits },
    { name: 'ARTICLES', value: stats.articles },
    { name: 'CRITICAL', value: stats.riskSum },
    { name: 'SCORE', value: stats.avgScore }
  ];

  if (loading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
              <div className="flex items-center space-x-3 mb-4">
                 <span className="h-px w-8 bg-red-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">COMMANDER DASHBOARD</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                MARWAH <span className="text-red-600">INTEGRITAS</span>
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest italic leading-none">
                AKP Official System - Auditor: {profile.name}
              </p>
        </div>
        <Link 
          to="/new-audit" 
          className="bg-red-600 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] transition-all flex items-center space-x-3"
        >
          <PlusCircle size={14} />
          <span>Mulai Audit Baru</span>
        </Link>
      </header>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <StatBox icon={Database} label="TOTAL AUDIT" value={stats.audits} color="bg-white border-gray-100" />
         <StatBox icon={Newspaper} label="ARTIKEL TERBIT" value={stats.articles} color="bg-white border-gray-100" />
         <StatBox icon={Zap} label="ANOMALI KRITIKAL" value={stats.riskSum} color="bg-red-600 text-white" />
         <StatBox icon={FileText} label="AVG SCORE" value={`${stats.avgScore}%`} color="bg-[#141414] text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8 shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10">Data Performa Auditor</h3>
           <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#A0A0A0' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#F9F9F9' }}
                      contentStyle={{ border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 0, textTransform: 'uppercase', fontSize: 10, fontWeight: 900 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 2 ? '#DC2626' : '#141414'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-8">
           <div className="bg-[#141414] text-white p-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6">Aktivitas Terakhir</h3>
               <div className="space-y-6">
                 {(latestAudits || []).map((audit, idx) => (
                   <Link 
                    key={audit.id ? `${audit.id}-${idx}` : `audit-${idx}`} 
                    to={`/audit/${audit.id}`}
                    className="block group border-l-2 border-white/10 hover:border-red-600 pl-4 transition-all"
                   >
                     <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{audit.createdAt && typeof (audit.createdAt as any).toDate === 'function' ? (audit.createdAt as any).toDate().toLocaleDateString() : audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'Baru Saja'}</div>
                     <div className="text-[11px] font-black uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors line-clamp-1">{audit?.title || 'Tanpa Judul'}</div>
                   </Link>
                 ))}
                 {(!latestAudits || latestAudits.length === 0) && (
                   <div className="text-[10px] font-bold text-gray-600 italic">Belum ada aktivitas audit.</div>
                 )}
              </div>
              <Link to="/audits" className="inline-block mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-red-600 hover:text-white transition-colors">
                Lihat Semua Arsip <ArrowUpRight size={12} className="inline ml-1" />
              </Link>
           </div>

           <div className="bg-red-50 p-8 border border-red-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-4">AKP Journalist AKP</h3>
              <p className="text-[10px] font-bold text-red-900/60 leading-relaxed uppercase mb-6 tracking-tight italic">
                Cek draf berita terbaru yang siap dipublikasikan ke portal Lens News.
              </p>
              <div className="space-y-4">
                 {(latestArticles || []).map((art, idx) => (
                   <div key={art.id ? `${art.id}-${idx}` : `art-${idx}`} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                     <span className="truncate mr-4 italic text-red-900">{art.headline || art.title}</span>
                     <span className={`shrink-0 px-2 py-0.5 ${art.status === 'published' ? 'bg-green-600 text-white' : 'bg-red-200 text-red-700'}`}>{art.status}</span>
                   </div>
                 ))}
                 {(!latestArticles || latestArticles.length === 0) && (
                   <p className="text-[10px] font-bold text-red-300 italic">Tidak ada draf berita.</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="mt-20 pt-16 border-t border-gray-100 flex flex-col items-center justify-center space-y-4">
         <p className="text-[#141414]/30 text-[11px] font-bold uppercase tracking-[0.3em] italic text-center max-w-2xl px-4 leading-loose">
            "Dan kebanyakan manusia itu tidak mengikuti (kebenaran) selain dugaan (semata)"
         </p>
         <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gray-200" />
            <span className="text-red-600/50 text-[10px] font-black uppercase tracking-[0.4em] italic">
               Al Qur'an Surah Yunus 35
            </span>
            <div className="h-px w-12 bg-gray-200" />
         </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <div className={`p-8 shadow-sm group ${color}`}>
       <div className="flex items-center justify-between mb-4">
          <Icon size={18} className="opacity-50 group-hover:scale-110 transition-transform" />
          <div className="h-px w-4 bg-current opacity-30" />
       </div>
       <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</div>
       <div className="text-3xl font-black uppercase tracking-tighter italic leading-none">{value}</div>
    </div>
  );
}
