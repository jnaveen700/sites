# Migration Guide: Real Estate App → Wholesale Saree Shop

## Overview

This document outlines all the changes made to transform the real estate application into a wholesale saree e-commerce platform.

---

## Backend Changes

### 1. Data Models

#### Property Model → Saree Model
**File:** `/server/models/Property.js`

**Removed Fields:**
- `title` → Replaced with `designName`
- `area` → Removed (not applicable)
- `location` → Removed (not applicable)
- `propertyType` → Removed (not applicable)

**Added Fields:**
- `retailPrice` - Retail/MRP price
- `wholesalePrice` - Bulk wholesale price (required for validation)
- `color` - Saree color
- `material` - Enum: silk, cotton, linen, georgette, chiffon, dupioni, mixed
- `pattern` - Enum: plain, striped, checked, printed, embroidered, woven
- `length` - Default "6 yards"
- `stock` - Inventory management (replaces area)
- `minOrderQuantity` - Minimum wholesale order quantity
- `season` - Enum: spring, summer, monsoon, autumn, winter, all-season
- Updated `status` enum: in-stock, low-stock, out-of-stock, discontinued (was: available, sold, pending)

#### Booking Model → Order Model
**File:** `/server/models/Booking.js`

**Removed Fields:**
- `property` → Replaced with `items` array
- `bookingDate` → Removed (not applicable)

**Added Fields:**
- `orderNumber` - Auto-generated unique order ID
- `items` - Array of saree items with quantity
- `totalAmount` - Total before discount
- `discount` - Discount amount
- `finalAmount` - Final amount after discount
- `shippingAddress` - Delivery address
- `paymentStatus` - Enum: pending, partial, paid, overdue
- `paymentMethod` - Enum: credit-card, bank-transfer, cheque, cash, other
- `deliveryDate` - Expected/actual delivery date

**Updated Fields:**
- `status` enum updated: pending, confirmed, processing, shipped, delivered, cancelled (was: pending, confirmed, cancelled, completed)

#### User Model Updates
**File:** `/server/models/User.js`

**New Wholesale Customer Fields:**
- `businessName` - Customer's business name
- `gstNumber` - GST registration number
- `creditLimit` - Wholesale credit limit
- `registrationDate` - Customer registration date

**Updated Employee Fields:**
- `department` updated: sales, inventory, support, management (was: sales, support, management)

---

### 2. Controllers

#### Property Controller → Saree Controller
**File:** `/server/controllers/propertyController.js`

**Function Renames:**
- `getProperties()` → `getSarees()`
- `getPropertyById()` → `getSareeById()`
- `createProperty()` → `createSaree()`
- `updateProperty()` → `updateSaree()`
- `deleteProperty()` → `deleteSaree()`

**Logic Changes:**
- Filter parameters changed: `type` → `material`, added `pattern` filter
- Added validation for wholesale price ≤ retail price
- Added automatic status update based on stock levels (low-stock threshold: 5)
- Stock management instead of area calculations

#### Booking Controller → Order Controller
**File:** `/server/controllers/bookingController.js`

**Function Renames:**
- `createBooking()` → `createOrder()`
- `getBookings()` → `getOrders()`
- `getBookingById()` → `getOrderById()`
- `updateBookingStatus()` → `updateOrderStatus()`
- `cancelBooking()` → `cancelOrder()`

**Logic Changes:**
- Order accepts array of items instead of single property
- Order calculation includes items, quantities, and pricing
- Automatic stock decrementation on order creation
- Automatic stock restoration on order cancellation
- Payment status tracking added
- Delivery date tracking added
- Prevents cancellation of shipped/delivered orders
- Validates minimum order quantities

---

### 3. Routes

#### Property Routes → Saree Routes
**File:** `/server/routes/propertyRoutes.js`

**Base Path Change:**
- `/api/properties` → `/api/sarees`

**New Query Parameters:**
- `material=silk`
- `pattern=embroidered`
- `search=wedding` (searches designName, description, color)

#### Booking Routes → Order Routes
**File:** `/server/routes/bookingRoutes.js`

**Base Path Change:**
- `/api/bookings` → `/api/orders`

**New Query Parameters:**
- `paymentStatus=paid`

**New Status Endpoint:**
- `PUT /orders/:id/status` - Updated logic for wholesale operations

---

### 4. Main Server File
**File:** `/server/server.js`

**Route Mount Changes:**
```javascript
// Before
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);

// After
app.use('/api/sarees', propertyRoutes);
app.use('/api/orders', bookingRoutes);
```

---

### 5. Package Configuration
**File:** `/server/package.json`

**Changes:**
- `name`: "realestate-backend" → "saree-shop-backend"
- `description`: "Real Estate Application Backend..." → "Wholesale Saree Shop Backend..."
- `keywords`: Added "wholesale", "saree", "ecommerce" (removed "real-estate")

---

## Frontend Changes (To Be Implemented)

The following frontend components will need to be updated:

