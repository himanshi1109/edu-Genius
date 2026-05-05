export const APP_NAME = 'EduGenius';

export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export const PROGRESS_STATES = {
  NOT_STARTED: 'not_started',
  LEARNING: 'learning',
  REVISING: 'revising',
  COMPLETED: 'completed',
};

export const QUIZ_PASS_THRESHOLD = 60;

export const CATEGORIES = [
  'All',
  'Development',
  'Design',
  'AI',
  'Business',
  'Marketing',
];

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'A-Z', value: 'az' },
];

export const ACHIEVEMENTS = [
  {
    id: 'first_enrollment',
    name: 'First Enrollment',
    icon: 'BookOpen',
    description: 'Enrolled in your first course',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    icon: 'Brain',
    description: 'Score 100% on any quiz',
  },
  {
    id: 'fast_learner',
    name: 'Fast Learner',
    icon: 'Zap',
    description: 'Complete 5 lessons in one day',
  },
  {
    id: 'course_complete',
    name: 'Course Complete',
    icon: 'Award',
    description: 'Complete an entire course',
  },
  {
    id: 'streak_7',
    name: 'Streak 7',
    icon: 'Flame',
    description: '7-day learning streak',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Student',
    rating: 5,
    quote:
      'EduGenius transformed how I study. The AI quizzes catch exactly what I need to review.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Software Developer',
    rating: 5,
    quote:
      'The flashcard system is brilliant. I retained 3x more material compared to traditional methods.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Analyst',
    rating: 5,
    quote:
      'Best learning platform I have used. The progress tracking keeps me motivated every single day.',
  },
  {
    name: 'David Kim',
    role: 'UX Designer',
    rating: 4,
    quote:
      'Clean interface, powerful AI tools. I completed two certifications in just one month.',
  },
  {
    name: 'Priya Patel',
    role: 'Business Student',
    rating: 5,
    quote:
      'The instructor tools made it easy to create engaging courses for my students.',
  },
  {
    name: 'Alex Thompson',
    role: 'Machine Learning Engineer',
    rating: 5,
    quote:
      'AI-generated quizzes are surprisingly accurate. This platform understands learning science.',
  },
];
