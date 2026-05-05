import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCourses, adminDeleteCourse } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import { BookOpen, Search, Pencil, Trash2, ShieldCheck, Clock } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const AdminCourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, isLoading } = useSelector(s => s.courses || {});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Cache check: only fetch if empty
    if (!courses || courses.length === 0) {
      dispatch(fetchCourses());
    }
  }, [dispatch, courses?.length]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated modules and lessons will be lost.')) return;
    const res = await dispatch(adminDeleteCourse(id));
    if (adminDeleteCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Course deleted successfully', type: 'success' }));
    } else {
      dispatch(addToast({ message: 'Failed to delete course', type: 'error' }));
    }
  }, [dispatch]);

  const filteredCourses = useMemo(() => 
    (Array.isArray(courses) ? courses : []).filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [courses, searchTerm]);

  if (isLoading && (!courses || courses.length === 0)) {
    return <ListSkeleton />;
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">All Courses</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage all platform content, including approved and legacy courses.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="input-glass w-full pr-4 py-2.5 focus:ring-2 focus:ring-[var(--accent-blue)]/20"
            style={{ '--input-pl': '44px' }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <GlowCard className="p-12 text-center text-[var(--text-muted)]">
            No courses found matching your search.
          </GlowCard>
        ) : (
          filteredCourses.map(course => (
            <GlowCard key={course._id} className="p-4" hover={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border)]">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:8080${course.thumbnail}`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {course.instructor?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.modules?.length || 0} Modules
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {course.status || 'approved'}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/instructor/courses/${course._id}/edit`); }}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-blue)]/10 transition-all"
                      title="Edit Course"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <AnimatedButton 
                      variant="ghost" 
                      icon={Trash2} 
                      onClick={() => handleDelete(course._id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    />
                  </div>
                </div>
              </div>
            </GlowCard>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AdminCourseList;
