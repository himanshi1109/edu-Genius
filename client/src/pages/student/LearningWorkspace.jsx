import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, CheckCircle, Circle, Play, ChevronLeft, ChevronRight,
  Brain, Layers, FileText, BookOpen, StickyNote, Bot, Send
} from 'lucide-react';
import api from '@/services/api';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { fetchProgress, updateProgress } from '@/store/slices/progressSlice';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { calculateCompletion, getTotalLessons, getMediaUrl } from '@/utils/helpers';


const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const LearningWorkspace = () => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('courseId');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((s) => s.courses);
  const { progress } = useSelector((s) => s.progress);
  const courseProgress = progress[id];

  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [rightTab, setRightTab] = useState('tools');
  const [notes, setNotes] = useState('');
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [isRequestingCert, setIsRequestingCert] = useState(false);

  useEffect(() => { 
    dispatch(fetchCourseById(id)); 
    dispatch(fetchProgress(id)); 
    checkCertificate();
  }, [dispatch, id]);

  const checkCertificate = async () => {
    try {
      const res = await api.get('/certificates/my');
      const certs = res.data?.data || [];
      const found = certs.find(c => (c.courseId?._id || c.courseId) === id);
      setCertificate(found);
    } catch (error) {
      console.error('Failed to check certificate:', error);
    }
  };

  const allLessons = useMemo(() => {
    if (!currentCourse?.modules) return [];
    return currentCourse.modules.flatMap((m) => m.lessons || []);
  }, [currentCourse]);

  useEffect(() => {
    if (allLessons.length && !activeLesson) {
      const currentId = courseProgress?.currentLesson;
      const found = currentId ? allLessons.find((l) => l._id === currentId) : null;
      setActiveLesson(found || allLessons[0]);
      if (currentCourse?.modules) {
        const init = {};
        currentCourse.modules.forEach((m) => { init[m._id] = true; });
        setOpenModules(init);
      }
    }
  }, [allLessons, courseProgress, activeLesson, currentCourse]);

  useEffect(() => {
    if (activeLesson) {
      const saved = localStorage.getItem(`notes_${activeLesson._id}`);
      setNotes(saved || '');
    }
  }, [activeLesson]);

  const completedLessonIds = useMemo(() => {
    return (courseProgress?.completedLessons || []).map(l => typeof l === 'string' ? l : l._id);
  }, [courseProgress]);

  const totalLessons = getTotalLessons(currentCourse);
  const completionPct = calculateCompletion(completedLessonIds.length, totalLessons);

  const currentIdx = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allLessons.length - 1;

  const isCompleted = activeLesson && completedLessonIds.includes(activeLesson._id);

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    dispatch(updateProgress({ courseId: id, lessonId: lesson._id }));
  };

  const markComplete = async () => {
    const res = await dispatch(updateProgress({ courseId: id, lessonId: activeLesson._id }));
    if (updateProgress.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Lesson completed!', type: 'success' }));
      dispatch(fetchProgress(id));
    }
  };

  const goNext = () => { if (hasNext) selectLesson(allLessons[currentIdx + 1]); };
  const goPrev = () => { if (hasPrev) selectLesson(allLessons[currentIdx - 1]); };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const saveNotes = (val) => {
    setNotes(val);
    if (activeLesson) localStorage.setItem(`notes_${activeLesson._id}`, val);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAiTyping) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        prompt: userMsg,
        courseTitle: currentCourse?.title,
        lessonTitle: activeLesson?.title,
        lessonContent: activeLesson?.content || activeLesson?.summary || 'No text content available.'
      });
      
      setChatHistory(prev => [...prev, { role: 'model', text: response.data.data.response }]);
    } catch (error) {
      dispatch(addToast({ message: 'AI failed to respond. Please try again.', type: 'error' }));
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleRequestCert = async () => {
    setIsRequestingCert(true);
    try {
      const res = await api.post(`/certificates/request/${id}`);
      if (res.data?.success) {
        dispatch(addToast({ message: 'Certificate requested! Awaiting instructor approval.', type: 'success' }));
        checkCertificate();
      }
    } catch (error) {
      dispatch(addToast({ message: error.response?.data?.message || 'Failed to request certificate.', type: 'error' }));
    } finally {
      setIsRequestingCert(false);
    }
  };

  if (isLoading || !currentCourse) return <div className="space-y-4"><SkeletonLoader height="60vh" /><SkeletonLoader lines={3} /></div>;

  const videoUrl = getMediaUrl(activeLesson?.videoUrl);


  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-[var(--bg-secondary)]">
        <div className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] transition-all duration-700" style={{ width: `${completionPct}%` }} />
      </div>

      <div className="flex gap-0 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 h-[calc(100vh-0px)]">
        {/* LEFT PANEL */}
        <div className="w-64 flex-shrink-0 border-r border-[var(--border)] overflow-y-auto bg-[var(--bg-primary)]/50 backdrop-blur-sm hidden md:block">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-heading font-semibold text-sm text-[var(--text-primary)] line-clamp-2">{currentCourse.title}</h3>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-secondary)]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{completedLessonIds.length}/{totalLessons} lessons</p>
          </div>

          {(currentCourse.modules || []).map((mod) => (
            <div key={mod._id}>
              <button onClick={() => setOpenModules((p) => ({ ...p, [mod._id]: !p[mod._id] }))} className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider hover:bg-[var(--accent-glow)] transition-colors">
                <span className="truncate">{mod.title}</span>
                {openModules[mod._id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openModules[mod._id] && (mod.lessons || []).map((les) => {
                const done = completedLessonIds.includes(les._id);
                const isActive = les._id === activeLesson?._id;
                return (
                  <button key={les._id} onClick={() => selectLesson(les)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all ${isActive ? 'bg-[var(--accent-glow)] text-[var(--accent-blue)] font-semibold' : 'text-[var(--text-muted)] hover:bg-[rgba(40,90,72,0.05)]'}`}>
                    {done ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate text-left">{les.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Video */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-[var(--bg-secondary)] mb-6">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center"><Play className="w-16 h-16 text-[var(--accent-blue)]/30 mx-auto mb-2" /><p className="text-sm text-[var(--text-muted)]">No video available</p></div>
                </div>
              )}
            </div>

            {activeLesson && (
              <>
                <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-4">{activeLesson.title}</h2>
                {activeLesson.content && <p className="text-[var(--text-muted)] leading-relaxed mb-6 whitespace-pre-wrap">{activeLesson.content}</p>}

                {activeLesson.keyPoints?.length > 0 && (
                  <GlowCard className="p-5 mb-6" hover={false}>
                    <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" />Key Points</h3>
                    <ul className="space-y-2">
                      {activeLesson.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                          <CheckCircle className="w-4 h-4 text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />{kp}
                        </li>
                      ))}
                    </ul>
                  </GlowCard>
                )}

                {activeLesson.summary && (
                  <div className="p-5 rounded-xl bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/10 mb-6">
                    <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">Summary</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{activeLesson.summary}</p>
                  </div>
                )}

                {activeLesson.transcript && (
                  <div className="mb-6">
                    <button onClick={() => setTranscriptOpen(!transcriptOpen)} className="flex items-center gap-2 text-sm text-[var(--accent-blue)] hover:underline">
                      <FileText className="w-4 h-4" /> {transcriptOpen ? 'Hide' : 'Show'} Transcript
                    </button>
                    <AnimatePresence>
                      {transcriptOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <pre className="mt-3 p-4 rounded-xl bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">{activeLesson.transcript}</pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {/* Bottom action bar */}
            <div className="sticky bottom-0 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-sm border-t border-[var(--border)] flex items-center justify-between gap-4 mt-8">
              <AnimatedButton variant="outline" onClick={goPrev} disabled={!hasPrev} className="text-sm"><ChevronLeft className="w-4 h-4" /> Previous</AnimatedButton>
              <AnimatedButton 
                variant={isCompleted ? "outline" : "gradient"} 
                onClick={markComplete} 
                className="text-sm"
                disabled={isCompleted}
              >
                {isCompleted ? <span className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /> Completed</span> : 'Mark as Complete'}
              </AnimatedButton>
              <AnimatedButton variant="outline" onClick={goNext} disabled={!hasNext} className="text-sm">Next <ChevronRight className="w-4 h-4" /></AnimatedButton>
            </div>

            {/* Certificate Unlock Banner */}
            {completionPct === 100 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-blue)]/20 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center mx-auto mb-4">
                  <Badge variant="glow" className="p-3"><Layers className="w-8 h-8 text-[var(--accent-blue)]" /></Badge>
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
                  Congratulations! You&apos;ve completed the course.
                </h3>
                <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                  Your hard work has paid off. Request your AI-generated certificate now to showcase your new skills.
                </p>
                
                {certificate ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                      <span className="text-[var(--text-muted)]">Status:</span>
                      <Badge variant={
                        certificate.status === 'approved' ? 'success' : 
                        certificate.status === 'rejected' ? 'danger' : 'warning'
                      }>
                        {certificate.status.toUpperCase()}
                      </Badge>
                    </div>
                    {certificate.status === 'approved' && (
                      <AnimatedButton variant="gradient" onClick={() => navigate('/student/certificates')} className="px-8 py-3">
                        View Certificate
                      </AnimatedButton>
                    )}
                    {certificate.status === 'rejected' && certificate.rejectionReason && (
                      <p className="text-sm text-red-400 mt-2 italic">&quot;{certificate.rejectionReason}&quot;</p>
                    )}
                    {certificate.status === 'pending' && (
                      <p className="text-sm text-[var(--text-muted)]">Your instructor will review your request shortly.</p>
                    )}
                  </div>
                ) : (
                  <AnimatedButton 
                    variant="gradient" 
                    onClick={handleRequestCert} 
                    loading={isRequestingCert}
                    className="px-8 py-3"
                    icon={Brain}
                  >
                    Unlock AI Certificate
                  </AnimatedButton>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-72 flex-shrink-0 border-l border-[var(--border)] overflow-y-auto bg-[var(--bg-primary)]/50 backdrop-blur-sm hidden lg:block">
          <div className="flex border-b border-[var(--border)]">
            {[{ key: 'tools', label: 'AI Tools', icon: Brain }, { key: 'ai', label: 'AI Tutor', icon: Bot }, { key: 'notes', label: 'Notes', icon: StickyNote }, { key: 'scores', label: 'Scores', icon: Layers }].map((t) => (
              <button key={t.key} onClick={() => setRightTab(t.key)}
                className={`flex-1 py-3 text-xs font-medium transition-colors ${rightTab === t.key ? 'text-[var(--accent-blue)] border-b-2 border-[var(--accent-blue)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {rightTab === 'tools' && (
              <>
                <AnimatedButton 
                  variant="gradient" 
                  className="w-full text-sm" 
                  icon={Brain} 
                  disabled={!activeLesson}
                  onClick={() => navigate(`/student/quiz/${activeLesson?._id || 'none'}?courseId=${id}`)}
                >
                  Generate Quiz
                </AnimatedButton>
                <AnimatedButton 
                  variant="outline" 
                  className="w-full text-sm" 
                  icon={Layers} 
                  disabled={!activeLesson}
                  onClick={() => navigate(`/student/flashcards/${activeLesson?._id || 'none'}?courseId=${id}`)}
                >
                  Flashcards
                </AnimatedButton>
                {activeLesson?.flashcards?.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Existing Flashcards</p>
                    {activeLesson.flashcards.slice(0, 3).map((fc, i) => (
                      <GlowCard key={i} className="p-3 text-xs" hover={false}>
                        <p className="text-[var(--text-primary)] font-medium">{fc.question}</p>
                        <p className="text-[var(--text-muted)] mt-1">{fc.answer}</p>
                      </GlowCard>
                    ))}
                  </div>
                )}
              </>
            )}
            {rightTab === 'ai' && (
              <div className="flex flex-col h-[calc(100vh-140px)]">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                  {chatHistory.length === 0 ? (
                    <div className="text-center mt-10">
                      <Bot className="w-10 h-10 text-[var(--accent-blue)]/50 mx-auto mb-2" />
                      <p className="text-sm text-[var(--text-muted)]">Ask me anything about the current lesson!</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-[85%] text-xs ${
                          msg.role === 'user' 
                            ? 'bg-[var(--accent-blue)] text-white rounded-tr-sm' 
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border)]'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-tl-sm text-xs">
                        <div className="flex gap-1 py-1">
                          <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative mt-auto pt-2 border-t border-[var(--border)]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Ask a question..."
                    className="w-full input-glass text-xs py-3 pr-10 bg-[var(--bg-primary)]/50 focus:bg-[var(--bg-secondary)]/80 transition-colors"
                    disabled={isAiTyping}
                  />
                  <button 
                    onClick={handleChatSubmit}
                    disabled={isAiTyping || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 p-1.5 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {rightTab === 'notes' && (
              <textarea value={notes} onChange={(e) => saveNotes(e.target.value)} placeholder="Type your notes here..." className="input-glass w-full h-64 resize-none text-sm" />
            )}
            {rightTab === 'scores' && (
              <div className="space-y-3">
                {(courseProgress?.quizScores || []).length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No quiz scores yet.</p>
                ) : courseProgress.quizScores.map((q, i) => (
                  <GlowCard key={i} className="p-3" hover={false}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-primary)]">Quiz {i + 1}</span>
                      <Badge variant={q.score >= 60 ? 'success' : 'danger'}>{q.score}%</Badge>
                    </div>
                  </GlowCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningWorkspace;
