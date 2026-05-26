import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/Contact.css';

export default function Contact() {
  const { isTelugu } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      isTelugu
        ? 'నమస్కారం, నేను హోల్‌సేల్ సరీస్ గురించి సమాచారం కావాలి.'
        : 'Hello, I would like information about wholesale sarees.'
    );

    window.open(
      `https://wa.me/918977430700?text=${message}`,
      '_blank'
    );
  };

  return (
    <div className="contact-page">

      <section className="hero-section">
        <h1 className="hero-title">
          {isTelugu ? 'సంప్రదించండి' : 'Contact Us'}
        </h1>

        <p className="hero-subtitle">
          {isTelugu
            ? 'హోల్‌సేల్ సరీస్ కోసం 24/7 సేవ'
            : 'For Wholesale Sarees - Available 24/7'}
        </p>
      </section>

      <section className="contact-section">
        <div className="contact-container">

          <div className="contact-info">

            <h2>
              {isTelugu
                ? 'సంప్రదింపు సమాచారం'
                : 'Contact Information'}
            </h2>

            <div className="info-item">
              <div className="info-icon">📍</div>

              <div className="info-content">
                <h3>
                  {isTelugu ? 'చిరునామా' : 'Address'}
                </h3>

                <p>
                  D.No. 17/837/20-A,
                  <br />
                  Kranthi Nagar,
                  <br />
                  Adoni - 518301
                  <br />
                  India
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>

              <div className="info-content">
                <h3>
                  {isTelugu ? 'ఫోన్' : 'Phone'}
                </h3>

                <p>
                  {isTelugu ? 'ప్రధానం' : 'Primary'}:{' '}
                  <a href="tel:+918977430700">
                    +91 89774 30700
                  </a>
                  <br />
                  {isTelugu ? 'ప్రత్యామ్నాయం' : 'Alternate'}:{' '}
                  <a href="tel:+919490210700">
                    +91 94902 10700
                  </a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📧</div>

              <div className="info-content">
                <h3>
                  {isTelugu ? 'ఇమెయిల్' : 'Email'}
                </h3>

                <p>
                  <a href="mailto:sreebalajifabricsadoni@gmail.com">
                    sreebalajifabricsadoni@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📋</div>

              <div className="info-content">
                <h3>GST Number</h3>

                <p>37AVVPC7172RIZI</p>
              </div>
            </div>

            <div className="info-item highlight">
              <div className="info-icon">💬</div>

              <div className="info-content">
                <h3>WhatsApp</h3>

                <p>
                  {isTelugu
                    ? 'తక్షణ స్పందన కోసం'
                    : 'For instant responses'}
                </p>

                <button
                  className="whatsapp-btn"
                  onClick={handleWhatsAppClick}
                >
                  {isTelugu
                    ? 'WhatsApp లో సంప్రదించండి'
                    : 'Message on WhatsApp'}
                </button>
              </div>
            </div>
          </div>

          <div className="contact-form-container">

            <h2>
              {isTelugu
                ? 'సంప్రదింపు ఫారం'
                : 'Send us a Message'}
            </h2>

            {submitted && (
              <div className="success-message">
                {isTelugu
                  ? 'మీ సందేశం పంపబడింది'
                  : 'Your message has been sent'}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="contact-form"
            >

              <div className="form-group">
                <label>
                  {isTelugu ? 'పేరు' : 'Name'}
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
                  {isTelugu ? 'ఇమెయిల్' : 'Email'}
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
                  {isTelugu ? 'ఫోన్' : 'Phone'}
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  {isTelugu ? 'విషయం' : 'Subject'}
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  {isTelugu ? 'సందేశం' : 'Message'}
                </label>

                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
              >
                {isTelugu
                  ? 'సందేశం పంపండి'
                  : 'Send Message'}
              </button>

            </form>
          </div>

        </div>
      </section>
    </div>
  );
}