import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import aiService from '@/services/aiService';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { Brain } from 'lucide-react';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const FlashcardsPage = () => {
  const { lessonId: rawLessonId, courseId: paramCourseId } = useParams();
  const lessonId = (rawLessonId === 'undefined' || rawLessonId === 'none') ? null : rawLessonId;
  const [searchParams] = useSearchParams();
  const courseId = paramCourseId || searchParams.get('courseId');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse } = useSelector((s) => s.courses);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await aiService.generateFlashcards(lessonId);
      if (res.data) {
        dispatch(addToast({ message: 'Flashcards generated!', type: 'success' }));
        dispatch(fetchCourseById(courseId || localStorage.getItem('lastCourseId')));
      }
    } catch (error) {
      dispatch(addToast({ message: 'Failed to generate flashcards.', type: 'error' }));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!currentCourse) {
      const stored = courseId || localStorage.getItem('lastCourseId');
      if (stored) dispatch(fetchCourseById(stored));
    }
  }, [currentCourse, dispatch, courseId]);

  const { flashcards, lessonTitle } = useMemo(() => {
    if (!currentCourse?.modules) return { flashcards: [], lessonTitle: '' };
    
    let allCards = [];
    
    for (const mod of currentCourse.modules) {
      for (const les of mod.lessons || []) {
        if (courseId) {
          if (les.flashcards?.length) allCards.push(...les.flashcards);
        } else if (les._id === lessonId && les.flashcards?.length) {
          return { flashcards: les.flashcards, lessonTitle: les.title };
        }
      }
    }
    if (courseId) return { flashcards: allCards, lessonTitle: 'Full Course Review' };
    return { flashcards: [], lessonTitle: '' };
  }, [currentCourse, lessonId, courseId]);

  const cards = flashcards.length > 0 ? flashcards : [
    { question: 'What is React?', answer: 'A JavaScript library for building user interfaces' },
    { question: 'What is JSX?', answer: 'A syntax extension that allows writing HTML in JavaScript' },
    { question: 'What is a component?', answer: 'A reusable piece of UI that can have its own logic and appearance' },
    { question: 'What is state?', answer: 'Data that changes over time and triggers re-renders' },
    { question: 'What are hooks?', answer: 'Functions that let you use state and lifecycle features in function components' },
  ];

  const card = cards[currentIdx];
  const progressPct = ((currentIdx + 1) / cards.length) * 100;

  const goNext = () => {
    if (currentIdx < cards.length - 1) { setFlipped(false); setTimeout(() => setCurrentIdx(currentIdx + 1), 200); }
    else setCompleted(true);
  };
  const goPrev = () => {
    if (currentIdx > 0) { setFlipped(false); setTimeout(() => setCurrentIdx(currentIdx - 1), 200); }
  };
  const flip = () => setFlipped(!flipped);
  const restart = () => { setCurrentIdx(0); setFlipped(false); setCompleted(false); };

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (completed) {
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)]">You&apos;ve reviewed all cards!</h2>
        <p className="text-[var(--text-muted)]">Great job finishing all {cards.length} flashcards.</p>
        <div className="flex gap-4 justify-center">
          <AnimatedButton variant="outline" icon={RotateCcw} onClick={restart}>Review Again</AnimatedButton>
          <AnimatedButton variant="gradient" onClick={() => navigate(courseId ? `/student/learn/${courseId}` : -1)}>Back to Lesson</AnimatedButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <AnimatedButton variant="ghost" icon={ArrowLeft} onClick={() => navigate(courseId ? `/student/learn/${courseId}` : -1)} className="px-3" />
        <div className="text-center flex-1">
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-1">
            Flashcards {lessonTitle && `— ${lessonTitle}`}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Card {currentIdx + 1} of {cards.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--bg-secondary)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mx-auto" style={{ width: '100%', maxWidth: 500, height: 300 }} onClick={flip}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative w-full preserve-3d cursor-pointer"
              style={{ height: 300 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden">
                <GlowCard className="w-full h-full flex flex-col items-center justify-center p-8 border-[var(--accent-blue)]/20" hover={false}>
                  <p className="text-xs text-[var(--accent-blue)] uppercase tracking-wider font-semibold mb-4">Question</p>
                  <p className="text-lg text-[var(--text-primary)] text-center font-medium leading-relaxed">{card?.question}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-6">Click or press Space to flip</p>
                </GlowCard>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <GlowCard className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[var(--accent-blue)]/5 to-[var(--accent-purple)]/5 border-[var(--accent-purple)]/20" hover={false}>
                  <p className="text-xs text-[var(--accent-purple)] uppercase tracking-wider font-semibold mb-4">Answer</p>
                  <p className="text-lg text-[var(--text-primary)] text-center font-bold leading-relaxed">{card?.answer}</p>
                </GlowCard>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-4">
          <AnimatedButton variant="outline" onClick={goPrev} disabled={currentIdx === 0} className="px-6"><ChevronLeft className="w-5 h-5" /> Prev</AnimatedButton>
          <AnimatedButton variant="ghost" onClick={flip} className="px-6">Flip</AnimatedButton>
          <AnimatedButton variant="outline" onClick={goNext} className="px-6">Next <ChevronRight className="w-5 h-5" /></AnimatedButton>
        </div>
        
        {flashcards.length === 0 && (
          <AnimatedButton variant="gradient" icon={Brain} onClick={handleGenerate} loading={isGenerating}>
            Generate Flashcards with AI
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
};

export default FlashcardsPage;
