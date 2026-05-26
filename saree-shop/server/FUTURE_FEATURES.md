# 🔮 Saree Shop - Future Features & Development Phases

This document outlines planned features for future development phases. All files are preserved and documented for easy activation.

---

## Current Status (Production v1.0)

**Active Features:**
- ✅ Saree catalog management (admin upload with Cloudinary)
- ✅ Batch collections showcase
- ✅ Multi-language support (English/Telugu)
- ✅ Admin authentication and dashboard
- ✅ Public browse (no customer login required)
- ✅ WhatsApp integration for inquiries
- ⏳ "Interested" inquiry system (in development)

---

## Phase 2: Ecommerce & Advanced Management

### 2.1 Order Management (`/api/orders`)
**Status:** DISABLED | **Files:** `*OrderManagement.FUTURE.*`

**Purpose:** Full ecommerce order processing, payment, shipping, invoicing.

**Features to add:**
- Order creation and tracking
- Payment gateway integration (Razorpay/Stripe)
- Order status management (Pending → Processing → Shipped → Delivered)
- Invoice generation
- Tax calculation (GST)
- Shipping integration

**How to activate:**
```bash
# 1. Rename files
mv models/OrderManagement.FUTURE.js models/OrderManagement.js
mv controllers/orderManagementController.FUTURE.js controllers/orderManagementController.js
mv routes/orderManagementRoutes.FUTURE.js routes/orderManagementRoutes.js

# 2. Uncomment in server/server.js (line 95)
// app.use('/api/orders', orderManagementRoutes);

# 3. Update imports in server.js (line 22)
const orderManagementRoutes = (await import('./routes/orderManagementRoutes.js')).default;
```

---

### 2.2 Saree Reservations (`/api/reservations`)
**Status:** DISABLED | **Files:** `*SareeReservation.FUTURE.*`

**Purpose:** Allow customers to reserve specific sarees in advance.

**Features to add:**
- Reservation calendar
- Hold period management
- Auto-cancellation for expired reservations
- Notification system (email/WhatsApp)
- Integration with order management

**How to activate:**
```bash
# 1. Rename files
mv models/SareeReservation.FUTURE.js models/SareeReservation.js
mv controllers/sareeReservationController.FUTURE.js controllers/sareeReservationController.js
mv routes/sareeReservationRoutes.FUTURE.js routes/sareeReservationRoutes.js

# 2. Uncomment in server/server.js
// app.use('/api/reservations', sareeReservationRoutes);
```

---

### 2.3 Store Location Management (`/api/stores`)
**Status:** DISABLED | **Files:** `*StoreLocation.FUTURE.*`

**Purpose:** Track store/warehouse locations, location-based inventory.

**Features to add:**
- Store/warehouse locations
- Location-based inventory tracking
- Delivery zone management
- Pickup point management
- Location-specific pricing (optional)

**How to activate:**
```bash
# 1. Rename files
mv models/StoreLocation.FUTURE.js models/StoreLocation.js
mv controllers/storeLocationController.FUTURE.js controllers/storeLocationController.js
mv routes/storeLocationRoutes.FUTURE.js routes/storeLocationRoutes.js

# 2. Uncomment in server/server.js
// app.use('/api/stores', storeLocationRoutes);
```

---

## Phase 3: Staff Management & Advanced Analytics

### 3.1 Staff Management (`/api/staff`)
**Status:** DISABLED | **Files:** `*StaffManagement.FUTURE.*`

**Purpose:** Full staff/employee management system with roles and permissions.

**Features to add:**
- Employee records and profiles
- Department management
- Role-based permissions (beyond current admin/user)
- Staff dashboard and reporting
- Performance tracking
- Leave management

**How to activate:**
```bash
# 1. Rename files
mv models/StaffManagement.FUTURE.js models/StaffManagement.js
mv controllers/staffManagementController.FUTURE.js controllers/staffManagementController.js
mv routes/staffManagementRoutes.FUTURE.js routes/staffManagementRoutes.js

# 2. Uncomment in server/server.js
// app.use('/api/staff', staffManagementRoutes);

# 3. Update User model to include staff reference
```

---

## Current Placeholder System

### Interested/Inquiry System (PHASE 1.5 - IN PROGRESS)

**Purpose:** Lightweight system to capture "Interested" leads.

**To implement:**
1. Create new model: `models/Inquiry.js`
   ```javascript
   {
     name: String,
     phone: String,
     email: String (optional),
     message: String (optional),
     sareeReference: ObjectId (optional),
     productType: "saree" | "batch",
     source: "website" | "whatsapp" | "other",
     createdAt: Date
   }
   ```

2. Create controller: `controllers/inquiryController.js`
   - POST /api/inquiries (public - submit inquiry)
   - GET /api/inquiries (admin only - view all)
   - DELETE /api/inquiries/:id (admin only)

3. Create routes: `routes/inquiryRoutes.js`

4. Add to server.js:
   ```javascript
   app.use('/api/inquiries', inquiryRoutes);
   ```

5. Frontend integration:
   - Add "Interested" button on saree/batch detail pages
   - Modal form: Name, Phone, Message (optional)
   - Submit to /api/inquiries

---

## Development Priorities

1. **Phase 1.5 (Immediate):** Interested/Inquiry System
2. **Phase 2 (Next Sprint):** Order Management + Payment Integration
3. **Phase 2.5:** Reservations System
4. **Phase 3 (Later):** Staff Management & Analytics

---

## File Structure for Future Features

All future feature files follow the `.FUTURE.js` naming convention:

```
server/
├── models/
│   ├── StoreLocation.FUTURE.js
│   ├── SareeReservation.FUTURE.js
│   ├── StaffManagement.FUTURE.js
│   └── OrderManagement.FUTURE.js
├── controllers/
│   ├── storeLocationController.FUTURE.js
│   ├── sareeReservationController.FUTURE.js
│   ├── staffManagementController.FUTURE.js
│   └── orderManagementController.FUTURE.js
└── routes/
    ├── storeLocationRoutes.FUTURE.js
    ├── sareeReservationRoutes.FUTURE.js
    ├── staffManagementRoutes.FUTURE.js
    └── orderManagementRoutes.FUTURE.js
```

---

## Notes for Future Developers

- ⚠️ **Do NOT delete .FUTURE files** - they contain working code patterns
- 📝 Each .FUTURE file has a header comment explaining its purpose
- 🔗 When activating a feature, update imports in `server.js`
- ✅ All .FUTURE files are already production-ready code
- 🧪 Test each feature independently before combining
- 📚 Reference the comments at the top of each file for activation steps

---

## Environment Configuration for Future Features

When implementing features that require configuration:

```env
# Phase 2: Payment Gateway
PAYMENT_GATEWAY=razorpay  # razorpay or stripe
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Phase 2: Email Notifications
SMTP_HOST=your_smtp_server
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Phase 3: Analytics
ANALYTICS_ENABLED=true
```

---

**Last Updated:** May 26, 2026  
**Next Review:** When Phase 2 begins
