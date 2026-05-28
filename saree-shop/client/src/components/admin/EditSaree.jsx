import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { clearAuthSession, getAuthHeaders } from '../../utils/auth';
import { getImageUrl, normalizeImages } from '../../utils/imageHelpers';
import '../../styles/EditSaree.css';

export default function EditSaree({ sareeId, onComplete }) {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saree, setSaree] = useState(null);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const alertRef = useRef(null);

  const [formData, setFormData] = useState({
    designName: '',
    designNameTelugu: '',
    description: '',
    descriptionTelugu: '',
    material: 'silk',
    materialTelugu: 'పట్టు',
    pattern: 'plain',
    patternTelugu: 'సాధారణ',
    color: '',
    colorTelugu: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: '',
  });

  const materials = [
    { value: 'silk', en: 'Silk', te: 'పట్టు' },
    { value: 'cotton', en: 'Cotton', te: 'కపాస' },
    { value: 'georgette', en: 'Georgette', te: 'జార్జెట్' },
    { value: 'chiffon', en: 'Chiffon', te: 'చిఫన్' },
    { value: 'linen', en: 'Linen', te: 'లినెన్' },
  ];

  const patterns = [
    { value: 'plain', en: 'Plain', te: 'సాధారణ' },
    { value: 'striped', en: 'Striped', te: 'చారలున్న' },
    { value: 'printed', en: 'Printed', te: 'ముద్రిత' },
    { value: 'embroidered', en: 'Embroidered', te: 'కుట్టుకటం' },
    { value: 'woven', en: 'Woven', te: 'నేయబడిన' },
  ];

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const toNumber = (value) => Number(String(value).trim());

  const safeExistingImages = normalizeImages(safeArray(images));
  const safeNewImages = safeArray(newImages);
  const safeDeletedImages = safeArray(deletedImages);

  useEffect(() => {
    console.group('EditSaree Debug');
    console.log('Saree:', saree);
    console.log('Existing images:', images);
    console.log('New images:', newImages);
    console.groupEnd();
  }, [saree, images, newImages]);

  useEffect(() => {
    if (error && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  // Fetch saree data
  useEffect(() => {
    const fetchSaree = async () => {
      try {
        const authHeaders = getAuthHeaders();
        if (!authHeaders) {
          throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
        }

        const response = await fetch(`${API_BASE_URL}/sarees/${sareeId}`, {
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
          const payload = await response.json();
          const sareeData = payload.data || payload.saree || payload;
          setSaree(sareeData);
          setImages(normalizeImages(sareeData.images));
          setDeletedImages([]);
          setFormData({
            designName: sareeData.designName || '',
            designNameTelugu: sareeData.designNameTelugu || '',
            description: sareeData.description || '',
            descriptionTelugu: sareeData.descriptionTelugu || '',
            material: (sareeData.material || 'silk').toString().toLowerCase(),
            materialTelugu: sareeData.materialTelugu || 'పట్టు',
            pattern: (sareeData.pattern || 'plain').toString().toLowerCase(),
            patternTelugu: sareeData.patternTelugu || 'సాధారణ',
            color: sareeData.color || '',
            colorTelugu: sareeData.colorTelugu || '',
            retailPrice: sareeData.retailPrice ?? '',
            wholesalePrice: sareeData.wholesalePrice ?? '',
            stock: sareeData.stock ?? '',
          });
        }
      } catch (err) {
        setError(isTelugu ? 'సరీ లోడ్ విఫలం' : 'Failed to load saree');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaree();
  }, [sareeId, isTelugu, navigate]);

  // Handle drag
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  // Process files
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length + safeNewImages.length + safeExistingImages.length > 5) {
      setError(isTelugu ? 'గరిష్టంగా 5 చిత్రాలు' : 'Maximum 5 images');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImages(prev => [...prev, {
          file,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removeExistingImage = (publicId) => {
    setImages(prev => normalizeImages(prev).filter(img => img.public_id !== publicId));
    setDeletedImages(prev => {
      const safePrev = safeArray(prev);
      return safePrev.includes(publicId) ? safePrev : [...safePrev, publicId];
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => safeArray(prev).filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMaterialChange = (e) => {
    const material = materials.find(m => m.value === e.target.value);
    setFormData(prev => ({
      ...prev,
      material: material.value,
      materialTelugu: material.te
    }));
  };

  const handlePatternChange = (e) => {
    const pattern = patterns.find(p => p.value === e.target.value);
    setFormData(prev => ({
      ...prev,
      pattern: pattern.value,
      patternTelugu: pattern.te
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const retailPrice = toNumber(formData.retailPrice);
    const wholesalePrice = toNumber(formData.wholesalePrice);
    const stock = toNumber(formData.stock);

    if (images.length + newImages.length === 0) {
      setError(isTelugu ? 'కనీసం 1 చిత్రం అవసరం' : 'At least 1 image required');
      return;
    }

    if (!Number.isFinite(retailPrice) || !Number.isFinite(wholesalePrice) || !Number.isFinite(stock)) {
      setError(isTelugu ? 'ధరలు మరియు స్టాక్ సరైన సంఖ్యలు కావాలి' : 'Prices and stock must be valid numbers');
      return;
    }

    if (retailPrice <= 0 || wholesalePrice <= 0 || stock < 0) {
      setError(isTelugu ? 'ధరలు మరియు స్టాక్ సరైనవి కావాలి' : 'Prices and stock must be valid');
      return;
    }

    if (wholesalePrice > retailPrice) {
      setError(isTelugu ? 'బందీ ధర రీటెయిల్ ధర కంటే తక్కువగా ఉండాలి' : 'Wholesale price must be lower than retail price');
      return;
    }

    setSaving(true);

    try {
      const uploadFormData = new FormData();

      uploadFormData.append('designName', formData.designName);
      uploadFormData.append('designNameTelugu', formData.designNameTelugu);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('descriptionTelugu', formData.descriptionTelugu);
      uploadFormData.append('material', formData.material);
      uploadFormData.append('materialTelugu', formData.materialTelugu);
      uploadFormData.append('pattern', formData.pattern);
      uploadFormData.append('patternTelugu', formData.patternTelugu);
      uploadFormData.append('color', formData.color);
      uploadFormData.append('colorTelugu', formData.colorTelugu);
      uploadFormData.append('retailPrice', String(retailPrice));
      uploadFormData.append('wholesalePrice', String(wholesalePrice));
      uploadFormData.append('stock', String(stock));

      if (safeDeletedImages.length > 0) {
        uploadFormData.append('deleteImages', JSON.stringify(safeDeletedImages));
      }

      // New images
      safeNewImages.forEach(img => {
        uploadFormData.append('images', img.file);
      });

      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
      }

      const response = await fetch(`${API_BASE_URL}/sarees/${sareeId}`, {
        method: 'PUT',
        headers: {
          ...authHeaders
        },
        body: uploadFormData
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (response.ok) {
        setSuccess(isTelugu ? 'సరీ విజయవంతంగా నవీకరించబడింది!' : 'Saree updated successfully!');
        setTimeout(() => onComplete(), 1500);
      } else {
        const data = await response.json();
        setError(data.message || (isTelugu ? 'ఎరర్' : 'An error occurred'));
      }
    } catch (err) {
      setError(isTelugu ? 'సర్వర్ ఎరర్' : 'Server error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-saree-loading">
        <div className="spinner"></div>
        <p>{isTelugu ? 'సరీ లోడ్ చేస్తోంది...' : 'Loading saree...'}</p>
      </div>
    );
  }

  if (!saree) {
    return (
      <div className="edit-saree-error">
        <p>{isTelugu ? 'సరీ కనుగొనబడలేదు' : 'Saree not found'}</p>
        <button onClick={onComplete} className="btn-back">
          {isTelugu ? 'వెనుకకు' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="edit-saree-container">
      <button className="btn-back-edit" onClick={onComplete}>
        ← {isTelugu ? 'వెనుకకు' : 'Back'}
      </button>

      <form onSubmit={handleSubmit} className="edit-saree-form">
        {error && <div ref={alertRef} className="form-error form-notice">{error}</div>}
        {success && <div className="form-success form-notice">{success}</div>}

        <div className="form-section">
          <h2>{isTelugu ? 'ప్రాథమిక వివరాలు' : 'Basic Details'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'డిజైన్ పేరు (English)' : 'Design Name'}</label>
              <input
                type="text"
                name="designName"
                value={formData.designName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'డిజైన్ పేరు (తెలుగు)' : 'Design Name (Telugu)'}</label>
              <input
                type="text"
                name="designNameTelugu"
                value={formData.designNameTelugu}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'వర్ణన (English)' : 'Description'}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'వర్ణన (తెలుగు)' : 'Description (Telugu)'}</label>
              <textarea
                name="descriptionTelugu"
                value={formData.descriptionTelugu}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>{isTelugu ? 'సరీ లక్షణాలు' : 'Saree Features'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'పదార్థం' : 'Material'}</label>
              <select value={formData.material} onChange={handleMaterialChange}>
                {materials.map(m => (
                  <option key={m.value} value={m.value}>{m.en}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'నమూనా' : 'Pattern'}</label>
              <select value={formData.pattern} onChange={handlePatternChange}>
                {patterns.map(p => (
                  <option key={p.value} value={p.value}>{p.en}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'రంగు' : 'Color'}</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'రంగు (తెలుగు)' : 'Color (Telugu)'}</label>
              <input
                type="text"
                name="colorTelugu"
                value={formData.colorTelugu}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>{isTelugu ? 'ధర & స్టాక్' : 'Pricing & Stock'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'రీటెయిల్ ధర' : 'Retail Price'}</label>
              <input
                type="number"
                name="retailPrice"
                value={formData.retailPrice}
                onChange={handleInputChange}
                step="10"
              />
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'బందీ ధర' : 'Wholesale Price'}</label>
              <input
                type="number"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleInputChange}
                step="10"
              />
            </div>
            <div className="form-group">
              <label>{isTelugu ? 'స్టాక్' : 'Stock'}</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h2>{isTelugu ? 'చిత్రాలు' : 'Images'}</h2>

          {/* Existing Images */}
          {safeExistingImages.length > 0 && (
            <div className="images-section">
              <h3>{isTelugu ? 'ప్రస్తుత చిత్రాలు' : 'Current Images'}</h3>
              <div className="image-previews">
                {safeExistingImages.map((img, index) => (
                  <div key={img?.public_id || img?._id || getImageUrl(img) || index} className="image-preview-item">
                    <img src={getImageUrl(img)} alt="Current" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeExistingImage(img?.public_id || img?._id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New */}
          <div
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              id="new-images"
              style={{ display: 'none' }}
            />
            <label htmlFor="new-images" className="upload-label">
              <div className="upload-icon">➕</div>
              <div className="upload-text">
                {isTelugu ? 'నవ చిత్రాలు జోడించండి' : 'Add More Images'}
              </div>
            </label>
          </div>

          {/* New Image Previews */}
          {safeNewImages.length > 0 && (
            <div className="images-section">
              <h3>{isTelugu ? 'కొత్త చిత్రాలు' : 'New Images'}</h3>
              <div className="image-previews">
                {safeNewImages.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={img.preview} alt="New" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeNewImage(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="image-count">
            {safeExistingImages.length + safeNewImages.length}/5 {isTelugu ? 'చిత్రాలు' : 'images'}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={saving}
          >
            {saving
              ? isTelugu ? 'సేవ్ చేస్తోంది...' : 'Saving...'
              : isTelugu ? 'సరీని నవీకరించండి' : 'Update Saree'}
          </button>
        </div>
      </form>
    </div>
  );
}
