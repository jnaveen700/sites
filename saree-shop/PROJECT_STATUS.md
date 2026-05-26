# Saree Shop Project - Status & Requirements Analysis

## 🎯 Project Completion Status

### Backend - 85% Complete ✅
**Done:**
- [x] Models (Saree, Order, User) 
- [x] Controllers (Saree, Order, Auth, Employee)
- [x] Routes (Saree, Order, Auth)
- [x] Authentication & Authorization
- [x] Stock Management
- [x] Payment Status Tracking
- [x] API Documentation

**Still Needed:**
- [ ] Dual pricing system refinement (wholesale + retail simultaneous)
- [ ] Price tier management (bulk discounts)
- [ ] Customer type separation (wholesale vs retail endpoints)
- [ ] GST calculation for retail
- [ ] Inventory analytics
- [ ] Order reporting

---

### Frontend - 5% Complete 🚧
**Done:**
- [x] Project structure
- [x] Vite setup

**Still Needed:**
- [ ] Language context (Telugu/English toggle)
- [ ] Telugu font integration
- [ ] Homepage with language selection
- [ ] Saree catalog (wholesale & retail views)
- [ ] Shopping cart
- [ ] Checkout
- [ ] Order management
- [ ] Admin dashboard
- [ ] Employee dashboard
- [ ] Customer account
- [ ] All pages in Telugu & English

---

### i18n (Internationalization) - 0% Complete 🔴
**Still Needed:**
- [ ] Language context provider
- [ ] Translation files (Telugu, English)
- [ ] Language persistence (localStorage)
- [ ] i18n hook for components
- [ ] Telugu font loading
- [ ] Date/Currency localization

---

## 🔌 New APIs Needed (Beyond Current)

### 1. **Dual Customer Type System**
```
GET /api/customer-type - Returns 'wholesale' or 'retail' based on login
```

### 2. **Pricing APIs**
```
GET /api/sarees/:id/pricing
Response: {
  retailPrice,
  wholeSalePrice,
  tierPricing: [
    { minQty: 10, price: 3500 },
    { minQty: 50, price: 3200 },
    { minQty: 100, price: 2900 }
  ]
}
```

### 3. **Tax & Billing**
```
POST /api/calculate-invoice
Body: { items, customerType, state }
Response: { subtotal, gst, total }
```

### 4. **Analytics (Employee/Admin)**
```
GET /api/analytics/sales-by-material
GET /api/analytics/wholesale-vs-retail
GET /api/analytics/monthly-revenue
```

### 5. **Language-Based Content**
```
GET /api/sarees/:id/content?lang=te
Response: {
  designNameTelugu: "...",
  descriptionTelugu: "...",
  designNameEnglish: "...",
  descriptionEnglish: "..."
}
```

---

## 📱 Frontend Pages Needed

### Public Pages
1. **Language Selection Page** (First entry point)
   - Choose Telugu or English
   - Set language preference

2. **Home Page** (Different for wholesale & retail)
   - Hero section (bilingual)
   - Featured sarees
   - Quick browse

3. **Saree Catalog**
   - Filters (material, color, pattern, price range)
   - Wholesale view (bulk options, tier pricing)
   - Retail view (individual items)
   - Both in Telugu & English

4. **Saree Details**
   - Full description (bilingual)
   - Gallery
   - Wholesale/Retail pricing
   - Reviews (Telugu & English)

5. **Shopping Cart**
   - Multi-language support
   - Quantity & pricing management

6. **Checkout**
   - Address form (with common Telugu locations)
   - Payment options
   - Order summary (bilingual)

7. **Order Confirmation**
   - SMS in Telugu/English
   - Email in Telugu/English

### Customer Pages
1. **My Orders** (Bilingual)
2. **Order Tracking** (Bilingual)
3. **Account Settings** (Language preference)
4. **Favorites/Wishlist** (Bilingual)

### Employee Pages
1. **Order Management Dashboard** (Bilingual)
2. **Inventory Management** (Bilingual)
3. **Analytics Dashboard** (Bilingual)

### Admin Pages
1. **Add Saree** (Bilingual form)
2. **Manage Inventory** (Bilingual)
3. **Reports** (Bilingual)

---

## 🗂️ File Renaming Needed

### Models
```
Property.js → Saree.js
Booking.js → Order.js
```

