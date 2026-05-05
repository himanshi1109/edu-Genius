import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { fetchCourseById } from '@/store/slices/courseSlice';
import { addToast } from '@/store/slices/uiSlice';
import courseService from '@/services/courseService';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlowCard from '@/components/ui/GlowCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const ModuleBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((s) => s.courses);
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchCourseById(courseId)); }, [dispatch, courseId]);
  useEffect(() => { if (currentCourse?.modules) { setModules(currentCourse.modules); setOrder(currentCourse.modules.length + 1); } }, [currentCourse]);

  const addModule = async () => {
    if (!title) return;
    setSaving(true);
    try {
      const res = await courseService.createModule(courseId, { title, order });
      setModules([...modules, res.data || res]);
      setTitle('');
      setOrder(modules.length + 2);
      dispatch(addToast({ message: 'Module added!', type: 'success' }));
    } catch { dispatch(addToast({ message: 'Failed to add', type: 'error' })); }
    setSaving(false);
  };

  const delModule = async (mId) => {
    try {
      await courseService.deleteModule(mId);
      setModules(modules.filter((m) => m._id !== mId));
      dispatch(addToast({ message: 'Module deleted', type: 'success' }));
    } catch { dispatch(addToast({ message: 'Failed to delete', type: 'error' })); }
  };

  if (isLoading) return <SkeletonLoader height="400px" />;

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <AnimatedButton variant="ghost" onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="w-5 h-5" /></AnimatedButton>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Manage Modules</h1>
      </div>

      <GlowCard className="p-6" hover={false}>
        <div className="flex gap-3 mb-6 w-full">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-glass flex-1 min-w-0" placeholder="Module title" />
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="input-glass w-20 flex-none" title="Order" />
          <AnimatedButton variant="gradient" icon={Plus} onClick={addModule} loading={saving} className="flex-none">Add</AnimatedButton>
        </div>

        <div className="space-y-2">
          {modules.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{m.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{m.lessons?.length || 0} lessons • Order: {m.order}</p>
              </div>
              <button onClick={() => delModule(m._id)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </div>
      </GlowCard>
    </motion.div>
  );
};

export default ModuleBuilder;
