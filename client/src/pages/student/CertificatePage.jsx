import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Download, Share2, GraduationCap, Award, Info } from 'lucide-react';
import api from '@/services/api';
import { addToast } from '@/store/slices/uiSlice';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
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
        // Try getting specific cert first (for instructors/direct links)
        try {
          const res = await api.get(`/certificates/${id}`);
          if (res.data?.success) {
            setCert(res.data.data);
            if (res.data.data.status === 'approved') triggerConfetti();
            return;
          }
        } catch (e) { /* fallback to list */ }

        const res = await api.get('/certificates/my');
        const certs = res.data?.data || [];
        const found = certs.find(c => (c.courseId?._id || c.courseId) === id || c._id === id);
        
        if (!found) {
          setLocked(true);
        } else if (found.status === 'pending') {
          setPendingApproval(true);
          setCert(found);
        } else {
          setCert(found);
          if (found.status === 'approved') triggerConfetti();
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
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = ['#285A48', '#FFD700', '#B0E4CC', '#FFFFFF'];
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    dispatch(addToast({ message: 'Certificate link copied to clipboard!', type: 'success' }));
  };

  if (loading) return <div className="max-w-3xl mx-auto py-12"><SkeletonLoader height="500px" /></div>;

  if (pendingApproval) {
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Award className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Approval Pending</h2>
        <p className="text-[var(--text-muted)]">Your course completion has been recorded. Please wait for your instructor to verify and issue your official certificate.</p>
        <AnimatedButton variant="outline" onClick={() => window.history.back()}>Go Back</AnimatedButton>
      </motion.div>
    );
  }

  if (locked) {
    return (
      <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <GraduationCap className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="text-[var(--text-muted)]">This certificate is only available after course completion or to authorized personnel.</p>
        <AnimatedButton variant="outline" onClick={() => window.history.back()}>Go Back</AnimatedButton>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35 }} className="max-w-6xl mx-auto py-8 space-y-8 print:p-0 print:m-0">
      <div className="text-center mb-4 no-print">
        <Badge variant="glow" className="mb-4">Official Document</Badge>
        <h1 className="font-heading text-4xl font-bold text-[var(--text-primary)]">Achievement Certificate</h1>
        <p className="text-[var(--text-muted)] mt-2">Personalized certificate matching the classic excellence template</p>
      </div>

      {/* Main Certificate Content - Exactly matching the user's reference image */}
      <div className="relative group no-print mx-auto max-w-5xl">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/20 via-[#F9F295]/30 to-[#D4AF37]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative bg-white rounded shadow-[0_20px_50px_rgba(0,0,0,0.15)] print:shadow-none print:rounded-none overflow-hidden" id="certificate-content">
          {/* Main Landscape Frame Container */}
          <div className="p-2 sm:p-4">
            <div className="relative bg-[#FDFDFD] aspect-[1.414/1] flex flex-col items-center justify-between p-10 md:p-14 border-[1px] border-[#D4AF37]">
              
              {/* Outer Gold Frame (Double Line Effect) */}
              <div className="absolute inset-1.5 border-[3px] border-[#D4AF37] pointer-events-none" />
              <div className="absolute inset-3.5 border-[1px] border-[#D4AF37]/50 pointer-events-none" />
              
              {/* Background Wavy Patterns (Subtle Gold Waves) */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,400 Q250,300 500,400 T1000,400" fill="none" stroke="#D4AF37" strokeWidth="30" />
                  <path d="M0,500 Q250,400 500,500 T1000,500" fill="none" stroke="#D4AF37" strokeWidth="50" />
                </svg>
              </div>

              {/* Inner Decorative Box with Ornate Corners */}
              <div className="absolute inset-8 border-[1px] border-gray-200 pointer-events-none">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-gray-300" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-gray-300" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-gray-300" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-gray-300" />
              </div>

              {/* Top Section */}
              <div className="z-10 flex flex-col items-center mt-2">
                <div className="text-[9px] text-gray-400 tracking-[0.4em] font-medium uppercase mb-3">
                  Official Academic Credential
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-700 tracking-[0.15em] font-bold">
                  CERTIFICATE
                </h1>
                <h2 className="text-lg md:text-xl lg:text-2xl font-serif text-gray-400 italic mt-1">
                  Of Appreciation
                </h2>
              </div>

              {/* Recipient Content */}
              <div className="z-10 flex flex-col items-center text-center space-y-3">
                <p className="text-gray-400 font-sans text-xs tracking-widest uppercase">
                  This Certificate is Presented To
                </p>
                
                <div className="py-1">
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-['Dancing_Script'] text-[#D4AF37] italic border-b-[1px] border-[#D4AF37]/30 px-10 pb-1">
                    {cert?.certificateData?.studentName || cert?.userId?.name}
                  </h3>
                </div>

                <div className="max-w-2xl px-6">
                  <h4 className="text-lg md:text-xl font-serif text-gray-700 mb-1">
                    For Completion of {cert?.certificateData?.courseTitle || cert?.courseId?.title}
                  </h4>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed italic text-center px-6">
                    &ldquo;{cert.certificateData?.aiSummary || 'For outstanding achievement and commitment to excellence in their educational journey.'}&rdquo;
                  </p>
                </div>
              </div>


              {/* Bottom Section: Signatures & Seal */}
              <div className="z-10 w-full grid grid-cols-3 items-end px-10 pb-4">
                <div className="flex flex-col items-center">
                  <div className="font-['Dancing_Script'] text-gray-700 text-2xl mb-1">
                    {cert?.courseId?.instructor?.name || 'Principal'}
                  </div>
                  <div className="w-full h-[1px] bg-gray-400" />
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">
                    Signature
                  </div>
                </div>

                <div className="flex flex-col items-center relative pb-2">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 flex gap-4 opacity-80">
                    <div className="w-4 h-16 bg-[#D4AF37] transform -rotate-12 origin-top rounded-b-sm shadow-md" />
                    <div className="w-4 h-16 bg-[#D4AF37] transform rotate-12 origin-top rounded-b-sm shadow-md" />
                  </div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#D4AF37] via-[#F9F295] to-[#D4AF37] rounded-full border-2 border-[#B8860B] shadow-lg flex items-center justify-center">
                    <Award className="w-10 h-10 text-[#8B4513] opacity-60" />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="font-serif text-gray-700 text-lg mb-1">
                    {formatDate(cert?.issuedAt || cert?.updatedAt)}
                  </div>
                  <div className="w-full h-[1px] bg-gray-400" />
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">
                    Date of Issue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}

      <div className="flex flex-wrap justify-center gap-4 no-print pb-12">
        <AnimatedButton 
          variant="gradient" 
          icon={Download} 
          onClick={handleDownload}
          className="px-10 py-4 shadow-xl"
        >
          Download Official PDF
        </AnimatedButton>
        <AnimatedButton 
          variant="outline" 
          icon={Share2} 
          onClick={handleShare}
          className="px-8"
        >
          Copy Link
        </AnimatedButton>
      </div>

      {/* Global CSS for printing */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          
          /* The "Ghost" Fix: Hide everything by default using visibility */
          * { visibility: hidden !important; }
          
          /* Force only the certificate and its children to be visible */
          #certificate-content, #certificate-content * { 
            visibility: visible !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Position the certificate to fill the print page perfectly */
          #certificate-content { 
            visibility: visible !important;
            position: fixed !important; 
            left: 50% !important; 
            top: 50% !important; 
            transform: translate(-50%, -50%) !important;
            width: 95vw !important;
            max-height: 90vh !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 999999 !important;
            page-break-after: avoid !important;
          }

          /* Reset all layout spacing that could cause page breaks */
          body, html, #root, main, .p-6, .lg\\:p-8, div[class*="ParticleBackground"] { 
            visibility: hidden !important;
            margin: 0 !important; 
            padding: 0 !important; 
            overflow: hidden !important;
            height: 100vh !important;
          }
          
          /* High-fidelity scaling for the landscape frame */
          #certificate-content .aspect-\\[1\\.414\\/1\\] { 
            width: 90vw !important; 
            height: 63.6vw !important; /* maintained aspect ratio */
            max-height: 85vh !important;
            border: none !important;
            margin: 0 !important;
          }
          
          /* Ensure text doesn't overflow or get cut */
          h1, h2, h3, h4, p { page-break-inside: avoid !important; }
        }






      `}</style>
    </motion.div>

  );
};

export default CertificatePage;

