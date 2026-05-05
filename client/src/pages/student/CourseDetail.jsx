import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Clock, Users, ChevronDown, ChevronUp, Video, CheckCircle } from 'lucide-react';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { enrollCourse, fetchProgress } from '@/store/slices/progressSlice';
import { addToast } from '@/store/slices/uiSlice';
import useAuth from '@/hooks/useAuth';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import ProgressRing from '@/components/ui/ProgressRing';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getTotalLessons, getTotalModules, calculateCompletion } from '@/utils/helpers';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((s) => s.courses);
  const { progress } = useSelector((s) => s.progress);
  const { user, isAuthenticated, isStudent, isInstructor, isAdmin } = useAuth();
  const [openModules, setOpenModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);



  const courseData = currentCourse || {};
  const courseProgress = progress[id];
  const isEnrolled = !!courseProgress?._id;
  const totalLessons = getTotalLessons(courseData);
  
  const completedLessonIds = (courseProgress?.completedLessons || []).map(l => 
    typeof l === 'string' ? l : (l._id || l.toString())
  );
  
  const completedCount = completedLessonIds.length;
  const completionPct = calculateCompletion(completedCount, totalLessons);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    if (isAuthenticated) dispatch(fetchProgress(id));
  }, [dispatch, id, isAuthenticated]);

  const toggleModule = (mId) => setOpenModules((p) => ({ ...p, [mId]: !p[mId] }));

  const handleEnrollClick = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowEnrollConfirm(true);
  };

  const confirmEnrollment = async () => {
    setEnrolling(true);
    const res = await dispatch(enrollCourse(id));
    setEnrolling(false);
    setShowEnrollConfirm(false);
    if (enrollCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Enrolled successfully!', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Enrollment failed', type: 'error' }));
    }
  };

  // Bypassing skeleton loader if we have mock data
  // if (isLoading || !currentCourse) {

  const c = courseData;
  const thumbUrl = c.thumbnail ? (c.thumbnail.startsWith('http') ? c.thumbnail : `http://localhost:8080${c.thumbnail}`) : null;

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        {thumbUrl && <div className="absolute inset-0"><img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-15 blur-sm" /></div>}
        <div className="relative glass-card p-8 lg:p-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge variant="gradient" className="mb-4">Course</Badge>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">{c.title}</h1>
              {c.instructor && <p className="text-[var(--text-muted)] flex items-center gap-2 mb-4"><Users className="w-4 h-4" />{c.instructor.name || 'Instructor'}</p>}
              <p className="text-[var(--text-muted)] leading-relaxed">{c.description}</p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{getTotalModules(c)} modules</span>
                <span className="flex items-center gap-1.5"><Play className="w-4 h-4" />{totalLessons} lessons</span>
              </div>
            </div>
            {/* Sticky card */}
            <div className="lg:sticky lg:top-8">
              <GlowCard className="p-6 space-y-4">
                {thumbUrl && <img src={thumbUrl} alt={c.title} className="w-full h-40 object-cover rounded-xl" />}
                {isEnrolled ? (
                  <>
                    <ProgressRing percentage={completionPct} size={80} className="mx-auto" />
                    <AnimatedButton variant="gradient" className="w-full" onClick={() => navigate(`/student/learn/${id}`)}>Continue Learning</AnimatedButton>
                  </>
                ) : (isInstructor || isAdmin) ? (
                  <>
                    <AnimatedButton variant="gradient" className="w-full" onClick={() => navigate(`/student/learn/${id}`)}>View Course Content</AnimatedButton>
                  </>
                ) : (
                  <AnimatedButton variant="gradient" className="w-full" onClick={handleEnrollClick} loading={enrolling}>
                    {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
                  </AnimatedButton>
                )}
              </GlowCard>

              <ConfirmationModal 
                isOpen={showEnrollConfirm}
                onClose={() => setShowEnrollConfirm(false)}
                onConfirm={confirmEnrollment}
                isLoading={enrolling}
                title="Enrollment Confirmation"
                message={`Do you want to enroll for "${c.title}" course?`}
                confirmLabel="Yes, Enroll"
                cancelLabel="No, Cancel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-6">Curriculum</h2>
        <div className="space-y-3">
          {(c.modules || []).map((mod) => (
            <GlowCard key={mod._id} className="overflow-hidden" hover={false}>
              <button onClick={() => toggleModule(mod._id)} className="w-full flex items-center justify-between p-5 text-left">
                <div>
                  <h3 className="font-heading font-semibold text-[var(--text-primary)]">{mod.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{mod.lessons?.length || 0} lessons</p>
                </div>
                {openModules[mod._id] ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
              </button>
              <AnimatePresence>
                {openModules[mod._id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-2 border-t border-[var(--border)] pt-3">
                      {(mod.lessons || []).map((les) => {
                        const done = completedLessonIds.includes(les._id);
                        return (
                          <div key={les._id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--accent-glow)] transition-colors">
                            {done ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Video className="w-4 h-4 text-[var(--text-muted)]" />}
                            <span className="text-sm text-[var(--text-primary)] flex-1">{les.title}</span>
                            {les.duration && <span className="text-xs text-[var(--text-muted)]">{les.duration} min</span>}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* Instructor */}
      {c.instructor && (
        <GlowCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(c.instructor.name || 'I')[0]}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-[var(--text-primary)]">{c.instructor.name}</h3>
            <p className="text-sm text-[var(--text-muted)]">{c.instructor.email}</p>
            <Badge variant="purple" className="mt-1">Instructor</Badge>
          </div>
        </GlowCard>
      )}
    </motion.div>
  );
};

export default CourseDetail;
