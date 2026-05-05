import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'admin',
  };
};

export default useAuth;
