import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import LoadingScreen from './components/ui/LoadingScreen';
import { fetchMe } from './store/slices/authSlice';
import useAuth from './hooks/useAuth';

const PUBLIC_PATHS = ['/', '/login', '/register'];

const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token && !user && !PUBLIC_PATHS.includes(location.pathname)) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user, location.pathname]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <AppRouter />;
};

export default App;
