import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  TrendingUp,
  User,
  BarChart2,
  BookMarked,
  PlusCircle,
  ChevronLeft,
  LogOut,
  GraduationCap,
  ClipboardList,
  Users,
  Award,
} from 'lucide-react';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchPendingCourses } from '@/store/slices/courseSlice';
import { getInitials } from '@/utils/helpers';
import GradientText from '@/components/ui/GradientText';

const studentLinks = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/courses', label: 'All Courses', icon: BookOpen },
  { path: '/student/certificates', label: 'My Certificates', icon: Award },
  { path: '/student/profile', label: 'My Profile', icon: User },
];


const instructorLinks = [
  { path: '/instructor/dashboard', label: 'Dashboard', icon: BarChart2 },
  { path: '/instructor/courses/new', label: 'Launch Course', icon: PlusCircle },
  { path: '/instructor/certificates', label: 'Manage Approvals', icon: Award },
  { path: '/courses', label: 'All Courses', icon: BookOpen },
  { path: '/instructor/profile', label: 'Instructor Profile', icon: User },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const { pendingCourses } = useSelector((state) => state.courses);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchPendingCourses());
    }
  }, [dispatch, user?.role]);

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/approvals', label: 'Approvals', icon: ClipboardList, badgeCount: pendingCourses?.length || 0 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/courses', label: 'All Courses', icon: BookOpen },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  const userRole = user?.role?.toLowerCase();
  const links = userRole === 'admin' ? adminLinks : userRole === 'instructor' ? instructorLinks : studentLinks;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col glass-card rounded-none border-l-0 border-t-0 border-b-0 hidden lg:flex"
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--accent-glow)] transition-colors"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GradientText className="text-lg font-heading font-bold">
              EduGenius
            </GradientText>
          </motion.div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path ||
            location.pathname.startsWith(link.path + '/');
          const Icon = link.icon;

          return (
            <motion.button
              key={link.path + link.label}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${isActive
                ? 'text-[var(--accent-blue)] bg-[var(--accent-glow)] border-l-2 border-[var(--accent-blue)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(40,90,72,0.1)]'
                }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {link.label}
                </motion.span>
              )}
              {link.badge && sidebarOpen && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
              )}
              {link.badgeCount > 0 && sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                  {link.badgeCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] p-3 space-y-3">
        {/* User info */}
        {sidebarOpen && user && (
          <motion.div
            className="flex items-center gap-3 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                {user.role}
              </p>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-glow)] transition-colors"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
