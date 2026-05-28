import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import { getImageUrl, normalizeImages, renderTextValue } from '../utils/imageHelpers';
import '../styles/SareeDetail.css';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const { addToCart } = useCart();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/batches/${id}`);
        if (!response.ok) throw new Error('Failed to fetch batch details');

        const data = await response.json();
        setBatch(data.batch || data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching batch:', err);
        setError(isTelugu ? 'బ్యాచ్ వివరాలు లోడ్ చేయడం విఫలమైంది' : 'Failed to load batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetail();
  }, [id, isTelugu]);

  useEffect(() => {
    console.group('Batch Debug');
    console.log('Batch:', batch);
    console.log('Images:', batch?.images);
    console.log('Selected image index:', selectedImageIndex);
    console.log('Selected image:', batch?.images?.[selectedImageIndex]);
    console.log('Mapped image items:', normalizeImages(batch?.images).map((img, index) => ({
      index,
      value: img,
      url: getImageUrl(img),
    })));
    console.groupEnd();
  }, [batch, selectedImageIndex]);

  const handleAddToCart = () => {
    if (batch) {
      addToCart({
        _id: batch._id,
        name: batch.title || batch.name,
        price: batch.price,
        quantity,
        type: 'batch'
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{isTelugu ? 'లోడ్ చేస్తున్నారు...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="error-container">
        <h2>{isTelugu ? 'లోడింగ్ లోపం' : 'Error'}</h2>
        <p>{error || (isTelugu ? 'బ్యాచ్ కనుగొనబడలేదు' : 'Batch not found')}</p>
        <button onClick={() => navigate('/catalog')} className="back-btn">
          {isTelugu ? 'కాటలాగ్‌కు తిరిగి వెళ్లండి' : 'Back to Catalog'}
        </button>
      </div>
    );
  }

  const images = normalizeImages(batch?.images);
  const currentImage = getImageUrl(images[selectedImageIndex]);

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="detail-image-section">
          <div className="main-image">
            {currentImage !== '/placeholder.jpg' ? (
              <img src={currentImage} alt={renderTextValue(batch.title, 'Batch detail image')} />
            ) : (
              <div className="image-placeholder">📷</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  {getImageUrl(img) !== '/placeholder.jpg' ? (
                    <img src={getImageUrl(img)} alt={`View ${idx + 1}`} />
                  ) : (
                    <span aria-hidden="true">📷</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {import.meta.env.DEV && (
            <section className="debug-panel" style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #c98', borderRadius: '12px', background: '#fffaf5' }}>
              <h3 style={{ marginTop: 0 }}>Debug Snapshot</h3>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '12px', lineHeight: 1.5 }}>
                {JSON.stringify({
                  batch,
                  images,
                  selectedImageIndex,
                  selectedImage: images[selectedImageIndex],
                  currentImage,
                }, null, 2)}
              </pre>
            </section>
          )}
        </div>

        <div className="detail-info-section">
          <h1>{renderTextValue(batch.title || batch.name, 'Batch Detail')}</h1>

          <div className="detail-category">
            <span className="category-badge">{renderTextValue(batch.category, 'Batch')}</span>
          </div>

          {batch.description && (
            <div className="detail-description">
              <h3>{isTelugu ? 'వివరణ' : 'Description'}</h3>
              <p>{renderTextValue(batch.description)}</p>
            </div>
          )}

          <div className="detail-pricing">
            <div className="price-display">
              <span className="label">{isTelugu ? 'ధర' : 'Price'}</span>
              <span className="price">₹{renderTextValue(batch.price, 0)}</span>
            </div>
            {batch.minOrder && (
              <p className="min-order">
                {isTelugu ? 'కనీస ఆర్డర్' : 'Min. Order'}: {renderTextValue(batch.minOrder, 0)}
              </p>
            )}
          </div>

          <div className="detail-quantity">
            <label>{isTelugu ? 'పరిమాణం' : 'Quantity'}</label>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="detail-total">
            <span className="label">{isTelugu ? 'మొత్తం' : 'Total'}</span>
            <span className="total-price">₹{(batch.price * quantity).toFixed(2)}</span>
          </div>

          <div className="detail-buttons">
            <button className="add-cart-btn" onClick={handleAddToCart}>
              🛍️ {isTelugu ? 'కార్టుకు జోడించండి' : 'Add to Cart'}
            </button>
            <button className="buy-btn" onClick={handleBuyNow}>
              💳 {isTelugu ? 'ఇప్పుడే కొనుగోలు చేయండి' : 'Buy Now'}
            </button>
          </div>

          {addedToCart && (
            <div className="added-message">
              ✓ {isTelugu ? 'కార్టుకు జోడించబడింది' : 'Added to Cart!'}
            </div>
          )}

          <div className="wholesale-info">
            <h3>📦 {isTelugu ? 'సరఫరా బ్యాచ్' : 'Wholesale Batch'}</h3>
            <p>{isTelugu ? 'సరఫరా ధరలు అందుబాటులో - మమ్మల్ని సంపర్కించండి' : 'Special wholesale pricing available - Contact us'}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
