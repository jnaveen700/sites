import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/AdminDashboard.css';
import SimpleBatchUpload from '../components/admin/SimpleBatchUpload';
import ManageSarees from '../components/admin/ManageSarees';
import AddSaree from '../components/admin/AddSaree';
import EditSaree from '../components/admin/EditSaree';

export default function AdminDashboard() {
  const { t, language, switchLanguage, isTelugu } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'batch'); // 'batch', 'manage', or 'add'
  const [editingId, setEditingId] = useState(location.state?.editingId || null);

  useEffect(() => {
    setActiveTab(location.state?.activeTab || 'batch');
    setEditingId(location.state?.editingId || null);
  }, [location.state]);

  const handleLanguageSwitch = (lang) => {
    switchLanguage(lang);
  };

  const handleSareeAdded = () => {
    setActiveTab('manage');
  };

  const handleEditComplete = () => {
    setEditingId(null);
    setActiveTab('manage');
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">👑 {isTelugu ? 'అడ్మిన్' : 'Admin'}</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item primary ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('batch');
              setEditingId(null);
            }}
            title={isTelugu ? 'కొత్త బ్యాచ్ అప్‌లోడ్ చేయండి' : 'Upload new batch'}
          >
            <span className="nav-icon">📸</span>
            <span className="nav-label">
              {isTelugu ? 'బ్యాచ్ అప్‌లోడ్' : 'Upload Batch'}
            </span>
          </button>

          <button
            className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('manage');
              setEditingId(null);
            }}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">
              {isTelugu ? 'సరీలను నిర్వహించండి' : 'Manage Sarees'}
            </span>
          </button>

          <button
            className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="nav-icon">➕</span>
            <span className="nav-label">
              {isTelugu ? 'నవ సరీని జోడించండి' : 'Add New Saree'}
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="language-selector">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageSwitch('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${language === 'te' ? 'active' : ''}`}
              onClick={() => handleLanguageSwitch('te')}
            >
              TE
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>
              {isTelugu ? 'సరీ దుకాణం ఆడ్మిన్ ' : 'Saree Shop Admin'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'batch'
                ? isTelugu
                  ? 'నవ సరీ బ్యాచ్ అప్‌లోడ్ చేయండి'
                  : 'Upload a New Saree Batch'
                : activeTab === 'manage'
                ? isTelugu
                  ? 'మీ సరీ సంగ్రహణను నిర్వహించండి'
                  : 'Manage Your Saree Inventory'
                : isTelugu
                ? 'కొత్త సరీని జోడించండి'
                : 'Add a New Saree'}
            </p>
          </div>
        </header>

        <section className="admin-content">
          {editingId ? (
            <EditSaree sareeId={editingId} onComplete={handleEditComplete} />
          ) : activeTab === 'batch' ? (
            <SimpleBatchUpload />
          ) : activeTab === 'manage' ? (
            <ManageSarees onEdit={setEditingId} />
          ) : (
            <AddSaree onAdded={handleSareeAdded} />
          )}
        </section>
      </main>
    </div>
  );
}
