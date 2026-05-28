import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useCart } from '../../context/CartContext';
import { clearAuthSession, getAuthSession, isAdminUser, resolveAuthSession } from '../../utils/auth';
import '../../styles/Navigation.css';

export default function Navigation() {
  const { language, switchLanguage, isTelugu } = useLanguage();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const resolved = await resolveAuthSession();
      if (mounted) {
        setSession(resolved || getAuthSession());
      }
    };

    void syncSession();

    const handleStorage = () => void syncSession();
    window.addEventListener('storage', handleStorage);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogoClick = () => {
    navigate('/home');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    navigate('/home');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo" onClick={handleLogoClick}>
          <div className="logo-container">
            <img src="https://drive.google.com/uc?export=view&id=1NOPGboIvLDzpVJw_QexQIqj5sQsnYUPB" alt="Sree Balaji Fabrics" className="logo-image" onError={(e) => {e.target.style.display = 'none'}} />
            <span className="logo-fallback">SBF</span>
          </div>
          <div className="logo-text">
            <span className="brand-name">{isTelugu ? 'శ్రీ బాలాజీ' : 'Sree Balaji'}</span>
            <span className="brand-tagline">FABRICS</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link
            to="/home"
            className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            onClick={() => handleNavClick('/home')}
          >
            {isTelugu ? 'హోమ్' : 'Home'}
          </Link>

          <Link
            to="/catalog"
            className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}
            onClick={() => handleNavClick('/catalog')}
          >
            {isTelugu ? 'సంపూర్ణ సరీలు' : 'Collections'}
          </Link>

          <a
            href="#about"
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/about');
            }}
          >
            {isTelugu ? 'గురించి' : 'About'}
          </a>

          <a
            href="#contact"
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/contact');
            }}
          >
            {isTelugu ? 'సంపర్కించండి' : 'Contact'}
          </a>
        </div>

        {/* Right Section - Language, Cart, Admin */}
        <div className="navbar-right">
          {/* Language Toggle */}
          <div className="language-toggle">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => switchLanguage('en')}
              title="English"
            >
              EN
            </button>
            <button
              className={`lang-btn ${language === 'te' ? 'active' : ''}`}
              onClick={() => switchLanguage('te')}
              title="Telugu"
            >
              TE
            </button>
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="cart-link">
            <span className="cart-icon">🛍️</span>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {/* Login/Logout Button */}
          {session ? (
            <button
              onClick={handleLogout}
              className="nav-link logout-btn"
              title={isTelugu ? 'లాగ్‌అవుట్' : 'Logout'}
            >
              🚪
            </button>
          ) : (
            <Link to="/login" className="nav-link login-btn" title={isTelugu ? 'లాగిన్' : 'Login'}>
              🔓
            </Link>
          )}

          {/* Admin Link */}
          {isAdminUser(session?.user) && (
            <Link to="/admin/dashboard" className="nav-link admin-link" title={isTelugu ? 'ఆడ్మిన్' : 'Admin'}>
              👑
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
