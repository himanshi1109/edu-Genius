import { cn } from '@/utils/helpers';

const GradientText = ({
  children,
  from = 'var(--accent-blue)',
  to = 'var(--accent-purple)',
  animate = false,
  className = '',
  as: Component = 'span',
}) => {
  return (
    <Component
      className={cn(
        animate ? 'gradient-text-animated' : 'gradient-text',
        className
      )}
      style={
        !animate
          ? {
              background: `linear-gradient(135deg, ${from}, ${to})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }
          : undefined
      }
    >
      {children}
    </Component>
  );
};

export default GradientText;
