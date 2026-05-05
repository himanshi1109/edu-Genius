import api from './api';

const quizService = {
  getQuizByLesson: async (lessonId) => {
    const response = await api.get(`/quizzes/lesson/${lessonId}`);
    return response.data;
  },

  createQuiz: async (lessonId, quizData) => {
    const response = await api.post(`/quizzes/${lessonId}`, quizData);
    return response.data;
  },

  getQuizByCourse: async (courseId) => {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data;
  },

  submitQuiz: async (quizId, answers) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },
};

export default quizService;
