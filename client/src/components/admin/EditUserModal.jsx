import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCog } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';

const EditUserModal = ({ isOpen, onClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student' });

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isBlocked: user.isBlocked || false 
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: user._id, ...formData });
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
            className="relative w-full max-w-md glass-card p-6 border-[var(--accent-blue)]/20"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface-light)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center flex-shrink-0">
                <UserCog className="w-5 h-5 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">Edit User</h2>
                <p className="text-sm text-[var(--text-muted)]">Update user details and role</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-glass w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-glass w-full text-[var(--text-primary)] bg-[var(--surface)]"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 mt-2">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={formData.isBlocked}
                  onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                  className="w-5 h-5 rounded border-[var(--border)] text-red-500 focus:ring-red-500/20"
                />
                <label htmlFor="isBlocked" className="text-sm font-medium text-red-400 cursor-pointer">
                  Block User Account
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <AnimatedButton type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="gradient" className="bg-gradient-to-r from-[#285A48] to-[#468A73] shadow-[#285A48]/20 border-none text-white">
                  Save Changes
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditUserModal;
