import { DataStore } from '../data/dataStore.js';

export const getAdminStats = async (req, res) => {
  try {
    const orders = await DataStore.getOrders();
    const products = await DataStore.getProducts();
    const inquiries = await DataStore.getCustomInquiries();

    const totalRevenuePKR = orders.reduce((acc, order) => {
      return acc + (order.totalPKR || 0);
    }, 0);

    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'In Crafting').length;
    const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;
    const customInquiriesCount = inquiries.length;

    return res.json({
      totalRevenuePKR,
      totalOrders: orders.length,
      pendingOrdersCount,
      deliveredOrdersCount,
      totalProducts: products.length,
      customInquiriesCount,
      recentOrders: orders.slice(0, 5),
      recentInquiries: inquiries.slice(0, 5)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve atelier performance stats' });
  }
};
