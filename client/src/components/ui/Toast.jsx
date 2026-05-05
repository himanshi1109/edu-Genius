import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { removeToast } from '@/store/slices/uiSlice';

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: 'toast-success',
  error: 'toast-error',
  info: 'toast-info',
};

const SingleToast = ({ toast }) => {
  const dispatch = useDispatch();
  const Icon = toastIcons[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`glass-card flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-[420px] ${toastStyles[toast.type] || toastStyles.info}`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          toast.type === 'success'
            ? 'text-green-400'
            : toast.type === 'error'
              ? 'text-red-400'
              : 'text-[var(--accent-blue)]'
        }`}
      />
      <p className="text-sm text-[var(--text-primary)] flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const Toast = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
