# Saree Shop Frontend Quick Reference

## 🚀 Quick Start Guide for Frontend Developers

---

## API Endpoints Quick Reference

### Sarees (Products)
```javascript
// Get all sarees with filters
GET /api/sarees?material=silk&pattern=embroidered&page=1&limit=10

// Get single saree details
GET /api/sarees/:sareeId

// Create saree (Admin only)
POST /api/sarees (multipart/form-data)

// Update saree (Admin only)  
PUT /api/sarees/:sareeId (multipart/form-data)

// Delete saree (Admin only)
DELETE /api/sarees/:sareeId
```

### Orders
```javascript
// Get all orders (filtered by role)
GET /api/orders?status=pending&paymentStatus=paid&page=1

// Get single order
GET /api/orders/:orderId

// Create order (Wholesale customer)
POST /api/orders

// Update order status (Employee/Admin)
PUT /api/orders/:orderId/status

// Cancel order
DELETE /api/orders/:orderId
```

### Authentication
```javascript
// Register
POST /api/auth/register

// Login
POST /api/auth/login
```

---

## Data Structures

### Saree Object
```javascript
{
  _id: "65a3f8d2c9e4b5a1f2e3d4c5",
  designName: "Traditional Silk Wedding Saree",
  description: "Premium silk saree...",
  retailPrice: 5000,
  wholesalePrice: 3500,
  color: "Deep Red",
  material: "silk",           // silk|cotton|linen|georgette|chiffon|dupioni|mixed
  pattern: "embroidered",     // plain|striped|checked|printed|embroidered|woven
  length: "6 yards",
  stock: 25,
  minOrderQuantity: 5,
  status: "in-stock",         // in-stock|low-stock|out-of-stock|discontinued
  season: "all-season",       // spring|summer|monsoon|autumn|winter|all-season
  images: [
    {
      url: "https://cloudinary.com/...",
      public_id: "saree_001"
    }
  ],
  createdBy: "admin_id",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Order Object
```javascript
{
  _id: "65a3f8d3c9e4b5a1f2e3d4c6",
  orderNumber: "ORD-1705315200000-1",
  customer: {
    _id: "customer_id",
    name: "ABC Wholesale",
    email: "wholesale@example.com",
    phone: "+91-9876543210",
    businessName: "ABC Wholesale",
    gstNumber: "27AABDE1234H1Z0"
  },
  items: [
    {
      saree: {
        _id: "65a3f8d2c9e4b5a1f2e3d4c5",
        designName: "Traditional Silk Wedding Saree",
        color: "Deep Red",
        material: "silk"
      },
      quantity: 10,
      unitPrice: 3500,
      subtotal: 35000
    }
  ],
  totalAmount: 40000,
  discount: 500,
  finalAmount: 39500,
  shippingAddress: "123 Business Complex, Delhi",
  status: "pending",           // pending|confirmed|processing|shipped|delivered|cancelled
  paymentStatus: "pending",    // pending|partial|paid|overdue
  paymentMethod: "bank-transfer", // credit-card|bank-transfer|cheque|cash|other
  deliveryDate: "2024-02-15T00:00:00Z",
  notes: "Please expedite delivery",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

---

## API Request Examples

### 1. Create Order
```javascript
const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            saree: "65a3f8d2c9e4b5a1f2e3d4c5",
            quantity: 10
          },
          {
            saree: "65a3f8d2c9e4b5a1f2e3d4c6",
            quantity: 5
          }
        ],
        shippingAddress: "123 Business Complex, Delhi",
        paymentMethod: "bank-transfer",
        discount: 500,
        notes: "Rush delivery"
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

### 2. Get Sarees with Filters
```javascript
const getSarees = async (filters) => {
  try {
    const params = new URLSearchParams();
    if (filters.material) params.append('material', filters.material);
    if (filters.pattern) params.append('pattern', filters.pattern);
    if (filters.search) params.append('search', filters.search);
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    
    const response = await fetch(`/api/sarees?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sarees:', error);
  }
};
```

### 3. Update Order Status (Employee)
```javascript
const updateOrderStatus = async (orderId, statusUpdate) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: "processing",
        paymentStatus: "partial",
        deliveryDate: "2024-02-15T00:00:00Z"
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
  }
};
```

---

## Filter Options

### Material Options
```javascript
const materials = ['silk', 'cotton', 'linen', 'georgette', 'chiffon', 'dupioni', 'mixed'];
```

### Pattern Options
```javascript
const patterns = ['plain', 'striped', 'checked', 'printed', 'embroidered', 'woven'];
```

### Season Options
```javascript
const seasons = ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'all-season'];
```

### Order Status
```javascript
const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
```

### Payment Status
```javascript
const paymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
```

### Payment Methods
```javascript
const paymentMethods = ['credit-card', 'bank-transfer', 'cheque', 'cash', 'other'];
```

---

## Component Structure Suggestions

### Pages
```
client/src/pages/
├── public/
│   ├── SareesCatalog.jsx      (Browse all sarees)
│   ├── SareeDetail.jsx        (View single saree)
│   └── ShoppingCart.jsx       (Multi-item cart)
├── customer/
│   ├── Checkout.jsx           (Create order)
│   ├── OrderHistory.jsx       (View orders)
│   └── OrderDetail.jsx        (View order details)
├── employee/
│   ├── OrderManagement.jsx    (View/update orders)
│   └── Dashboard.jsx          (Statistics)
└── admin/
    └── InventoryManagement.jsx (Add/edit sarees)
```

### Components
```
client/src/components/
├── SareeCard.jsx              (Display saree info)
├── SareeFilter.jsx            (Filter controls)
├── OrderSummary.jsx           (Order totals)
├── StatusBadge.jsx            (Status indicator)
├── PaymentStatus.jsx          (Payment indicator)
└── StockIndicator.jsx         (Stock level display)
```

### Context
```
client/src/context/
├── SareeContext.jsx           (Product management)
├── OrderContext.jsx           (Order state)
├── CartContext.jsx            (Shopping cart)
└── AuthContext.jsx            (User auth)
```

---

## Environment Setup

### .env (Frontend)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_PRESET=unsigned_preset_name
```

---

## Common Tasks

### Display Saree Catalog
```javascript
import { useState, useEffect } from 'react';

function SareesCatalog() {
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSarees();
  }, []);
  
  const fetchSarees = async () => {
    try {
      const response = await fetch('/api/sarees?page=1&limit=12');
      const data = await response.json();
      setSarees(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sarees.map(saree => (
        <SareeCard key={saree._id} saree={saree} />
      ))}
    </div>
  );
}
```

### Create Order
```javascript
const handleCreateOrder = async (orderItems) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        items: orderItems,
        shippingAddress: customerAddress,
        paymentMethod: 'bank-transfer'
      })
    });
    
    const order = await response.json();
    if (order.success) {
      // Show success message
      // Redirect to order confirmation
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Update Order Status (Employee)
```javascript
const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        status: newStatus,
        paymentStatus: 'partial'
      })
    });
    
    const updated = await response.json();
    // Refresh order data
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Important Notes

1. **Stock Management**: Stock is automatically managed by the backend
   - Decreases on order creation
   - Restores on order cancellation
   - Status updates based on levels

2. **Minimum Order Quantities**: Each saree has `minOrderQuantity`
   - Frontend should validate this before order creation
   - Backend also validates

3. **Authorization**: 
   - Store JWT token in localStorage after login
   - Include token in all protected endpoints
   - Token expires after set period

4. **Error Handling**: Always check `response.success` in API responses

5. **Pagination**: Use `page` and `limit` query parameters
   - Default limit: 10
   - Adjust based on UI needs

---

## Useful Links

- API Documentation: `/server/SAREE_SHOP_API.md`
- Migration Guide: `/MIGRATION_GUIDE.md`
- Transformation Summary: `/TRANSFORMATION_SUMMARY.md`
- Server Repo: `/server/`

---

## Testing with Postman

1. **Login first** - Get JWT token
2. **Create test data** - Add sample sarees
3. **Test order flow** - Create order, verify stock changes
4. **Test filtering** - Try different filter combinations
5. **Test status updates** - Update order and payment status

---

**Happy Coding! 🎉**
