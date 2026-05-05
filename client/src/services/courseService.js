import api from './api';

const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (formData) => {
    const response = await api.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCourse: async (id, formData) => {
    const response = await api.put(`/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  createModule: async (courseId, moduleData) => {
    const response = await api.post(`/modules/${courseId}`, moduleData);
    return response.data;
  },

  updateModule: async (id, moduleData) => {
    const response = await api.put(`/modules/${id}`, moduleData);
    return response.data;
  },

  deleteModule: async (id) => {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
  },

  createLesson: async (moduleId, formData) => {
    const response = await api.post(`/lessons/${moduleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateLesson: async (id, formData) => {
    const response = await api.put(`/lessons/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteLesson: async (id) => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  // --- Admin Endpoints ---
  getPendingCourses: async () => {
    const response = await api.get('/admin/courses/pending');
    return response.data;
  },
  approveCourse: async (id) => {
    const response = await api.put(`/admin/courses/${id}/approve`);
    return response.data;
  },
  rejectCourse: async (id, reason) => {
    const response = await api.put(`/admin/courses/${id}/reject`, { reason });
    return response.data;
  },
  adminDeleteCourse: async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },
};

export default courseService;
