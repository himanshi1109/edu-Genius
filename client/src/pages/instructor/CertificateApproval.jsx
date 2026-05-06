import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  Search,
  Filter,
  Award,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import certificateService from '@/services/certificateService';
import { addToast } from '@/store/slices/uiSlice';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { formatDate } from '@/utils/helpers';

const pageV = { 
  initial: { opacity: 0, y: 20 }, 
  animate: { opacity: 1, y: 0 }, 
  exit: { opacity: 0, y: -20 } 
};

const CertificateApproval = () => {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getInstructorPending();
      setRequests(res.data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch requests';
      dispatch(addToast({ message: errorMsg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleStatusUpdate = async (id, status) => {

    try {
      await certificateService.updateCertificateStatus(id, status, status === 'rejected' ? rejectionReason : '');
      dispatch(addToast({ message: `Certificate ${status} successfully`, type: 'success' }));
      setRejectingId(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      dispatch(addToast({ message: 'Operation failed', type: 'error' }));
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Certificate Approvals</h1>
        <p className="text-[var(--text-muted)] mt-2">Review and approve certificate requests from your students.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by student or course..." 
            className="input-glass"
            style={{ '--input-pl': '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filterStatus === status 
                ? 'bg-[var(--accent-blue)] text-white' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <SkeletonLoader count={3} height="120px" />
        ) : filteredRequests.length === 0 ? (
          <GlowCard className="p-12 text-center">
            <Award className="w-16 h-16 text-[var(--bg-secondary)] mx-auto mb-4" />
            <h3 className="text-[var(--text-primary)] font-semibold">No requests found</h3>
            <p className="text-[var(--text-muted)] text-sm">All caught up! No certificates are awaiting your review.</p>
          </GlowCard>
        ) : (
          filteredRequests.map((req) => (
            <GlowCard key={req._id} className="p-6 overflow-hidden relative" hover={false}>
              {req.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{req.userId?.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <BookOpen className="w-3.5 h-3.5" />
                        {req.courseId?.title}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5" />
                        Requested {formatDate(req.createdAt)}
                      </span>
                    </div>
                    {req.certificateData?.aiSummary && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] italic text-xs text-[var(--text-muted)]">
                        &ldquo;{req.certificateData.aiSummary}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <AnimatedButton 
                      variant="outline" 
                      size="sm" 
                      icon={Eye}
                      onClick={() => navigate(`/student/certificate/${req.courseId?._id || req.courseId}`)}
                    >
                      Preview
                    </AnimatedButton>

                    <Badge 
                      variant={
                        req.status === 'approved' ? 'success' : 
                        req.status === 'rejected' ? 'danger' : 'warning'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>


                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <AnimatedButton 
                        variant="success" 
                        size="sm" 
                        icon={CheckCircle}
                        onClick={() => handleStatusUpdate(req._id, 'approved')}
                      >
                        Approve
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="danger" 
                        size="sm" 
                        icon={XCircle}
                        onClick={() => setRejectingId(req._id)}
                      >
                        Reject
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Modal/Form */}
              <AnimatePresence>
                {rejectingId === req._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-[var(--border)]"
                  >
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Rejection Reason</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-3 w-4 h-4 text-[var(--text-muted)]" />
                      <textarea 
                        className="input-glass pl-12 min-h-[100px] py-3"
                        placeholder="Explain why the certificate is being rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button 
                        onClick={() => {setRejectingId(null); setRejectionReason('');}}
                        className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                      <AnimatedButton 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                        disabled={!rejectionReason.trim()}
                      >
                        Confirm Rejection
                      </AnimatedButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlowCard>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default CertificateApproval;
