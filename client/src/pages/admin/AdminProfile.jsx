import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Mail, 
  User, 
  ShieldCheck, 
  Calendar, 
  Settings, 
  Bell, 
  Key,
  ShieldAlert
} from 'lucide-react';
import { fetchMe, logoutUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import { getInitials, formatDate } from '@/utils/helpers';

const pageV = { 
  initial: { opacity: 0, y: 20 }, 
  animate: { opacity: 1, y: 0 }, 
  exit: { opacity: 0, y: -20 } 
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);

  useEffect(() => { 
    if (!user) dispatch(fetchMe()); 
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
    navigate('/login');
  };

  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isLoading || !user) return <PageLoader />;

  return (
    <motion.div 
      variants={pageV} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      transition={{ duration: 0.35 }} 
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Admin Profile</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your administrative identity and security.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Verified Admin
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar card */}
        <div className="space-y-6">
          <GlowCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-cyan)] to-[var(--accent-blue)]" />
            
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-2xl border-4 border-[var(--bg-secondary)] ring-1 ring-[var(--border)]">
              {getInitials(user.name)}
            </div>
            
            <h2 className="font-heading text-2xl font-semibold text-[var(--text-primary)]">{user.name}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
            
            <div className="flex justify-center mt-4">
              <Badge variant="success" className="px-4 py-1.5 rounded-xl capitalize font-bold tracking-wide">
                {user.role}istrator
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mt-6 py-3 border-t border-[var(--border)]">
              <Calendar className="w-3.5 h-3.5" />
              Platform member since {formatDate(user.createdAt)}
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              Security Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Two-Factor Auth</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Session Timeout</span>
                <span className="text-[var(--text-muted)]">24 Hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Login Alerts</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Right: Info & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="p-8" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Account Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  {user.name}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Official Email
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Access Role
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--accent-cyan)] font-bold capitalize">
                  System {user.role}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" /> Notifications
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  Enabled (High Priority)
                </div>
              </div>
            </div>
          </GlowCard>

          <div className="flex flex-col sm:flex-row gap-4">
            <AnimatedButton 
              variant="outline" 
              icon={Settings} 
              className="flex-1"
            >
              Edit Identity
            </AnimatedButton>
            <AnimatedButton 
              variant="danger" 
              icon={LogOut} 
              onClick={handleLogout}
              className="flex-1"
            >
              Terminate Session
            </AnimatedButton>
          </div>

          <GlowCard className="p-6 bg-red-500/5 border-red-500/10">
            <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Administrative Disclaimer</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              As a System Administrator, your actions are logged for security and auditing purposes. 
              Ensure you follow the platform's governance policies when making global changes.
            </p>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
