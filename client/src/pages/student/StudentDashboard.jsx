import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BookOpen, Award, Brain, Zap, Flame, Trophy,
  Clock, CheckCircle, TrendingUp as TrendUp,
} from 'lucide-react';
import { fetchMe } from '@/store/slices/authSlice';
import { fetchAllMyProgress } from '@/store/slices/progressSlice';

import StatCard from '@/components/shared/StatCard';
import CourseCard from '@/components/shared/CourseCard';
import GlowCard from '@/components/ui/GlowCard';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/shared/EmptyState';
import { getGreeting, formatRelativeTime } from '@/utils/helpers';
import { ACHIEVEMENTS } from '@/utils/constants';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allProgress, isLoading: progressLoading } = useSelector((state) => state.progress);
  const [loading, setLoading] = useState(true);

  const enrolledCourses = allProgress || [];


  // fetchMe is handled globally in App.jsx, no need to dispatch here to prevent RoleRoute infinite unmount loops

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await dispatch(fetchAllMyProgress());
      setLoading(false);
    };
    loadData();
  }, [dispatch]);


  const completedCount = enrolledCourses.filter(
    (p) => p?.state === 'completed'
  ).length;

  const avgScore = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((acc, curr) => acc + (curr.avgQuizScore || 0), 0) / enrolledCourses.length)
    : 0;




  const earnedBadges = ['first_enrollment'];
  if (completedCount > 0) earnedBadges.push('course_complete');
  if (avgScore >= 100) earnedBadges.push('quiz_master');

  const achievementIcons = { BookOpen, Brain, Zap, Award, Flame };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <GlowCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-blue)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] relative z-10">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-[var(--text-muted)] mt-2 relative z-10">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </GlowCard>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={enrolledCourses.length}
          icon="BookOpen"
          trend={12}
          trendLabel="+2 this week"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon="Award"
          trend={completedCount > 0 ? 8 : 0}
          onClick={() => navigate('/student/certificates')}
        />

        <StatCard
          title="Avg Quiz Score"
          value={`${avgScore}%`}
          icon="Brain"
          trend={avgScore > 70 ? 5 : -3}
        />
        <StatCard
          title="Learning Streak"
          value={7}
          icon="Flame"
          trend={14}
          trendLabel="🔥 7 days"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrolled Courses (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              My Courses
            </h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-sm text-[var(--accent-blue)] hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              subtitle="Explore our catalog and enroll in your first course"
              actionLabel="Browse Courses"
              onAction={() => navigate('/courses')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrolledCourses.map((p) => {
                const courseData = {
                  _id: p.courseId,
                  title: p.courseTitle,
                  thumbnail: p.thumbnail
                };
                return (
                  <CourseCard
                    key={p.courseId}
                    course={courseData}
                    showProgress
                    progress={p}
                  />
                );
              })}
            </div>
          )}

        </div>

        {/* Right column: Activity + Achievements */}
        <div className="space-y-6">
          {/* Achievements */}
          <GlowCard className="p-5">
            <h3 className="font-heading text-base font-semibold text-[var(--text-primary)] mb-4">
              Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {ACHIEVEMENTS.map((a) => {
                const earned = earnedBadges.includes(a.id);
                const Icon = achievementIcons[a.icon] || Award;
                return (
                  <motion.div
                    key={a.id}
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        earned
                          ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)]'
                          : 'bg-[var(--bg-secondary)] opacity-40 grayscale'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {a.name}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlowCard>

          {/* Recent Activity */}
          <GlowCard className="p-5">
            <h3 className="font-heading text-base font-semibold text-[var(--text-primary)] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">No recent activity to display.</p>
            </div>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
