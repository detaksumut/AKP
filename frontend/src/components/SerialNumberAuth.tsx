import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, KeyRound, Loader2, ArrowRight } from 'lucide-react';

interface SerialNumberAuthProps {
  onValidSerial: () => void;
}

export default function SerialNumberAuth({ onValidSerial }: SerialNumberAuthProps) {
  const [serial, setSerial] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Daftar Nomor Seri yang sah (Opsi B: Daftar Statis)
  // Anda dapat menambahkan atau menghapus nomor seri di daftar ini.
  const VALID_SERIALS = [
    'AKP-MASTER-2026',
    'AKP-VIP-001',
    'AKP-VIP-002',
    'AKP-VIP-003'
  ];

  // Aturan Pola Khusus (Opsi A)
  // Misalnya: Berawalan "AKP-", diikuti 4 angka tahun, lalu bebas huruf besar/angka 5 digit.
  // Contoh valid: AKP-2026-X7Y8Z
  // Ditambah: Pola baru AKP-XXXXXXXX (8 huruf acak divalidasi checksum)
  const isValidPattern = (code: string) => {
    const pattern = /^AKP-\d{4}-[A-Z0-9]{5}$/;
    if (pattern.test(code)) return true;

    if (!code.startsWith("AKP-")) return false;
    const payload = code.slice(4);
    if (!/^[A-Z]{8}$/.test(payload)) return false;
    const weights = [3, 7, 1, 9, 5, 8, 2, 6];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += payload.charCodeAt(i) * weights[i];
    }
    return sum % 13 === 7;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulasi loading agar terlihat proses verifikasi di sistem
    setTimeout(() => {
      const code = serial.trim().toUpperCase();
      
      if (VALID_SERIALS.includes(code) || isValidPattern(code)) {
        // Jika cocok, simpan status aktif di memori perangkat
        localStorage.setItem('akp_license_active', 'true');
        
        // Kirim log aktivitas ke Google Sheets
        const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby-ruxlJa_-qW4Xxb6bBM9I7uGQVBLqh2vJdmLJSLbtf232GjJn0ri1L9CDY1TSGFw7hQ/exec";
        if (!GOOGLE_SHEET_URL.includes("PLACEHOLDER")) {
          try {
            fetch(GOOGLE_SHEET_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                app: "Audit Kebijakan Publik",
                license: code,
                action: "Aktivasi",
                userAgent: navigator.userAgent
              })
            }).catch(() => {});
          } catch (err) {}
        }
        
        onValidSerial();
      } else {
        // Jika tidak cocok
        setError('Nomor Seri tidak valid atau sudah kedaluwarsa.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-white font-sans relative overflow-hidden">
      {/* Background Ornamen */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <ShieldAlert size={600} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#141414] border border-red-900/30 shadow-2xl relative z-10"
      >
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center rounded-sm">
              <KeyRound className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-tighter italic">AKTIVASI SISTEM</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">AKP Newsroom</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-8 leading-relaxed font-medium">
            Akses ke sistem ini dibatasi. Silakan masukkan Nomor Seri (License Key) Anda untuk mengaktifkan aplikasi.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center">
                NOMOR SERI LISENSI
              </label>
              <input 
                type="text" 
                value={serial}
                onChange={e => setSerial(e.target.value.toUpperCase())}
                placeholder="Misal: AKP-MASTER-2026"
                className="w-full bg-[#1a1a1a] border-b-2 border-gray-800 p-4 outline-none focus:border-red-600 transition-colors font-mono text-center tracking-widest uppercase text-white"
                required
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xs text-red-500 font-medium text-center bg-red-900/20 py-2 px-3 border border-red-900/50"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading || !serial}
              className="w-full bg-red-600 text-white py-4 px-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>AKTIFKAN APLIKASI</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-[#0f0f0f] p-4 border-t border-gray-900 text-center">
          <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">
            Sistem Audit Kebijakan Nasional &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
