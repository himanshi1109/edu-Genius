import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { PlusCircle, Pencil, Trash2, BookOpen, Users, Layers, Play, Clock, XCircle, CheckCircle, Award } from 'lucide-react';
import { fetchCourses, createCourse, deleteCourse } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import useAuth from '@/hooks/useAuth';
import StatCard from '@/components/shared/StatCard';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { getTotalLessons, getTotalModules, getGreeting, getMediaUrl } from '@/utils/helpers';


const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { courses, isLoading } = useSelector((s) => s.courses);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', thumbnail: null });
  const [creating, setCreating] = useState(false);

  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

  const myCourses = (Array.isArray(courses) ? courses : []).filter(
    (c) => c.instructor?._id === user?._id || c.instructor === user?._id
  );

  const totalModules = myCourses.reduce((s, c) => s + getTotalModules(c), 0);
  const totalLessons = myCourses.reduce((s, c) => s + getTotalLessons(c), 0);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setDeleting(id);
    const res = await dispatch(deleteCourse(id));
    setDeleting(null);
    if (deleteCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Course deleted', type: 'success' }));
    } else {
      dispatch(addToast({ message: 'Failed to delete', type: 'error' }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { dispatch(addToast({ message: 'Title and description required', type: 'error' })); return; }
    setCreating(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    if (form.thumbnail) fd.append('thumbnail', form.thumbnail);
    const res = await dispatch(createCourse(fd));
    setCreating(false);
    if (createCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Course created!', type: 'success' }));
      setForm({ title: '', description: '', thumbnail: null });
      setShowForm(false);
      dispatch(fetchCourses());
    } else {
      dispatch(addToast({ message: res.payload || 'Failed', type: 'error' }));
    }
  };

  const getStatusBadge = (course) => {
    if (course.status === 'pending') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
          <Clock className="w-3 h-3" /> Pending Approval
        </div>
      );
    }
    if (course.status === 'rejected') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-500" title={course.rejectionReason}>
          <XCircle className="w-3 h-3" /> Rejected
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
        <CheckCircle className="w-3 h-3" /> Approved
      </div>
    );
  };

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      {/* Welcome */}
      <GlowCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-purple)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] relative z-10">
          {getGreeting()}, Professor {user?.name?.split(' ')[0]} 👨‍🏫
        </h1>
        <div className="flex gap-3 mt-4 relative z-10">
          <AnimatedButton variant="gradient" icon={PlusCircle} onClick={() => navigate('/instructor/courses/new')}>Create New Course</AnimatedButton>
        </div>
      </GlowCard>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={myCourses.length} icon="BookOpen" trend={5} />
        <StatCard title="Total Students" value={myCourses.reduce((s, c) => s + (c.enrolledCount || 0), 0)} icon="Users" trend={12} />
        <StatCard title="Total Modules" value={totalModules} icon="Layers" />
        <StatCard title="Total Lessons" value={totalLessons} icon="Play" />
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">My Courses</h2>
          <AnimatedButton variant="ghost" className="text-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Hide Form' : 'Quick Create'}
          </AnimatedButton>
        </div>

        {/* Quick create form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlowCard className="p-6 mb-6" hover={false}>
              <form onSubmit={handleCreate} className="space-y-4">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course title" className="input-glass" />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description" className="input-glass h-24 resize-none" />
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })} className="text-sm text-[var(--text-muted)]" />
                <AnimatedButton type="submit" variant="gradient" loading={creating}>Create Course</AnimatedButton>
              </form>
            </GlowCard>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>
        ) : myCourses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" subtitle="Create your first course to get started" actionLabel="Create Course" onAction={() => navigate('/instructor/courses/new')} />
        ) : (
          <div className="space-y-3">
            {myCourses.map((course, i) => {
              const thumbUrl = getMediaUrl(course.thumbnail);

              return (
                <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlowCard className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    {thumbUrl ? <img src={thumbUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6 text-[var(--accent-blue)]/40" /></div>}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-heading font-semibold text-[var(--text-primary)] truncate">{course.title}</h3>
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)] mt-1 justify-center sm:justify-start">
                        <span>{getTotalModules(course)} modules</span>
                        <span>{getTotalLessons(course)} lessons</span>
                        <span>{course.enrolledCount || 0} students</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 items-center sm:items-start">
                        {getStatusBadge(course)}
                        {course.status === 'rejected' && course.rejectionReason && (
                          <span className="text-xs text-red-400 mt-1 sm:mt-0 sm:ml-2 line-clamp-1 max-w-xs">{course.rejectionReason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/instructor/courses/${course._id}/students`)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Enrolled Students">
                        <Users className="w-4 h-4" />
                      </motion.button>
                      {course.status !== 'pending' && course.status !== 'rejected' && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/student/certificate/${course._id}`)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Issue Certificates">
                          <Award className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/instructor/courses/${course._id}/edit`)} className="p-2.5 rounded-xl bg-[var(--accent-glow)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(course._id)} disabled={deleting === course._id} className="p-2.5 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;
