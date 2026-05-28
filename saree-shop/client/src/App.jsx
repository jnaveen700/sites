import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import Navigation from './components/common/Navigation';

// Pages
import LanguageSelection from './pages/LanguageSelection';
import HomePage from './pages/HomePage';
import SareeCatalog from './pages/SareeCatalog';
import SareeDetail from './pages/SareeDetail';
import BatchDetail from './pages/BatchDetail';
import ShoppingCart from './pages/ShoppingCart';
import Checkout from './pages/Checkout';
import Wholesale from './pages/Wholesale';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './components/common/ProtectedAdminRoute';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';

// Layout wrapper that includes Navigation for all pages except LanguageSelection
function MainLayout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            {/* Language Selection - Entry Point (No Navigation) */}
            <Route path="/" element={<LanguageSelection />} />

            {/* Login Route (With Navigation) */}
            <Route
              path="/login"
              element={
                <MainLayout>
                  <Login />
                </MainLayout>
              }
            />

            {/* Main App Routes (With Navigation) */}
            <Route
              path="/home"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/catalog"
              element={
                <MainLayout>
                  <SareeCatalog />
                </MainLayout>
              }
            />
            <Route
              path="/saree/:id"
              element={
                <MainLayout>
                  <RouteErrorBoundary fallback={
                    <div style={{ padding: '2rem' }}>
                      <h2>Saree detail could not be rendered</h2>
                      <p>Please reload the page or open a different collection.</p>
                    </div>
                  }>
                    <SareeDetail />
                  </RouteErrorBoundary>
                </MainLayout>
              }
            />
            <Route
              path="/batch/:id"
              element={
                <MainLayout>
                  <RouteErrorBoundary fallback={
                    <div style={{ padding: '2rem' }}>
                      <h2>Collection detail could not be rendered</h2>
                      <p>Please reload the page or open a different collection.</p>
                    </div>
                  }>
                    <BatchDetail />
                  </RouteErrorBoundary>
                </MainLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <MainLayout>
                  <ShoppingCart />
                </MainLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <MainLayout>
                  <Checkout />
                </MainLayout>
              }
            />

            {/* New Pages */}
            <Route
              path="/wholesale"
              element={
                <MainLayout>
                  <Wholesale />
                </MainLayout>
              }
            />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <About />
                </MainLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <MainLayout>
                  <Contact />
                </MainLayout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <MainLayout>
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                </MainLayout>
              }
            />

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;

