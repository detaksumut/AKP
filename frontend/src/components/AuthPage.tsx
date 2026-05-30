import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import type { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Scale, 
  Lock, 
  User, 
  Phone, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function AuthPage({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const userData = await ApiService.getUser(formData.phone);
        if (!userData) {
          alert('User tidak ditemukan');
          setLoading(false);
          return;
        }

        if (userData.password === formData.password) {
          onLogin(userData);
          navigate('/dashboard');
        } else {
          alert('Password salah');
        }
      } else {
        // Register Logic
        const existingUser = await ApiService.getUser(formData.phone);
        if (existingUser) {
          alert('Nomor HP sudah terdaftar');
          setLoading(false);
          return;
        }

        const newUser = {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          role: 'admin',
        };
        
        await ApiService.createUser(newUser);
        const savedUser = await ApiService.getUser(formData.phone);
        if (savedUser) {
          onLogin(savedUser);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert('Terjadi kesalahan autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl border border-gray-100 min-h-[600px]">
        {/* Left Side - Info */}
        <div className="bg-[#141414] text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <ShieldCheck size={400} className="absolute -bottom-20 -left-20" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
              <div className="flex flex-col">
                <span className="text-2xl font-black uppercase tracking-tighter italic">AKP</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Audit Kebijakan</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight italic mb-6">
              KONSTITUSI ADALAH PANGLIMA
            </h1>
            <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
              PORTAL AUTENTIKASI
            </p>
          </div>

          <div className="relative z-10 mt-20 pt-12 border-t border-white/10">
             <div className="flex items-center space-x-4 mb-4">
                <ShieldCheck className="text-red-600" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure Portal</span>
             </div>
             <p className="text-[9px] text-gray-500 font-medium italic">
               Sistem Audit AKP dilindungi oleh Protokol Keamanan Nasional. 
               Setiap akses dicatat dalam log integritas AKP.
             </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-2">
              {isLogin ? "Masuk ke" : "Daftar ke"} <span className="text-red-600">AKP</span>
            </h2>
            <div className="h-1 w-12 bg-red-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center">
                  <User size={12} className="mr-2" /> {"Nama Lengkap"}
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-b-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors font-medium"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center">
                <Phone size={12} className="mr-2" /> {"Nomor Telepon"}
              </label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-50 border-b-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center">
                <Lock size={12} className="mr-2" /> {"Kata Sandi"}
              </label>
              <input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-50 border-b-2 border-gray-100 p-3 outline-none focus:border-red-600 transition-colors font-medium"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-white py-4 px-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span>{isLogin ? "Masuk" : "Daftar"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               {isLogin ? "Belum punya akun?" : "Sudah punya akun?"} { ' ' }
               <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-red-600 hover:underline"
               >
                 {isLogin ? "Daftar sekarang" : "Masuk di sini"}
               </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
