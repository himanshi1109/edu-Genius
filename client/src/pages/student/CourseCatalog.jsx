import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, X, SlidersHorizontal, PlusCircle } from 'lucide-react';
import { fetchCourses } from '@/store/slices/courseSlice';
import CourseCard from '@/components/shared/CourseCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import useDebounce from '@/hooks/useDebounce';
import { CATEGORIES, SORT_OPTIONS } from '@/utils/constants';

import useAuth from '@/hooks/useAuth';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CourseCatalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isInstructor, isAdmin } = useAuth();
  const { courses, isLoading } = useSelector((s) => s.courses);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

  const filtered = useMemo(() => {
    let result = Array.isArray(courses) ? [...courses] : [];
    
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (category !== 'All') {
      const cat = category.toLowerCase();
      result = result.filter((c) => c.title?.toLowerCase().includes(cat) || c.description?.toLowerCase().includes(cat));
    }
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'az') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [courses, debouncedSearch, category, sortBy]);

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Course Catalog</h1>
          <p className="text-[var(--text-muted)] mt-1">Discover courses and start learning today</p>
        </div>
        {(isInstructor || isAdmin) && (
          <AnimatedButton variant="gradient" onClick={() => navigate('/instructor/courses/new')} icon={PlusCircle}>
            Create Course
          </AnimatedButton>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-2xl group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Search className="w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
        </div>
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search courses..." 
          className="input-glass w-full pr-10 py-3.5 focus:ring-2 focus:ring-[var(--accent-blue)]/20"
          style={{ '--input-pl': '48px' }}
        />
        <AnimatePresence>
          {search && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              onClick={() => setSearch('')} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LayoutGroup>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${category === cat ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {category === cat && (
                  <motion.div layoutId="activeCat" className="absolute inset-0 bg-[var(--accent-glow)] border border-[var(--accent-blue)]/30 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{cat}</span>
              </motion.button>
            ))}
          </div>
        </LayoutGroup>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-glass py-2 px-3 text-sm w-auto bg-[var(--bg-secondary)]">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No courses found" subtitle={search ? `No results for "${search}".` : 'No courses in this category yet.'} />
      ) : (
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          {filtered.map((course) => (
            <motion.div key={course._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CourseCatalog;
