import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCourses, adminDeleteCourse } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import { BookOpen, Search, Pencil, Trash2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';


const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const AdminCourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, isLoading } = useSelector(s => s.courses || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    // Cache check: only fetch if empty
    if (!courses || courses.length === 0) {
      dispatch(fetchCourses());
    }
  }, [dispatch, courses?.length]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await dispatch(adminDeleteCourse(deleteId));
      if (adminDeleteCourse.fulfilled.match(res)) {
        dispatch(addToast({ message: 'Course deleted successfully', type: 'success' }));
      } else {
        dispatch(addToast({ message: 'Failed to delete course', type: 'error' }));
      }
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const confirmEdit = () => {
    if (!editId) return;
    const id = editId;
    setEditId(null);
    navigate(`/instructor/courses/${id}/edit`);
  };


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
            <GlowCard key={course._id} className="p-4 sm:p-5" hover={false}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border)] shadow-inner">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop';
                        }}
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] truncate text-lg">{course.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] mt-1.5">
                      <span className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-blue)]" /> {course.instructor?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {course.modules?.length || 0} Modules
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-none border-[var(--border)]/50">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {course.status || 'approved'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditId(course._id); }}
                      className="p-3 md:p-2 text-[var(--text-muted)] hover:text-[var(--accent-blue)] rounded-xl hover:bg-[var(--accent-blue)]/10 transition-all active:scale-95"
                      title="Edit Course"
                    >
                      <Pencil className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteId(course._id); }}
                      className="p-3 md:p-2 text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
                      title="Delete Course"
                    >
                      <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course._id}`); }}
                      className="p-3 md:p-2 text-[var(--text-muted)] hover:text-white rounded-xl hover:bg-white/5 transition-all active:scale-95"
                      title="View Course"
                    >
                      <ExternalLink className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </GlowCard>
          ))
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Course?"
        message="Are you sure you want to delete this course? This action is permanent and all associated lessons, modules, and progress will be lost."
        confirmLabel="Yes, Delete Course"
        cancelLabel="No, Keep It"
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        onConfirm={confirmEdit}
        title="Edit Course Details?"
        message="Would you like to open the course builder to modify this course's content?"
        confirmLabel="Yes, Open Editor"
        cancelLabel="Not Now"
      />
    </motion.div>
  );
};

export default AdminCourseList;

