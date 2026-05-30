import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Scale, 
  Search, 
  Newspaper, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Gavel,
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import ConstitutionalWarning from '../components/ConstitutionalWarning';

export default function LandingPage() {
  return (
    <div className="bg-[#FDFDFD]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#141414] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <ShieldCheck size={800} className="absolute -top-40 -left-40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-10 flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="h-px w-8 bg-red-600 shrink-0" />
                <span className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-red-600 whitespace-nowrap">
                  STRATEGIC INTELLIGENCE SYSTEM
                  <span className="text-white"> - GARDA REPUBLIK INDONESIA</span>
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[1] md:leading-[0.9] italic mb-6 md:mb-8">
              AUDIT PERATURAN & KEBIJAKAN PEMERINTAH <br />
              <span className="text-red-600 text-lg sm:text-xl md:text-3xl lg:text-5xl block mt-2 md:mt-4 tracking-widest font-black not-italic uppercase">PERPU | PERPRES | PERMEN | PERDA</span>
            </h1>
            
            <p className="text-sm md:text-lg font-bold text-gray-400 max-w-xl mb-12 leading-relaxed uppercase tracking-tight">
              AKP adalah Sistem Audit Kebijakan Nasional yang mencermati Integritas Kebijakan Publik dan Pengadaan Pemerintah berdasarkan Marwah UUD 1945.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full">
              <Link 
                to="/new-audit" 
                className="bg-red-600 px-6 py-4 md:px-10 md:py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center group w-full sm:w-auto"
              >
                Audit Kebijakan
                <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/news" 
                className="border-2 border-white/20 px-6 py-4 md:px-10 md:py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center w-full sm:w-auto"
              >
                Lihat Temuan
              </Link>
            </div>
          </motion.div>

          <div className="hidden lg:block relative">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-12">
                   <StatCard icon={ShieldAlert} title="INTEGRITY" score="100%" />
                   <StatCard icon={Scale} title="CONSTITUTION" score="PASSED" />
                </div>
                <div className="space-y-4">
                   <StatCard icon={TrendingUp} title="AUDIT ACCURACY" score="99.9%" />
                   <StatCard icon={Gavel} title="RULE OF LAW" score="UUD '45" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Philosophy Banner */}
      <section className="py-12 bg-red-600 text-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <div className="flex items-center space-x-6">
             <ShieldCheck size={60} className="shrink-0" />
             <div className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                MARWAH KONSTITUSIONAL
             </div>
          </div>
          <div className="text-lg md:text-xl font-black italic max-w-2xl text-white text-center md:text-right uppercase tracking-tight">
            "KEADILAN ADALAH MAHKOTA DARI SETIAP KEBIJAKAN PUBLIK YANG BERADAB."
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-xs md:text-base font-black uppercase tracking-[0.4em] text-red-600 mb-4 md:mb-6">AKP CORE CAPABILITIES</h2>
              <div className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic leading-[0.9]">
                EKOSISTEM INTELEJEN AKP
              </div>
            </div>
            <div className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-widest max-w-md">
                MANDAT KONSTITUSI UNTUK TRANSPARANSI DAN AKUNTABILITAS NASIONAL.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
             <FeatureCard 
                icon={Scale} 
                title="AUDIT KEBIJAKAN" 
                desc="Analisis mendalam terhadap naskah peraturan menggunakan basis data hukum dan UUD 1945." 
             />
             <FeatureCard 
                icon={Zap} 
                title="TRACKING APBN" 
                desc="Pemantauan alokasi anggaran negara terhadap efektivitas kebijakan di lapangan." 
             />
             <FeatureCard 
                icon={Newspaper} 
                title="LENSA NEWS" 
                desc="Portal berita investigasi yang menyajikan temuan dari hasil audit AI." 
             />
             <FeatureCard 
                icon={Globe} 
                title="GLOBAL INTEGRITY" 
                desc="Standarisasi integritas kebijakan publik berdasarkan parameter transparansi global." 
             />
          </div>
        </div>
      </section>

      {/* Peringatan Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 border-t border-gray-100">
         <ConstitutionalWarning />
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] text-white py-16 md:py-20 px-6 md:px-8 border-t-8 border-red-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div className="col-span-1 md:col-span-2">
             <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 mb-8">
                <div className="flex items-center space-x-4">
                  <img 
                    src="/logoMSRI.png" 
                    alt="Logo LSM MSRI" 
                    className="h-16 w-auto object-contain bg-white/5 p-1 rounded border border-white/10"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'logoMSRI.png';
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">AKP Badan Otonomi</span>
                    <span className="text-xl font-extrabold uppercase tracking-tight text-white leading-tight">LSM MSRI</span>
                  </div>
                </div>
                
                <div className="hidden sm:block h-10 w-px bg-white/10" />
                
                <div className="flex items-center space-x-4">
                  <img 
                    src="/logobinews.png" 
                    alt="BiNews Logo" 
                    className="h-14 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-widest text-red-600 italic">SUPERVISI</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Beritaindonesia.news</span>
                  </div>
                </div>
             </div>
             
             <p className="text-sm font-bold text-gray-400 uppercase tracking-tight max-w-2xl mb-4 leading-relaxed">
               AKP (Audit Kebijakan Publik) adalah Badan Otonomi Khusus <span className="text-white">LSM MSRI</span> yang didirikan sebagai instrumen penyelidikan & pengawasan kebijakan strategis nasional.
             </p>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider max-w-2xl mb-12 leading-relaxed">
               Seluruh kegiatan pengawasan kebijakan, audit tata kelola pemerintahan, serta evaluasi fisik & teknis infrastruktur berada di bawah supervisi portal media nasional <span className="text-red-500">Beritaindonesia.news</span> guna menjaga pencerahan, akurasi, dan penyebaran informasi kepada seluruh rakyat Indonesia.
             </p>
          </div>
          <div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-red-600">TRANSPARANSI</h4>
             <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                <li><Link to="/news" className="hover:text-white transition-colors">Lensa News</Link></li>
                <li><Link to="/audits" className="hover:text-white transition-colors">Arsip Audit</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Portal Auditor</Link></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 flex flex-col md:flex-row items-center gap-4">
              <span>© 2024 AKP INTELLIGENCE - BI NEWS NETWORK</span>
              <span className="hidden md:block">|</span>
              <span className="text-red-600">VERIFIED B01 V1.5</span>
           </div>
           
           <div className="text-center md:text-right max-w-md">
              <p className="text-[#FDFDFD]/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">
                "Dan kebanyakan manusia itu tidak mengikuti (kebenaran) selain dugaan (semata)"
              </p>
              <p className="text-red-600/60 text-[9px] font-black uppercase tracking-[0.2em] mt-1">
                — Al Qur'an Surah Yunus 35
              </p>
           </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, title, score }: { icon: any, title: string, score: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-md p-8 border border-white/10 hover:border-red-600 transition-colors group">
       <Icon className="text-red-600 mb-6 group-hover:scale-110 transition-transform" size={32} />
       <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{title}</h4>
       <div className="text-3xl font-black uppercase tracking-tighter italic">{score}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0a0a0a] p-12 border border-white/5 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-2 transition-all group flex flex-col items-center text-center">
       <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-8 group-hover:from-red-600 group-hover:to-red-800 shadow-inner border border-white/10 transition-all duration-300">
          <Icon size={32} className="text-gray-300 group-hover:text-white transition-colors" />
       </div>
       <h3 className="text-base md:text-lg font-black uppercase tracking-widest mb-6 text-gray-100 group-hover:text-red-500 transition-colors">{title}</h3>
       <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-tight">{desc}</p>
    </div>
  );
}
