import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { clearAuthSession, getAuthHeaders } from '../../utils/auth';
import '../../styles/AddSaree.css';

export default function AddSaree({ onAdded }) {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const toNumber = (value) => Number(String(value).trim());

  useEffect(() => {
    console.group('AddSaree Debug');
    console.log('Form data:', formData);
    console.log('Images:', images);
    console.groupEnd();
  }, [formData, images]);

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
    const files = Array.from(fileList);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length + images.length > 5) {
      setError(isTelugu ? 'గరిష్టంగా 5 చిత్రాలు అనుమతించబడ్డాయి' : 'Maximum 5 images allowed');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    // Validation
    if (!formData.designName.trim()) {
      setError(isTelugu ? 'డిజైన్ పేరు అవసరం' : 'Design name is required');
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

    if (images.length === 0) {
      setError(isTelugu ? 'కనీసం 1 చిత్రం అవసరం' : 'At least 1 image is required');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      
      // Add text fields
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

      // Add image files
      images.forEach((img) => {
        uploadFormData.append('images', img.file);
      });

      // Send to backend
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
      }

      const response = await fetch(`${API_BASE_URL}/sarees`, {
        method: 'POST',
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
        setSuccess(isTelugu ? 'సరీ విజయవంతంగా జోడించబడింది!' : 'Saree added successfully!');
        // Reset form
        setFormData({
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
        setImages([]);
        setTimeout(() => onAdded(), 1500);
      } else {
        const data = await response.json();
        setError(data.message || (isTelugu ? 'ఎ러ర్ సంభవించింది' : 'An error occurred'));
      }
    } catch (err) {
      setError(isTelugu ? 'సర్వర్ ఎరర్' : 'Server error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-saree-container">
      <form onSubmit={handleSubmit} className="add-saree-form">
        {/* Messages */}
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-section">
          <h2>{isTelugu ? 'ప్రాథమిక వివరాలు' : 'Basic Details'}</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'డిజైన్ పేరు (English)' : 'Design Name (English)'}</label>
              <input
                type="text"
                name="designName"
                value={formData.designName}
                onChange={handleInputChange}
                placeholder={isTelugu ? 'ఉదా: రెడ్ సిల్క్ సరీ' : 'E.g., Red Silk Saree'}
              />
            </div>

            <div className="form-group">
              <label>{isTelugu ? 'డిజైన్ పేరు (తెలుగు)' : 'Design Name (Telugu)'}</label>
              <input
                type="text"
                name="designNameTelugu"
                value={formData.designNameTelugu}
                onChange={handleInputChange}
                placeholder="ఉదా: ఎరుపు సిల్క్ సరీ"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'వర్ణన (English)' : 'Description (English)'}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={isTelugu ? 'సరీ గురించి వివరించండి' : 'Describe the saree'}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>{isTelugu ? 'వర్ణన (తెలుగు)' : 'Description (Telugu)'}</label>
              <textarea
                name="descriptionTelugu"
                value={formData.descriptionTelugu}
                onChange={handleInputChange}
                placeholder="సరీ గురించి వివరించండి"
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
                  <option key={m.value} value={m.value}>
                    {m.en} ({m.te})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{isTelugu ? 'నమూనా' : 'Pattern'}</label>
              <select value={formData.pattern} onChange={handlePatternChange}>
                {patterns.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.en} ({p.te})
                  </option>
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
                placeholder={isTelugu ? 'ఉదా: ఎరుపు, నీలం' : 'E.g., Red, Blue'}
              />
            </div>

            <div className="form-group">
              <label>{isTelugu ? 'రంగు (తెలుగు)' : 'Color (Telugu)'}</label>
              <input
                type="text"
                name="colorTelugu"
                value={formData.colorTelugu}
                onChange={handleInputChange}
                placeholder="ఉదా: ఎరుపు, నీలం"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>{isTelugu ? 'ధర & స్టాక్' : 'Pricing & Stock'}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>{isTelugu ? 'రీటెయిల్ ధర (₹)' : 'Retail Price (₹)'}</label>
              <input
                type="number"
                name="retailPrice"
                value={formData.retailPrice}
                onChange={handleInputChange}
                placeholder="2500"
                step="10"
              />
            </div>

            <div className="form-group">
              <label>{isTelugu ? 'బందీ ధర (₹)' : 'Wholesale Price (₹)'}</label>
              <input
                type="number"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleInputChange}
                placeholder="1800"
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
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <h2>{isTelugu ? 'చిత్రాలను అప్‌లోడ్ చేయండి' : 'Upload Images'}</h2>
          <p className="section-hint">
            {isTelugu
              ? 'గరిష్టంగా 5 చిత్రాలు - క్లిక్ చేయండి లేదా ఎడ్డా వేయండి'
              : 'Maximum 5 images - click or drag & drop'}
          </p>

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
              id="image-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="image-input" className="upload-label">
              <div className="upload-icon">🖼️</div>
              <div className="upload-text">
                {isTelugu ? 'చిత్రాలను ఆన్‌లోడ్ చేయండి' : 'Upload Images'}
              </div>
              <div className="upload-hint">
                {isTelugu
                  ? 'ఇక్కడ క్లిక్ చేయండి లేదా చిత్రాలను ఎడ్డా వేయండి'
                  : 'Click here or drag images'}
              </div>
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="image-previews">
              {images.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <img src={img.preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="image-count">
            {images.length}/5 {isTelugu ? 'చిత్రాలు' : 'images'}
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading
              ? isTelugu
                ? 'జోడిస్తోంది...'
                : 'Adding...'
              : isTelugu
              ? 'సరీని జోడించండి'
              : 'Add Saree'}
          </button>
        </div>
      </form>
    </div>
  );
}
