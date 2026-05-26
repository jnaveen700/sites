import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import '../../styles/SareeCard.css';

export default function SareeCard({
  saree,
  customerType = 'retail', // 'retail' or 'wholesale'
  onViewDetails,
  onAddToCart,
}) {
  const { t, isTelugu } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  // Check if this is a new saree (within 7 days)
  const isNewDrop = () => {
    const createdDate = new Date(saree.createdAt);
    const today = new Date();
    const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  // Get price based on customer type
  const getPrice = () => {
    if (customerType === 'wholesale') {
      return saree.wholesalePrice;
    }
    return saree.retailPrice;
  };

  // Get discount percentage if wholesale
  const getDiscount = () => {
    if (customerType === 'wholesale' && saree.retailPrice > saree.wholesalePrice) {
      const discount = Math.round(
        ((saree.retailPrice - saree.wholesalePrice) / saree.retailPrice) * 100
      );
      return discount;
    }
    return 0;
  };

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAdding(true);

    try {
      await onAddToCart(saree);
      setAddedMessage(isTelugu ? '✅ కార్టుకు జోడించబడింది' : '✅ Added to Cart');
      setTimeout(() => {
        setAddedMessage('');
      }, 2000);
    } catch (err) {
      setAddedMessage(isTelugu ? '❌ ఎరర్' : '❌ Error');
    } finally {
      setIsAdding(false);
    }
  };

  // Stock status
  const getStockStatus = () => {
    if (saree.stock === 0) {
      return { label: isTelugu ? 'కొనుగోలు చేయలేనిది' : 'Out of Stock', type: 'empty' };
    } else if (saree.stock < 5) {
      return { label: isTelugu ? 'చాలా తక్కువ' : 'Very Limited', type: 'low' };
    } else if (saree.stock < 15) {
      return { label: isTelugu ? 'తక్కువ స్టాక్' : 'Limited Stock', type: 'medium' };
    }
    return { label: isTelugu ? 'స్టాక్‌లో' : 'In Stock', type: 'good' };
  };

  const stockStatus = getStockStatus();
  const discount = getDiscount();
  const price = getPrice();
  const isNewDrop_ = isNewDrop();

  return (
    <div
      className="saree-card"
      onClick={onViewDetails}
    >
      {/* Image Section */}
      <div className="card-image-wrapper">
        {/* Badges */}
        <div className="card-badges">
          {isNewDrop_ && (
            <span className="badge-new">
              {isTelugu ? '🆕 కొత్త' : '🆕 NEW'}
            </span>
          )}
          {discount > 0 && (
            <span className="badge-discount">
              {isTelugu ? `${discount}% ছাড়` : `${discount}% OFF`}
            </span>
          )}
        </div>

        {/* Main Image */}
        <div className="card-image">
          {saree.images && saree.images.length > 0 ? (
            <img src={saree.images[0].url} alt={saree.designName} />
          ) : (
            <div className="no-image-placeholder">📷</div>
          )}
        </div>

        {/* Overlay with Stock Status */}
        <div className="card-overlay">
          <span className={`stock-status stock-${stockStatus.type}`}>
            {stockStatus.label}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          className="btn-quick-add"
          onClick={handleAddToCart}
          disabled={isAdding || saree.stock === 0}
          title={isTelugu ? 'కార్టుకు జోడించండి' : 'Add to cart'}
        >
          {isAdding ? '⏳' : '🛒'}
        </button>

        {/* Added Message */}
        {addedMessage && (
          <div className="added-message">
            {addedMessage}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="card-content">
        {/* Title */}
        <h3 className="card-title">
          {isTelugu ? saree.designNameTelugu : saree.designName}
        </h3>

        {/* Tags */}
        <div className="card-tags">
          <span className="tag">
            {isTelugu ? saree.materialTelugu : saree.material}
          </span>
          <span className="tag">
            {isTelugu ? saree.patternTelugu : saree.pattern}
          </span>
        </div>

        {/* Pricing */}
        <div className="card-pricing">
          <div className="price-main">
            <span className="price-amount">₹{price.toLocaleString()}</span>
            <span className="price-type">
              {customerType === 'wholesale'
                ? isTelugu ? 'బందీ' : 'Wholesale'
                : isTelugu ? 'రీటెయిల్' : 'Retail'}
            </span>
          </div>

          {/* Original price if discount exists */}
          {discount > 0 && (
            <span className="price-original">
              ₹{saree.retailPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Color (optional) */}
        {saree.color && (
          <div className="card-color">
            <span className="color-label">
              {isTelugu ? 'రంగు' : 'Color'}:
            </span>
            <span className="color-name">
              {isTelugu ? saree.colorTelugu : saree.color}
            </span>
          </div>
        )}

        {/* CTA */}
        <button
          className="btn-view-details"
          onClick={onViewDetails}
        >
          {isTelugu ? 'సంపూర్ణ చూడండి →' : 'View Collection →'}
        </button>
      </div>

      {/* Stock Indicator Bar */}
      {saree.stock > 0 && saree.stock < 20 && (
        <div className="stock-bar">
          <div
            className="stock-fill"
            style={{ width: `${(saree.stock / 20) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
