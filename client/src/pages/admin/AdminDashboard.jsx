import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCourses, fetchPendingCourses, adminDeleteCourse } from '@/store/slices/courseSlice';
import { fetchAllUsers } from '@/store/slices/userSlice';
import { getGreeting } from '@/utils/helpers';
import StatCard from '@/components/shared/StatCard';
import GlowCard from '@/components/ui/GlowCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { Users, BookOpen, Clock, ShieldCheck, Pencil, Trash2 } from 'lucide-react';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth || {});
  const { courses, pendingCourses, isLoading: coursesLoading } = useSelector(s => s.courses || {});
  const { usersList, isLoading: usersLoading } = useSelector(s => s.users || {});

  useEffect(() => {
    // Only fetch if data is missing or empty to reduce API load
    if (!courses || courses.length === 0) dispatch(fetchCourses());
    if (!usersList || usersList.length === 0) dispatch(fetchAllUsers());
    if (!pendingCourses || pendingCourses.length === 0) dispatch(fetchPendingCourses());
  }, [dispatch, courses?.length, usersList?.length, pendingCourses?.length]);

  const handleDeleteCourse = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    await dispatch(adminDeleteCourse(id));
    dispatch(fetchCourses());
  }, [dispatch]);

  const approvedCount = React.useMemo(() => 
    Array.isArray(courses) ? courses.filter(c => c.status === 'approved' || !c.status).length : 0,
  [courses]);

  if (coursesLoading && usersLoading && (!courses?.length || !usersList?.length)) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-8">
      {/* Welcome */}
      <GlowCard className="p-8 relative overflow-hidden border-[var(--accent-blue)]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-blue)]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] relative z-10">
          {getGreeting()}, Administrator 🛡️
        </h1>
        <p className="text-[var(--text-muted)] mt-2 relative z-10 max-w-xl">
          Welcome to the EduGenius control center. Monitor platform activity, manage users, and review course submissions.
        </p>
      </GlowCard>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={usersList?.length || 0} icon="Users" trend={12} />
        <StatCard title="Total Courses" value={courses?.length || 0} icon="BookOpen" trend={8} />
        <StatCard title="Pending Approvals" value={pendingCourses?.length || 0} icon="Clock" />
        <StatCard title="Approved Courses" value={approvedCount} icon="ShieldCheck" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Recent Courses</h2>
            <button onClick={() => navigate('/admin/courses')} className="text-xs text-[var(--accent-blue)] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(courses) ? courses : []).slice(0, 5).map(course => (
              <div key={course._id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)]/10 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:8080${course.thumbnail}`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-5 h-5 text-[var(--accent-blue)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{course.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[var(--text-muted)]">{course.instructor?.name || 'Unknown'}</p>
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-30" />
                      <p className="text-xs text-[var(--accent-blue)] flex items-center gap-1">
                        <Users className="w-3 h-3" /> {course.enrolledCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] mr-2">
                    {course.status || 'approved'}
                  </div>
                  <button 
                    onClick={() => navigate(`/instructor/courses/${course._id}/students`)} 
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-blue)]/10 transition-colors" 
                    title="View Students"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/courses/${course._id}/edit`); }} 
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-blue)]/10 transition-colors" 
                    title="Edit Course"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCourse(course._id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Course">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {courses?.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No courses available.</p>
            )}
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Recent Users</h2>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-[var(--accent-blue)] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(usersList) ? usersList : []).slice(0, 5).map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center text-white font-bold text-sm">
                    {u.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{u.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
                  {u.role}
                </div>
              </div>
            ))}
            {usersList?.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No users available.</p>
            )}
          </div>
        </GlowCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
