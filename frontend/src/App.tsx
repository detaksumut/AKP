import { useState, useEffect } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { ApiService } from './services/api.service';
import type { UserProfile } from './types';
import { 
  Scale,
  Loader2
} from 'lucide-react';
import SetupPage from './pages/SetupPage';
import SerialNumberAuth from './components/SerialNumberAuth';
import { motion } from 'motion/react';
import { UIProvider } from './contexts/UIContext';

// Components
import Nav from './components/Nav';
import AuthPage from './components/AuthPage';
import LiveChat from './components/LiveChat';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuditList from './pages/AuditList';
import AuditDetail from './pages/AuditDetail';
import NewAudit from './pages/NewAudit';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import JournalMaker from './pages/JournalMaker';
import Settings from './pages/Settings';

export default function App() {
  // Set default profile so user is always logged in
  const [profile, setProfile] = useState<UserProfile | null>({
    uid: 'admin-1',
    name: 'Administrator',
    phone: '000000',
    role: 'admin',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  // logout function is now empty or removed, but we keep it to not break Nav props if passed
  const logout = () => {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex flex-col items-center gap-6"
        >
          <Scale size={48} className="text-red-600" />
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-gray-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Memuat Sistem...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (needsSetup) {
    return <SetupPage onComplete={() => setNeedsSetup(false)} />;
  }

  return (
    <UIProvider>
        <Router>
          <div className="min-h-screen bg-[#FDFDFD] text-[#141414] font-sans selection:bg-red-200">
            <Nav profile={profile} logout={logout} />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/news" element={<News profile={profile} />} />
                <Route path="/news/:id" element={<ArticleDetail profile={profile} />} />
                <Route path="/audits" element={<AuditList profile={profile} />} />
                <Route path="/audit/:id" element={<AuditDetail profile={profile} />} />
                <Route path="/journal" element={<JournalMaker profile={profile!} />} />
                
                <Route 
                  path="/dashboard" 
                  element={<Dashboard profile={profile!} />} 
                />
                <Route 
                  path="/new-audit" 
                  element={<NewAudit profile={profile!} />} 
                />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <LiveChat profile={profile} />
          </div>
        </Router>
      </UIProvider>
  );
}
