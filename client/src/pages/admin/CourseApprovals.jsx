import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPendingCourses, approveCourse, rejectCourse } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import EmptyState from '@/components/shared/EmptyState';
import PendingCourseCard from '@/components/admin/PendingCourseCard';
import RejectionModal from '@/components/admin/RejectionModal';
import { ClipboardList, Filter } from 'lucide-react';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CourseApprovals = () => {
  const dispatch = useDispatch();
  const { pendingCourses, isLoading } = useSelector(s => s.courses || {});
  const [rejectModal, setRejectModal] = useState({ isOpen: false, courseId: null, courseName: '' });

  useEffect(() => {
    dispatch(fetchPendingCourses());
  }, [dispatch]);

  const handleApprove = async (id) => {
    const res = await dispatch(approveCourse(id));
    if (approveCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Course approved successfully', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Failed to approve', type: 'error' }));
    }
  };

  const openRejectModal = (id, name) => setRejectModal({ isOpen: true, courseId: id, courseName: name });
  const closeRejectModal = () => setRejectModal({ isOpen: false, courseId: null, courseName: '' });

  const handleReject = async (reason) => {
    const res = await dispatch(rejectCourse({ id: rejectModal.courseId, reason }));
    closeRejectModal();
    if (rejectCourse.fulfilled.match(res)) {
      dispatch(addToast({ message: 'Course rejected', type: 'success' }));
    } else {
      dispatch(addToast({ message: res.payload || 'Failed to reject', type: 'error' }));
    }
  };

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Course Approvals</h1>
          <p className="text-[var(--text-muted)] mt-1">Review and manage instructor course submissions.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-light)] rounded-xl border border-[var(--border)]">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{pendingCourses?.length || 0} Pending</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingCourses?.length === 0 ? (
        <EmptyState 
          icon={ClipboardList} 
          title="All Caught Up!" 
          subtitle="There are no pending courses waiting for your review."
        />
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {pendingCourses?.map(course => (
              <PendingCourseCard
                key={course._id}
                course={course}
                onApprove={handleApprove}
                onReject={() => openRejectModal(course._id, course.title)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <RejectionModal
        isOpen={rejectModal.isOpen}
        onClose={closeRejectModal}
        onSubmit={handleReject}
        courseName={rejectModal.courseName}
      />
    </motion.div>
  );
};

export default CourseApprovals;
