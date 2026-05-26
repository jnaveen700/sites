import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import SareeCard from '../components/product/SareeCard';
import BatchCard from '../components/product/BatchCard';
import '../styles/SareeCatalog.css';

export default function SareeCatalog() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isTelugu } = useLanguage();

  const [sarees, setSarees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerType, setCustomerType] = useState(
    location.state?.customerType || localStorage.getItem('customerType') || 'retail'
  );

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('recent');

  // Extract unique filter options (only from sarees, since batches don't have these)
  const materials = ['all', ...new Set(sarees.map(s => s.material))];
  const patterns = ['all', ...new Set(sarees.map(s => s.pattern))];
  const colors = ['all', ...new Set(sarees.map(s => s.color))];
  const maxPrice = Math.max(
    ...[...sarees.map(s => s.retailPrice), ...batches.map(b => b.price)],
    5000
  );

  // Fetch sarees and batches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sareeRes, batchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sarees`),
          fetch(`${API_BASE_URL}/batches`)
        ]);

        if (!sareeRes.ok && !batchRes.ok) throw new Error('Failed to fetch data');

        const sareeData = sareeRes.ok ? await sareeRes.json() : { data: [] };
        const batchData = batchRes.ok ? await batchRes.json() : { batches: [] };

        setSarees(sareeData.data || []);
        setBatches(batchData.batches || []);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(isTelugu ? 'సమాచారాన్ని లోడ్ చేయడం విఫలమైంది' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isTelugu]);

  // Apply filters and search
  useEffect(() => {
    let sareeResults = sarees.filter(saree => {
      // Search filter
      const matchesSearch = saree.designName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          saree.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          saree.color.toLowerCase().includes(searchQuery.toLowerCase());

      // Material filter
      const matchesMaterial = selectedMaterial === 'all' || saree.material === selectedMaterial;

      // Pattern filter
      const matchesPattern = selectedPattern === 'all' || saree.pattern === selectedPattern;

      // Color filter
      const matchesColor = selectedColor === 'all' || saree.color === selectedColor;

      // Price filter (based on customer type)
      const price = customerType === 'wholesale' ? saree.wholesalePrice : saree.retailPrice;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesMaterial && matchesPattern && matchesColor && matchesPrice;
    });

    // Filter batches (by search and price only)
    let batchResults = batches.filter(batch => {
      const matchesSearch = !searchQuery ||
        (batch.title && batch.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (batch.category && batch.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPrice = batch.price >= priceRange[0] && batch.price <= priceRange[1];

      return matchesSearch && matchesPrice;
    });

    // Combine results
    let combined = [
      ...sareeResults.map(s => ({ ...s, type: 'saree' })),
      ...batchResults.map(b => ({ ...b, type: 'batch' }))
    ];

    // Apply sorting
    if (sortBy === 'price-low') {
      combined.sort((a, b) => {
        const priceA = a.type === 'batch' ? a.price : (customerType === 'wholesale' ? a.wholesalePrice : a.retailPrice);
        const priceB = b.type === 'batch' ? b.price : (customerType === 'wholesale' ? b.wholesalePrice : b.retailPrice);
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      combined.sort((a, b) => {
        const priceA = a.type === 'batch' ? a.price : (customerType === 'wholesale' ? a.wholesalePrice : a.retailPrice);
        const priceB = b.type === 'batch' ? b.price : (customerType === 'wholesale' ? b.wholesalePrice : b.retailPrice);
        return priceB - priceA;
      });
    } else if (sortBy === 'stock-low' && sareeResults.length > 0) {
      combined.sort((a, b) => {
        if (a.type === 'batch' && b.type === 'batch') return 0;
        if (a.type === 'batch') return -1;
        if (b.type === 'batch') return 1;
        return a.stock - b.stock;
      });
    } else if (sortBy === 'recent') {
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredResults(combined);
  }, [searchQuery, selectedMaterial, selectedPattern, selectedColor, priceRange, sortBy, sarees, batches, customerType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMaterial('all');
    setSelectedPattern('all');
    setSelectedColor('all');
    setPriceRange([0, maxPrice]);
    setSortBy('recent');
  };

  return (
    <div className="saree-catalog">
      {/* HEADER */}
      <div className="catalog-header">
        <h1>{isTelugu ? 'సరీ కేటలాగ్' : 'Saree Catalog'}</h1>
        <p>
          {isTelugu
            ? `${customerType === 'wholesale' ? 'హోల్‌సేల్' : 'చిన్న'}కొనుగోలు నిర్ణయించారు`
            : `${customerType === 'wholesale' ? 'Wholesale' : 'Retail'} Pricing`}
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="catalog-container">
        {/* FILTERS SIDEBAR */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>{isTelugu ? 'ఫిల్టర్‌లు' : 'Filters'}</h3>
            <button className="reset-btn" onClick={handleResetFilters}>
              {isTelugu ? '🔄 రీసెట్' : '🔄 Reset'}
            </button>
          </div>

          {/* SEARCH */}
          <div className="filter-group">
            <label>{isTelugu ? 'శోధన' : 'Search'}</label>
            <input
              type="text"
              placeholder={isTelugu ? 'సరీ, పదార్థం, రంగు...' : 'Saree, material, color...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* MATERIAL FILTER */}
          <div className="filter-group">
            <label>{isTelugu ? 'పదార్థం' : 'Material'}</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="filter-select"
            >
              {materials.map(material => (
                <option key={material} value={material}>
                  {material === 'all' ? (isTelugu ? 'అన్ని' : 'All') : material}
                </option>
              ))}
            </select>
          </div>

          {/* PATTERN FILTER */}
          <div className="filter-group">
            <label>{isTelugu ? 'నమూనా' : 'Pattern'}</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="filter-select"
            >
              {patterns.map(pattern => (
                <option key={pattern} value={pattern}>
                  {pattern === 'all' ? (isTelugu ? 'అన్ని' : 'All') : pattern}
                </option>
              ))}
            </select>
          </div>

          {/* COLOR FILTER */}
          <div className="filter-group">
            <label>{isTelugu ? 'రంగు' : 'Color'}</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="filter-select"
            >
              {colors.map(color => (
                <option key={color} value={color}>
                  {color === 'all' ? (isTelugu ? 'అన్ని' : 'All') : color}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE RANGE FILTER */}
          <div className="filter-group">
            <label>{isTelugu ? 'ధర పరిధి' : 'Price Range'}</label>
            <div className="price-inputs">
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="price-input"
                placeholder={isTelugu ? 'కనీసం' : 'Min'}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="price-input"
                placeholder={isTelugu ? 'గరిష్ట' : 'Max'}
              />
            </div>
          </div>

          {/* SORT */}
          <div className="filter-group">
            <label>{isTelugu ? 'క్రమం' : 'Sort By'}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">{isTelugu ? 'ఇటీవల జోడించారు' : 'Recently Added'}</option>
              <option value="price-low">{isTelugu ? 'ధర: తక్కువ నుండి ఎక్కువ' : 'Price: Low to High'}</option>
              <option value="price-high">{isTelugu ? 'ధర: ఎక్కువ నుండి తక్కువ' : 'Price: High to Low'}</option>
              <option value="stock-low">{isTelugu ? 'కనీస స్టాక్' : 'Low Stock First'}</option>
            </select>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="catalog-main">
          {/* RESULTS HEADER */}
          <div className="results-header">
            <h2>
              {isTelugu ? 'ఫలితాలు' : 'Results'}
              <span className="result-count">({filteredResults.length})</span>
            </h2>
            <p className="result-info">
              {isTelugu
                ? `${filteredResults.length} నుండి ${sarees.length + batches.length} చిత్రాలు`
                : `${filteredResults.length} of ${sarees.length + batches.length} items`}
            </p>
          </div>

          {/* PRODUCTS GRID - MIXED SAREES & BATCHES */}
          {filteredResults.length > 0 ? (
            <div className="catalog-grid">
              {filteredResults.map((item) => (
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
                    customerType={customerType}
                    onViewDetails={() => navigate(`/saree/${item._id}`)}
                      onAddToCart={() => {}}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>{isTelugu ? 'చిత్రాలు కనుగొనబడలేదు' : 'No Items Found'}</h3>
              <p>
                {isTelugu
                  ? 'దయచేసి ఫిల్టర్‌లను సర్దుబాటు చేయండి మరియు మళ్లీ ప్రయత్నించండి'
                  : 'Please adjust your filters and try again'}
              </p>
              <button className="reset-btn-large" onClick={handleResetFilters}>
                {isTelugu ? 'ఫిల్టర్‌లను రీసెట్ చేయండి' : 'Reset Filters'}
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{isTelugu ? 'లోడ్ చేస్తున్నారు...' : 'Loading...'}</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
