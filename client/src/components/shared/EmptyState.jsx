import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'Nothing here yet',
  subtitle = 'No items to display',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[var(--accent-blue)]" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-muted)] text-sm max-w-md mb-6">
        {subtitle}
      </p>
      {actionLabel && onAction && (
        <AnimatedButton variant="gradient" onClick={onAction}>
          {actionLabel}
        </AnimatedButton>
      )}
    </motion.div>
  );
};

export default EmptyState;
