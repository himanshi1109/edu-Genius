import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

const AnimatedButton = ({
  children,
  variant = 'gradient',
  loading = false,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 font-semibold text-[15px] rounded-xl px-7 py-3 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    gradient:
      'bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg hover:shadow-[0_8px_30px_rgba(40,90,72,0.4)]',
    outline:
      'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--accent-glow)] hover:border-[var(--accent-blue)]',
    ghost:
      'bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent-glow)]',
    danger:
      'bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10',
  };

  return (
    <motion.button
      type={type}
      className={cn(baseClasses, variants[variant], className)}
      whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
