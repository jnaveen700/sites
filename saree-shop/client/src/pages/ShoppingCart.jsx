import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import { useCart } from '../context/CartContext';
import { getImageUrl, renderTextValue } from '../utils/imageHelpers';
import '../styles/ShoppingCart.css';

export default function ShoppingCart() {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [sarees, setSarees] = useState({});
  const [loading, setLoading] = useState(true);
  const [gstRate, setGstRate] = useState(0.18); // 18% GST default
  const [error, setError] = useState('');

  // Fetch all sarees to get details for cart items
  useEffect(() => {
    const fetchSarees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/sarees`);
        if (!response.ok) throw new Error('Failed to fetch sarees');
        
        const data = await response.json();
        const sareeMap = {};
        data.data.forEach(saree => {
          sareeMap[saree._id] = saree;
        });
        setSarees(sareeMap);
        setError('');
      } catch (err) {
        console.error('Error fetching sarees:', err);
        setError(isTelugu ? 'సరీలను లోడ్ చేయడం విఫలమైంది' : 'Failed to load saree details');
      } finally {
        setLoading(false);
      }
    };

    if (cart.length > 0) {
      fetchSarees();
    } else {
      setLoading(false);
    }
  }, [cart, isTelugu]);

  useEffect(() => {
    console.group('Cart Debug');
    console.log('Cart:', cart);
    console.log('Sarees map keys:', Object.keys(sarees || {}));
    console.groupEnd();
  }, [cart, sarees]);

  const gstAmount = cartTotal * gstRate;
  const finalTotal = cartTotal + gstAmount;

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(isTelugu ? 'దయచేసి అంశాలను కార్ట్‌కు జోడించండి' : 'Please add items to cart');
      return;
    }
    navigate('/checkout', { state: { cart, total: finalTotal } });
  };

  if (loading) {
    return (
      <div className="shopping-cart loading">
        <div className="spinner"></div>
        <p>{isTelugu ? 'లోడ్ చేస్తున్నారు...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h1>{isTelugu ? '🛒 కార్ట్' : '🛒 Shopping Cart'}</h1>
        <p>
          {isTelugu
            ? `${cart.length} సరీలు`
            : `${cart.length} item${cart.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="cart-container">
        {/* CART ITEMS */}
        <div className="cart-items-section">
          {error && <div className="error-banner">{error}</div>}

          {cart.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-icon">🛍️</span>
              <h2>{isTelugu ? 'కార్ట్ ఖాళీగా ఉంది' : 'Your Cart is Empty'}</h2>
              <p>
                {isTelugu
                  ? 'సరీలను కార్ట్‌కు జోడించండి మరియు కొనుగోలు కొనండి'
                  : 'Add some beautiful sarees to get started!'}
              </p>
              <button className="continue-btn" onClick={handleContinueShopping}>
                {isTelugu ? 'సరీలను బ్రౌజ్ చేయండి' : 'Browse Sarees'}
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {/* HEADER ROW */}
              <div className="cart-item header">
                <div className="item-product">{isTelugu ? 'ఉత్పత్తి' : 'Product'}</div>
                <div className="item-price">{isTelugu ? 'ధర' : 'Price'}</div>
                <div className="item-quantity">{isTelugu ? 'పరిమాణం' : 'Quantity'}</div>
                <div className="item-total">{isTelugu ? 'మొత్తం' : 'Total'}</div>
                <div className="item-action"></div>
              </div>

              {/* ITEMS */}
              {cart.map((cartItem) => {
                const saree = sarees[cartItem.sareeId];
                if (!saree) return null;

                const itemTotal = cartItem.price * cartItem.quantity;

                return (
                  <div key={`${cartItem.sareeId}-${cartItem.customerType}`} className="cart-item">
                    {/* PRODUCT INFO */}
                    <div className="item-product">
                      <div className="product-image">
                        {saree.images && saree.images[0] && (
                          <img
                            src={getImageUrl(saree.images?.[0])}
                            alt={renderTextValue(saree.designName, 'Saree image')}
                          />
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{renderTextValue(saree.designName, 'Saree')}</h3>
                        {saree.designNameTelugu && (
                          <p className="product-name-te">{renderTextValue(saree.designNameTelugu)}</p>
                        )}
                        <p className="product-meta">
                          {renderTextValue(saree.material)} • {renderTextValue(saree.pattern)}
                        </p>
                        <p className="customer-type">
                          {cartItem.customerType === 'wholesale'
                            ? (isTelugu ? '🏢 హోల్‌సేల్' : '🏢 Wholesale')
                            : (isTelugu ? '🛍️ రిటైల్' : '🛍️ Retail')}
                        </p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="item-price">
                      <span className="price-label">{isTelugu ? 'ధర' : 'Price'}</span>
                      <span className="price-value">₹{cartItem.price}</span>
                    </div>

                    {/* QUANTITY */}
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.sareeId, cartItem.customerType, cartItem.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={cartItem.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              cartItem.sareeId,
                              cartItem.customerType,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          min="1"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.sareeId, cartItem.customerType, cartItem.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* TOTAL */}
                    <div className="item-total">
                      <span className="total-label">{isTelugu ? 'మొత్తం' : 'Total'}</span>
                      <span className="total-value">₹{itemTotal}</span>
                    </div>

                    {/* REMOVE BUTTON */}
                    <div className="item-action">
                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeFromCart(cartItem.sareeId, cartItem.customerType)
                        }
                        title={isTelugu ? 'తీసివేయండి' : 'Remove'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CART SUMMARY */}
        {cart.length > 0 && (
          <div className="cart-summary-section">
            <div className="summary-box">
              <h2>{isTelugu ? 'ఆర్డర్ సారాంశం' : 'Order Summary'}</h2>

              <div className="summary-row">
                <span>{isTelugu ? 'సబ్‌టోటల్' : 'Subtotal'}:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>{isTelugu ? 'GST (18%)' : 'GST (18%)'}:</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="summary-row shipping">
                <span>{isTelugu ? 'డెలివరీ' : 'Delivery'}:</span>
                <span className="free">{isTelugu ? 'ఉచితం' : 'FREE'}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>{isTelugu ? 'మొత్తం' : 'Total'}</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              <p className="summary-note">
                {isTelugu
                  ? 'ఉచిత డెలివరీ ₹500 కంటే ఎక్కువ ఆర్డర్‌కు'
                  : 'Free delivery on orders above ₹500'}
              </p>

              <button className="checkout-btn" onClick={handleCheckout}>
                {isTelugu ? '💳 చెక్‌అవుట్‌కు వెళ్లండి' : '💳 Proceed to Checkout'}
              </button>

              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                {isTelugu ? 'కేటలాగ్‌కు వెళ్లండి' : 'Continue Shopping'}
              </button>

              {/* PROMO CODE */}
              <div className="promo-section">
                <input
                  type="text"
                  placeholder={isTelugu ? 'ప్రోమో కోడ్ (భవిష్యత్‌)' : 'Promo Code (Coming Soon)'}
                  disabled
                  className="promo-input"
                />
              </div>
            </div>

            {/* PAYMENT INFO */}
            <div className="info-box">
              <h3>{isTelugu ? 'చెక్‌అవుట్ గురించి' : 'About Checkout'}</h3>
              <ul>
                <li>
                  <span className="info-icon">🔒</span>
                  <span>{isTelugu ? '100% సురక్షిత చెక్‌అవుట్' : '100% Secure checkout'}</span>
                </li>
                <li>
                  <span className="info-icon">💳</span>
                  <span>{isTelugu ? 'బహుళ చెల్లింపు ఎంపికలు' : 'Multiple payment options'}</span>
                </li>
                <li>
                  <span className="info-icon">🚚</span>
                  <span>{isTelugu ? '7 రోజుల రిటర్న్' : '7-days easy returns'}</span>
                </li>
                <li>
                  <span className="info-icon">🎁</span>
                  <span>{isTelugu ? 'భారీ ఆర్డర్‌కు విशేష ఆఫర్' : 'Special offers for bulk orders'}</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
