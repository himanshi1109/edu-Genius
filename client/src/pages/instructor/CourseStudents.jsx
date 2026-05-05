import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Clock, Search, ChevronLeft, BookOpen, User } from 'lucide-react';
import api from '@/services/api';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/utils/helpers';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CourseStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, studentsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/students`)
      ]);
      setCourse(courseRes.data?.data);
      setStudents(studentsRes.data?.data || []);
    } catch (error) {
      dispatch(addToast({ message: 'Failed to fetch student data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Enrolled Students</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {course?.title}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState 
          icon={Users} 
          title="No Students Yet" 
          subtitle="Wait for students to enroll in your course to see them here."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredStudents.map((student) => (
              <motion.div key={student._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <GlowCard className="p-5 flex items-center gap-4" hover={true}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {student.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">{student.name}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
                        <Mail className="w-3.5 h-3.5" /> {student.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5" /> Enrolled {formatDate(student.createdAt)}
                      </span>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default CourseStudents;
