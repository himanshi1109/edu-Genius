import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Download, Share2, GraduationCap, Award, Info } from 'lucide-react';
import api from '@/services/api';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ProgressRing from '@/components/ui/ProgressRing';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { formatDate } from '@/utils/helpers';
import confetti from 'canvas-confetti';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const CertificatePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/certificates/my');
        const certs = res.data?.data || [];
        const found = certs.find(c => (c.courseId?._id || c.courseId) === id);
        
        if (!found) {
          setLocked(true);
        } else if (found.status === 'pending') {
          setPendingApproval(true);
          setCert(found);
        } else if (found.status === 'rejected') {
          setLocked(true); // Or handle rejected specifically
          setCert(found);
        } else {
          setCert(found);
          triggerConfetti();
        }
      } catch (err) {
        setLocked(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#285A48', '#468A73', '#B0E4CC', '#FACC15'];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleDownload = () => window.print();
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    dispatch(addToast({ message: 'Certificate URL copied!', type: 'success' }));
  };

  if (loading) return <div className="max-w-3xl mx-auto py-12"><SkeletonLoader height="500px" /></div>;

  if (pendingApproval) {
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
          <Award className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Pending Instructor Approval</h2>
        <p className="text-[var(--text-muted)]">You have completed the course! Please wait for the instructor to review and manually issue your certificate.</p>
      </motion.div>
    );
  }

  if (locked) {
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-lg mx-auto py-20 text-center space-y-6">
        <ProgressRing percentage={0} size={120} strokeWidth={8} textSize="20px" className="mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Course Not Completed</h2>
        <p className="text-[var(--text-muted)]">You need to complete all lessons before you can generate a certificate.</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center mb-4">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">🎉 Congratulations!</h1>
        <p className="text-[var(--text-muted)] mt-2">You have earned a certificate of completion.</p>
      </div>

      {/* Certificate card */}
      <div className="bg-white rounded-2xl p-1 shadow-2xl mx-auto max-w-2xl" id="certificate">
        <div className="border-4 border-double border-gray-300 rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[var(--accent-blue)] opacity-30" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[var(--accent-purple)] opacity-30" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[var(--accent-purple)] opacity-30" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[var(--accent-blue)] opacity-30" />

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#285A48] to-[#468A73] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#285A48] to-[#468A73] bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk' }}>
              EduGenius
            </span>
          </div>

          <h2 className="text-gray-500 text-sm uppercase tracking-[0.3em] mb-6">Certificate of Completion</h2>

          <p className="text-gray-500 text-sm mb-2">This is to certify that</p>
          <p className="text-3xl sm:text-4xl text-gray-800 mb-4" style={{ fontFamily: '"Dancing Script", cursive' }}>
            {cert?.certificateData?.studentName || cert?.userId?.name || 'Student'}
          </p>

          <p className="text-gray-500 text-sm mb-2">has successfully completed</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            {cert?.certificateData?.courseTitle || cert?.courseId?.title || 'Course'}
          </p>

          {cert?.certificateData?.aiSummary && (
            <div className="max-w-md mx-auto mb-6 px-4">
              <p className="text-gray-500 text-sm italic leading-relaxed">
                &ldquo;{cert.certificateData.aiSummary}&rdquo;
              </p>
            </div>
          )}

          <p className="text-gray-400 text-sm mb-1">
            Issued on: {formatDate(cert?.issuedAt || cert?.updatedAt)}
          </p>
          <p className="text-gray-400 text-xs font-mono">
            Certificate ID: {cert?._id}
          </p>

          {/* Seal */}
          <div className="mt-8 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#B0E4CC] flex items-center justify-center">
              <Award className="w-8 h-8 text-[#468A73]" />
            </div>
          </div>
          <div className="mt-4 w-40 mx-auto border-t border-gray-300 pt-2">
            <p className="text-xs text-gray-400">Instructor Signature</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <AnimatedButton variant="gradient" icon={Download} onClick={handleDownload}>Download Certificate</AnimatedButton>
        <AnimatedButton variant="outline" icon={Share2} onClick={handleShare}>Share</AnimatedButton>
      </div>
    </motion.div>
  );
};

export default CertificatePage;
