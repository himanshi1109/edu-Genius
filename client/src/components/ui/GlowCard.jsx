import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

const GlowCard = ({
  children,
  className = '',
  glowColor = 'blue',
  hover = true,
  onClick,
  ...props
}) => {
  const glowMap = {
    blue: 'rgba(40, 90, 72, 0.15)',
    purple: 'rgba(70, 138, 115, 0.15)',
    cyan: 'rgba(176, 228, 204, 0.15)',
    green: 'rgba(40, 90, 72, 0.15)',
  };

  return (
    <motion.div
      className={cn('glass-card p-6', className)}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: `0 0 20px ${glowMap[glowColor] || glowMap.blue}, 0 8px 32px rgba(0,0,0,0.3)`,
              borderColor: 'rgba(176, 228, 204, 0.3)',
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }
          : {}
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlowCard;
