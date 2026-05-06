import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Eye, Download, GraduationCap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import GlowCard from '@/components/ui/GlowCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Badge from '@/components/ui/Badge';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { formatDate } from '@/utils/helpers';

const pageV = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

const StudentCertificates = () => {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/certificates/my');
        setCerts(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const filteredCerts = certs.filter(c => 
    c.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={pageV} initial="initial" animate="animate" className="max-w-6xl mx-auto py-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading text-4xl font-bold text-[var(--text-primary)]">My Certificates</h1>
          <p className="text-[var(--text-muted)] mt-2">Displaying your official achievements and credentials.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search certificates..." 
            className="input-glass w-full pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={3} height="200px" />
        </div>
      ) : filteredCerts.length === 0 ? (
        <GlowCard className="p-20 text-center space-y-6">
          <Award className="w-20 h-20 text-gray-700/20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">No Certificates Yet</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              Complete your courses to earn official certificates and showcase your expertise to the world.
            </p>
          </div>
          <AnimatedButton variant="gradient" onClick={() => navigate('/courses')}>Browse Courses</AnimatedButton>
        </GlowCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <motion.div 
              key={cert._id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <GlowCard className="p-6 h-full flex flex-col justify-between group overflow-hidden border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <GraduationCap className="w-20 h-20 text-[#D4AF37]" />
                </div>
                
                <div className="space-y-4">
                  <Badge variant={cert.status === 'approved' ? 'success' : 'warning'} className="uppercase">
                    {cert.status}
                  </Badge>
                  
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-2">
                      {cert.courseId?.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Issued on {formatDate(cert.issuedAt || cert.updatedAt)}
                    </p>
                  </div>

                  {cert.certificateData?.aiSummary && (
                    <p className="text-xs text-[var(--text-muted)] italic line-clamp-2 border-l-2 border-[#D4AF37]/20 pl-3 py-1">
                      &ldquo;{cert.certificateData.aiSummary}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-6 flex gap-3 mt-auto">
                  <AnimatedButton 
                    variant="gradient" 
                    size="sm" 
                    icon={Eye}
                    fullWidth
                    onClick={() => navigate(`/student/certificate/${cert._id}`)}
                  >
                    View Full
                  </AnimatedButton>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentCertificates;
