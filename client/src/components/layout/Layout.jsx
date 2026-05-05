import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileDrawer from './MobileDrawer';
import Toast from '@/components/ui/Toast';
import ParticleBackground from '@/components/ui/ParticleBackground';

const Layout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground count={20} />

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Mobile hamburger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2.5 rounded-xl glass-card hover:bg-[var(--accent-glow)] transition-colors"
      >
        <Menu className="w-5 h-5 text-[var(--text-primary)]" />
      </button>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main content */}
      <motion.main
        className="min-h-screen transition-all duration-300 ease-in-out"
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? sidebarOpen ? 240 : 64
            : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </motion.main>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default Layout;
