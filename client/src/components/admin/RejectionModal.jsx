import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';

const RejectionModal = ({ isOpen, onClose, onSubmit, courseName }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card p-6 border-[var(--accent-blue)]/20"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface-light)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">Reject Course</h2>
                <p className="text-sm text-[var(--text-muted)]">Please provide a reason for rejecting <span className="text-[var(--accent-blue)] font-medium">{courseName}</span></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., The audio quality in Module 1 is too low, please re-record."
                className="input-glass w-full h-32 resize-none"
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <AnimatedButton type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="gradient" className="bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20 border-none text-white">
                  Confirm Rejection
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RejectionModal;
