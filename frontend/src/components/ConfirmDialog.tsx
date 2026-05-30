import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  showCancel?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'warning',
  showCancel = true
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertCircle className="text-red-600" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-600" size={24} />;
      case 'success': return <CheckCircle2 className="text-green-600" size={24} />;
      case 'info': return <Info className="text-blue-600" size={24} />;
      default: return <AlertTriangle className="text-amber-600" size={24} />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'success': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white';
      default: return 'bg-[#141414] hover:bg-black text-white';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white max-w-md w-full border-t-4 border-red-600 shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getIcon()}
                  <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                {message}
              </div>
              
              <div className="flex space-x-3">
                {showCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                )}
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${getButtonClass()}`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 italic text-[8px] font-black uppercase tracking-widest text-gray-300">
              AKP SECURITY PROTOCOL ACCESS
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
