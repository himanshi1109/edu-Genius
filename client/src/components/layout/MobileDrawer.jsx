import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  TrendingUp,
  User,
  BarChart2,
  BookMarked,
  PlusCircle,
  LogOut,
  X,
  GraduationCap,
} from 'lucide-react';
import { logoutUser } from '@/store/slices/authSlice';
import { getInitials } from '@/utils/helpers';
import GradientText from '@/components/ui/GradientText';

const studentLinks = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/courses', label: 'My Courses', icon: BookOpen },
  { path: '/courses', label: 'Explore', icon: Compass },
  { path: '/student/progress', label: 'Progress', icon: TrendingUp },
  { path: '/profile', label: 'Profile', icon: User },
];

const instructorLinks = [
  { path: '/instructor/dashboard', label: 'Dashboard', icon: BarChart2 },
  { path: '/courses', label: 'My Courses', icon: BookMarked },
  { path: '/instructor/courses/new', label: 'Create Course', icon: PlusCircle },
  { path: '/profile', label: 'Profile', icon: User },
];

const MobileDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const links = user?.role === 'instructor' ? instructorLinks : studentLinks;

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 h-screen w-72 z-[70] glass-card rounded-none border-l-0 border-t-0 border-b-0 flex flex-col lg:hidden"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border)]">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleNav('/')}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center transition-transform group-hover:scale-105">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <GradientText className="text-lg font-heading font-bold">
                  EduGenius
                </GradientText>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-glow)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;

                return (
                  <button
                    key={link.path + link.label}
                    onClick={() => handleNav(link.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-[var(--accent-blue)] bg-[var(--accent-glow)] border-l-2 border-[var(--accent-blue)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(40,90,72,0.1)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-[var(--border)] p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
