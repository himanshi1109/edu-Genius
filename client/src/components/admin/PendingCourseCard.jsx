import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import GlowCard from '../ui/GlowCard';
import AnimatedButton from '../ui/AnimatedButton';

const PendingCourseCard = ({ course, onApprove, onReject }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <GlowCard className="p-6 relative overflow-hidden group border border-[var(--border)] hover:border-[var(--accent-blue)]/30 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-blue)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full md:w-48 h-32 object-cover rounded-xl" />
          ) : (
            <div className="w-full md:w-48 h-32 rounded-xl bg-gradient-to-br from-[var(--surface-light)] to-[var(--surface)] flex items-center justify-center border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-sm">No Thumbnail</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] truncate">{course.title}</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span className="text-xs font-medium text-[var(--accent-blue)]">Pending</span>
              </div>
            </div>
            
            <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5 bg-[var(--surface-light)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                <span>Instructor:</span>
                <span className="text-[var(--text-primary)]">{course.instructor?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--surface-light)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                <span>Modules:</span>
                <span className="text-[var(--text-primary)]">{course.modules?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col justify-center gap-3">
            <AnimatedButton onClick={() => onApprove(course._id)} variant="gradient" className="flex-1 md:flex-none bg-gradient-to-r from-[#285A48] to-[#468A73] hover:shadow-[#285A48]/20 border-none text-white">
              <Check className="w-4 h-4 mr-2" /> Approve
            </AnimatedButton>
            <AnimatedButton onClick={() => onReject(course._id)} variant="outline" className="flex-1 md:flex-none text-red-400 border-red-500/20 hover:bg-red-500/10">
              <X className="w-4 h-4 mr-2" /> Reject
            </AnimatedButton>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
};

export default PendingCourseCard;
