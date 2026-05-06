import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, Plus, X, Trash2, Check } from 'lucide-react';
import { fetchCourseById, createCourse, updateCourse } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import courseService from '@/services/courseService';
import quizService from '@/services/quizService';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import Badge from '@/components/ui/Badge';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse } = useSelector((s) => s.courses);
  const { user } = useSelector((s) => s.auth);
  const isEdit = !!id;

  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(id || null);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');

  // Step 2
  const [modules, setModules] = useState([]);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModOrder, setNewModOrder] = useState(1);

  // Step 3
  const [selModule, setSelModule] = useState('');
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', duration: '', summary: '', video: null });
  const [keyPoints, setKeyPoints] = useState([]);
  const [kpInput, setKpInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  // Step 3 - Quiz & Edit state
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    if (isEdit) dispatch(fetchCourseById(id));
  }, [isEdit, id, dispatch]);

  useEffect(() => {
    if (isEdit && currentCourse) {
      setTitle(currentCourse.title || '');
      setDescription(currentCourse.description || '');
      setCourseId(currentCourse._id);
      setModules(currentCourse.modules || []);
      
      const allLessons = [];
      (currentCourse.modules || []).forEach(m => {
        if (m.lessons) allLessons.push(...m.lessons);
      });
      setLessons(allLessons);

      if (currentCourse.thumbnail) {
        setThumbPreview(currentCourse.thumbnail);
      }
    }
  }, [isEdit, currentCourse]);

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!title || !description) { dispatch(addToast({ message: 'Title and description required', type: 'error' })); return; }
    
    setSaving(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    if (thumbnail) fd.append('thumbnail', thumbnail);

    try {
      if (isEdit && courseId) {
        await dispatch(updateCourse({ id: courseId, formData: fd }));
        dispatch(addToast({ message: 'Course updated!', type: 'success' }));
        setStep(2);
      } else {
        const res = await dispatch(createCourse(fd));
        if (createCourse.fulfilled.match(res)) {
          setCourseId(res.payload._id);
          dispatch(addToast({ message: 'Course created!', type: 'success' }));
          setStep(2);
        } else {
          dispatch(addToast({ message: res.payload || 'Failed to create course.', type: 'error' }));
        }
      }
    } catch { dispatch(addToast({ message: 'Save failed', type: 'error' })); }
    setSaving(false);
  };

  const addModule = async () => {
    if (!newModTitle) { dispatch(addToast({ message: 'Please enter a module title', type: 'error' })); return; }
    if (!courseId) { 
      dispatch(addToast({ message: 'Course must be saved first!', type: 'error' })); 
      setStep(1);
      return; 
    }
    try {
      const res = await courseService.createModule(courseId, { title: newModTitle, order: newModOrder });
      const mod = res.data || res;
      setModules([...modules, mod]);
      setNewModTitle('');
      setNewModOrder(modules.length + 2);
      dispatch(addToast({ message: 'Module added', type: 'success' }));
    } catch { dispatch(addToast({ message: 'Failed to add module', type: 'error' })); }
  };

  const delModule = async (mId) => {
    try {
      if (courseId) await courseService.deleteModule(mId);
      setModules(modules.filter((m) => m._id !== mId));
      dispatch(addToast({ message: 'Module deleted', type: 'success' }));
    } catch { dispatch(addToast({ message: 'Failed to delete', type: 'error' })); }
  };

  const addKeyPoint = () => {
    if (kpInput.trim()) { setKeyPoints([...keyPoints, kpInput.trim()]); setKpInput(''); }
  };

  const addFlashcard = () => setFlashcards([...flashcards, { question: '', answer: '' }]);
  const updateFC = (i, field, val) => { const n = [...flashcards]; n[i][field] = val; setFlashcards(n); };
  const removeFC = (i) => setFlashcards(flashcards.filter((_, j) => j !== i));

  const addQuizQuestion = () => setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const updateQuizQ = (i, field, val) => { const n = [...quizQuestions]; n[i][field] = val; setQuizQuestions(n); };
  const updateQuizOpt = (qIdx, oIdx, val) => { const n = [...quizQuestions]; n[qIdx].options[oIdx] = val; setQuizQuestions(n); };
  const removeQuizQ = (i) => setQuizQuestions(quizQuestions.filter((_, j) => j !== i));

  const editLesson = async (les) => {
    setEditingLessonId(les._id);
    setSelModule(les.moduleId);
    setLessonForm({ title: les.title || '', content: les.content || '', duration: les.duration || '', summary: les.summary || '', video: null });
    setKeyPoints(les.keyPoints || []);
    setFlashcards(les.flashcards || []);
    try {
      if (!courseId) return;
      const res = await quizService.getQuizByLesson(les._id);
      const q = res.data?.[0];
      if (q) { setQuizId(q._id); setQuizQuestions(q.questions || []); }
      else { setQuizId(null); setQuizQuestions([]); }
    } catch { setQuizId(null); setQuizQuestions([]); }
  };

  const delLesson = async (lId) => {
    try {
      if (courseId) await courseService.deleteLesson(lId);
      setLessons(lessons.filter((l) => l._id !== lId));
      if (editingLessonId === lId) {
        setEditingLessonId(null);
        setLessonForm({ title: '', content: '', duration: '', summary: '', video: null });
        setKeyPoints([]); setFlashcards([]); setQuizQuestions([]); setQuizId(null);
      }
      dispatch(addToast({ message: 'Lesson deleted', type: 'success' }));
    } catch { dispatch(addToast({ message: 'Failed to delete lesson', type: 'error' })); }
  };

  const submitLesson = async (e) => {
    e.preventDefault();
    if (!selModule || !lessonForm.title) { dispatch(addToast({ message: 'Select module and enter title', type: 'error' })); return; }

    setSaving(true);
    const fd = new FormData();
    fd.append('title', lessonForm.title);
    fd.append('content', lessonForm.content);
    fd.append('duration', lessonForm.duration);
    fd.append('summary', lessonForm.summary);
    if (lessonForm.video) fd.append('video', lessonForm.video);
    if (keyPoints.length) fd.append('keyPoints', JSON.stringify(keyPoints));
    if (flashcards.length) fd.append('flashcards', JSON.stringify(flashcards));

    try {
      let savedLesson;
      if (editingLessonId) {
        const res = await courseService.updateLesson(editingLessonId, fd);
        savedLesson = res.data || res;
        setLessons(lessons.map((l) => l._id === editingLessonId ? savedLesson : l));
        dispatch(addToast({ message: 'Lesson updated!', type: 'success' }));
      } else {
        const res = await courseService.createLesson(selModule, fd);
        savedLesson = res.data || res;
        setLessons([...lessons, savedLesson]);
        dispatch(addToast({ message: 'Lesson added!', type: 'success' }));
      }

      if (quizQuestions.length > 0) {
        if (quizId) await quizService.updateQuiz(quizId, { questions: quizQuestions });
        else await quizService.createQuiz(savedLesson._id, { questions: quizQuestions });
      } else if (quizId && quizQuestions.length === 0) {
        await quizService.deleteQuiz(quizId);
      }

      setLessonForm({ title: '', content: '', duration: '', summary: '', video: null });
      setKeyPoints([]); setFlashcards([]); setEditingLessonId(null); setQuizQuestions([]); setQuizId(null);
    } catch { dispatch(addToast({ message: 'Failed to save lesson', type: 'error' })); }
    setSaving(false);
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div 
            onClick={() => setStep(s)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:scale-105 ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg shadow-[var(--accent-blue)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
          {s < 3 && <div className={`w-8 sm:w-12 h-[2px] ${step > s ? 'bg-green-500' : 'bg-[var(--bg-secondary)]'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">{isEdit ? 'Edit Course' : 'Create Course'}</h1>
      {stepIndicator}

      {/* STEP 1 */}
      {step === 1 && (
        <GlowCard className="p-6" hover={false}>
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Course Info</h2>
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-glass" placeholder="Course title" />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-glass h-32 resize-none" placeholder="Describe your course" />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Thumbnail</label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--accent-blue)]/40 transition-colors cursor-pointer" onClick={() => document.getElementById('thumb-input').click()}>
                {thumbPreview ? <img src={thumbPreview} alt="" className="w-32 h-24 object-cover rounded-lg mx-auto mb-2" /> : <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />}
                <p className="text-sm text-[var(--text-muted)]">{thumbnail ? thumbnail.name : 'Click to upload'}</p>
              </div>
              <input id="thumb-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setThumbnail(f); setThumbPreview(URL.createObjectURL(f)); } }} />
            </div>
            <AnimatedButton type="submit" variant="gradient" loading={saving} className="w-full">Save & Continue</AnimatedButton>
          </form>
        </GlowCard>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <GlowCard className="p-6" hover={false}>
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Modules</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end sm:items-stretch">
            <div className="flex-1 w-full">
              <input 
                value={newModTitle} 
                onChange={(e) => setNewModTitle(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())} 
                className="input-glass w-full" 
                placeholder="Module title" 
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <input 
                type="number" 
                value={newModOrder} 
                onChange={(e) => setNewModOrder(Number(e.target.value))} 
                className="input-glass w-16 text-center" 
                placeholder="#" 
                title="Order" 
              />
              <AnimatedButton variant="gradient" icon={Plus} onClick={addModule} className="px-5">Add</AnimatedButton>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {modules.map((m) => (
              <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <span className="text-sm text-[var(--text-primary)]">{m.title}</span>
                <button onClick={() => delModule(m._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {modules.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">No modules added yet.</p>}
          </div>
          <div className="flex gap-3">
            <AnimatedButton variant="ghost" onClick={() => setStep(1)}>Back</AnimatedButton>
            <AnimatedButton variant="gradient" onClick={() => setStep(3)}>Next: Add Lessons</AnimatedButton>
          </div>
        </GlowCard>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <GlowCard className="p-6" hover={false}>
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Add Lessons</h2>
          <form onSubmit={submitLesson} className="space-y-4">
            <select value={selModule} onChange={(e) => setSelModule(e.target.value)} className="input-glass">
              {modules.length === 0 ? (
                <option value="">No modules available (Go back to Step 2)</option>
              ) : (
                <>
                  <option value="">Select module</option>
                  {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                </>
              )}
            </select>
            <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="input-glass" placeholder="Lesson title" />
            <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} className="input-glass h-24 resize-none font-mono text-sm" placeholder="Lesson content" />
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="number" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} className="input-glass flex-1" placeholder="Duration (min)" />
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <input type="file" accept="video/*" onChange={(e) => setLessonForm({ ...lessonForm, video: e.target.files[0] })} className="text-xs text-[var(--text-muted)] w-full overflow-hidden" />
              </div>
            </div>

            <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium text-[var(--text-primary)] hover:bg-[var(--accent-glow)] transition-colors select-none">
                Interactive Elements & Details (Optional)
              </summary>
              <div className="p-4 space-y-6 border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
                <textarea value={lessonForm.summary} onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })} className="input-glass h-20 resize-none" placeholder="Summary" />

                {/* Key points */}
                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Key Points</label>
                  <div className="flex gap-2">
                    <input value={kpInput} onChange={(e) => setKpInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())} className="input-glass flex-1" placeholder="Type and press Enter" />
                    <AnimatedButton variant="ghost" type="button" onClick={addKeyPoint}>Add</AnimatedButton>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keyPoints.map((kp, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-xs text-[var(--accent-blue)]">
                        {kp} <button type="button" onClick={() => setKeyPoints(keyPoints.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Flashcards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-[var(--text-muted)]">Flashcards</label>
                    <AnimatedButton variant="ghost" type="button" className="text-xs" icon={Plus} onClick={addFlashcard}>Add Flashcard</AnimatedButton>
                  </div>
                  {flashcards.map((fc, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={fc.question} onChange={(e) => updateFC(i, 'question', e.target.value)} className="input-glass flex-1" placeholder="Question" />
                      <input value={fc.answer} onChange={(e) => updateFC(i, 'answer', e.target.value)} className="input-glass flex-1" placeholder="Answer" />
                      <button type="button" onClick={() => removeFC(i)} className="text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                {/* Quiz Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-[var(--text-muted)]">Quiz Questions</label>
                    <AnimatedButton variant="ghost" type="button" className="text-xs" icon={Plus} onClick={addQuizQuestion}>Add Question</AnimatedButton>
                  </div>
                  {quizQuestions.map((q, i) => (
                    <div key={i} className="p-4 mb-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 relative">
                      <button type="button" onClick={() => removeQuizQ(i)} className="absolute top-2 right-2 text-red-400"><X className="w-4 h-4" /></button>
                      <input value={q.question} onChange={(e) => updateQuizQ(i, 'question', e.target.value)} className="input-glass w-full" placeholder={`Question ${i + 1}`} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input type="radio" name={`correct-${i}`} checked={q.correctAnswer === oIdx} onChange={() => updateQuizQ(i, 'correctAnswer', oIdx)} />
                            <input value={opt} onChange={(e) => updateQuizOpt(i, oIdx, e.target.value)} className="input-glass flex-1 text-sm py-1" placeholder={`Option ${oIdx + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            <AnimatedButton type="submit" variant="gradient" loading={saving} className="w-full">{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</AnimatedButton>
          </form>

          {lessons.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center"><p className="text-sm text-[var(--text-muted)] font-semibold">Added Lessons</p>
              {editingLessonId && <button onClick={() => { setEditingLessonId(null); setLessonForm({ title: '', content: '', duration: '', summary: '', video: null }); setKeyPoints([]); setFlashcards([]); setQuizQuestions([]); setQuizId(null); }} className="text-xs text-[var(--accent-blue)]">Cancel Edit</button>}</div>
              {lessons.map((l) => (
                <div key={l._id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${editingLessonId === l._id ? 'border-[var(--accent-blue)] bg-[var(--accent-glow)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
                  <span className="text-sm text-[var(--text-primary)]">{l.title}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => editLesson(l)} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-blue)]">Edit</button>
                    <button onClick={() => delLesson(l._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <AnimatedButton variant="ghost" onClick={() => setStep(2)}>Back</AnimatedButton>
            <AnimatedButton variant="gradient" onClick={() => {
              dispatch(addToast({ message: isEdit ? 'Changes saved!' : 'Course submitted for approval.', type: 'success' }));
              navigate(user?.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard');
            }}>Finish & Save</AnimatedButton>
          </div>
        </GlowCard>
      )}
    </motion.div>
  );
};

export default CourseBuilder;
