import api from './api';

const aiService = {
  chat: async (data) => {
    const response = await api.post('/ai/chat', data);
    return response.data;
  },

  generateQuiz: async (lessonId) => {
    const response = await api.post(`/ai/quiz/${lessonId}`);
    return response.data;
  },

  generateCourseQuiz: async (courseId) => {
    const response = await api.post(`/ai/quiz-course/${courseId}`);
    return response.data;
  },

  generateFlashcards: async (lessonId) => {
    const response = await api.post(`/ai/flashcards/${lessonId}`);
    return response.data;
  },
};

export default aiService;
