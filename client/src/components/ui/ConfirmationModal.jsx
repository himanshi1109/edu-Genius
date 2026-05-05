import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Yes, Enroll",
  cancelLabel = "No, Cancel",
  isLoading = false 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass-card p-6 shadow-2xl border-[var(--accent-blue)]/20"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-[var(--accent-blue)]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{message}</p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <AnimatedButton 
                  variant="outline" 
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </AnimatedButton>
                <AnimatedButton 
                  variant="gradient" 
                  className="flex-1"
                  onClick={onConfirm}
                  loading={isLoading}
                >
                  {confirmLabel}
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
