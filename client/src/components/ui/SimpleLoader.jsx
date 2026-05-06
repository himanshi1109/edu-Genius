import React from 'react';
import { motion } from 'framer-motion';

const SimpleLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <div className="relative">
        {/* Simple rotating ring */}
        <motion.div 
          className="w-16 h-16 rounded-full border-2 border-[var(--accent-blue)]/20 border-t-[var(--accent-blue)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Pulsing core */}
        <motion.div 
          className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[var(--accent-blue)]/40 blur-sm"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-sm font-medium text-[var(--text-muted)] tracking-widest uppercase"
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default SimpleLoader;
