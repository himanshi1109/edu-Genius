import api from './api';

const progressService = {
  enrollCourse: async (courseId) => {
    const response = await api.post(`/progress/enroll/${courseId}`);
    return response.data;
  },

  getProgress: async (courseId) => {
    const response = await api.get(`/progress/${courseId}`);
    return response.data;
  },

  updateProgress: async (courseId, data) => {
    const response = await api.put(`/progress/${courseId}`, data);
    return response.data;
  },
  
  getMyProgress: async () => {
    const response = await api.get('/progress/my');
    return response.data;
  },
};


export default progressService;
