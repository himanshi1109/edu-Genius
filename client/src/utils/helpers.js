export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const calculateCompletion = (completedLessons, totalLessons) => {
  if (!totalLessons || totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

export const getTotalLessons = (course) => {
  if (!course?.modules) return 0;
  return course.modules.reduce(
    (total, mod) => total + (mod.lessons?.length || 0),
    0
  );
};

export const getTotalModules = (course) => {
  return course?.modules?.length || 0;
};

export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent!';
  if (score >= 70) return 'Good Job!';
  if (score >= 60) return 'Passed';
  return 'Keep Practicing';
};

export const getScoreColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 60) return '#eab308';
  return '#ef4444';
};

export const passwordStrength = (password) => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
export const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const apiBase = import.meta.env.VITE_API_URL || '';
  // If apiBase is relative (like '/api'), we need to handle the prefix carefully
  if (apiBase === '/api') {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // For local development or absolute API URLs
  const base = apiBase.replace('/api', '') || 'http://localhost:8080';
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
};

