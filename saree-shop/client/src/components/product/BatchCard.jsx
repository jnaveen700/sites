import { useLanguage } from '../../hooks/useLanguage';
import '../../styles/BatchCard.css';

export default function BatchCard({ batch, onViewDetails }) {
  const { isTelugu } = useLanguage();

  // Check if this is a new batch (within 7 days)
  const isNewDrop = () => {
    const createdDate = new Date(batch.createdAt);
    const today = new Date();
    const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  const isNewDrop_ = isNewDrop();
  const imageCount = batch.images ? batch.images.length : 0;

  return (
    <div className="batch-card" onClick={onViewDetails}>
      {/* Image Section */}
      <div className="card-image-wrapper">
        {/* Badges */}
        <div className="card-badges">
          {isNewDrop_ && (
            <span className="badge-new">
              {isTelugu ? '🆕 కొత్త' : '🆕 NEW'}
            </span>
          )}
          <span className="badge-batch">
            📸 {imageCount} {isTelugu ? 'చిత్రాలు' : 'Images'}
          </span>
        </div>

        {/* Main Image */}
        <div className="card-image">
          {batch.images && batch.images.length > 0 ? (
            <img src={batch.images[0].url} alt={batch.title || 'Batch'} />
          ) : (
            <div className="no-image-placeholder">📸</div>
          )}
        </div>

        {/* Overlay */}
        <div className="card-overlay">
          <span className="image-count-overlay">
            {isTelugu ? `${imageCount} చిత్రాలు` : `${imageCount} images`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        {/* Title */}
        {batch.title && (
          <h3 className="card-title">
            {batch.title}
          </h3>
        )}

        {/* Category Tag */}
        {batch.category && (
          <div className="card-tags">
            <span className="tag">
              {batch.category}
            </span>
          </div>
        )}

        {/* Description */}
        {batch.description && (
          <p className="card-description">
            {batch.description}
          </p>
        )}

        {/* Pricing */}
        <div className="card-pricing">
          <div className="price-main">
            <span className="price-amount">₹{batch.price.toLocaleString()}</span>
            <span className="price-type">
              {isTelugu ? 'ధర' : 'Price'}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button className="btn-view-details" onClick={onViewDetails}>
          {isTelugu ? 'సంపూర్ణ చూడండి →' : 'View Collection →'}
        </button>
      </div>
    </div>
  );
}
