import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Mail, 
  User, 
  BookMarked, 
  Users, 
  BarChart2, 
  Calendar, 
  Settings,
  PlusCircle,
  Award
} from 'lucide-react';
import { fetchMe, logoutUser } from '@/store/slices/authSlice';
import { fetchCourses } from '@/store/slices/courseSlice';
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

const InstructorProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);

  useEffect(() => { 
    if (!user) dispatch(fetchMe()); 
    dispatch(fetchCourses());
  }, [dispatch, user]);

  const { courses } = useSelector((s) => s.courses);
  
  const myCourses = (Array.isArray(courses) ? courses : []).filter(
    (c) => c.instructor?._id === user?._id || c.instructor === user?._id
  );

  const totalStudents = myCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

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
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Instructor Profile</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your teaching identity and course performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatedButton 
            variant="gradient" 
            icon={PlusCircle} 
            onClick={() => navigate('/instructor/courses/new')}
          >
            Create New Course
          </AnimatedButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar card */}
        <div className="space-y-6">
          <GlowCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-cyan)] to-[var(--accent-purple)]" />
            
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-2xl border-4 border-[var(--bg-secondary)] ring-1 ring-[var(--border)]">
              {getInitials(user.name)}
            </div>
            
            <h2 className="font-heading text-2xl font-semibold text-[var(--text-primary)]">{user.name}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
            
            <div className="flex justify-center mt-4">
              <Badge variant="purple" className="px-4 py-1.5 rounded-xl capitalize font-bold tracking-wide">
                Expert Instructor
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mt-6 py-3 border-t border-[var(--border)]">
              <Calendar className="w-3.5 h-3.5" />
              Teaching since {formatDate(user.createdAt)}
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[var(--accent-purple)]" />
              Teaching Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Courses Created</span>
                <span className="text-[var(--text-primary)] font-bold">{myCourses.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Total Students</span>
                <span className="text-[var(--accent-cyan)] font-bold">{totalStudents}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Instructor Rating</span>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">4.9/5</span>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Right: Info & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="p-8" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Public Identity</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                   Professional Name
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  {user.name}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  Contact Email
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <BookMarked className="w-3.5 h-3.5" /> Expertise
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  Computer Science
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Department
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  Engineering
                </div>
              </div>
            </div>
          </GlowCard>

          <div className="flex flex-col sm:flex-row gap-4">
            <AnimatedButton 
              variant="outline" 
              className="flex-1"
              icon={Settings}
            >
              Account Settings
            </AnimatedButton>
            <AnimatedButton 
              variant="danger" 
              icon={LogOut} 
              onClick={handleLogout}
              className="flex-1"
            >
              Logoff Session
            </AnimatedButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorProfile;
