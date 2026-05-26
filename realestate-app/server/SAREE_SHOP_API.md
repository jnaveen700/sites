# Wholesale Saree Shop API Documentation

## Overview

This API powers a wholesale saree e-commerce platform. It supports wholesale customers placing bulk orders, employee management of inventory and orders, and admin control of the catalog.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### 1. Authentication Routes (`/auth`)

#### Register User
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "password": "password123",
  "address": "123 Main St, City",
  "businessName": "ABC Wholesale", // Optional, for wholesale customers
  "gstNumber": "27AABDE1234H1Z0" // Optional
}
```

#### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### 2. Saree Product Routes (`/sarees`)

#### Get All Sarees (Public)
```
GET /sarees
```
**Query Parameters:**
- `material` - Filter by material: silk, cotton, linen, georgette, chiffon, dupioni, mixed
- `pattern` - Filter by pattern: plain, striped, checked, printed, embroidered, woven
- `status` - Filter by status: in-stock, low-stock, out-of-stock, discontinued
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in design name, description, color

**Example:**
```
GET /sarees?material=silk&pattern=embroidered&page=1&limit=10&search=wedding
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "...",
      "designName": "Traditional Silk Wedding Saree",
      "description": "Premium silk saree with traditional embroidery",
      "retailPrice": 5000,
      "wholesalePrice": 3500,
      "color": "Deep Red",
      "material": "silk",
      "pattern": "embroidered",
      "stock": 25,
      "status": "in-stock",
      "minOrderQuantity": 5,
      "season": "all-season",
      "images": [
        {
          "url": "https://cloudinary.com/...",
          "public_id": "saree_001"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Saree (Public)
```
GET /sarees/:id
```

#### Create Saree (Admin Only)
```
POST /sarees
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```
**Form Fields:**
- `designName` (required) - Name of the saree design
- `description` (required) - Detailed description
- `retailPrice` (required) - MRP for retail
- `wholesalePrice` (required) - Bulk wholesale price
- `color` (required) - Saree color
- `material` (required) - Material type
- `pattern` (required) - Pattern type
- `stock` (required) - Available quantity
- `minOrderQuantity` (optional) - Minimum order quantity
- `season` (optional) - Season category
- `images` (optional) - Up to 10 image files

#### Update Saree (Admin Only)
```
PUT /sarees/:id
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```
**Can update:**
- designName, description, retailPrice, wholesalePrice
- stock, status, minOrderQuantity, season
- Add new images (multipart)
- Remove images (send `deleteImages` array with public_ids)

#### Delete Saree (Admin Only)
```
DELETE /sarees/:id
Authorization: Bearer <admin-token>
```
Automatically removes all associated images from Cloudinary.

---

### 3. Order Routes (`/orders`)

#### Get All Orders
```
GET /orders
Authorization: Bearer <token>
```
**Query Parameters:**
- `status` - Filter by status: pending, confirmed, processing, shipped, delivered, cancelled
- `paymentStatus` - Filter by payment: pending, partial, paid, overdue
- `page` - Page number
- `limit` - Items per page

**Access Control:**
- Customers see only their own orders
- Employees/Admins see all orders

#### Get Single Order
```
GET /orders/:id
Authorization: Bearer <token>
```
**Access Control:**
- Customers can only view their own orders
- Employees/Admins can view any order

#### Create Order (Wholesale Customer)
```
POST /orders
Authorization: Bearer <customer-token>
```
**Body:**
```json
{
  "items": [
    {
      "saree": "65a3f8d2c9e4b5a1f2e3d4c5",
      "quantity": 10
    },
    {
      "saree": "65a3f8d2c9e4b5a1f2e3d4c6",
      "quantity": 5
    }
  ],
  "shippingAddress": "123 Business Complex, Delhi, India",
  "paymentMethod": "bank-transfer", // credit-card, cheque, cash, other
  "discount": 500, // Optional
  "notes": "Please expedite delivery" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "orderNumber": "ORD-1705315200000-1",
    "customer": "...",
    "items": [
      {
        "saree": {
          "designName": "Traditional Silk Wedding Saree"
        },
        "quantity": 10,
        "unitPrice": 3500,
        "subtotal": 35000
      }
    ],
    "totalAmount": 40000,
    "discount": 500,
    "finalAmount": 39500,
    "shippingAddress": "123 Business Complex, Delhi, India",
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
- Checks minimum order quantity for each saree
- Verifies stock availability
- Returns 400 error if validation fails

#### Update Order Status (Employee/Admin Only)
```
PUT /orders/:id/status
Authorization: Bearer <employee-token>
```
**Body:**
```json
{
  "status": "confirmed", // pending, confirmed, processing, shipped, delivered, cancelled
  "paymentStatus": "partial", // pending, partial, paid, overdue
  "deliveryDate": "2024-02-15T00:00:00Z", // Optional
  "assignedEmployee": "65a3f8d2c9e4b5a1f2e3d4c7" // Optional
}
```

#### Cancel Order
```
DELETE /orders/:id
Authorization: Bearer <token>
```
**Access Control:**
- Customers can cancel their own pending/confirmed orders
- Employees/Admins can cancel most orders (with restrictions)
- Cannot cancel shipped/delivered orders

**Important:** Cancelling restores stock for all items.

---

## Data Models

### Saree Model
```javascript
{
  _id: ObjectId,
  designName: String (required),
  description: String (required),
  retailPrice: Number (required),
  wholesalePrice: Number (required),
  color: String (required),
  material: Enum (silk, cotton, linen, georgette, chiffon, dupioni, mixed),
  pattern: Enum (plain, striped, checked, printed, embroidered, woven),
  length: String (default: "6 yards"),
  stock: Number (required, >= 0),
  minOrderQuantity: Number (default: 1),
  status: Enum (in-stock, low-stock, out-of-stock, discontinued),
  season: Enum (spring, summer, monsoon, autumn, winter, all-season),
  images: [{
    url: String,
    public_id: String
  }],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  customer: ObjectId (ref: User, required),
  items: [{
    saree: ObjectId (ref: Saree),
    quantity: Number (required),
    unitPrice: Number,
    subtotal: Number
  }],
  totalAmount: Number (required),
  discount: Number (default: 0),
  finalAmount: Number (required),
  shippingAddress: String (required),
  status: Enum (pending, confirmed, processing, shipped, delivered, cancelled),
  paymentStatus: Enum (pending, partial, paid, overdue),
  paymentMethod: Enum (credit-card, bank-transfer, cheque, cash, other),
  deliveryDate: Date,
  notes: String,
  assignedEmployee: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (hashed),
  address: String,
  role: Enum (customer, employee, admin),
  isActive: Boolean (default: true),
  
  // Wholesale customer fields
  businessName: String,
  gstNumber: String,
  creditLimit: Number,
  registrationDate: Date,
  
  // Employee fields
  department: Enum (sales, inventory, support, management),
  employeeId: String,
  joinDate: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided or invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Stock Management

When an order is created:
- Stock is automatically decremented for each saree item

When an order is cancelled:
- Stock is automatically restored for each saree item

Status is updated based on stock:
- `stock <= 0`: "out-of-stock"
- `stock < 5`: "low-stock"
- `stock >= 5`: "in-stock"

---

## Business Logic

### Minimum Order Quantities
Each saree can have a different minimum order quantity. Orders cannot be placed with quantities below this minimum.

### Wholesale Pricing
- `retailPrice`: Maximum retail selling price
- `wholesalePrice`: Bulk wholesale price (typically 30-50% lower)

### Payment Tracking
- `paymentStatus` tracks the payment state of each order
- Support for partial payments (useful for large wholesale orders)

### Order Status Workflow
1. **pending** - Order just created, not yet confirmed
2. **confirmed** - Admin/Employee confirmed the order
3. **processing** - Order is being prepared/packed
4. **shipped** - Order shipped to customer
5. **delivered** - Order delivered and completed
6. **cancelled** - Order cancelled by customer or admin (stock restored)

---

## Environment Variables (.env)

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/saree_shop
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Getting Started

### Install Dependencies
```bash
cd server
npm install
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

The API will be available at `http://localhost:5000/api`
