import { cn } from '@/utils/helpers';

const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default:
      'bg-[var(--accent-glow)] text-[var(--accent-cyan)] border border-[var(--accent-blue)]/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    purple:
      'bg-[#285A48]/10 text-[#B0E4CC] border border-[#285A48]/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    gradient:
      'bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 text-[var(--text-primary)] border border-[var(--border)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
