import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { API_BASE_URL } from '../../config/api';
import { clearAuthSession, getAuthHeaders } from '../../utils/auth';
import '../../styles/SimpleBatchUpload.css';

export default function SimpleBatchUpload({ onBatchCreated }) {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    price: '',
    title: '',
    category: 'Other',
    description: '',
  });

  const [images, setImages] = useState([]);

  const categories = [
    { value: 'Wedding', en: 'Wedding', te: 'వివాహం' },
    { value: 'Casual', en: 'Casual', te: 'సామాన్యం' },
    { value: 'Budget', en: 'Budget', te: 'బడ్జెట్' },
    { value: 'Other', en: 'Other', te: 'ఇతరం' },
  ];

  useEffect(() => {
    console.group('SimpleBatchUpload Debug');
    console.log('Form data:', formData);
    console.log('Images:', images);
    console.groupEnd();
  }, [formData, images]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection from input
  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  // Process files
  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));

    // Validate file count
    if (validFiles.length + images.length > 50) {
      setError(isTelugu ? 'గరిష్టంగా 50 చిత్రాలు అనుమతించబడ్డాయి' : 'Maximum 50 images allowed');
      return;
    }

    // Validate file size
    const invalidFiles = validFiles.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(isTelugu ? 'కొన్ని ఫైల్‌లు 5MB కంటే ఎక్కువ ఉన్నాయి' : 'Some files are larger than 5MB');
      return;
    }

    // Add files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: e.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = Number(String(formData.price).trim());

    // Validate
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError(isTelugu ? 'ధర అవసరమైనది' : 'Price is required');
      return;
    }

    if (images.length === 0) {
      setError(isTelugu ? 'కనీసం ఒక చిత్రం అవసరమైనది' : 'At least one image is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create FormData
      const uploadFormData = new FormData();
      uploadFormData.append('price', String(numericPrice));
      if (formData.title.trim()) {
        uploadFormData.append('title', formData.title.trim());
      }
      uploadFormData.append('category', formData.category);
      if (formData.description.trim()) {
        uploadFormData.append('description', formData.description.trim());
      }

      // Append all image files
      images.forEach((img) => {
        uploadFormData.append('images', img.file);
      });

      // Get token from localStorage
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        throw new Error(isTelugu ? 'లాగిన్ సమయం ముగిసిపోయింది' : 'Session expired');
      }

      // Send request
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: uploadFormData,
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          isTelugu
            ? `బ్యాచ్ సఫలంగా సృష్టించబడింది! (${images.length} చిత్రాలు)`
            : `Batch created successfully! (${images.length} images)`
        );

        // Reset form
        setFormData({
          price: '',
          title: '',
          category: 'Other',
          description: '',
        });
        setImages([]);

        // Callback to parent
        if (onBatchCreated) {
          setTimeout(() => onBatchCreated(), 1500);
        }
      } else {
        const errorMsg = data.message || data.error || (isTelugu ? 'ఎరర్ సంభవించింది' : 'An error occurred');
        setError(`${errorMsg}${data.error ? ' (' + data.error + ')' : ''}`);
      }
    } catch (err) {
      setError(
        `${isTelugu ? 'సర్వర్ ఎరర్' : 'Server error'}: ${err.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-upload-container">
      <form onSubmit={handleSubmit} className="batch-upload-form">
        {/* Header */}
        <div className="form-header">
          <h2>{isTelugu ? 'నవ సరీ బ్యాచ్ అప్‌లోడ్ చేయండి' : 'Upload Saree Batch'}</h2>
          <p className="subtitle">
            {isTelugu ? 'ఒక ధరకు అనేక చిత్రాలను అప్‌లోడ్ చేయండి' : 'Upload multiple images with one price'}
          </p>
        </div>

        {/* Price Input (REQUIRED) */}
        <div className="form-group">
          <label className="form-label required">
            {isTelugu ? 'ధర (₹)' : 'Price (₹)'}
          </label>
          <input
            type="number"
            name="price"
            placeholder={isTelugu ? 'ధర ఎంటర్ చేయండి' : 'Enter price'}
            value={formData.price}
            onChange={handleInputChange}
            className="form-input price-input"
            required
          />
        </div>

        {/* Title Input (OPTIONAL) */}
        <div className="form-group">
          <label className="form-label optional">
            {isTelugu ? 'శీర్షిక' : 'Title'} ({isTelugu ? 'ఐచ్ఛికం' : 'Optional'})
          </label>
          <input
            type="text"
            name="title"
            placeholder={isTelugu ? 'ఉదా: ఉత్సవ సరీలు' : 'E.g., Festival Sarees'}
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        {/* Category Select (OPTIONAL) */}
        <div className="form-group">
          <label className="form-label optional">
            {isTelugu ? 'వర్గం' : 'Category'} ({isTelugu ? 'ఐచ్ఛికం' : 'Optional'})
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {isTelugu ? cat.te : cat.en}
              </option>
            ))}
          </select>
        </div>

        {/* Description (OPTIONAL) */}
        <div className="form-group">
          <label className="form-label optional">
            {isTelugu ? 'వివరణ' : 'Description'} ({isTelugu ? 'ఐచ్ఛికం' : 'Optional'})
          </label>
          <textarea
            name="description"
            placeholder={isTelugu ? 'చిన్న వివరణ...' : 'Brief description...'}
            value={formData.description}
            onChange={handleInputChange}
            className="form-input textarea-input"
            rows="3"
          />
        </div>

        {/* Bulk Image Upload Zone */}
        <div
          className={`upload-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFilePicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
        >
          <div className="upload-zone-content">
            <p className="upload-icon">📸</p>
            <p className="upload-title">
              {isTelugu ? 'చిత్రాలను ఇక్కడ డ్రాగ్ చేయండి' : 'Drag images here'}
            </p>
            <p className="upload-hint">
              {isTelugu ? 'లేదా క్లిక్ చేసి ఫైల్‌లను ఎంచుకోండి' : 'or click to select files'}
            </p>
            <p className="upload-limit">
              {isTelugu ? 'గరిష్టంగా 50 చిత్రాలు' : 'Max 50 images'}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              ref={fileInputRef}
            />
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>
                {isTelugu ? 'ఎంచుకున్న చిత్రాలు' : 'Selected Images'} ({images.length})
              </h3>
            </div>
            <div className="preview-grid">
              {images.map((img, i) => (
                <div key={i} className="preview-item">
                  <img src={img.preview} alt={`Preview ${i + 1}`} />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(i)}
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <p className="preview-number">{i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn primary-btn"
            disabled={loading || !formData.price || images.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {isTelugu ? 'అప్‌లోడ్ చేస్తున్నారు...' : 'Uploading...'}
              </>
            ) : (
              <>
                <span>📤</span>
                {isTelugu ? 'బ్యాచ్ అప్‌లోడ్ చేయండి' : 'Upload Batch'} ({images.length})
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
