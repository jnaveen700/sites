import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../context/CartContext';
import '../styles/Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();
  const { cartItems, getTotalPrice } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const gstRate = 0.05;
  const subtotal = getTotalPrice();
  const gst = subtotal * gstRate;
  const shipping = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + gst + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    setOrderPlaced(true);

    setTimeout(() => {
      navigate('/home');
    }, 3000);
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <section className="empty-cart">

          <h1>
            {isTelugu
              ? 'మీ కార్ట్ ఖాళీగా ఉంది'
              : 'Your Cart is Empty'}
          </h1>

          <p>
            {isTelugu
              ? 'కొన్ని సరీస్ జోడించి తిరిగి రండి'
              : 'Add some sarees and come back'}
          </p>

          <button
            onClick={() => navigate('/catalog')}
            className="continue-btn"
          >
            {isTelugu
              ? 'సరీస్ చూడండి'
              : 'Browse Collections'}
          </button>

        </section>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <section className="hero-section">

        <h1 className="hero-title">
          {isTelugu ? 'చెక్‌అవుట్' : 'Checkout'}
        </h1>

        <p className="hero-subtitle">
          {isTelugu
            ? 'మీ ఆర్డర్ పూర్తి చేయండి'
            : 'Complete your order'}
        </p>

      </section>

      <section className="checkout-section">

        <div className="checkout-container">

          {/* ORDER SUMMARY */}
          <div className="order-summary">

            <h2>
              {isTelugu
                ? 'ఆర్డర్ సారాంశం'
                : 'Order Summary'}
            </h2>

            <div className="order-items">

              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="order-item"
                >

                  <div className="item-details">
                    <p className="item-name">
                      {item.name}
                    </p>

                    <p className="item-price">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <p className="item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>

                </div>
              ))}

            </div>

            <div className="pricing-breakdown">

              <div className="breakdown-item">
                <span>
                  {isTelugu ? 'సబ్‌టోటల్' : 'Subtotal'}
                </span>

                <span>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="breakdown-item">
                <span>GST (5%)</span>

                <span>
                  ₹{gst.toFixed(2)}
                </span>
              </div>

              <div className="breakdown-item">
                <span>
                  {isTelugu ? 'షిప్పింగ్' : 'Shipping'}
                </span>

                <span>
                  ₹{shipping.toFixed(2)}
                </span>
              </div>

              <div className="breakdown-item total">
                <span>
                  {isTelugu ? 'మొత్తం' : 'Total'}
                </span>

                <span>
                  ₹{total.toFixed(2)}
                </span>
              </div>

            </div>

            <div className="gst-info">
              <p>
                <strong>GST Number:</strong>
                {' '}
                37AVVPC7172RIZI
              </p>
            </div>

          </div>

          {/* CHECKOUT FORM */}
          <div className="checkout-form-container">

            {orderPlaced ? (

              <div className="success-section">

                <div className="success-icon">
                  ✓
                </div>

                <h2>
                  {isTelugu
                    ? 'ఆర్డర్ విజయవంతంగా పంపబడింది'
                    : 'Order Placed Successfully'}
                </h2>

                <p>
                  {isTelugu
                    ? 'ధన్యవాదాలు'
                    : 'Thank you for your order'}
                </p>

              </div>

            ) : (

              <form
                onSubmit={handlePlaceOrder}
                className="checkout-form"
              >

                <h2>
                  {isTelugu
                    ? 'షిప్పింగ్ చిరునామా'
                    : 'Shipping Address'}
                </h2>

                <div className="form-group">
                  <label>
                    {isTelugu
                      ? 'పూర్తి పేరు'
                      : 'Full Name'}
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    {isTelugu
                      ? 'ఇమెయిల్'
                      : 'Email'}
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    {isTelugu
                      ? 'ఫోన్'
                      : 'Phone'}
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    {isTelugu
                      ? 'చిరునామా'
                      : 'Address'}
                  </label>

                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">

                  <div className="form-group">
                    <label>
                      {isTelugu ? 'నగరం' : 'City'}
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {isTelugu ? 'రాష్ట్రం' : 'State'}
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {isTelugu ? 'పిన్ కోడ్' : 'Pincode'}
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <h3
                  style={{
                    marginTop: '2rem',
                    color: '#5c3d2e',
                  }}
                >
                  {isTelugu
                    ? 'చెల్లింపు విధానం'
                    : 'Payment Method'}
                </h3>

                <div className="payment-options">

                  <label className="payment-option">
                    <input
                      type="radio"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <span>UPI</span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <span>
                      {isTelugu
                        ? 'బ్యాంక్ బదిలీ'
                        : 'Bank Transfer'}
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <span>
                      {isTelugu
                        ? 'కార్డ్'
                        : 'Card'}
                    </span>
                  </label>

                </div>

                <button
                  type="submit"
                  className="place-order-btn"
                >
                  {isTelugu
                    ? 'ఆర్డర్ ఉంచండి'
                    : 'Place Order'}
                  {' '}
                  - ₹{total.toFixed(2)}
                </button>

              </form>

            )}

          </div>

        </div>

      </section>
    </div>
  );
}