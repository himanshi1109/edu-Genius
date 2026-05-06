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
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { 
    if (!user) {
      dispatch(fetchMe());
    } else {
      setName(user.name);
      setEmail(user.email);
    }
  }, [dispatch, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.put('/auth/profile', { name, email });
      if (res.data?.success) {
        dispatch(addToast({ message: 'Profile updated successfully!', type: 'success' }));
        dispatch(fetchMe());
      }
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Update failed', type: 'error' }));
    } finally {
      setUpdating(false);
    }
  };

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

  const enrolledCourses = user.enrolledCourses || [];

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
        <p className="text-[var(--text-muted)] mt-1">Update your personal information and account preferences.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Avatar card */}
        <GlowCard className="p-8 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl">
            {getInitials(user.name)}
          </div>
          <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">{user.name}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
          <Badge variant={user.role === 'instructor' ? 'glow' : 'default'} className="mt-3 capitalize font-bold px-4">
            {user.role}
          </Badge>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mt-6 py-4 border-t border-[var(--border)] w-full">
            <Calendar className="w-3.5 h-3.5" />
            Member since {formatDate(user.createdAt)}
          </div>
        </GlowCard>

        {/* Right: Info Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="p-8" hover={false}>
            <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">Personal Details</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="input-glass"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glass"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <AnimatedButton 
                  type="submit" 
                  variant="gradient" 
                  loading={updating}
                  className="px-8"
                >
                  Save Changes
                </AnimatedButton>
                <AnimatedButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/student/profile')}
                >
                  Cancel
                </AnimatedButton>
              </div>
            </form>
          </GlowCard>

          <GlowCard className="p-6 border-red-500/10" hover={false}>
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Danger Zone</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Logging out will end your current session. You will need to login again to access your courses.</p>
            <AnimatedButton 
              variant="danger" 
              icon={LogOut} 
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Logout Account
            </AnimatedButton>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;

