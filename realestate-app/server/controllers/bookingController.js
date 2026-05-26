// Order Controller
// Handles wholesale saree orders with proper authorization
// Customer: Create and view own orders
// Employee/Admin: View all orders and update status

import Order from '../models/Booking.js';
import Saree from '../models/Property.js';
import User from '../models/User.js';

/**
 * createOrder - Creates a new wholesale order (customers only)
 * POST /api/orders
 * 
 * AUTHORIZATION: Authenticated users (typically wholesale customers)
 * 
 * Body: { items: [{saree, quantity}, ...], shippingAddress, paymentMethod, notes }
 * items: Array of {saree: id, quantity: number}
 */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, discount, notes } = req.body;
    const customerId = req.user.id; // From authMiddleware

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    // Validate and fetch sarees, calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const saree = await Saree.findById(item.saree);

      if (!saree) {
        return res.status(404).json({
          success: false,
          message: `Saree with ID ${item.saree} not found`,
        });
      }

      // Check minimum order quantity
      if (item.quantity < saree.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${saree.designName} is ${saree.minOrderQuantity}`,
        });
      }

      // Check stock
      if (item.quantity > saree.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${saree.stock} units of ${saree.designName} available`,
        });
      }

      const subtotal = saree.wholesalePrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        saree: saree._id,
        quantity: item.quantity,
        unitPrice: saree.wholesalePrice,
        subtotal,
      });
    }

    // Calculate final amount after discount
    const discountAmount = discount ? parseFloat(discount) : 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Create new order
    const newOrder = new Order({
      customer: customerId,
      items: orderItems,
      totalAmount,
      discount: discountAmount,
      finalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'bank-transfer',
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await newOrder.save();

    // Update saree stock
    for (const item of orderItems) {
      await Saree.findByIdAndUpdate(
        item.saree,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Populate references for response
    await newOrder.populate('customer', 'name email phone');
    await newOrder.populate('items.saree', 'designName color material');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

/**
 * getOrders - Retrieves orders (filtered by role)
 * GET /api/orders
 * 
 * AUTHORIZATION: All authenticated users
 * - Customers see only their own orders
 * - Employees/Admins see all orders
 */
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};

    // If customer, only show their orders
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Fetch orders
    const orders = await Order.find(query)
      .populate('customer', 'name email phone businessName')
      .populate('items.saree', 'designName color material')
      .populate('assignedEmployee', 'name email department')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      userRole: req.user.role,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders',
    });
  }
};

/**
 * getOrderById - Retrieves a single order by ID
 * GET /api/orders/:id
 * 
 * AUTHORIZATION: Authenticated users
 * - Customers can only view their own orders
 * - Employees/Admins can view any order
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'name email phone businessName gstNumber')
      .populate('items.saree', 'designName color material wholesalePrice')
      .populate('assignedEmployee', 'name email department');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization: customers can only view their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own orders',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order',
    });
  }
};

/**
 * updateOrderStatus - Updates order status (employee/admin only)
 * 
 * AUTHORIZATION: Only employees and admins can update order status
 * 
 * PUT /api/orders/:id/status
 * Body: { status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, deliveryDate, assignedEmployee } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const validPaymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    // Build update object
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (deliveryDate) updates.deliveryDate = deliveryDate;
    if (assignedEmployee) updates.assignedEmployee = assignedEmployee;

    const order = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('customer', 'name email phone businessName')
      .populate('items.saree', 'designName color material')
      .populate('assignedEmployee', 'name email department');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status',
    });
  }
};

/**
 * cancelOrder - Cancels an order and restores stock
 * DELETE /api/orders/:id
 * 
 * AUTHORIZATION: 
 * - Customers can cancel their own pending/confirmed orders
 * - Employees/Admins can cancel any order (with restrictions for processed orders)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization: customers can only cancel their own orders
    if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders',
      });
    }

    // Prevent cancellation of shipped/delivered orders
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.status} status`,
      });
    }

    // Restore stock for all items in order
    for (const item of order.items) {
      await Saree.findByIdAndUpdate(
        item.saree,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Delete order
    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling order',
    });
  }
};
