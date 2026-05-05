import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from '@/components/three/HeroScene';
import './LoadingScreen.css';

const LoadingScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsExiting(true), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onComplete]);

  return (
    <div className={`loader-wrapper ${isExiting ? 'exit' : ''}`}>
      <div className="ambient-bg" />
      
      {/* Centered 3D Globe Scene */}
      <div className="loader-globe-container">
        <HeroScene />
      </div>

      <div className="loader-content">
        <motion.h1 
          className="loader-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          EduGenius
        </motion.h1>
        
        <div className="loading-bar-container">
          <motion.div 
            className="loading-bar-progress"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="loader-status">
          {progress < 100 ? 'Initializing AI Systems...' : 'Access Granted'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
