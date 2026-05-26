import { useLanguage } from '../hooks/useLanguage';
import '../styles/About.css';

export default function About() {
  const { isTelugu } = useLanguage();

  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {isTelugu ? 'శ్రీ బాలాజీ ఫేబ్రిక్‌లు గురించి' : 'About Sree Balaji Fabrics'}
          </h1>
          <p className="hero-subtitle">
            {isTelugu
              ? 'ఐతిహ్యవాహక సరీల సరఫరాదారు | భారతీయ చేతిచేతులచేత'
              : 'Traditional Saree Excellence | Handcrafted Heritage'}
          </p>
        </div>
      </section>

      {/* BRAND INTRODUCTION */}
      <section className="intro-section">
        <div className="intro-content">
          <h2>{isTelugu ? 'మీ సరఫరా సరీల ఆత్మీయ సంస్థ' : 'Your Trusted Wholesale Saree Partner'}</h2>
          <p>
            {isTelugu
              ? 'శ్రీ బాలాజీ ఫేబ్రిక్‌లు రిటెయిల్ దుకాణాలు, ఫ్యాషన్ బూటీక్‌లు, మరియు సరఫరా కర్తలకు ప్రిమియం సరీలను సరఫరా చేస్తుంది. భారతీయ ఐతిహ్యవాహక చేతిచేతులచేత సరీలు - నిర్ణయ నాణ్యత, ఆధిక డిజైన్‌లు, మరియు సాశ్వత సేవ.'
              : 'Sree Balaji Fabrics is your dedicated partner for wholesale saree supply. We serve retailers, boutiques, and resellers with premium, authentic handcrafted traditional sarees with commitment to quality, design excellence, and dedicated service.'}
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="mission-section">
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">🎯</div>
            <h3>{isTelugu ? 'మా లక్ష్యం' : 'Our Mission'}</h3>
            <p>
              {isTelugu
                ? 'ఐతిహ్యవాహక చేతిచేతులచేత సరీలను సరఫరా చేయడం ద్వారా భారతీయ చేతిచేతులను సమర్థించటం'
                : 'Empower Indian artisans by delivering authentic handcrafted sarees to businesses across the country'}
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">✨</div>
            <h3>{isTelugu ? 'మా దృష్టి' : 'Our Vision'}</h3>
            <p>
              {isTelugu
                ? 'సరఫరా సరీల పరిశ్రమకు విశ్వస్త బ్రాండ్‌గా ఉండటం, ఐతిహ్యవాహక కళ సంరక్షణ చేయటం'
                : 'To be the most trusted brand in wholesale sarees, preserving traditional craftsmanship while meeting modern business needs'}
            </p>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="collections-section">
        <h2 className="section-title">
          {isTelugu ? 'మా సంపూర్ణ సంపూర్ణ' : 'Our Collections'}
        </h2>
        <p className="section-subtitle">
          {isTelugu
            ? 'ఐతిహ్యవాహక నేసిన సరీల నుండి ఆధునిక డిజిటల్ నమూనాల వరకు'
            : 'From traditional handwoven sarees to contemporary designs'}
        </p>
        <div className="collections-grid">
          <div className="collection-card">
            <div className="collection-image">🎨</div>
            <h3>{isTelugu ? 'ఐతిహ్యవాహక సరీలు' : 'Traditional Sarees'}</h3>
            <p>{isTelugu ? 'చేతిచేత నేసిన, చేతిచేత నమూనాలు' : 'Handwoven, hand-embroidered designs'}</p>
          </div>
          <div className="collection-card">
            <div className="collection-image">✨</div>
            <h3>{isTelugu ? 'ప్రిమియం సంపూర్ణ' : 'Premium Collections'}</h3>
            <p>{isTelugu ? 'విలక్షణ పదార్థాలు, నిర్ణయ నాణ్యత' : 'Exclusive materials, superior craftsmanship'}</p>
          </div>
          <div className="collection-card">
            <div className="collection-image">💎</div>
            <h3>{isTelugu ? 'సీజనల్ సంపూర్ణ' : 'Seasonal Collections'}</h3>
            <p>{isTelugu ? 'ఫ్యాషన్ ఫ్రోవర్డ్, ట్రెండీ రంగులు' : 'Fashion-forward, trending colors'}</p>
          </div>
        </div>
      </section>

      {/* WHOLESALE SPECIALIZATION */}
      <section className="specialization-section">
        <h2 className="section-title">
          {isTelugu ? 'సరఫరా విశేషీకరణ' : 'Wholesale Specialization'}
        </h2>
        <div className="specialization-content">
          <div className="spec-item">
            <div className="spec-icon">📦</div>
            <h3>{isTelugu ? 'బల్క్ ఆర్డర్' : 'Bulk Orders'}</h3>
            <p>{isTelugu ? 'రిటెయిల్ దుకాణాలు, బూటీక్‌లు, రీసెల్‌లర్‌లకు పేరుకుపోయిన సరఫరా' : 'Dedicated supply solutions for retailers and resellers'}</p>
          </div>
          <div className="spec-item">
            <div className="spec-icon">💳</div>
            <h3>{isTelugu ? 'ఖాతా సుబిధలు' : 'Credit Facilities'}</h3>
            <p>{isTelugu ? 'నమ్మిన వ్యాపారులకు ఫ్లెక్సిబిల్ చెల్లింపు నిబంధనలు' : 'Flexible payment terms for established businesses'}</p>
          </div>
          <div className="spec-item">
            <div className="spec-icon">🚚</div>
            <h3>{isTelugu ? 'వేగవంతమైన డిసపట్చ్' : 'Fast Dispatch'}</h3>
            <p>{isTelugu ? 'భారతదేశం అంతటా 5-7 రోజుల్లో సరఫరా' : 'All-India delivery within 5-7 days'}</p>
          </div>
          <div className="spec-item">
            <div className="spec-icon">👥</div>
            <h3>{isTelugu ? 'వ్యక్తిగత సేవ' : 'Dedicated Service'}</h3>
            <p>{isTelugu ? 'ప్రతి సరఫరా కర్తకు వ్యక్తిగత సమన్వయ మరియు సహాయం' : 'Personalized service and support for each partner'}</p>
          </div>
          <div className="spec-item">
            <div className="spec-icon">🎨</div>
            <h3>{isTelugu ? 'కస్టమ్ సమాధానాలు' : 'Custom Solutions'}</h3>
            <p>{isTelugu ? 'మీ ఖాతా కోసం ఎక్సక్లూసివ్ డిజైన్‌లు' : 'Exclusive designs tailored to your needs'}</p>
          </div>
          <div className="spec-item">
            <div className="spec-icon">✨</div>
            <h3>{isTelugu ? 'నాణ్యత నిర్ధారణ' : 'Quality Assurance'}</h3>
            <p>{isTelugu ? 'ప్రతిదీ రంగు, నిర్ణయ, మరియు మెటీరియల్ కోసం తనిఖీ' : 'Every saree inspected for quality before dispatch'}</p>
          </div>
        </div>
      </section>

      {/* QUALITY COMMITMENT */}
      <section className="quality-section">
        <h2 className="section-title">
          {isTelugu ? 'నాణ్యత నిబద్ధత' : 'Quality Commitment'}
        </h2>
        <div className="quality-content">
          <div className="quality-item">
            <div className="quality-number">✓</div>
            <h3>{isTelugu ? 'ఐతిహ్యవాహక చేతిచేతులచేత' : 'Authentic Craftsmanship'}</h3>
            <p>{isTelugu ? 'చేతిచేత నెసిన, చేతిచేత నమూనాలు - సాంప్రదాయ కళ సంరక్షణ' : 'Handwoven, hand-embroidered - preserving traditional artistry'}</p>
          </div>
          <div className="quality-item">
            <div className="quality-number">✓</div>
            <h3>{isTelugu ? 'ప్రిమియం పదార్థాలు' : 'Premium Materials'}</h3>
            <p>{isTelugu ? 'రేష్‌మ, కాటన్, లిన్‌ఇన్ - సర్వోత్తమ ఫిబర్‌లు' : 'Silk, cotton, linen - finest quality fabrics'}</p>
          </div>
          <div className="quality-item">
            <div className="quality-number">✓</div>
            <h3>{isTelugu ? 'కఠినమైన తనిఖీ' : 'Rigorous Testing'}</h3>
            <p>{isTelugu ? 'ప్రతిదీ రంగు, నిర్ణయ, మరియు మెటీరియల్ కోసం తనిఖీ' : 'Every saree checked for color, quality, and material'}</p>
          </div>
          <div className="quality-item">
            <div className="quality-number">✓</div>
            <h3>{isTelugu ? 'డ్యూరబిలిటీ' : 'Durability'}</h3>
            <p>{isTelugu ? 'సూర్యకాశంలో నిండిన, సీజనల్‌కు దీర్ఘకాలం పరిహారాలు' : 'Built to last, suitable for all seasons'}</p>
          </div>
        </div>
      </section>

      {/* CUSTOMER TRUST */}
      <section className="trust-section">
        <h2 className="section-title">
          {isTelugu ? 'గ్రాహక విశ్వాసం' : 'Customer Trust'}
        </h2>
        <p className="section-subtitle">
          {isTelugu
            ? 'సంతోష దుకాణదారుల మరియు సరఫరా కర్తల నుండి'
            : 'Trusted by hundreds of retailers and wholesale partners'}
        </p>
        <div className="trust-content">
          <div className="trust-item">
            <div className="trust-stat">500+</div>
            <p>{isTelugu ? 'దుకాణదారులు' : 'Retailers'}</p>
          </div>
          <div className="trust-item">
            <div className="trust-stat">10K+</div>
            <p>{isTelugu ? 'సరీలు సరఫరా' : 'Sarees Supplied'}</p>
          </div>
          <div className="trust-item">
            <div className="trust-stat">100%</div>
            <p>{isTelugu ? 'సంతోష గ్రాహకులు' : 'Satisfied Customers'}</p>
          </div>
          <div className="trust-item">
            <div className="trust-stat">5 Y</div>
            <p>{isTelugu ? 'సేవ సంచయం' : 'Years of Service'}</p>
          </div>
        </div>
      </section>

      {/* BUSINESS HISTORY */}
      <section className="history-section">
        <h2 className="section-title">
          {isTelugu ? 'మా చరిత్ర' : 'Our Story'}
        </h2>
        <div className="history-placeholder">
          <div className="placeholder-box">
            <p className="placeholder-text">
              {isTelugu
                ? '📖 వ్యాపారి చరిత్ర విస్తరణ చేయటానికి సంచేతకులు రాబోయుదు'
                : '📖 Business information will be updated soon'}
            </p>
            <p className="placeholder-subtext">
              {isTelugu
                ? 'చరిత్ర, పటకాలు, మరియు మిషన్ వర్ణన కోసం సంచేతకులు ఎదురుచూస్తున్నారు'
                : 'Coming soon with our founding story, milestones, and journey'}
            </p>
          </div>
        </div>
      </section>

      {/* MODERN + TRADITIONAL */}
      <section className="blend-section">
        <h2 className="section-title">
          {isTelugu ? 'ఐతిహ్యవాహక + ఆధునిక' : 'Traditional + Modern'}
        </h2>
        <p className="section-subtitle">
          {isTelugu
            ? 'ఐతిహ్యవాహక చేతిచేతులను సమర్థించటం, ఆధునిక సరఫరా సమాధానాలు'
            : 'Preserving heritage craftsmanship with modern business solutions'}
        </p>
        <div className="blend-content">
          <div className="blend-item">
            <div className="blend-icon">🎨</div>
            <h3>{isTelugu ? 'ఐతిహ్యవాహక' : 'Heritage'}</h3>
            <ul>
              <li>{isTelugu ? 'చేతిచేత నెసిన సరీలు' : 'Handwoven sarees'}</li>
              <li>{isTelugu ? 'చేతిచేత నమూనాలు' : 'Hand embroidery'}</li>
              <li>{isTelugu ? 'ఐతిహ్యవాహక డిజైన్' : 'Traditional designs'}</li>
            </ul>
          </div>
          <div className="blend-item">
            <div className="blend-icon">💻</div>
            <h3>{isTelugu ? 'ఆధునిక' : 'Modern'}</h3>
            <ul>
              <li>{isTelugu ? 'ఆన్‌లైన్ ఆర్డర్' : 'Online ordering'}</li>
              <li>{isTelugu ? 'వేగవంతమైన సరఫరా' : 'Quick dispatch'}</li>
              <li>{isTelugu ? 'డిజిటల్ చెల్లింపులు' : 'Digital payments'}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="about-cta">
        <h2>{isTelugu ? 'సరఫరా సరీలకు సంపర్కించండి' : 'Connect With Us'}</h2>
        <p>{isTelugu ? 'సరఫరా ధరలు, ఖాతా అర్హత, మరియు కస్టమ్ సమాధానాల కోసం సంపర్కించండి' : 'For wholesale pricing, account eligibility, and custom solutions'}</p>
      </section>
    </div>
  );
}
