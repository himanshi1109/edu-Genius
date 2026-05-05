import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllUsers, updateUserRole, deleteUser } from '@/store/slices/userSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import AnimatedButton from '@/components/ui/AnimatedButton';
import EditUserModal from '@/components/admin/EditUserModal';
import { Users, Search, Edit2, Trash2, Clock } from 'lucide-react';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const UserManagement = () => {
  const dispatch = useDispatch();
  const { usersList, isLoading } = useSelector(s => s.users || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });

  useEffect(() => {
    if (!usersList || usersList.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, usersList?.length]);

  const filteredUsers = useMemo(() => 
    (Array.isArray(usersList) ? usersList : []).filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [usersList, searchTerm]);

  const handleUpdate = useCallback(async (updatedData) => {
    const res = await dispatch(updateUserRole(updatedData));
    setEditModal({ isOpen: false, user: null });
    if (updateUserRole.fulfilled.match(res)) {
      dispatch(addToast({ message: 'User updated successfully', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Failed to update user', type: 'error' }));
    }
  }, [dispatch]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    const res = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(res)) {
      dispatch(addToast({ message: 'User deleted successfully', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Failed to delete', type: 'error' }));
    }
  }, [dispatch]);

  if (isLoading && (!usersList || usersList.length === 0)) {
    return <ListSkeleton />;
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
            <p className="text-[var(--text-muted)] mt-1">Manage accounts, roles, and access.</p>
          </div>
          <button 
            onClick={() => dispatch(fetchAllUsers())}
            className="p-2 rounded-lg bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
            title="Refresh Users"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative w-full md:w-64 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="input-glass w-full pr-4 py-2.5 focus:ring-2 focus:ring-[var(--accent-blue)]/20"
            style={{ '--input-pl': '44px' }}
          />
        </div>
      </div>

      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-light)] text-[var(--text-secondary)] text-sm font-medium">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-[var(--surface-light)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                        u.role === 'instructor' ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-cyan)] border border-[var(--accent-blue)]/20' :
                        'bg-[var(--surface)] text-[var(--text-secondary)]'
                      }`}>
                        {u.role}
                      </span>
                      {u.isBlocked && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditModal({ isOpen: true, user: u })}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-blue)]/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u._id)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        user={editModal.user}
        onSubmit={handleUpdate}
      />
    </motion.div>
  );
};

export default UserManagement;
