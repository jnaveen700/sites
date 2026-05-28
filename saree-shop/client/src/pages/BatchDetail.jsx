import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import { getImageUrl, normalizeImages, renderTextValue } from '../utils/imageHelpers';
import { getAuthHeaders, isAdminUser, resolveAuthSession } from '../utils/auth';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [replacementImages, setReplacementImages] = useState([]);
  const adminMessageRef = useRef(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/batches/${id}`);
        if (!response.ok) throw new Error('Failed to fetch batch details');

        const data = await response.json();
        setBatch(data.batch || data.data || data);
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

  useEffect(() => {
    let active = true;

    const resolveAdmin = async () => {
      const session = await resolveAuthSession();
      if (active) {
        setIsAdmin(isAdminUser(session?.user));
      }
    };

    void resolveAdmin();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!batch) {
      return;
    }

    setEditForm({
      title: batch.title || '',
      category: batch.category || 'Other',
      description: batch.description || '',
      price: batch.price ?? '',
      status: batch.status || 'active',
    });
  }, [batch]);

  useEffect(() => {
    if (adminMessage && adminMessageRef.current) {
      adminMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [adminMessage]);

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

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const headers = getAuthHeaders();
    if (!headers) {
      setAdminMessage(isTelugu ? 'దయచేసి మళ్లీ లాగిన్ చేయండి' : 'Please log in again');
      return;
    }

    try {
      setSaving(true);
      setAdminMessage('');

      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('category', editForm.category);
      formData.append('description', editForm.description);
      formData.append('price', String(editForm.price));
      formData.append('status', editForm.status);

      replacementImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update batch');
      }

      setBatch(data.batch || data.data || batch);
      setIsEditing(false);
      setReplacementImages([]);
      setAdminMessage(isTelugu ? 'బ్యాచ్ నవీకరించబడింది' : 'Batch updated successfully');
    } catch (err) {
      console.error('Error updating batch:', err);
      setAdminMessage(err.message || (isTelugu ? 'నవీకరణ విఫలమైంది' : 'Failed to update batch'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!window.confirm(isTelugu ? 'ఈ బ్యాచ్‌ను తొలగించాలా?' : 'Delete this batch?')) {
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      setAdminMessage(isTelugu ? 'దయచేసి మళ్లీ లాగిన్ చేయండి' : 'Please log in again');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete batch');
      }

      navigate('/admin/dashboard', { state: { activeTab: 'batch' }, replace: true });
    } catch (err) {
      console.error('Error deleting batch:', err);
      setAdminMessage(isTelugu ? 'తొలగింపు విఫలమైంది' : 'Failed to delete batch');
    } finally {
      setSaving(false);
    }
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
    <div className="detail-page batch-detail-page">
      <div className="detail-container batch-detail-shell">
        <div className="detail-image-section batch-gallery">
          <div className="main-image batch-main-image">
            {currentImage !== '/placeholder.jpg' ? (
              <img src={currentImage} alt={renderTextValue(batch.title, 'Batch detail image')} />
            ) : (
              <div className="image-placeholder">📷</div>
            )}
            <div className="batch-main-copy">
              <span className="batch-eyebrow">{isTelugu ? 'హోల్‌సేల్ కలెక్షన్' : 'Wholesale Collection'}</span>
              <h1>{renderTextValue(batch.title || batch.name, 'Batch Detail')}</h1>
              <p>{renderTextValue(batch.description, isTelugu ? 'ఈ బ్యాచ్ కోసం వివరణ లేదు' : 'No description provided yet.')}</p>
            </div>
          </div>

          {images.length > 1 && (
            <div className="image-thumbnails batch-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  {getImageUrl(img) !== '/placeholder.jpg' ? (
                    <img src={getImageUrl(img)} alt={`View ${idx + 1}`} />
                  ) : (
                    <span aria-hidden="true">📷</span>
                  )}
                </button>
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

        <div className="detail-info-section batch-detail-info">
          <div className="batch-detail-card batch-sticky-card">
            <div className="detail-category">
              <span className="category-badge">{renderTextValue(batch.category, 'Batch')}</span>
            </div>

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

            <div className="batch-meta-grid">
              <div className="batch-meta-item">
                <span>{isTelugu ? 'స్టేటస్' : 'Status'}</span>
                <strong>{renderTextValue(batch.status, 'active')}</strong>
              </div>
              <div className="batch-meta-item">
                <span>{isTelugu ? 'చిత్రాలు' : 'Images'}</span>
                <strong>{images.length}</strong>
              </div>
              <div className="batch-meta-item">
                <span>{isTelugu ? 'ఆర్డర్' : 'Order'}</span>
                <strong>{renderTextValue(batch.minOrder || 1, 1)}</strong>
              </div>
              <div className="batch-meta-item">
                <span>{isTelugu ? 'వర్గం' : 'Category'}</span>
                <strong>{renderTextValue(batch.category, 'Batch')}</strong>
              </div>
            </div>

            <div className="detail-quantity">
              <label>{isTelugu ? 'పరిమాణం' : 'Quantity'}</label>
              <div className="quantity-selector">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
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

            {isAdmin && (
              <>
                <div className="detail-admin-actions batch-admin-actions">
                  <div>
                    <span className="detail-admin-label">{isTelugu ? 'ఆడ్మిన్ నియంత్రణలు' : 'Admin controls'}</span>
                    <p>{isTelugu ? 'మెటాడేటా మార్చండి, బ్యాచ్‌ను తొలగించండి, లేదా కొత్త బ్యాచ్ అప్‌లోడ్ చేయండి.' : 'Update metadata, delete the batch, or open the batch uploader.'}</p>
                  </div>
                  <div className="detail-admin-buttons">
                    <button
                      className="admin-action-btn admin-action-primary"
                      type="button"
                      onClick={() => {
                        setIsEditing((value) => {
                          const nextValue = !value;
                          if (!nextValue) {
                            setReplacementImages([]);
                          }
                          return nextValue;
                        });
                      }}
                    >
                      {isEditing ? (isTelugu ? 'ఫారమ్ మూసివేయండి' : 'Close Editor') : (isTelugu ? 'బ్యాచ్‌ను ఎడిట్ చేయండి' : 'Edit Batch')}
                    </button>
                    <button className="admin-action-btn admin-action-secondary" type="button" onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'batch' } })}>
                      {isTelugu ? 'బ్యాచ్ అప్‌లోడర్' : 'Open Batch Uploader'}
                    </button>
                    <button className="admin-action-btn admin-action-danger" type="button" onClick={handleDeleteBatch} disabled={saving}>
                      {saving ? (isTelugu ? 'తొలగిస్తోంది...' : 'Deleting...') : (isTelugu ? 'బ్యాచ్ తొలగించండి' : 'Delete Batch')}
                    </button>
                  </div>
                  {adminMessage && <p ref={adminMessageRef} className="detail-admin-message">{adminMessage}</p>}
                </div>

                {isEditing && (
                  <form className="batch-edit-form" onSubmit={handleEditSubmit}>
                    <div className="batch-edit-grid">
                      <label>
                        <span>{isTelugu ? 'శీర్షిక' : 'Title'}</span>
                        <input value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder={isTelugu ? 'బ్యాచ్ శీర్షిక' : 'Batch title'} />
                      </label>
                      <label>
                        <span>{isTelugu ? 'వర్గం' : 'Category'}</span>
                        <select value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}>
                          <option value="Wedding">Wedding</option>
                          <option value="Casual">Casual</option>
                          <option value="Budget">Budget</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                      <label>
                        <span>{isTelugu ? 'ధర' : 'Price'}</span>
                        <input type="number" min="1" value={editForm.price} onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))} />
                      </label>
                      <label>
                        <span>{isTelugu ? 'స్టేటస్' : 'Status'}</span>
                        <select value={editForm.status} onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                    <label className="batch-edit-description">
                      <span>{isTelugu ? 'చిత్రాలను మార్చండి' : 'Replace Images'}</span>
                      <input type="file" accept="image/*" multiple onChange={(event) => setReplacementImages(Array.from(event.target.files || []))} />
                      <small>{replacementImages.length > 0 ? `${replacementImages.length} ${isTelugu ? 'చిత్రాలు ఎంచుకున్నారు' : 'images selected'}` : (isTelugu ? 'అవసరమైతే కొత్త చిత్రాలు ఎంచుకోండి' : 'Choose new images only if you want to replace the existing ones.')}</small>
                    </label>
                    <label className="batch-edit-description">
                      <span>{isTelugu ? 'వివరణ' : 'Description'}</span>
                      <textarea rows="4" value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} placeholder={isTelugu ? 'బ్యాచ్ వివరణ' : 'Batch description'} />
                    </label>
                    <div className="batch-edit-actions">
                      <button className="admin-action-btn admin-action-primary" type="submit" disabled={saving}>
                        {saving ? (isTelugu ? 'సేవ్ చేస్తోంది...' : 'Saving...') : (isTelugu ? 'మార్పులను సేవ్ చేయండి' : 'Save Changes')}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            <div className="wholesale-info">
              <h3>📦 {isTelugu ? 'సరఫరా బ్యాచ్' : 'Wholesale Batch'}</h3>
              <p>{isTelugu ? 'సరఫరా ధరలు అందుబాటులో - మమ్మల్ని సంపర్కించండి' : 'Special wholesale pricing available - Contact us'}</p>
            </div>
          </div>

          {batch.description && (
            <div className="batch-detail-summary">
              <h3>{isTelugu ? 'వివరణ' : 'Description'}</h3>
              <p>{renderTextValue(batch.description)}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
