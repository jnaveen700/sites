// ⚠️ FUTURE FEATURE - PHASE 2
// Saree Reservation Model
// Purpose: Allow customers to reserve/book specific sarees in advance
// Status: DISABLED in production (rename .FUTURE to activate)
// How to enable: Rename to SareeReservation.js and uncomment in server.js
// TODO for future agents:
//   - Update imports in controllers/sareeReservationController.FUTURE.js
//   - Add routes to server.js: app.use('/api/reservations', sareeReservationRoutes)
//   - Implement reservation calendar
//   - Add auto-cancellation for expired reservations
//   - Integrate with order management

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        saree: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Saree',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit-card', 'bank-transfer', 'cheque', 'cash', 'other'],
    },
    deliveryDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
