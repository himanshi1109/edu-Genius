import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ParticleBackground from '@/components/ui/ParticleBackground';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center relative overflow-hidden px-4">
      <ParticleBackground count={15} />
      
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* Animated Ghost Icon */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-2xl">
            <Ghost className="w-16 h-16 text-[var(--accent-blue)]" />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-heading font-black text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
          >
            404
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-heading font-bold text-white relative z-10"
          >
            Lost in Space?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] text-lg"
          >
            The page you're looking for has drifted away. Let's get you back to the platform.
          </motion.p>
        </div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <AnimatedButton 
            variant="outline" 
            icon={ArrowLeft} 
            onClick={() => navigate(-1)}
            className="px-8"
          >
            Go Back
          </AnimatedButton>
          <AnimatedButton 
            variant="gradient" 
            icon={Home} 
            onClick={() => navigate('/')}
            className="px-8"
          >
            Take Me Home
          </AnimatedButton>
        </motion.div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default NotFound;
