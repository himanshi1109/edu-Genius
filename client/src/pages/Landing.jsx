import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Brain, Layers, TrendingUp, Award, Video, Users,
  Play, ArrowRight, Check, Star, ChevronRight,
  GraduationCap, Github, Twitter, Linkedin, Mail, X,
} from 'lucide-react';
import HeroScene from '@/components/three/HeroScene';
import GlowCard from '@/components/ui/GlowCard';
import GradientText from '@/components/ui/GradientText';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ParticleBackground from '@/components/ui/ParticleBackground';
import FloatingChatWidget from '@/components/ui/FloatingChatWidget';
import { TESTIMONIALS } from '@/utils/constants';
import useAuth from '@/hooks/useAuth';

gsap.registerPlugin(ScrollTrigger);

/* ── Animated Counter ── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── Features data ── */
const features = [
  { icon: Brain, title: 'AI Quiz Generation', desc: 'Auto-generate MCQs from any lesson content using advanced AI algorithms.' },
  { icon: Layers, title: 'Smart Flashcards', desc: 'Spaced-repetition cards powered by AI for faster and deeper recall.' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Real-time completion analytics and personalized score dashboards.' },
  { icon: Award, title: 'Certificates', desc: 'Verifiable certificates automatically issued on course completion.' },
  { icon: Video, title: 'Video Lessons', desc: 'Cloud-hosted HD video with auto-generated transcripts and summaries.' },
  { icon: Users, title: 'Instructor Tools', desc: 'Full course builder with module management and student analytics.' },
];

const steps = [
  { num: 1, title: 'Register & Choose Role', desc: 'Sign up as a student or instructor in seconds.' },
  { num: 2, title: 'Enroll in Courses', desc: 'Browse the catalog and enroll in courses that match your goals.' },
  { num: 3, title: 'Learn with AI Tools', desc: 'Use AI quizzes, flashcards, and smart progress tracking.' },
  { num: 4, title: 'Earn Certificate', desc: 'Complete your course and receive a verifiable certificate.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const aiRef = useRef(null);
  const statsRef = useRef(null);
  const [navBlur, setNavBlur] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { isAuthenticated, user, isAdmin, isInstructor } = useAuth();

  const getDashboardRoute = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInstructor) return '/instructor/dashboard';
    return '/student/dashboard';
  };

  const getProfileRoute = () => {
    if (isAdmin) return '/admin/profile';
    if (isInstructor) return '/instructor/profile';
    return '/student/profile';
  };

  /* GSAP scroll animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero fade on scroll out */
      gsap.to(heroRef.current, {
        opacity: 0.6,
        y: -50,
        scrollTrigger: { trigger: heroRef.current, start: 'bottom top+=200', end: 'bottom top', scrub: true },
      });

      /* Features stagger */
      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
        });
      }

      /* Steps stagger */
      if (stepsRef.current) {
        gsap.from(stepsRef.current.children, {
          y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
        });
      }

      /* AI section */
      if (aiRef.current) {
        gsap.from(aiRef.current.children, {
          y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: aiRef.current, start: 'top 75%' },
        });
      }

      /* Stats */
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  /* Nav blur on scroll */
  useEffect(() => {
    const handleScroll = () => setNavBlur(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.35 }}
      className="relative"
    >
      <ParticleBackground count={30} />

      {/* ── NAV BAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBlur ? 'bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]' : ''}`}>
        <div className="container-custom flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <GradientText className="text-xl font-heading font-bold">EduGenius</GradientText>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block mr-2">
                  Welcome, {user?.name?.split(' ')[0]}
                </span>
                <AnimatedButton variant="ghost" onClick={() => navigate(getProfileRoute())} className="text-sm px-5 py-2">
                  View Profile
                </AnimatedButton>
                <AnimatedButton variant="gradient" onClick={() => navigate(getDashboardRoute())} className="text-sm px-5 py-2">
                  Dashboard
                </AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton variant="ghost" onClick={() => navigate('/login')} className="text-sm px-5 py-2">
                  Login
                </AnimatedButton>
                <AnimatedButton variant="gradient" onClick={() => navigate('/courses')} className="text-sm px-5 py-2">
                  Get Started
                </AnimatedButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section ref={heroRef} className="min-h-screen flex items-center relative overflow-hidden pt-16">
        <div className="container-custom grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            {/* Pill badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-[var(--accent-blue)] mb-6"
              animate={{ boxShadow: ['0 0 15px rgba(40,90,72,0.2)', '0 0 30px rgba(40,90,72,0.4)', '0 0 15px rgba(40,90,72,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚀 AI-Powered Learning Platform
            </motion.div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Learn Smarter{' '}
              <br />
              <GradientText animate className="text-5xl sm:text-6xl lg:text-7xl">
                with AI
              </GradientText>
            </h1>

            <p className="text-lg text-[var(--text-muted)] max-w-lg mb-8 leading-relaxed">
              Experience the future of education with personalized AI quizzes,
              smart flashcards, and real-time progress tracking.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <AnimatedButton 
                variant="gradient" 
                onClick={() => navigate('/courses')} 
                className="text-base px-9 py-3.5"
              >
                {isAuthenticated ? 'Continue Learning' : 'Start Learning Free'}
              </AnimatedButton>
              <AnimatedButton 
                variant="outline" 
                icon={Play} 
                onClick={() => setShowDemo(true)} 
                className="text-base px-8 py-3.5"
              >
                Watch Demo
              </AnimatedButton>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Students', value: 10000, suffix: '+' },
                { label: 'Courses', value: 500, suffix: '+' },
                { label: 'Completion Rate', value: 95, suffix: '%' },
              ].map((s) => (
                <div key={s.label} className="glass-card px-5 py-2.5 rounded-full flex items-center gap-2 text-sm">
                  <span className="font-bold text-[var(--text-primary)]">
                    <Counter target={s.value} suffix={s.suffix} />
                  </span>
                  <span className="text-[var(--text-muted)]">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D Scene */}
          <motion.div
            className="relative h-[500px] lg:h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          >
            <HeroScene />
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 2: FEATURES ═══ */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <GradientText>Excel</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              Powerful AI-driven tools designed to accelerate your learning journey from start to certification.
            </p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <GlowCard key={f.title} className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {f.desc}
                </p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: HOW IT WORKS ═══ */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              How It <GradientText>Works</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              Four simple steps to transform your learning experience forever.
            </p>
          </div>

          <div ref={stepsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] border-t-2 border-dashed border-[var(--border)]" />

            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-xl font-bold mb-4 relative z-10 shadow-lg shadow-[var(--accent-blue)]/20">
                  {s.num}
                </div>
                <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: AI CAPABILITIES ═══ */}
      <section className="section">
        <div className="container-custom">
          <div ref={aiRef} className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mock Quiz Card */}
            <GlowCard className="p-8">
              <p className="text-xs text-[var(--accent-blue)] font-semibold uppercase tracking-wider mb-4">AI-Generated Quiz</p>
              <h4 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">
                What is the time complexity of binary search?
              </h4>
              <div className="space-y-3">
                {['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((opt, i) => (
                  <motion.div
                    key={opt}
                    className={`p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${i === 1
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/40'
                      }`}
                    initial={i === 1 ? { scale: 1 } : {}}
                    animate={i === 1 ? { scale: [1, 1.02, 1] } : {}}
                    transition={i === 1 ? { duration: 2, repeat: Infinity } : {}}
                  >
                    <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {i === 1 && <Check className="w-4 h-4 inline ml-2 text-green-400" />}
                  </motion.div>
                ))}
              </div>
            </GlowCard>

            {/* Text content */}
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
                Let AI Do the{' '}
                <GradientText>Heavy Lifting</GradientText>
              </h2>
              <div className="space-y-4">
                {[
                  'Generate 5 MCQs from any lesson in seconds',
                  'Create flashcard sets instantly from content',
                  'Auto-grade quizzes and save scores permanently',
                  'Track mastery across all lessons and modules',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                    </div>
                    <p className="text-[var(--text-muted)]">{item}</p>
                  </div>
                ))}
              </div>

              {/* Flashcard flip demo */}
              <div className="mt-8">
                <FlashcardDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: STATISTICS ═══ */}
      <section className="section bg-[var(--bg-secondary)]/50">
        <div className="container-custom">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: '+', label: 'Active Learners' },
              { value: 500, suffix: '+', label: 'Expert Courses' },
              { value: 50, suffix: '+', label: 'AI Features' },
              { value: 98, suffix: '%', label: 'Satisfaction Rate' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold font-heading mb-2">
                  <GradientText>
                    <Counter target={s.value} suffix={s.suffix} />
                  </GradientText>
                </p>
                <p className="text-[var(--text-muted)] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: TESTIMONIALS ═══ */}
      <section className="section overflow-hidden">
        <div className="container-custom mb-12">
          <div className="text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Loved by <GradientText>Learners</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              See what our community has to say about their learning experience.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-6 animate-marquee">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <GlowCard key={i} className="min-w-[340px] max-w-[340px] p-6 flex-shrink-0" hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: CTA BANNER ═══ */}
      <section className="section">
        <div className="container-custom">
          <div className="glow-border glass-card p-12 text-center rounded-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your{' '}
              <GradientText>Learning?</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto mb-8">
              Join thousands of students and instructors already using EduGenius
              to achieve their goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <AnimatedButton variant="gradient" onClick={() => navigate('/courses')} className="text-base px-8 py-3.5">
                Start For Free
              </AnimatedButton>
              <AnimatedButton variant="outline" onClick={() => navigate('/courses')} className="text-base px-8 py-3.5">
                Browse Courses
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: FOOTER ═══ */}
      <footer className="border-t border-[var(--border)] py-16">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <GradientText className="text-lg font-heading font-bold">EduGenius</GradientText>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                AI-powered learning management for the next generation of students and educators.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-heading font-semibold text-[var(--text-primary)] mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Courses', 'Pricing', 'API'].map((l) => (
                  <li key={l}>
                    <span className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors cursor-pointer">{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-heading font-semibold text-[var(--text-primary)] mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact'].map((l) => (
                  <li key={l}>
                    <span className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors cursor-pointer">{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-heading font-semibold text-[var(--text-primary)] mb-4">Connect</h4>
              <div className="flex gap-3">
                {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                  <motion.button
                    key={i}
                    className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-blue)] hover:border-[var(--accent-blue)]/40 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              © 2026 EduGenius. All rights reserved.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Built with ❤️ by Himanshi Khatri
            </p>
          </div>
        </div>
      </footer>

      <FloatingChatWidget />
      {/* ── DEMO SHOWCASE MODAL ── */}
      <AnimatePresence>
        {showDemo && (
          <DemoShowcase onClose={() => setShowDemo(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Flashcard Demo ── */
const FlashcardDemo = () => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 w-full max-w-sm cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-40 preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-card p-6 flex flex-col items-center justify-center rounded-2xl border border-[var(--accent-blue)]/20">
          <p className="text-xs text-[var(--accent-blue)] uppercase tracking-wider mb-2">Question</p>
          <p className="text-sm text-[var(--text-primary)] text-center font-medium">
            What data structure uses LIFO ordering?
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-3">Click to flip</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-6 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20">
          <p className="text-xs text-[var(--accent-purple)] uppercase tracking-wider mb-2">Answer</p>
          <p className="text-sm text-[var(--text-primary)] text-center font-bold">Stack</p>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Demo Showcase (Animated In-Browser Demo) ── */
const demoSlides = [
  {
    tag: 'Welcome',
    title: 'Welcome to EduGenius',
    subtitle: 'AI-Powered Learning, Reimagined.',
    gradient: 'from-[#285A48] to-[#468A73]',
    icon: GraduationCap,
    content: (
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center shadow-2xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <GraduationCap className="w-12 h-12 text-white" />
        </motion.div>
        <div className="flex gap-3">
          {['Student', 'Instructor', 'Admin'].map((role, i) => (
            <motion.div
              key={role}
              className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              {role}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: 'AI Quizzes',
    title: 'AI-Generated Assessments',
    subtitle: 'Smart MCQs from any lesson in seconds.',
    gradient: 'from-[#6366f1] to-[#8b5cf6]',
    icon: Brain,
    content: (
      <div className="w-full max-w-md space-y-3 text-left">
        <div className="text-sm text-white/60 mb-4">Q: What is the time complexity of binary search?</div>
        {['O(n)', 'O(log n) ✓', 'O(n²)', 'O(1)'].map((opt, i) => (
          <motion.div
            key={opt}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              i === 1
                ? 'border-green-400/60 bg-green-500/15 text-green-300'
                : 'border-white/10 text-white/50'
            }`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    tag: 'Flashcards',
    title: 'Smart Flashcards',
    subtitle: 'Spaced repetition powered by AI.',
    gradient: 'from-[#ec4899] to-[#f43f5e]',
    icon: Layers,
    content: (
      <div className="flex gap-4">
        {[
          { q: 'What is React?', a: 'A JS library for UI' },
          { q: 'What is JSX?', a: 'JavaScript XML syntax' },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="w-44 h-28 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center p-3"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.4 + i * 0.3, duration: 0.6 }}
          >
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Question</p>
            <p className="text-xs text-white/90 text-center font-medium">{card.q}</p>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    tag: 'Progress',
    title: 'Real-Time Analytics',
    subtitle: 'Track every step of your learning journey.',
    gradient: 'from-[#f59e0b] to-[#ef4444]',
    icon: TrendingUp,
    content: (
      <div className="w-full max-w-sm space-y-4">
        {[
          { label: 'Node.js Performance', pct: 85 },
          { label: 'React Patterns', pct: 62 },
          { label: 'AI Fundamentals', pct: 40 },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
          >
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{item.label}</span>
              <span>{item.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#22c55e]"
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ delay: 0.5 + i * 0.2, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    tag: 'Certificates',
    title: 'Earn AI Certificates',
    subtitle: 'Verifiable credentials on completion.',
    gradient: 'from-[#22c55e] to-[#10b981]',
    icon: Award,
    content: (
      <motion.div
        className="w-72 p-6 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#22c55e] to-[#10b981] flex items-center justify-center"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <Award className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-white/90 text-sm font-semibold mb-1">Certificate of Completion</p>
        <p className="text-white/50 text-xs">Node.js Performance Tuning</p>
        <p className="text-white/40 text-[10px] mt-2">Issued to: Himanshi Khatri</p>
        <div className="mt-3 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold uppercase inline-block">
          Verified ✓
        </div>
      </motion.div>
    ),
  },
];

const DemoShowcase = ({ onClose }) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const SLIDE_DURATION = 4500;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(0);
      setCurrent((p) => {
        if (p === demoSlides.length - 1) {
          clearInterval(interval);
          onClose(); // Automatically close after the last slide
          return p;
        }
        return p + 1;
      });
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [onClose]);

  useEffect(() => {
    setProgress(0);
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100));
    }, SLIDE_DURATION / 50);
    return () => clearInterval(tick);
  }, [current]);

  const slide = demoSlides[current];
  const SlideIcon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden z-10 shadow-2xl border border-white/10"
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20`}
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-[#0a0f0d]/80 backdrop-blur-sm" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-12 min-h-[480px] flex flex-col items-center justify-center text-center">
          {/* Tag */}
          <motion.div
            key={`tag-${current}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${slide.gradient} text-white text-xs font-bold uppercase tracking-wider mb-6`}
          >
            <SlideIcon className="w-3.5 h-3.5" />
            {slide.tag}
          </motion.div>

          {/* Title */}
          <motion.h2
            key={`title-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white font-heading mb-2"
          >
            {slide.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm mb-10 max-w-md"
          >
            {slide.subtitle}
          </motion.p>

          {/* Slide content */}
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center"
          >
            {slide.content}
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-8 sm:px-12 pb-6">
          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {demoSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-10 bg-white'
                    : i < current
                    ? 'w-3 bg-white/40'
                    : 'w-3 bg-white/15'
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${slide.gradient}`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
