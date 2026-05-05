import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Mail, 
  User, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar, 
  Settings,
  GraduationCap
} from 'lucide-react';
import { fetchMe, logoutUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import api from '@/services/api';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import { getInitials, formatDate } from '@/utils/helpers';

const pageV = { 
  initial: { opacity: 0, y: 20 }, 
  animate: { opacity: 1, y: 0 }, 
  exit: { opacity: 0, y: -20 } 
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);

  const [certs, setCerts] = React.useState([]);
  const [certsLoading, setCertsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState([]);
  const [progressLoading, setProgressLoading] = React.useState(false);


  const fetchCerts = React.useCallback(async () => {
    setCertsLoading(true);
    try {
      const res = await api.get('/certificates/my');
      const data = res.data?.data || [];
      setCerts(data.filter(c => c.status === 'approved'));
    } catch (e) {
      console.error(e);
    } finally {
      setCertsLoading(false);
    }
  }, []);

  const fetchProgress = React.useCallback(async () => {
    setProgressLoading(true);
    try {
      const res = await api.get('/progress/my');
      setProgress(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (!user) dispatch(fetchMe()); 
    fetchCerts();
    fetchProgress();
  }, [dispatch, fetchCerts, fetchProgress, user]);


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
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Student Profile</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your learning identity and progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatedButton variant="ghost" icon={Settings} onClick={() => navigate('/settings')}>
            Settings
          </AnimatedButton>
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
              <Badge variant="cyan" className="px-4 py-1.5 rounded-xl capitalize font-bold tracking-wide">
                Active Student
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mt-6 py-3 border-t border-[var(--border)]">
              <Calendar className="w-3.5 h-3.5" />
              Learning since {formatDate(user.createdAt)}
            </div>
          </GlowCard>

          {user.enrolledCourses?.length > 0 ? (
            <GlowCard className="p-6">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-cyan)]" />
                Learning Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Enrolled Courses</span>
                  <span className="text-[var(--text-primary)] font-bold">{progress.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Certificates Earned</span>
                  <span className="text-[var(--accent-cyan)] font-bold">{certs.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Lessons Completed</span>
                  <span className="text-orange-400 font-bold">
                    {progress.reduce((acc, curr) => acc + curr.completedLessons, 0)}
                  </span>
                </div>

              </div>
            </GlowCard>
          ) : (
            <GlowCard className="p-6 text-center border-dashed border-[var(--border)]" hover={true} onClick={() => navigate('/courses')}>
              <div className="w-12 h-12 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Start Your Journey</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Enroll in any course to start tracking your stats.</p>
              <span className="text-xs font-bold text-[var(--accent-blue)] hover:underline cursor-pointer">Browse Courses &rarr;</span>
            </GlowCard>
          )}
        </div>

        {/* Right: Info & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="p-8" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Personal Information</h3>
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
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                  {user.email}
                </div>
              </div>

              {user.enrolledCourses?.length > 0 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Primary Interest
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                      {user.enrolledCourses?.[0]?.title || 'Software Engineering'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                      <Award className="w-3.5 h-3.5" /> Skill Level
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-primary)]">
                      {user.enrolledCourses?.length > 2 ? 'Advanced' : 'Beginner'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </GlowCard>

          {/* Progress Section */}
          {progress.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <GlowCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Skill Mastery</h3>
                </div>
                
                <div className="space-y-6">
                  {progress.map((p) => (
                    <div key={p._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{p.courseTitle}</span>
                        <span className="text-[var(--accent-cyan)] font-bold">{p.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${p.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)]"
                        />
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] flex justify-between">
                        <span>{p.completedLessons} / {p.totalLessons} Lessons</span>
                        <span className="capitalize">{p.state.replace('_', ' ')}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </GlowCard>

              <GlowCard className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Award className="w-32 h-32 text-[var(--accent-cyan)]" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Certificates</h3>
                </div>

                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">
                    {certs.length}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] max-w-[150px]">
                    Verified achievements earned through learning.
                  </p>
                  
                  {certs.length > 0 ? (
                    <button 
                      onClick={() => navigate('/student/certificates')}
                      className="mt-6 text-xs font-bold text-[var(--accent-cyan)] hover:underline flex items-center gap-1"
                    >
                      View All Certificates <Award className="w-3 h-3" />
                    </button>
                  ) : (
                    <p className="mt-6 text-xs italic text-[var(--text-muted)]">
                      Complete a course to earn your first certificate!
                    </p>
                  )}
                </div>
              </GlowCard>
            </div>
          )}


          <div className="flex flex-col sm:flex-row gap-4">
            <AnimatedButton 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/courses')}
            >
              {user.enrolledCourses?.length > 0 ? 'Continue Learning' : 'Browse Courses'}
            </AnimatedButton>
            <AnimatedButton 
              variant="danger" 
              icon={LogOut} 
              onClick={handleLogout}
              className="flex-1"
            >
              Logout Account
            </AnimatedButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