### Pages to Update/Create:
1. **Saree Catalog Page**
   - Display grid of sarees
   - Add filters: material, pattern, color, season
   - Replace property listing view

2. **Saree Detail Page**
   - Show saree details (design, material, pattern)
   - Display wholesale pricing
   - Add to cart/order functionality
   - Minimum order quantity indicator

3. **Shopping Cart**
   - Item selection and quantity management
   - Order summary with wholesale pricing
   - Discount application

4. **Checkout Page**
   - Shipping address input
   - Payment method selection
   - Order confirmation

5. **Order History Page**
   - View past orders
   - Order status tracking
   - Payment status
   - Reorder functionality

6. **Admin Dashboard**
   - Saree inventory management
   - Add/edit/delete sarees
   - Order management interface

7. **Employee Dashboard**
   - View all orders
   - Update order/payment status
   - Assign orders to team members
   - Delivery tracking

### Context API Updates:
- `PropertyContext` → `SareeContext`
- `BookingContext` → `OrderContext`
- Update state management for wholesale operations

### API Utilities:
- Update API endpoint calls in `src/api/` files
- Replace property API functions with saree API functions
- Replace booking API functions with order API functions

---

## Database Migration

If migrating from an existing real estate database:

1. **Backup existing data**
2. **Drop/archive old collections**
3. **Create new Saree collection** with new schema
4. **Populate with saree data:**
   - Add saree designs, colors, materials
   - Set wholesale and retail prices
   - Initialize stock quantities

5. **Migrate customer data** (if applicable)
   - Convert property brokers → wholesale sales team (employee role)
   - Customers stay as customers, but add wholesale fields

6. **Archive old bookings** (optional)

---

## Testing Checklist

### Backend Tests:
- [ ] Create saree with all fields
- [ ] Add saree with images
- [ ] Filter sarees by material
- [ ] Filter sarees by pattern
- [ ] Create order with multiple items
- [ ] Verify stock decrementation
- [ ] Cancel order and verify stock restoration
- [ ] Update order status
- [ ] Update payment status
- [ ] Test minimum order quantity validation
- [ ] Test wholesale price validation

### Frontend Tests:
- [ ] Browse saree catalog
- [ ] Filter by material/pattern
- [ ] View saree details
- [ ] Search for sarees
- [ ] Add items to order
- [ ] Checkout with multiple items
- [ ] View order history
- [ ] Track order status
- [ ] Employee can update order status
- [ ] Admin can manage inventory

---

## API Endpoint Mapping

### Old → New

| Old Endpoint | New Endpoint | Purpose |
|---|---|---|
| GET /api/properties | GET /api/sarees | List all products |
| GET /api/properties/:id | GET /api/sarees/:id | Get product details |
| POST /api/properties | POST /api/sarees | Create product (Admin) |
| PUT /api/properties/:id | PUT /api/sarees/:id | Update product (Admin) |
| DELETE /api/properties/:id | DELETE /api/sarees/:id | Delete product (Admin) |
| GET /api/bookings | GET /api/orders | List orders |
| GET /api/bookings/:id | GET /api/orders/:id | Get order details |
| POST /api/bookings | POST /api/orders | Create order |
| PUT /api/bookings/:id/status | PUT /api/orders/:id/status | Update order status |
| DELETE /api/bookings/:id | DELETE /api/orders/:id | Cancel order |

---

## Key Business Logic Changes

1. **Order Creation:**
   - Now accepts multiple items (sarees)
   - Calculates total from items and quantities
   - Validates minimum order quantities
   - Automatically deducts stock

2. **Stock Management:**
   - Stock decreases on order creation
   - Stock increases on order cancellation
   - Status updates based on stock level

3. **Pricing:**
   - Wholesale prices stored per saree
   - Discounts can be applied to entire order
   - Final amount calculated after discount

4. **Payment Tracking:**
   - Separate from order status
   - Supports partial payments
   - Can mark as overdue

5. **Order Status:**
   - Now includes "processing" and "shipped" states
   - More granular tracking of fulfillment

---

## Environment Variables

No new environment variables needed. Existing configuration (MongoDB, JWT, Cloudinary) remains the same.

---

## Breaking Changes

**IMPORTANT:** The following are breaking changes from v1 to v2:

1. All `/api/properties` endpoints → `/api/sarees`
2. All `/api/bookings` endpoints → `/api/orders`
3. Property schema completely changed to Saree
4. Booking schema completely changed to Order
5. Create Order now requires array of items, not single property
6. User model has new fields for wholesale customers

**Recommendation:** Deploy as new version (2.0.0) to avoid conflicts.

---

## Rollback Plan

If needed to rollback:

1. Keep backup of old real estate database
2. Deploy previous version of backend
3. Update frontend to call old endpoints
4. Restore old database collections

---

## Support

For questions or issues during migration, refer to:
- [API Documentation](./SAREE_SHOP_API.md)
- [Backend Routes](./routes/)
- [Models](./models/)
