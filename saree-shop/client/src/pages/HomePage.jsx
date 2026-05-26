import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import SareeCard from '../components/product/SareeCard';
import BatchCard from '../components/product/BatchCard';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { t, isTelugu } = useLanguage();
  const [sarees, setSarees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerType, setCustomerType] = useState('wholesale');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sareeRes, batchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sarees`),
          fetch(`${API_BASE_URL}/batches`)
        ]);

        const sareeData = sareeRes.ok ? await sareeRes.json() : { data: [] };
        const batchData = batchRes.ok ? await batchRes.json() : { batches: [] };

        const allSarees = sareeData.data || [];
        const allBatches = batchData.batches || [];

        setSarees(allSarees);
        setBatches(allBatches);

        const allItems = [
          ...allSarees.map(s => ({ ...s, type: 'saree' })),
          ...allBatches.map(b => ({ ...b, type: 'batch' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const drops = allItems.filter(item => {
          const createdDate = new Date(item.createdAt);
          return createdDate > sevenDaysAgo;
        }).slice(0, 4);
        setNewDrops(drops);

        setFeaturedItems(allItems.slice(0, 8));

        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(isTelugu ? 'డేటాను లోడ్ చేయడం విఫలమైంది' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isTelugu]);

  const handleViewCollections = () => {
    setCustomerType('wholesale');
    localStorage.setItem('customerType', 'wholesale');
    navigate('/catalog', { state: { customerType: 'wholesale' } });
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(isTelugu ? 'నమస్కారం, నేను సరఫరా సరీల గురించి ఆసక్తి కలిగి ఉన్నాను.' : 'Hello, I am interested in your wholesale sarees collections.');
    window.open('https://wa.me/918977430700?text=' + message, '_blank');
  };

  return (
    <div className="home-page">
      {/* THIS WEEK'S NEW DROPS */}
      {newDrops.length > 0 && (
        <section className="new-drops-section">
          <h2 className="section-title">
            {isTelugu ? '🆕 ఈ వారం కొత్త' : '🆕 This Week\'s New Drops'}
          </h2>
          <p className="section-subtitle">
            {isTelugu
              ? 'తాజా సరీల కోసం ఈ వారం చూడండి'
              : 'Discover fresh designs and latest collections'}
          </p>
          <div className="sarees-grid">
            {newDrops.map((item) => (
              item.type === 'batch' ? (
                <BatchCard
                  key={item._id}
                  batch={item}
                  onViewDetails={() => navigate(`/batch/${item._id}`)}
                />
              ) : (
                <SareeCard
                  key={item._id}
                  saree={item}
                  customerType="wholesale"
                  onViewDetails={() => navigate(`/saree/${item._id}`)}
                    onAddToCart={() => {}}
                />
              )
            ))}
          </div>
        </section>
      )}

      {/* FEATURED COLLECTION */}
      {featuredItems.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">
            {isTelugu ? '⭐ ఫీచర్ చేయబడిన సంపూర్ణ సంపూర్ణ' : '⭐ Featured Wholesale Collections'}
          </h2>
          <p className="section-subtitle">
            {isTelugu
              ? 'బాలిచేసిన సరీలు ప్రతి సమయానికి'
              : 'Premium collections for every occasion and season'}
          </p>
          <div className="sarees-grid">
            {featuredItems.map((item) => (
              item.type === 'batch' ? (
                <BatchCard
                  key={item._id}
                  batch={item}
                  onViewDetails={() => navigate(`/batch/${item._id}`)}
                />
              ) : (
                <SareeCard
                  key={item._id}
                  saree={item}
                  customerType="wholesale"
                  onViewDetails={() => navigate(`/saree/${item._id}`)}
                    onAddToCart={() => {}}
                />
              )
            ))}
          </div>
          <div className="view-all-section">
            <button
              className="view-all-btn"
              onClick={handleViewCollections}
            >
              {isTelugu ? 'అన్ని సరీలను చూడండి →' : 'View All Collections →'}
            </button>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US SECTION */}
      <section className="why-choose-section">
        <h2 className="section-title">
          {isTelugu ? 'శ్రీ బాలాజీ ఫేబ్రిక్‌లను ఎందుకు ఎంచుకోండి?' : 'Why Choose Sree Balaji Fabrics?'}
        </h2>
        <div className="why-choose-grid">
          <div className="why-card">
            <div className="why-icon">📦</div>
            <h3>{isTelugu ? 'బల్క్ ఆర్డర్' : 'Bulk Orders'}</h3>
            <p>{isTelugu ? 'పెద్ద పరిమాణ ఆర్డర్‌ల కోసం ప్రత్యేక ధరలు' : 'Special pricing for bulk wholesale orders'}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🏪</div>
            <h3>{isTelugu ? 'బూటీక్ సరఫరా' : 'Boutique Supply'}</h3>
            <p>{isTelugu ? 'బూటీక్‌లు మరియు చిన్న దుకాణాల కోసం కస్టమ్ సమాధానాలు' : 'Custom solutions for boutiques and small retailers'}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🚚</div>
            <h3>{isTelugu ? 'వేగవంతమైన పంపిణీ' : 'Fast Dispatch'}</h3>
            <p>{isTelugu ? '5-7 రోజులలో సరఫరా చేయండి' : 'Prompt dispatch across India'}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">✨</div>
            <h3>{isTelugu ? 'ప్రిమియం నాణ్యత' : 'Premium Quality'}</h3>
            <p>{isTelugu ? 'ఐతిహ్యవాహక నేసిన సరీలు' : 'Authentic handcrafted sarees'}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🔄</div>
            <h3>{isTelugu ? 'వారానికి కొత్త సంపూర్ణ' : 'Weekly New Drops'}</h3>
            <p>{isTelugu ? 'నిత్యం తాజా డిజైన్‌లు' : 'Fresh designs added every week'}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">💳</div>
            <h3>{isTelugu ? 'సులభ చెల్లింపు' : 'Easy Payment'}</h3>
            <p>{isTelugu ? 'వ్యాపారులకు క్రెడిట్ సదుపాయాలు' : 'Credit terms for business partners'}</p>
          </div>
        </div>
      </section>

      {/* WHOLESALE INFORMATION SECTION */}
      <section className="wholesale-info-section">
        <h2 className="section-title">
          {isTelugu ? 'సరఫరా సంపూర్ణ సంపూర్ణ సంపూర్ణ' : 'Wholesale Information'}
        </h2>
        <div className="wholesale-content">
          <div className="wholesale-item">
            <h3>{isTelugu ? '👥 రిటెయిల్ దుకాణ సరఫరా' : 'Retail Shop Supply'}</h3>
            <p>{isTelugu ? 'మీ రిటెయిల్ దుకాణానికి రేఖాంశ సరఫరాదారు. కస్టమ్ కలెక్షన్‌లు, విక్రయ తర్వాత సేవలు మరియు శీఘ్ర పంపిణీ.' : 'Direct supplier for your retail shops. Custom collections, after-sales support, and quick dispatch.'}</p>
          </div>
          <div className="wholesale-item">
            <h3>{isTelugu ? '🏘️ ఆన్‌లైన్ రీసెల్' : 'Online Reseller'}</h3>
            <p>{isTelugu ? 'ఆన్‌లైన్ వ్యాపారు లేదా ఇ-కామర్స్‌ కోసం పెద్ద ఆర్డర్‌లు. సిద్ధమైన స్టాక్ మరియు డ్రాప్‌షిప్ సదుపాయాలు.' : 'Bulk orders for online business and e-commerce. Ready stock and dropship facilities.'}</p>
          </div>
          <div className="wholesale-item">
            <h3>{isTelugu ? '✨ ఫ్యాషన్ బూటీక్' : 'Fashion Boutique'}</h3>
            <p>{isTelugu ? 'ఆధిక-ఆర్డర్‌ల కోసం విలక్షణ డిజైన్‌లు. వ్యక్తిగત సమన్వయ మరియు సీజన్‌కు సరైన సంపూర్ణ.' : 'Exclusive designs for boutiques. Personal curation and seasonal collections.'}</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>{isTelugu ? 'సరఫరా కర్తలకు సందర్భం!' : 'Get in Touch with Our Team!'}</h2>
          <p>
            {isTelugu
              ? 'సంపూర్ణ సరఫరా కోసం, ఎకౌంట్ ఆప్‌లికేషన్‌ల కోసం, లేదా కస్టమ్ ఆర్డర్‌ల కోసం సంపర్కించండి'
              : 'Contact us for wholesale pricing, account applications, or custom orders'}
          </p>
          <div className="cta-buttons">
            <button
              className="cta-btn cta-btn-primary"
              onClick={handleWhatsAppContact}
            >
              {isTelugu ? '💬 WhatsApp సంపర్కం' : '💬 Message on WhatsApp'}
            </button>
            <button
              className="cta-btn cta-btn-secondary"
              onClick={() => handleViewCollections()}
            >
              {isTelugu ? '🛍️ సరీలను చూడండి' : '🛍️ Browse Collections'}
            </button>
          </div>
        </div>
      </section>

      {/* LOADING & ERROR STATES */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{isTelugu ? 'లోడ్ చేస్తున్నారు...' : 'Loading...'}</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
    </div>
  );
}
