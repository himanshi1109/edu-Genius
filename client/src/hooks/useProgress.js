import { useSelector } from 'react-redux';

const useProgress = (courseId) => {
  const { progress, isLoading } = useSelector((state) => state.progress);
  const courseProgress = courseId ? progress[courseId] : null;

  const completedCount = courseProgress?.completedLessons?.length || 0;
  const quizScores = courseProgress?.quizScores || [];
  const avgScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce((sum, q) => sum + (q.score || 0), 0) /
            quizScores.length
        )
      : 0;

  return {
    progress: courseProgress,
    completedCount,
    quizScores,
    avgScore,
    isLoading,
    state: courseProgress?.state || 'not_started',
    currentLesson: courseProgress?.currentLesson,
    completedLessons: courseProgress?.completedLessons || [],
  };
};

export default useProgress;