### Controllers
```
propertyController.js → sareeController.js
bookingController.js → orderController.js
```

### Routes
```
propertyRoutes.js → sareeRoutes.js
bookingRoutes.js → orderRoutes.js
```

### Frontend Components
```
Pages:
  PropertyPage → SareeCatalogPage
  BookingPage → OrderCheckoutPage
  
Components:
  PropertyCard → SareeCard
  BookingForm → OrderForm
```

---

## 🌐 Telugu Language Integration

### Needed Translations (Key Areas)
1. **Product Details**
   - Design name, description, material names, patterns
   
2. **UI Elements**
   - Buttons, labels, placeholders
   - Navigation menu
   - Forms
   
3. **Business Terms**
   - "Wholesale" → "సరిల్లుకట్టుకోటి" / "Bulk" → "బందీ"
   - "Retail" → "చిన్నపరిమాణంలో"
   - "Saree" → "సారీ"
   - "Order" → "ఆర్డర్"
   - "Cart" → "చేపట్టు"
   
4. **Messages**
   - Success messages (bilingual)
   - Error messages (bilingual)
   - Confirmations (bilingual)

---

## 🎨 Telugu Font Requirements

### Recommended Fonts
```
1. Noto Sans Telugu (Free, Google Fonts)
2. Anupama (Free, Google Fonts)
3. Utsada (Free)
```

### Font Loading
```
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;700&display=swap');

Default Telugu font:
font-family: 'Noto Sans Telugu', sans-serif;
```

---

## 📋 Implementation Priority

### Phase 1 (Must Have - Week 1-2)
- [x] Backend API (already done)
- [ ] i18n setup with Telugu support
- [ ] Language selection page
- [ ] Home page (bilingual)
- [ ] Saree catalog (bilingual)
- [ ] Basic checkout (bilingual)

### Phase 2 (Important - Week 3-4)
- [ ] Order tracking
- [ ] Customer account
- [ ] Employee dashboard
- [ ] Payment integration
- [ ] Inventory management

### Phase 3 (Nice to Have - Week 5-6)
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Reviews system
- [ ] Wishlist
- [ ] Search optimization

---

## 🔐 Security Considerations

### Already Implemented
- ✅ JWT authentication
- ✅ Role-based access (customer, employee, admin)
- ✅ Password hashing

### Still Needed
- [ ] Rate limiting
- [ ] CSRF protection for forms
- [ ] XSS protection
- [ ] Input sanitization
- [ ] SQL injection prevention (already safe with mongoose)

---

## 📊 Database Structure (Approved)

### Collections
```javascript
Saree {
  designName, designNameTelugu,
  description, descriptionTelugu,
  retailPrice, wholesalePrice,
  tierPricing: [{ minQty, price }],
  material, materialTelugu,
  pattern, patternTelugu,
  color, colorTelugu,
  stock, images, ...
}

Order {
  orderNumber, customer, items,
  totalAmount, gst, finalAmount,
  customerType (wholesale/retail),
  status, paymentStatus, ...
}

User {
  name, email, phone, role,
  language (te/en),
  customerType,
  gstNumber (if wholesale), ...
}
```

---

## 💾 Storage & Performance

### Images
- [x] Cloudinary integration ready
- Needs optimization for Telugu descriptions

### Database
- [x] MongoDB ready
- Needs indexes for language-based queries

### Frontend
- Needs: Lazy loading for bilingual content
- Needs: Language caching

---

## 🎯 Success Metrics

1. **User Engagement**
   - Track wholesale vs retail usage
   - Language preference distribution
   - Cart completion rate

2. **Business**
   - Average order value (wholesale vs retail)
   - Customer retention
   - Repeat purchase rate

3. **Technical**
   - Page load time < 2s
   - API response time < 500ms
   - 99.9% uptime

---

## 📝 To-Do Summary

### Immediate (Current)
- [ ] Rename backend files (Property→Saree, Booking→Order)
- [ ] Add Telugu language support
- [ ] Create language context
- [ ] Set up translations

### Next Steps
- [ ] Build frontend with bilingual support
- [ ] Integrate Telugu fonts
- [ ] Create language selection UI
- [ ] Implement dual customer system

### Future
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] WhatsApp integration (for Telugu SMS)
- [ ] Payment gateway (local options for India)
