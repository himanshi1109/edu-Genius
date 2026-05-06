import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import LoadingScreen from './components/ui/LoadingScreen';
import SimpleLoader from './components/ui/SimpleLoader';
import { fetchMe } from './store/slices/authSlice';
import useAuth from './hooks/useAuth';

const PUBLIC_PATHS = ['/', '/login', '/register'];


const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showFullIntro, setShowFullIntro] = useState(false);

  useEffect(() => {
    // Check if user has already seen the cinematic intro in this session
    const hasSeenIntro = sessionStorage.getItem('edugenius_intro_seen');
    if (!hasSeenIntro) {
      setShowFullIntro(true);
      sessionStorage.setItem('edugenius_intro_seen', 'true');
    }

    // Small delay to simulate app readiness check
    const timer = setTimeout(() => {
      if (!showFullIntro) setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [showFullIntro]);

  useEffect(() => {
    if (token && !user && !PUBLIC_PATHS.includes(location.pathname)) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user, location.pathname]);

  if (isLoading) {
    if (showFullIntro) {
      return <LoadingScreen onComplete={() => setIsLoading(false)} />;
    }
    return <SimpleLoader />;
  }


  return <AppRouter />;
};

export default App;
