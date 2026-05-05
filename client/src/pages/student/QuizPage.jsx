import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import quizService from '@/services/quizService';
import aiService from '@/services/aiService';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import confetti from 'canvas-confetti';
import { getScoreLabel, getScoreColor } from '@/utils/helpers';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const QuizPage = () => {
  const { lessonId: rawLessonId, courseId: paramCourseId } = useParams();
  const lessonId = (rawLessonId === 'undefined' || rawLessonId === 'none') ? null : rawLessonId;
  const [searchParams] = useSearchParams();
  const courseId = paramCourseId || searchParams.get('courseId');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      let q = null;
      if (lessonId) {
        const res = await quizService.getQuizByLesson(lessonId);
        const data = res.data || res;
        q = Array.isArray(data) ? data[0] : data;
      } else if (courseId) {
        const res = await quizService.getQuizByCourse(courseId);
        const data = res.data || res;
        q = Array.isArray(data) ? data[0] : data;
      }

      setQuiz(q);
      if (q?.questions) {
        setAnswers(new Array(q.questions.length).fill(null));
        setTimeLeft(600);
        setResults(null);
        setCurrentQ(0);
        setSelected(null);
        setLocked(false);
      }
    } catch (e) {
      console.error('Quiz load error:', e);
      setQuiz(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadQuiz();
  }, [lessonId, courseId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = lessonId 
        ? await aiService.generateQuiz(lessonId)
        : await aiService.generateCourseQuiz(courseId);
      
      if (res.success) {
        dispatch(addToast({ message: 'Quiz generated successfully!', type: 'success' }));
        loadQuiz();
      }
    } catch (error) {
      dispatch(addToast({ message: 'Failed to generate quiz.', type: 'error' }));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!quiz || results) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quiz, results]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const questions = quiz?.questions || [];
  const question = questions[currentQ];

  const selectAnswer = (idx) => {
    if (locked) return;
    setSelected(idx);
    const newAns = [...answers];
    newAns[currentQ] = idx;
    setAnswers(newAns);
    setLocked(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(answers[currentQ + 1]);
      setLocked(answers[currentQ + 1] !== null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      const res = await quizService.submitQuiz(quiz._id, answers);
      const data = res.data || res;
      setResults(data);
      if (data.score >= 80) {
        confetti({ particleCount: 150, spread: 80, colors: ['#285A48', '#468A73', '#B0E4CC', '#FACC15'] });
      }
    } catch (e) {
      console.error(e);
      dispatch(addToast({ message: 'Failed to submit quiz', type: 'error' }));
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><SkeletonLoader width="600px" height="400px" /></div>;
  if (!quiz) return (
    <div className="text-center py-20 space-y-4">
      <p className="text-[var(--text-muted)]">No quiz available for this lesson.</p>
      <div className="flex gap-4 justify-center">
        <AnimatedButton variant="outline" onClick={() => navigate(courseId ? `/student/learn/${courseId}` : -1)}>Go Back</AnimatedButton>
        <AnimatedButton variant="gradient" onClick={handleGenerate} loading={isGenerating}>Generate with AI</AnimatedButton>
      </div>
    </div>
  );

  /* Results screen */
  if (results) {
    const score = results.score ?? Math.round((results.correct / results.total) * 100);
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="text-center">
          <ProgressRing percentage={score} size={140} strokeWidth={8} textSize="28px" className="mx-auto mb-6" />
          <h2 className="font-heading text-3xl font-bold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</h2>
          <p className="text-[var(--text-muted)] mt-2">You scored {results.correct || 0} out of {results.total || questions.length}</p>
        </div>
        <div className="space-y-3">
          {(results.results || []).map((r, i) => (
            <GlowCard key={i} className={`p-4 border-l-4 ${r.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`} hover={false}>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Q{i + 1}: {r.question}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className={r.isCorrect ? 'text-green-400' : 'text-red-400'}>Your answer: {typeof r.yourAnswer === 'number' ? questions[i]?.options?.[r.yourAnswer] : r.yourAnswer}</span>
                {!r.isCorrect && <span className="text-green-400">Correct: {typeof r.correctAnswer === 'number' ? questions[i]?.options?.[r.correctAnswer] : r.correctAnswer}</span>}
              </div>
            </GlowCard>
          ))}
        </div>
        <div className="flex gap-4 justify-center">
          <AnimatedButton variant="outline" icon={RotateCcw} onClick={() => { setResults(null); setCurrentQ(0); setAnswers(new Array(questions.length).fill(null)); setSelected(null); setLocked(false); setTimeLeft(600); }}>Retake Quiz</AnimatedButton>
          <AnimatedButton variant="gradient" onClick={() => navigate(courseId ? `/student/learn/${courseId}` : -1)}>Back to Lesson</AnimatedButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-3xl mx-auto py-4">
      <div className="flex items-center gap-4 mb-8">
        <AnimatedButton variant="ghost" icon={ArrowLeft} onClick={() => navigate(courseId ? `/student/learn/${courseId}` : -1)} className="px-3" />
        <div className="flex items-center justify-between flex-1">
          <h2 className="font-heading font-semibold text-[var(--text-primary)]">Quiz</h2>
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="flex gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
              {questions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${answers[i] !== null ? 'bg-[var(--accent-blue)]' : i === currentQ ? 'bg-[var(--accent-purple)]' : 'bg-[var(--border)]'}`} />
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              <span className={timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-[var(--text-primary)]'}>{mins}:{secs.toString().padStart(2, '0')}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hidden sm:block">
              Question {currentQ + 1} of {questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
          <GlowCard className="p-8" hover={false}>
            <p className="text-xs text-[var(--text-muted)] mb-2">Question {currentQ + 1} of {questions.length}</p>
            <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)] mb-8">{question?.question}</h3>
            <div className="space-y-3">
              {(question?.options || []).map((opt, i) => {
                const isSelected = selected === i;
                const correctIdx = question?.correctAnswer;
                const isCorrect = locked && i === correctIdx;
                const isWrong = locked && isSelected && i !== correctIdx;
                return (
                  <motion.button key={i} onClick={() => selectAnswer(i)} whileHover={!locked ? { scale: 1.01 } : {}} whileTap={!locked ? { scale: 0.99 } : {}}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ${
                      isCorrect ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                      : isWrong ? 'border-red-500 bg-red-500/10 text-red-400'
                      : isSelected ? 'border-[var(--accent-blue)] bg-[var(--accent-glow)] text-[var(--accent-blue)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent-blue)]/40 hover:bg-[var(--accent-glow)]'
                    }`}>
                    <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>{opt}
                  </motion.button>
                );
              })}
            </div>
          </GlowCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end mt-6">
        <AnimatedButton variant="gradient" onClick={nextQuestion} disabled={selected === null}>
          {currentQ === questions.length - 1 ? 'Submit Quiz' : 'Next Question'} <ChevronRight className="w-4 h-4" />
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default QuizPage;
