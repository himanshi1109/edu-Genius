import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { fetchProgress } from '@/store/slices/progressSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import ProgressRing from '@/components/ui/ProgressRing';
import Badge from '@/components/ui/Badge';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import certificateService from '@/services/certificateService';
import { calculateCompletion, getTotalLessons, getScoreColor } from '@/utils/helpers';
import { PROGRESS_STATES } from '@/utils/constants';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const stateSteps = ['not_started', 'learning', 'revising', 'completed'];
const stateLabels = { not_started: 'Not Started', learning: 'Learning', revising: 'Revising', completed: 'Completed' };

const ProgressTracker = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((s) => s.courses);
  const { progress } = useSelector((s) => s.progress);
  const courseProgress = progress[id];

  useEffect(() => { dispatch(fetchCourseById(id)); dispatch(fetchProgress(id)); }, [dispatch, id]);



  const courseData = currentCourse || {};
  const progressData = courseProgress || { completedLessons: [], quizScores: [], state: 'not_started' };

  const totalLessons = getTotalLessons(courseData);
  const completedLessons = progressData?.completedLessons || [];
  const completionPct = calculateCompletion(completedLessons.length, totalLessons);
  const quizScores = progressData?.quizScores || [];
  const avgScore = quizScores.length ? Math.round(quizScores.reduce((a, q) => a + (q.score || 0), 0) / quizScores.length) : 0;
  const currentState = progressData?.state || 'not_started';
  const currentStateIdx = stateSteps.indexOf(currentState);
  const thumbUrl = courseData.thumbnail ? (courseData.thumbnail.startsWith('http') ? courseData.thumbnail : `http://localhost:8080${courseData.thumbnail}`) : null;

  const [certStatus, setCertStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    dispatch(fetchProgress(id));
    checkCertStatus();
  }, [dispatch, id]);

  const checkCertStatus = async () => {
    try {
      const cert = await certificateService.getCertificateForCourse(id);
      if (cert) setCertStatus(cert);
    } catch (err) { console.error(err); }
  };

  const handleUnlock = async () => {
    try {
      setRequesting(true);
      await certificateService.requestCertificate(id);
      dispatch(addToast({ message: 'Certificate request sent!', type: 'success' }));
      checkCertStatus();
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to request certificate', type: 'error' }));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      {/* Course Overview */}
      <GlowCard className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {thumbUrl && <img src={thumbUrl} alt="" className="w-20 h-20 rounded-xl object-cover" />}
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">{courseData.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <Badge variant={currentState === 'completed' ? 'success' : 'default'}>{stateLabels[currentState]}</Badge>
              
              {currentState === 'completed' && !certStatus && (
                <AnimatedButton 
                  size="sm" 
                  variant="gradient" 
                  onClick={handleUnlock}
                  loading={requesting}
                >
                  Unlock Certificate
                </AnimatedButton>
              )}
              
              {certStatus?.status === 'pending' && (
                <Badge variant="warning">Certificate Pending Approval</Badge>
              )}
              
              {certStatus?.status === 'approved' && (
                <AnimatedButton 
                  size="sm" 
                  variant="success" 
                  onClick={() => navigate(`/student/certificate/${id}`)}
                >
                  View Certificate
                </AnimatedButton>
              )}

              {certStatus?.status === 'rejected' && (
                <div className="flex flex-col">
                  <Badge variant="danger">Certificate Rejected</Badge>
                  {certStatus.rejectionReason && <p className="text-[10px] text-red-400 mt-1">Reason: {certStatus.rejectionReason}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing percentage={completionPct} size={100} strokeWidth={8} textSize="20px" />
            <p className="text-xs text-[var(--text-muted)] mt-2">{completedLessons.length}/{totalLessons} lessons</p>
          </div>
        </div>
      </GlowCard>

      {/* State Timeline */}
      <GlowCard className="p-6" hover={false}>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-6">Progress Timeline</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-[var(--bg-secondary)]" />
          <div className="absolute top-5 left-[10%] h-[2px] bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] transition-all duration-700" style={{ width: `${(currentStateIdx / (stateSteps.length - 1)) * 80}%` }} />
          {stateSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStateIdx ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg shadow-[var(--accent-blue)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                {i < currentStateIdx ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-2 ${i <= currentStateIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{stateLabels[step]}</span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Modules Breakdown */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Modules Breakdown</h2>
        <div className="space-y-3">
          {(courseData.modules || []).map((mod) => {
            const modLessons = mod.lessons || [];
            const modCompleted = modLessons.filter((l) => completedLessons.includes(l._id)).length;
            const modPct = modLessons.length ? Math.round((modCompleted / modLessons.length) * 100) : 0;
            return (
              <GlowCard key={mod._id} className="p-4" hover={false}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{mod.title}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{modCompleted}/{modLessons.length} lessons</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-secondary)]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${modPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]" />
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>

      {/* Quiz Scores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Quiz Scores</h2>
          {quizScores.length > 0 && <Badge variant="default">Avg: {avgScore}%</Badge>}
        </div>
        {quizScores.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No quiz scores yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {quizScores.map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlowCard className="p-4 flex items-center justify-between" hover={false}>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Quiz {i + 1}</p>
                    <p className="text-xs text-[var(--text-muted)]">{q.attempts || 1} attempt(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: getScoreColor(q.score) }}>{q.score}%</p>
                    <Badge variant={q.score >= 60 ? 'success' : 'danger'} className="text-[10px]">{q.score >= 60 ? 'Pass' : 'Fail'}</Badge>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressTracker;
