import { ShieldAlert } from 'lucide-react';

export default function ConstitutionalWarning({ className = "" }: { className?: string }) {  
  return (
    <div className={`p-8 bg-black text-white border-l-4 border-red-600 relative overflow-hidden ${className}`}>
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
        <ShieldAlert size={120} className="-mr-8 -mb-8" />
      </div>
      <div className="relative z-10">
        <h4 className="text-base md:text-xl font-black uppercase tracking-[0.2em] text-red-600 mb-4 flex items-center">
          <ShieldAlert size={24} className="mr-3" /> PERINGATAN KONSTITUSIONAL
        </h4>
        <p className="text-sm md:text-base font-bold text-gray-300 leading-relaxed italic uppercase tracking-tight">
          SISTEM INI BERJALAN SECARA INDEPENDEN. SEGALA HASIL AUDIT BERDASARKAN ANALISIS DATA OBJEKTIF DAN SUMBER HUKUM YANG BERLAKU DI REPUBLIK INDONESIA.
        </p>
      </div>
    </div>
  );
}
