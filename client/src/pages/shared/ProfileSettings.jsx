import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LogOut, Mail, User, BookOpen, Calendar } from 'lucide-react';
import { fetchMe, logoutUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import { getInitials, formatDate } from '@/utils/helpers';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const ProfileSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);

  useEffect(() => { 
    if (!user) dispatch(fetchMe()); 
  }, [dispatch, user]);

  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isLoading || !user) return <PageLoader />;

  const enrolledCourses = user.enrolledCourses || [];

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar card */}
        <GlowCard className="p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {getInitials(user.name)}
          </div>
          <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">{user.name}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
          <Badge variant={user.role === 'instructor' ? 'purple' : 'default'} className="mt-3 capitalize">{user.role}</Badge>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mt-4">
            <Calendar className="w-3.5 h-3.5" />
            Member since {formatDate(user.createdAt)}
          </div>
          {user.role === 'student' && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {enrolledCourses.length} enrolled course{enrolledCourses.length !== 1 ? 's' : ''}
            </p>
          )}
        </GlowCard>

        {/* Right: Info */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="p-6" hover={false}>
            <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-1 block flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                <input value={user.name} disabled className="input-glass opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-1 block flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                <input value={user.email} disabled className="input-glass opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-1 block">Role</label>
                <Badge variant={user.role === 'instructor' ? 'purple' : 'default'} className="capitalize">{user.role}</Badge>
              </div>
            </div>
          </GlowCard>

          {user.role === 'student' && enrolledCourses.length > 0 && (
            <GlowCard className="p-6" hover={false}>
              <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Enrolled Courses</h3>
              <div className="flex flex-wrap gap-2">
                {enrolledCourses.map((c) => {
                  const courseTitle = typeof c === 'object' ? c.title : 'Course';
                  return (
                    <span key={c._id || c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-glow)] text-sm text-[var(--accent-blue)] border border-[var(--border)]">
                      <BookOpen className="w-3.5 h-3.5" />
                      {courseTitle}
                    </span>
                  );
                })}
              </div>
            </GlowCard>
          )}

          <AnimatedButton variant="danger" icon={LogOut} onClick={handleLogout} className="w-full sm:w-auto">
            Logout
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
