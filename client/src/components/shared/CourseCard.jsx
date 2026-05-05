import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Play } from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { getTotalLessons, getTotalModules, calculateCompletion } from '@/utils/helpers';

const CourseCard = ({
  course,
  showProgress = false,
  progress,
  className = '',
}) => {
  const navigate = useNavigate();

  const totalLessons = getTotalLessons(course);
  const totalModules = getTotalModules(course);
  const completedCount = progress?.completedLessons?.length || 0;
  const completionPercent = calculateCompletion(completedCount, totalLessons);

  const thumbnailUrl = course.thumbnail
    ? course.thumbnail.startsWith('http')
      ? course.thumbnail
      : `http://localhost:8080${course.thumbnail}`
    : null;

  return (
    <motion.div
      className={`glass-card overflow-hidden group cursor-pointer ${className}`}
      whileHover={{
        y: -4,
        boxShadow:
          '0 0 20px rgba(40,90,72,0.15), 0 8px 32px rgba(0,0,0,0.3)',
        borderColor: 'rgba(176, 228, 204, 0.3)',
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#285A48]/20 to-[#468A73]/20 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-[var(--accent-blue)]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] text-[var(--text-primary)]">
          Course
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-semibold text-[var(--text-primary)] text-lg mb-1 line-clamp-1">
          {course.title}
        </h3>

        {course.instructor && (
          <p className="text-sm text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {course.instructor.name || 'Instructor'}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {totalModules} modules
          </span>
          <span className="flex items-center gap-1">
            <Play className="w-3.5 h-3.5" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.enrolledCount || 0} students
          </span>
        </div>

        {showProgress && progress ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#285A48] to-[#468A73] transition-all duration-700"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <ProgressRing
              percentage={completionPercent}
              size={48}
              strokeWidth={4}
              textSize="11px"
              className="ml-4"
            />
          </div>
        ) : (
          <AnimatedButton
            variant="outline"
            className="w-full text-sm py-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course._id}`);
            }}
          >
            View Course
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
};

export default CourseCard;
