import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowLeft } from 'lucide-react';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GradientText from '@/components/ui/GradientText';
import ParticleBackground from '@/components/ui/ParticleBackground';
import Toast from '@/components/ui/Toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      dispatch(addToast({ message: 'Please fill in all fields', type: 'error' }));
      return;
    }

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Welcome back!', type: 'success' }));
      navigate('/');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      dispatch(addToast({ message: result.payload || 'Login failed', type: 'error' }));
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1 + 0.3, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.35 }}
      className="min-h-screen flex relative"
    >
      <ParticleBackground count={15} />
      <Toast />

      {/* Left half — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(40,90,72,0.15) 0%, rgba(70,138,115,0.15) 50%, rgba(176,228,204,0.1) 100%)',
        }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/5 to-[var(--accent-purple)]/10" style={{
          animation: 'meshDrift 15s ease-in-out infinite alternate',
        }} />

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-2xl shadow-[var(--accent-blue)]/20"
          >
            <GraduationCap className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h2
            className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your journey to mastery starts here.
          </motion.h2>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {['AI-Powered Quizzes', 'Smart Flashcards', 'Real-time Progress'].map((f) => (
              <span key={f} className="glass-card px-4 py-2 rounded-full text-xs text-[var(--text-muted)]">
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right half — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          animate={shake ? { x: [0, 10, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Back button */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <GradientText className="text-xl font-heading font-bold">EduGenius</GradientText>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--text-muted)] mb-8">
            Sign in to continue your learning journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-glass"
                  style={{ paddingLeft: '44px' }}
                  autoComplete="email"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-glass"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible"
              className="flex justify-end"
            >
              <span className="text-sm text-[var(--accent-blue)] cursor-pointer hover:underline">
                Forgot password?
              </span>
            </motion.div>

            <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
              <AnimatedButton
                type="submit"
                variant="gradient"
                loading={isLoading}
                className="w-full py-3.5"
              >
                Sign In
              </AnimatedButton>
            </motion.div>
          </form>

          <motion.p
            custom={4} variants={inputVariants} initial="hidden" animate="visible"
            className="text-center text-sm text-[var(--text-muted)] mt-6"
          >
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[var(--accent-blue)] hover:underline font-medium">
              Register
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
