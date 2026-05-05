import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, BookOpen, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GradientText from '@/components/ui/GradientText';
import ParticleBackground from '@/components/ui/ParticleBackground';
import Toast from '@/components/ui/Toast';
import { passwordStrength, strengthColors, strengthLabels } from '@/utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const strength = passwordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      dispatch(addToast({ message: 'Please fill in all fields', type: 'error' }));
      return;
    }

    if (form.password.length < 6) {
      dispatch(addToast({ message: 'Password must be at least 6 characters', type: 'error' }));
      return;
    }

    const result = await dispatch(registerUser({
      name: form.name, email: form.email, password: form.password, role: form.role,
    }));

    if (registerUser.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Account created successfully!', type: 'success' }));
      navigate('/');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      dispatch(addToast({ message: result.payload || 'Registration failed', type: 'error' }));
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
      transition: { delay: i * 0.08 + 0.2, duration: 0.4 },
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

      {/* Left half */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(40,90,72,0.15) 0%, rgba(70,138,115,0.15) 50%, rgba(176,228,204,0.1) 100%)',
        }} />

        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shadow-2xl shadow-[var(--accent-purple)]/20"
          >
            <BookOpen className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h2
            className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Begin your learning adventure today.
          </motion.h2>

          <motion.p
            className="text-[var(--text-muted)] max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Join thousands of students and instructors already transforming education with AI.
          </motion.p>
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

          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <GradientText className="text-xl font-heading font-bold">EduGenius</GradientText>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
            Create Account
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            Start your journey in seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input-glass" style={{ paddingLeft: '44px' }} />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-glass" style={{ paddingLeft: '44px' }} autoComplete="email" />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••" className="input-glass" style={{ paddingLeft: '44px', paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < strength ? strengthColors[strength - 1] : 'rgba(40,90,72,0.1)' }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strengthColors[strength - 1] || 'var(--text-muted)' }}>
                    {strength > 0 ? strengthLabels[strength - 1] : ''}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Role selector */}
            <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
              <label className="block text-sm text-[var(--text-muted)] mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'student', label: 'Student', icon: BookOpen },
                  { value: 'instructor', label: 'Instructor', icon: GraduationCap },
                  { value: 'admin', label: 'Admin', icon: ShieldCheck },
                ].map((r) => (
                  <motion.button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      form.role === r.value
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-glow)] text-[var(--accent-blue)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <r.icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{r.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
              <AnimatedButton type="submit" variant="gradient" loading={isLoading} className="w-full py-3.5">
                Create Account
              </AnimatedButton>
            </motion.div>
          </form>

          <motion.p custom={5} variants={inputVariants} initial="hidden" animate="visible"
            className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent-blue)] hover:underline font-medium">
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
