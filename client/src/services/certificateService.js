import api from './api';

const certificateService = {
  requestCertificate: async (courseId) => {
    const response = await api.post(`/certificates/request/${courseId}`);
    return response.data;
  },

  getMyCertificates: async () => {
    const response = await api.get('/certificates/my');
    return response.data;
  },

  getInstructorPending: async () => {
    const response = await api.get('/certificates/instructor/pending');
    return response.data;
  },

  updateCertificateStatus: async (id, status, rejectionReason = '') => {
    const response = await api.patch(`/certificates/status/${id}`, { status, rejectionReason });
    return response.data;
  },

  // Helper to find certificate for a specific course
  getCertificateForCourse: async (courseId) => {
    const response = await api.get('/certificates/my');
    const certs = response.data?.data || [];
    return certs.find(c => (c.courseId._id || c.courseId) === courseId);
  }
};

export default certificateService;
