import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

/* Lazy-load pages */
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProfile from '@/pages/admin/AdminProfile';
import ProfileSettings from '@/pages/shared/ProfileSettings';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import InstructorDashboard from '@/pages/instructor/InstructorDashboard';
import InstructorProfile from '@/pages/instructor/InstructorProfile';
import CourseCatalog from '@/pages/student/CourseCatalog';
import CourseDetail from '@/pages/student/CourseDetail';

const CourseApprovals = lazy(() => import('@/pages/admin/CourseApprovals'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AdminCourseList = lazy(() => import('@/pages/admin/AdminCourseList'));
const LearningWorkspace = lazy(() => import('@/pages/student/LearningWorkspace'));
const QuizPage = lazy(() => import('@/pages/student/QuizPage'));
const FlashcardsPage = lazy(() => import('@/pages/student/FlashcardsPage'));
const ProgressTracker = lazy(() => import('@/pages/student/ProgressTracker'));
const CertificatePage = lazy(() => import('@/pages/student/CertificatePage'));
const CourseBuilder = lazy(() => import('@/pages/instructor/CourseBuilder'));
const ModuleBuilder = lazy(() => import('@/pages/instructor/ModuleBuilder'));
const CertificateApproval = lazy(() => import('@/pages/instructor/CertificateApproval'));
const CourseStudents = lazy(() => import('@/pages/instructor/CourseStudents'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
  </div>
);

const DashboardRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }
  return <Navigate to="/student/dashboard" replace />;
};

const ProfileRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  if (role === 'admin') {
    return <Navigate to="/admin/profile" replace />;
  }
  if (role === 'instructor') {
    return <Navigate to="/instructor/profile" replace />;
  }
  return <Navigate to="/student/profile" replace />;
};

const AppRouter = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with Layout (sidebar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Student routes */}
            <Route path="/student/dashboard" element={<RoleRoute role="student"><StudentDashboard /></RoleRoute>} />
            <Route path="/student/profile" element={<RoleRoute role="student"><StudentProfile /></RoleRoute>} />
            <Route path="/student/learn/:id" element={<RoleRoute role={['student', 'instructor']}><LearningWorkspace /></RoleRoute>} />
            <Route path="/student/quiz/:lessonId" element={<RoleRoute role={['student', 'instructor']}><QuizPage /></RoleRoute>} />
            <Route path="/student/course-quiz/:courseId" element={<RoleRoute role={['student', 'instructor']}><QuizPage /></RoleRoute>} />
            <Route path="/student/flashcards/:lessonId" element={<RoleRoute role={['student', 'instructor']}><FlashcardsPage /></RoleRoute>} />
            <Route path="/student/course-flashcards/:courseId" element={<RoleRoute role={['student', 'instructor']}><FlashcardsPage /></RoleRoute>} />
            <Route path="/student/progress/:id" element={<RoleRoute role="student"><ProgressTracker /></RoleRoute>} />
            <Route path="/student/certificate/:id" element={<RoleRoute role="student"><CertificatePage /></RoleRoute>} />

            {/* Shared routes inside Layout */}
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/profile" element={<ProfileRedirect />} />

            {/* Instructor routes */}
            <Route path="/instructor/dashboard" element={<RoleRoute role="instructor"><InstructorDashboard /></RoleRoute>} />
            <Route path="/instructor/profile" element={<RoleRoute role="instructor"><InstructorProfile /></RoleRoute>} />
            <Route path="/instructor/certificates" element={<RoleRoute role="instructor"><CertificateApproval /></RoleRoute>} />
            <Route path="/instructor/courses/:id/students" element={<RoleRoute role="instructor"><CourseStudents /></RoleRoute>} />
            <Route path="/instructor/courses/new" element={<RoleRoute role="instructor"><CourseBuilder /></RoleRoute>} />
            <Route path="/instructor/courses/:id/edit" element={<RoleRoute role={['instructor', 'admin']}><CourseBuilder /></RoleRoute>} />
            <Route path="/instructor/modules/:courseId" element={<RoleRoute role={['instructor', 'admin']}><ModuleBuilder /></RoleRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/approvals" element={<RoleRoute role="admin"><CourseApprovals /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute role="admin"><UserManagement /></RoleRoute>} />
            <Route path="/admin/courses" element={<RoleRoute role="admin"><AdminCourseList /></RoleRoute>} />
            <Route path="/admin/profile" element={<RoleRoute role="admin"><AdminProfile /></RoleRoute>} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
