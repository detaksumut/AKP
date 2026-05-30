import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Terminal,
  ShieldCheck,
  Dot,
  Loader2
} from 'lucide-react';
import type { UserProfile } from '../types';
import { ApiService } from '../services/api.service';
import { useUI } from '../contexts/UIContext';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  createdAt: any;
}

export default function LiveChat({ profile }: { profile: UserProfile | null }) {
  const { isGlobalLoading } = useUI();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [guestId] = useState(() => 'guest-' + Math.random().toString(36).substr(2, 9));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Standalone version uses local state for this session.
    const unsubscribe = () => {};

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    
    try {
      // 1. Add user message to local state
      const userMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: text,
        senderId: profile?.id || guestId,
        senderName: profile?.name || 'Guest Auditor',
        senderRole: profile?.role || 'user',
        createdAt: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      // 2. Trigger AI response
      setIsTyping(true);
      
      try {
        const result = await ApiService.chat(text, []);
        
        if (!result || !result.response) {
          throw new Error('Gagal mendapatkan respon AI.');
        }

        const aiMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          text: result.response,
          senderId: 'akp-ai-system',
          senderName: 'AKP Audit Specialist',
          senderRole: 'admin',
          createdAt: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (err) {
        console.error('AI Error:', err);
      } finally {
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  if (isGlobalLoading || location.pathname !== '/') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans flex flex-col items-end space-y-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 md:w-96 bg-[#141414] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[450px] max-h-[calc(100vh-120px)]"
          >
            {/* Header */}
            <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Terminal size={18} className="text-red-600" />
                  <Dot size={20} className="absolute -top-2 -right-2 text-green-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">AKP Intelligence Support</h3>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest font-sans">Dewan Pakar Audit Selalu Siaga</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">System Ready</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">Konsultasikan temuan janggal Anda langsung dengan Tim Analis Senior AKP.</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = profile ? msg.senderId === profile.id : msg.senderId === guestId;
                const isAI = msg.senderId === 'akp-ai-system';
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1 px-1">
                      {!isMe && <span className={`text-[8px] font-black uppercase tracking-tighter ${isAI ? 'text-red-500' : 'text-gray-400'}`}>
                        {msg.senderName} 
                        {isAI && " (SYSTEM AUTH)"}
                      </span>}
                      {(msg.senderRole === 'admin' || isAI) && <ShieldCheck size={10} className="text-red-500" />}
                    </div>
                    <div className={`max-w-[90%] p-3 text-[11px] leading-relaxed ${
                      isMe 
                        ? 'bg-red-600 text-white rounded-l-lg rounded-tr-lg' 
                        : isAI 
                          ? 'bg-[#1a1a1a] text-red-50 text-xs border-l-2 border-red-600 rounded-r-lg rounded-tl-lg shadow-lg'
                          : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-r-lg rounded-tl-lg'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex items-center space-x-2 text-red-600">
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-widest italic animate-pulse">Meninjau Bukti & Rekam Jejak...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center space-x-2">
              <input 
                type="text"
                placeholder="Tanyakan bantuan atau bicaralah..."
                className="flex-1 bg-black border border-white/5 px-4 py-2 text-xs text-white placeholder:text-gray-700 focus:border-red-600 outline-none transition-all"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2 bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 px-5 bg-red-600 text-white rounded-full flex items-center justify-center space-x-3 shadow-red-900/20 shadow-xl border border-white/10 group relative"
      >
        <MessageSquare size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black uppercase tracking-[0.2em]">CHAT</span>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-white text-red-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-red-600">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
