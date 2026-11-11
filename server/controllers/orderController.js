import { DataStore } from '../data/dataStore.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (guests can order with COD or logged in users)
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      orderItems,
      paymentMethod,
      subtotalPKR,
      shippingFeePKR,
      discountPKR,
      totalPKR
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in order bag' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
      return res.status(400).json({ message: 'Complete delivery details are required' });
    }

    const orderData = {
      user: req.user ? req.user._id : null,
      customer,
      orderItems,
      paymentMethod: paymentMethod || 'COD',
      subtotalPKR: Number(subtotalPKR),
      shippingFeePKR: Number(shippingFeePKR || 0),
      discountPKR: Number(discountPKR || 0),
      totalPKR: Number(totalPKR)
    };

    const createdOrder = await DataStore.createOrder(orderData);
    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ message: 'Failed to process order placement' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await DataStore.getOrders(req.user._id);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve your order history' });
  }
};

// @desc    Get order by ID or Tracking Code
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const order = await DataStore.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order record or tracking reference not found' });
    }
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching order' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await DataStore.getOrders();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch atelier order log' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingCode } = req.body;
    const updated = await DataStore.updateOrderStatus(req.params.id, status, trackingCode);
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update order progression status' });
  }
};
