import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { clearAuthSession, getAuthSession, validateAuthSession } from '../../utils/auth';

export default function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('checking');
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    let isActive = true;

    const verifySession = async () => {
      const session = getAuthSession();

      if (!session?.token) {
        clearAuthSession();
        if (isActive) {
          setRedirectTo('/login');
          setStatus('done');
        }
        return;
      }

      const user = session.user?.role === 'admin'
        ? session.user
        : await validateAuthSession();

      if (!user || user.role !== 'admin') {
        clearAuthSession();
        if (isActive) {
          setRedirectTo('/login');
          setStatus('done');
        }
        return;
      }

      if (isActive) {
        setStatus('ready');
      }
    };

    verifySession();

    return () => {
      isActive = false;
    };
  }, [location.pathname]);

  if (status === 'checking') {
    return (
      <div className="admin-access-loading">
        <p>Checking admin access...</p>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
