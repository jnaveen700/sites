import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import { getImageUrl, normalizeImages, renderTextValue } from '../utils/imageHelpers';
import '../styles/SareeDetail.css';

export default function SareeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isTelugu } = useLanguage();

  const [saree, setSaree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customerType, setCustomerType] = useState(
    location.state?.customerType || localStorage.getItem('customerType') || 'retail'
  );
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch saree details
  useEffect(() => {
    const fetchSareeDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/sarees/${id}`);
        if (!response.ok) throw new Error('Failed to fetch saree details');
        
        const data = await response.json();
        setSaree(data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching saree:', err);
        setError(isTelugu ? 'సరీ వివరాలు లోడ్ చేయడం విఫలమైంది' : 'Failed to load saree details');
      } finally {
        setLoading(false);
      }
    };

    fetchSareeDetail();
  }, [id, isTelugu]);

  useEffect(() => {
    console.group('Saree Debug');
    console.log('Saree:', saree);
    console.log('Images:', saree?.images);
    console.log('Selected image index:', selectedImageIndex);
    console.log('Selected image:', saree?.images?.[selectedImageIndex]);
    console.log('Mapped image items:', normalizeImages(saree?.images).map((img, index) => ({
      index,
      value: img,
      url: getImageUrl(img),
    })));
    console.groupEnd();
  }, [saree, selectedImageIndex]);

  const handleAddToCart = () => {
    // TODO: Implement cart functionality with CartContext
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    // TODO: Redirect to checkout after implementing cart
    navigate('/checkout', { state: { sareeId: id, quantity, customerType } });
  };

  const currentPrice = customerType === 'wholesale' ? saree?.wholesalePrice : saree?.retailPrice;
  const otherPrice = customerType === 'wholesale' ? saree?.retailPrice : saree?.wholesalePrice;
  const discount = saree ? Math.round(((otherPrice - currentPrice) / otherPrice) * 100) : 0;
  const isNewDrop = saree && new Date() - new Date(saree.createdAt) < 7 * 24 * 60 * 60 * 1000;
  const stockStatus = saree?.stock > 15 ? 'in-stock' : saree?.stock > 0 ? 'limited' : 'out-of-stock';
  const images = normalizeImages(saree?.images);

  if (loading) {
    return (
      <div className="saree-detail loading">
        <div className="spinner"></div>
        <p>{isTelugu ? 'లోడ్ చేస్తున్నారు...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error || !saree) {
    return (
      <div className="saree-detail error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2>{isTelugu ? 'ఎర్రర్' : 'Error'}</h2>
          <p>{error || (isTelugu ? 'సరీ కనుగొనబడలేదు' : 'Saree not found')}</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            {isTelugu ? '← వెనుకకు వెళ్లండి' : '← Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="saree-detail">
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/catalog')} className="breadcrumb-link">
          {isTelugu ? 'కేటలాగ్' : 'Catalog'}
        </button>
        <span>/</span>
        <span className="breadcrumb-current">{renderTextValue(saree.designName, 'Saree Detail')}</span>
      </div>

      {/* MAIN CONTENT */}
      <div className="detail-container">
        {/* IMAGE SECTION */}
        <section className="image-section">
          <div className="main-image">
            {isNewDrop && <div className="new-badge">🆕 NEW</div>}
            {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
            
            <img
              src={getImageUrl(images[selectedImageIndex])}
              alt={renderTextValue(saree.designName, 'Saree detail image')}
            />
            {/* STOCK STATUS OVERLAY */}
            <div className={`stock-status ${stockStatus}`}>
              {stockStatus === 'in-stock' && (isTelugu ? '✓ స్టాక్‌లో' : '✓ In Stock')}
              {stockStatus === 'limited' && (isTelugu ? '⚠ సీమిత' : '⚠ Limited Stock')}
              {stockStatus === 'out-of-stock' && (isTelugu ? '✗ స్టాక్ నుండి' : '✗ Out of Stock')}
            </div>
          </div>

          {/* IMAGE THUMBNAILS */}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${renderTextValue(saree.designName, 'Saree')} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

          {import.meta.env.DEV && (
            <section className="debug-panel" style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #c98', borderRadius: '12px', background: '#fffaf5' }}>
              <h3 style={{ marginTop: 0 }}>Debug Snapshot</h3>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '12px', lineHeight: 1.5 }}>
                {JSON.stringify({
                  saree,
                  images,
                  selectedImageIndex,
                  selectedImage: images[selectedImageIndex],
                  currentImage: getImageUrl(images[selectedImageIndex]),
                }, null, 2)}
              </pre>
            </section>
          )}

        </section>

        {/* DETAILS SECTION */}
        <section className="details-section">
          {/* TITLE & RATING */}
          <div className="product-header">
            <h1 className="product-title">{renderTextValue(saree.designName, 'Saree Detail')}</h1>
            {saree.designNameTelugu && (
              <p className="product-title-te">{renderTextValue(saree.designNameTelugu)}</p>
            )}
            <div className="rating">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">(125 reviews)</span>
            </div>
          </div>

          {/* PRICING */}
          <div className="pricing-section">
            <div className="price-box">
              <h3>{isTelugu ? 'ధర' : 'Price'}</h3>
              <div className="prices">
                <span className="current-price">₹{renderTextValue(currentPrice, 0)}</span>
                {discount > 0 && (
                  <span className="original-price">₹{renderTextValue(otherPrice, 0)}</span>
                )}
              </div>
              <p className="price-note">
                {customerType === 'wholesale' 
                  ? (isTelugu ? 'హోల్‌సేల్ ధర' : 'Wholesale Price')
                  : (isTelugu ? 'రిటైల్ ధర' : 'Retail Price')}
              </p>
            </div>

            {/* STOCK & AVAILABILITY */}
            <div className="stock-box">
              <h3>{isTelugu ? 'స్టాక్ స్థితి' : 'Availability'}</h3>
              <p className={`stock-info ${stockStatus}`}>
                {stockStatus === 'in-stock' && isTelugu && `${renderTextValue(saree.stock, 0)} సరీలు స్టాక్‌లో`}
                {stockStatus === 'in-stock' && !isTelugu && `${renderTextValue(saree.stock, 0)} units in stock`}
                {stockStatus === 'limited' && isTelugu && `కేవలం ${renderTextValue(saree.stock, 0)} సరీలు మిగిలి ఉన్నాయి`}
                {stockStatus === 'limited' && !isTelugu && `Only ${renderTextValue(saree.stock, 0)} left`}
                {stockStatus === 'out-of-stock' && (isTelugu ? 'స్టాక్ నుండి' : 'Out of Stock')}
              </p>
            </div>
          </div>

          {/* PRODUCT ATTRIBUTES */}
          <div className="attributes-section">
            <h3>{isTelugu ? 'విశేషాలు' : 'Details'}</h3>
            
            <div className="attribute">
              <span className="attr-label">{isTelugu ? 'పదార్థం' : 'Material'}:</span>
              <span className="attr-value">{renderTextValue(saree.material)}</span>
              {saree.materialTelugu && (
                <span className="attr-value-te">({renderTextValue(saree.materialTelugu)})</span>
              )}
            </div>

            <div className="attribute">
              <span className="attr-label">{isTelugu ? 'నమూనా' : 'Pattern'}:</span>
              <span className="attr-value">{renderTextValue(saree.pattern)}</span>
              {saree.patternTelugu && (
                <span className="attr-value-te">({renderTextValue(saree.patternTelugu)})</span>
              )}
            </div>

            <div className="attribute">
              <span className="attr-label">{isTelugu ? 'రంగు' : 'Color'}:</span>
              <span className="attr-value">{renderTextValue(saree.color)}</span>
              {saree.colorTelugu && (
                <span className="attr-value-te">({renderTextValue(saree.colorTelugu)})</span>
              )}
            </div>

            {saree.season && (
              <div className="attribute">
                <span className="attr-label">{isTelugu ? 'సీజన్' : 'Season'}:</span>
                <span className="attr-value">{renderTextValue(saree.season)}</span>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {saree.description && (
            <div className="description-section">
              <h3>{isTelugu ? 'వివరణ' : 'Description'}</h3>
              <p>{renderTextValue(saree.description)}</p>
              {saree.descriptionTelugu && (
                <p className="description-te">{renderTextValue(saree.descriptionTelugu)}</p>
              )}
            </div>
          )}

          {/* QUANTITY & ACTION BUTTONS */}
          <div className="actions-section">
            <div className="quantity-selector">
              <label>{isTelugu ? 'పరిమాణం' : 'Quantity'}:</label>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={stockStatus === 'out-of-stock'}
            >
              {isTelugu ? (addedToCart ? '✓ జోడించబడింది!' : '🛒 కార్ట్‌కు జోడించండి') : (addedToCart ? '✓ Added!' : '🛒 Add to Cart')}
            </button>

            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={stockStatus === 'out-of-stock'}
            >
              {isTelugu ? '💳 ఇప్పుడే కొనండి' : '💳 Buy Now'}
            </button>
          </div>

          {/* POLICY SECTION */}
          <div className="policy-section">
            <div className="policy-item">
              <span className="policy-icon">🚚</span>
              <div>
                <p className="policy-title">{isTelugu ? 'ఉచిత డెలివరీ' : 'Free Delivery'}</p>
                <p className="policy-desc">{isTelugu ? '₹500 కంటే ఎక్కువ ఆర్డర్‌కు' : 'On orders above ₹500'}</p>
              </div>
            </div>

            <div className="policy-item">
              <span className="policy-icon">🔄</span>
              <div>
                <p className="policy-title">{isTelugu ? '7 రోజుల రిటర్న్' : '7 Days Return'}</p>
                <p className="policy-desc">{isTelugu ? 'ఆందోళన లేనిదిగా' : 'Hassle-free'}</p>
              </div>
            </div>

            <div className="policy-item">
              <span className="policy-icon">🛡️</span>
              <div>
                <p className="policy-title">{isTelugu ? '100% సాక్ష్యం' : '100% Secure'}</p>
                <p className="policy-desc">{isTelugu ? 'సురక్షిత చెక్‌అవుట్' : 'Safe checkout'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BACK BUTTON */}
      <div className="back-section">
        <button className="back-btn" onClick={() => navigate(-1)}>
          {isTelugu ? '← వెనుకకు వెళ్లండి' : '← Go Back'}
        </button>
      </div>

    </div>
  );
}
