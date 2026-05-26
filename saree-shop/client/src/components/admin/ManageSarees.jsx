import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { clearAuthSession, getAuthHeaders } from '../../utils/auth';
import '../../styles/ManageSarees.css';

export default function ManageSarees({ onEdit }) {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSarees = async () => {
      try {
        setLoading(true);
        const authHeaders = getAuthHeaders();
        if (!authHeaders) {
          throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
        }

        const response = await fetch(`${API_BASE_URL}/sarees`, {
          headers: {
            ...authHeaders
          }
        });

        if (response.status === 401 || response.status === 403) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setSarees(data);
            setError('');
          }
        } else if (isMounted) {
          setError(isTelugu ? 'సరీలను లోడ్ చేయడంలో విఫలం' : 'Failed to load sarees');
        }
      } catch (err) {
        if (isMounted) {
          setError(isTelugu ? 'సర్వర్ ఎరర్' : 'Server error');
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchSarees();

    return () => {
      isMounted = false;
    };
  }, [isTelugu, navigate]);

  const handleDelete = async (sareeId) => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
      }

      const response = await fetch(`${API_BASE_URL}/sarees/${sareeId}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders
        }
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (response.ok) {
        setSarees(prev => prev.filter(s => s._id !== sareeId));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error(err);
      setError(isTelugu ? 'తొలగించడంలో ఎరర్' : 'Error deleting');
    }
  };

  // Filter and sort
  let filtered = sarees.filter(saree => {
    const matchesSearch =
      saree.designName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saree.material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMaterial = filterMaterial === 'all' || saree.material === filterMaterial;
    
    return matchesSearch && matchesMaterial;
  });

  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.wholesalePrice - b.wholesalePrice);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.wholesalePrice - a.wholesalePrice);
  } else if (sortBy === 'stock-low') {
    filtered.sort((a, b) => a.stock - b.stock);
  }

  const materials = [...new Set(sarees.map(s => s.material))];

  return (
    <div className="manage-sarees-container">
      {/* Filters & Search */}
      <div className="manage-header">
        <div className="search-box">
          <input
            type="text"
            placeholder={isTelugu ? 'సరీలను వెతకండి...' : 'Search sarees...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="filter-select"
          >
            <option value="all">
              {isTelugu ? 'అన్ని పదార్థాలు' : 'All Materials'}
            </option>
            {materials.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">
              {isTelugu ? 'ఇటీవలైనవి' : 'Most Recent'}
            </option>
            <option value="price-low">
              {isTelugu ? 'ధర: తక్కువ నుండి ఎక్కువ' : 'Price: Low to High'}
            </option>
            <option value="price-high">
              {isTelugu ? 'ధర: ఎక్కువ నుండి తక్కువ' : 'Price: High to Low'}
            </option>
            <option value="stock-low">
              {isTelugu ? 'స్టాక్: తక్కువ' : 'Stock: Low First'}
            </option>
          </select>
        </div>

        <div className="control-stats">
          <span className="stat-item">
            {isTelugu ? 'మొత్తం' : 'Total'}: <strong>{sarees.length}</strong>
          </span>
          <span className="stat-item">
            {isTelugu ? 'చూపిన' : 'Showing'}: <strong>{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{isTelugu ? 'సరీలను లోడ్ చేస్తోంది...' : 'Loading sarees...'}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>{isTelugu ? 'సరీలు కనుగొనబడలేదు' : 'No sarees found'}</p>
          <p className="empty-hint">
            {isTelugu ? 'వేరేలా ప్రయత్నించండి లేదా కొత్త సరీని జోడించండి' : 'Try different filters or add a new saree'}
          </p>
        </div>
      )}

      {/* Saree Grid */}
      {!loading && filtered.length > 0 && (
        <div className="sarees-grid">
          {filtered.map(saree => (
            <div key={saree._id} className="saree-card">
              {/* Image */}
              <div className="card-image">
                {saree.images && saree.images.length > 0 ? (
                  <img src={saree.images[0].url} alt={saree.designName} />
                ) : (
                  <div className="no-image">📷</div>
                )}
                <div className="card-overlay">
                  <div className="stock-badge">
                    {saree.stock === 0 ? (
                      <span className="stock-empty">
                        {isTelugu ? 'కొనుగోలు చేయలేనిది' : 'Out of Stock'}
                      </span>
                    ) : saree.stock < 10 ? (
                      <span className="stock-low">
                        {isTelugu ? 'తక్కువ' : 'Low'}: {saree.stock}
                      </span>
                    ) : (
                      <span className="stock-good">
                        {isTelugu ? 'స్టాక్' : 'Stock'}: {saree.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="card-content">
                <h3 className="card-title">{isTelugu ? saree.designNameTelugu : saree.designName}</h3>
                
                <div className="card-meta">
                  <span className="meta-item">
                    {isTelugu ? 'పదార్థం' : 'Material'}: <strong>{saree.material}</strong>
                  </span>
                  <span className="meta-item">
                    {isTelugu ? 'నమూనా' : 'Pattern'}: <strong>{saree.pattern}</strong>
                  </span>
                </div>

                <div className="card-pricing">
                  <div className="price-item">
                    <span className="price-label">
                      {isTelugu ? 'రీటెయిల్' : 'Retail'}
                    </span>
                    <span className="price-value">₹{saree.retailPrice}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">
                      {isTelugu ? 'బందీ' : 'Wholesale'}
                    </span>
                    <span className="price-value">₹{saree.wholesalePrice}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(saree._id)}
                  >
                    ✏️ {isTelugu ? 'సవరించండి' : 'Edit'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => setDeleteConfirm(saree._id)}
                  >
                    🗑️ {isTelugu ? 'తొలగించండి' : 'Delete'}
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === saree._id && (
                  <div className="delete-confirm">
                    <p>{isTelugu ? 'ఖచ్చితంగా ఉన్నారా?' : 'Are you sure?'}</p>
                    <div className="confirm-buttons">
                      <button
                        className="btn-confirm-yes"
                        onClick={() => handleDelete(saree._id)}
                      >
                        {isTelugu ? 'అవును' : 'Yes'}
                      </button>
                      <button
                        className="btn-confirm-no"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        {isTelugu ? 'రద్దు' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
