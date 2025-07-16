import { useState, useEffect } from 'react';
import Auth from '../utils/auth';

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(Auth.loggedIn());

  useEffect(() => {
    const handler = () => setIsLoggedIn(Auth.loggedIn());
    window.addEventListener('authchange', handler);
    return () => window.removeEventListener('authchange', handler);
  }, []);

  return isLoggedIn;
}
