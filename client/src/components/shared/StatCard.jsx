import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className = '',
  onClick,
}) => {

  const [displayValue, setDisplayValue] = useState(0);
  const targetValue =
    typeof value === 'number' ? value : parseInt(value) || 0;
  useEffect(() => {
    let current = displayValue;
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    const diff = targetValue - current;
    if (diff === 0) return;
    
    const increment = diff / steps;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  const IconComponent = typeof icon === 'string' ? Icons[icon] : icon;

  return (
    <motion.div
      className={`glass-card p-5 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400 } }}
    >

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-white" />
          )}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trendLabel || `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)] font-heading">
        {typeof value === 'string' && value.includes('%')
          ? `${displayValue}%`
          : displayValue.toLocaleString()}
      </p>
      <p className="text-sm text-[var(--text-muted)] mt-1">{title}</p>
    </motion.div>
  );
};

export default StatCard;
