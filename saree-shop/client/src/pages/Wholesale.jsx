import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/Wholesale.css';

export default function Wholesale() {
  const { isTelugu } = useLanguage();

  const handleWhatsAppContact = () => {
    const phone = '918977430700';
    const message = encodeURIComponent(isTelugu
      ? 'నమస్కారం, నేను సరఫరా సరీల గురించి విచారణ చేయటానికి ఆసక్తి కలిగి ఉన్నాను.'
      : 'Hello, I am interested in wholesale sarees for my business.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="wholesale-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {isTelugu ? 'సరఫరా సరీలు' : 'Wholesale Sarees'}
          </h1>
          <p className="hero-subtitle">
            {isTelugu
              ? 'ఫ్యాషన్ బూటీక్‌లు, రిటెయిల్ దుకాణాలు, రీసెల్‌లర్‌ల కోసం ప్రిమియం సరీలు'
              : 'Premium Collections for Boutiques, Retailers & Resellers'}
          </p>
          <p className="hero-description">
            {isTelugu
              ? 'సరాసరి సంపూర్ణ సరఫరా, పెద్ద ఆర్డర్ ధరలు, మరియు వ్యక్తిగత సేవా'
              : 'Direct Supply • Competitive Pricing • Personal Service'}
          </p>
          <button className="hero-btn" onClick={handleWhatsAppContact}>
            {isTelugu ? '💬 సరఫరా విచారణ' : '💬 Inquire for Wholesale'}
          </button>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="benefits-section">
        <h2 className="section-title">
          {isTelugu ? 'సరఫరా కర్తగా ఆయుష్యం యొక్క ప్రయోజనాలు' : 'Benefits of Buying Wholesale'}
        </h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>{isTelugu ? 'ధర సుবిధలు' : 'Special Pricing'}</h3>
            <p>{isTelugu
              ? 'పెద్ద ఆర్డర్‌ల కోసం 20-40% తగ్గింపు'
              : 'Get 20-40% discount on bulk orders'}</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📦</div>
            <h3>{isTelugu ? 'అసీమ కస్టమైజేషన్' : 'Custom Orders'}</h3>
            <p>{isTelugu
              ? 'మీ కస్టమర్‌ల కోసం ప్రత్యేక డిజైన్‌లు'
              : 'Exclusive designs tailored for your customers'}</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>{isTelugu ? 'వేగవంతమైన సరఫరా' : 'Quick Dispatch'}</h3>
            <p>{isTelugu
              ? '5-7 రోజుల్లో భారతదేశానికి అంతటా పంపిణీ'
              : 'Dispatch within 5-7 days across India'}</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💳</div>
            <h3>{isTelugu ? 'క్రెడిట్ సదుపాయాలు' : 'Credit Terms'}</h3>
            <p>{isTelugu
              ? 'నమ్మిన వ్యాపారులకు నిబద్ధ ఖాతాలు'
              : 'Credit facilities for established businesses'}</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">✨</div>
            <h3>{isTelugu ? 'ప్రిమియం నాణ్యత' : 'Premium Quality'}</h3>
            <p>{isTelugu
              ? 'ఐతిహ్యవాహక కళ కూలీ నేసిన సరీలు'
              : 'Authentic handcrafted traditional sarees'}</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3>{isTelugu ? 'వ్యక్తిగత సమర్థన' : 'Dedicated Support'}</h3>
            <p>{isTelugu
              ? 'మీ సరఫరా కుటుంబానికి 24/7 సహాయం'
              : '24/7 support for your wholesale orders'}</p>
          </div>
        </div>
      </section>

      {/* BOUTIQUE SUPPLY */}
      <section className="supply-section">
        <h2 className="section-title">
          {isTelugu ? 'ఫ్యాషన్ బూటీక్ సరఫరా' : 'Fashion Boutique Supply'}
        </h2>
        <div className="supply-content">
          <div className="supply-text">
            <h3>{isTelugu ? 'మీ బూటీక్ కోసం ఎక్సక్లూసివ్ సరీలు' : 'Exclusive Collections for Your Boutique'}</h3>
            <p>{isTelugu
              ? 'ప్రతిధారా ట్రెండీ డిజైన్‌లు, ఐతిహ్యవాహక కళ మరియు ఆధునిక శైలీ మిశ్రణం. చిన్న ఆర్డర్‌ల కోసం విలక్షణ ధరలు।'
              : 'Curated designs combining traditional craftsmanship with modern aesthetics. Special pricing for boutique-sized orders.'}</p>
            <ul className="supply-features">
              <li>🎨 {isTelugu ? 'ట్రెండీ డిజైన్‌లు' : 'Trendy Designs'}</li>
              <li>📍 {isTelugu ? 'ప్రత్యేక నమూనాలు' : 'Exclusive Patterns'}</li>
              <li>📦 {isTelugu ? 'చిన్న కంటకుర్‌ కోసం డిజిటల్' : 'Small Quantity Friendly'}</li>
              <li>✨ {isTelugu ? 'ప్రిమియం ఫిన్‌ఇషింగ్' : 'Premium Finishing'}</li>
            </ul>
          </div>
          <div className="supply-image">
            <div className="image-placeholder">🎨</div>
          </div>
        </div>
      </section>

      {/* RETAIL SHOP SUPPLY */}
      <section className="supply-section supply-section-alt">
        <div className="supply-content supply-content-rev">
          <div className="supply-image">
            <div className="image-placeholder">🏪</div>
          </div>
          <div className="supply-text">
            <h3>{isTelugu ? 'రిటెయిల్ దుకాణ సరఫరా' : 'Retail Shop Supply'}</h3>
            <p>{isTelugu
              ? 'ఆपனాను కోసం పెద్ద పరిమాణ సరీ సరఫరా. అన్ని వయస్సులకు, అన్ని సంస్కృతులకు సరీలు. వారానికో కొత్త సంపూర్ణ జోడించండి।'
              : 'Bulk saree supply for established retail shops. Diverse collections for all ages and occasions. Fresh designs added weekly.'}</p>
            <ul className="supply-features">
              <li>📦 {isTelugu ? 'పెద్ద కంటకుర్‌ కమీషన్' : 'Large Order Pricing'}</li>
              <li>🔄 {isTelugu ? 'వారానిక కొత్త నమూనాలు' : 'Weekly New Designs'}</li>
              <li>🚚 {isTelugu ? 'వేగవంతమైన డిసపట్చ్' : 'Fast Dispatch'}</li>
              <li>💰 {isTelugu ? 'రిటర్న్ సదుపాయం' : 'Return Facility'}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BULK ORDERS */}
      <section className="bulk-section">
        <h2 className="section-title">
          {isTelugu ? 'బల్క్ ఆర్డర్‌లు' : 'Bulk Orders'}
        </h2>
        <div className="bulk-content">
          <div className="bulk-card">
            <h3>🎯 {isTelugu ? '10-50 సరీలు' : '10-50 Sarees'}</h3>
            <p className="bulk-price">15% {isTelugu ? 'తగ్గింపు' : 'Discount'}</p>
            <p>{isTelugu ? 'ఛోటా సరఫరా కర్తలకు ఆదర్శవంతమైనది' : 'Perfect for small resellers'}</p>
          </div>
          <div className="bulk-card">
            <h3>🎯 {isTelugu ? '50-200 సరీలు' : '50-200 Sarees'}</h3>
            <p className="bulk-price">25% {isTelugu ? 'తగ్గింపు' : 'Discount'}</p>
            <p>{isTelugu ? 'బూటీక్‌లు మరియు చిన్న దుకాణాల కోసం' : 'For boutiques and shops'}</p>
          </div>
          <div className="bulk-card">
            <h3>🎯 {isTelugu ? '200+ సరీలు' : '200+ Sarees'}</h3>
            <p className="bulk-price">35% {isTelugu ? 'తగ్గింపు' : 'Discount'}</p>
            <p>{isTelugu ? 'పెద్ద చేయిన రిటెయిల్‌లకు' : 'For large retail chains'}</p>
          </div>
        </div>
      </section>

      {/* WEEKLY FRESH STOCK */}
      <section className="fresh-stock-section">
        <h2 className="section-title">
          {isTelugu ? 'వారానికో కొత్త సంపూర్ణ' : 'Weekly Fresh Stock'}
        </h2>
        <p className="section-subtitle">
          {isTelugu
            ? 'ప్రతి శుక్రవారం కొత్త డిజైన్‌లు జోడించబడతాయి'
            : 'New designs added every Friday'}
        </p>
        <div className="stock-items">
          <div className="stock-item">
            <div className="stock-icon">🌟</div>
            <h4>{isTelugu ? 'ఆచార్యుల సంపూర్ణ' : 'Traditional Collections'}</h4>
            <p>{isTelugu ? 'తెనాలీ సెట్‌కు సరీలు' : 'Handwoven traditional designs'}</p>
          </div>
          <div className="stock-item">
            <div className="stock-icon">💎</div>
            <h4>{isTelugu ? 'ఆధునిక డిజిటల్‌' : 'Modern Prints'}</h4>
            <p>{isTelugu ? 'కన్నాటు డిజిటల్ నమూనాలు' : 'Contemporary digital prints'}</p>
          </div>
          <div className="stock-item">
            <div className="stock-icon">✨</div>
            <h4>{isTelugu ? 'సీజనల్ కలెక్షన్' : 'Seasonal Specials'}</h4>
            <p>{isTelugu ? 'సీజనల్ రంగులు మరియు డిజైన్‌లు' : 'Seasonal colors and themes'}</p>
          </div>
        </div>
      </section>

      {/* PRICING ADVANTAGES */}
      <section className="pricing-section">
        <h2 className="section-title">
          {isTelugu ? 'ధర సుబిధలు' : 'Pricing Advantages'}
        </h2>
        <div className="pricing-table">
          <table>
            <thead>
              <tr>
                <th>{isTelugu ? 'ఆర్డర్ పరిమాణం' : 'Order Size'}</th>
                <th>{isTelugu ? 'యూనిట్ ధర' : 'Unit Price'}</th>
                <th>{isTelugu ? 'తగ్గింపు' : 'Discount'}</th>
                <th>{isTelugu ? 'డెలివరీ సమయం' : 'Delivery'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10-25</td>
                <td>₹800-1200</td>
                <td>15%</td>
                <td>5-7 {isTelugu ? 'రోజులు' : 'days'}</td>
              </tr>
              <tr>
                <td>25-50</td>
                <td>₹700-1100</td>
                <td>20%</td>
                <td>5-7 {isTelugu ? 'రోజులు' : 'days'}</td>
              </tr>
              <tr>
                <td>50-100</td>
                <td>₹600-1000</td>
                <td>25%</td>
                <td>3-5 {isTelugu ? 'రోజులు' : 'days'}</td>
              </tr>
              <tr>
                <td>100+</td>
                <td>{isTelugu ? 'ఆచారణ చేయండి' : 'Contact us'}</td>
                <td>30-35%</td>
                <td>3-5 {isTelugu ? 'రోజులు' : 'days'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2>{isTelugu ? 'సరఫరా ఖాతా ఆవేదన చేయండి' : 'Apply for Wholesale Account'}</h2>
        <p>{isTelegu ? 'సరఫరా ధరలు, నిబద్ధ ఖాతాలు, మరియు కస్టమ్ ఆర్డర్‌ల కోసం' : 'For wholesale pricing, credit accounts, and custom orders'}</p>
        <button className="cta-btn" onClick={handleWhatsAppContact}>
          {isTelugu ? '💬 WhatsApp లో సంపర్కించండి' : '💬 Contact on WhatsApp'}
        </button>
      </section>
    </div>
  );
}
