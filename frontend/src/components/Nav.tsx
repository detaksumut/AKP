import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Newspaper, 
  Search, 
  LayoutDashboard, 
  PlusCircle, 
  ShieldAlert, 
  LogOut, 
  LogIn,
  Languages,
  Menu,
  X,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Cloud,
  HardDrive
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserProfile } from '../types';

export default function Nav({ 
  profile, 
  logout 
}: { 
  profile: UserProfile | null; 
  logout: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false);  const navigate = useNavigate();
  const [hasApiKey, setHasApiKey] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
    setHasApiKey(!!localStorage.getItem('GEMINI_API_KEY'));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);



  
  const menuItems = [
    { to: '/news', label: "Lensa News", icon: Newspaper },
    { to: '/audits', label: "Arsip Audit", icon: Search },
    { to: '/dashboard', label: "Dashboard", icon: LayoutDashboard, protected: true },
    { to: '/new-audit', label: "Audit Baru", icon: PlusCircle, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 h-20 flex items-center shadow-sm px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-4 group">
            <img 
              src="/logo-akp.png" 
              alt="AKP Logo" 
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Connection Indicators */}
          <div className="hidden md:flex items-center space-x-3 pl-6 border-l border-gray-100">
            <div className={`flex items-center space-x-1.5 ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
               {isOnline ? <Cloud size={10} /> : <WifiOff size={10} />}
               <span className="text-[7px] font-black uppercase tracking-widest">{isOnline ? 'Online AI' : 'Offline Mode'}</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${isElectron ? 'text-blue-600' : 'text-gray-400'}`}>
               <HardDrive size={10} />
               <span className="text-[7px] font-black uppercase tracking-widest">{isElectron ? 'Standalone' : 'Browser Mode'}</span>
            </div>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-8">
          {menuItems.filter(item => {
            if (item.protected) return !!profile;
            return true;
          }).map(item => (
            <Link 
              key={item.to} 
              to={item.to}
              className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors flex items-center space-x-2"
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Link 
            to="/settings"
            className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center space-x-2 relative ${!hasApiKey ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
          >
            <SettingsIcon size={14} />
            <span>Setup</span>
            {!hasApiKey && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
            )}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          
          {profile && (
            <div className="flex items-center space-x-6 pl-6 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                 <div className="text-[10px] font-black uppercase tracking-tight leading-none italic">{profile.name}</div>
               </div>
            </div>
          )}

          <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-20 bg-white z-[60] lg:hidden p-8 flex flex-col space-y-8"
          >
            {menuItems.filter(item => {
              if (item.protected) return !!profile;
              return true;
            }).map(item => (
              <Link 
                key={item.to} 
                to={item.to} 
                onClick={() => setIsOpen(false)}
                className="text-xl font-black uppercase tracking-tighter italic flex items-center space-x-4 border-b border-gray-50 pb-4"
              >
                <item.icon size={24} className="text-red-600" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="text-xl font-black uppercase tracking-tighter italic flex items-center space-x-4 border-b border-gray-50 pb-4"
            >
              <SettingsIcon size={24} className={!hasApiKey ? "text-red-600" : "text-gray-500"} />
              <span className={!hasApiKey ? "text-red-600" : ""}>
                Setup {hasApiKey ? '' : '(Need API Key)'}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
