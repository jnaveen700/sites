import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useLanguage } from '../hooks/useLanguage';
import { clearAuthSession, getAuthSession, validateAuthSession } from '../utils/auth';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    let mounted = true;

    const syncExistingSession = async () => {
      const session = getAuthSession();

      if (!session?.token) {
        clearAuthSession();
        return;
      }

      const user = session.user?.role === 'admin'
        ? session.user
        : await validateAuthSession();

      if (mounted && user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    };

    syncExistingSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        if (data.user?.role !== 'admin') {
          clearAuthSession();
          setError('Admin access required');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{isTelugu ? 'ఆడ్మిన్ లాగిన్' : 'Admin Login'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isTelugu ? 'ఈమెయిల్' : 'Email'}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
                placeholder={isTelugu ? 'మీ ఈమెయిల్' : 'Your email'}
              required
            />
          </div>

          <div className="form-group">
            <label>{isTelugu ? 'పాస్‌వర్డ్' : 'Password'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
                placeholder={isTelugu ? 'మీ పాస్‌వర్డ్' : 'Your password'}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : (isTelugu ? 'లాగిన్ చేయండి' : 'Login')}
          </button>
        </form>

      </div>
    </div>
  );
}
