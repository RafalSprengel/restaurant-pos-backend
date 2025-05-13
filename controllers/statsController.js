const Order = require('../db/models/Order');
const Customer = require('../db/models/Customer');
const Visit = require('../db/models/Visit');

exports.getStats = async (req, res) => {
  try {
      const orders = await Order.find({ isPaid: true });
      const totalOrders = orders.length;
      const recentOrders = orders.filter(order => order.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // ostatnie 7 dni
      const last7DaysOrders = recentOrders.length;

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      const allStats = await Visit.find();

      const totalVisitors = allStats.reduce((acc, stat) => acc + stat.visitors, 0);

      const last7DaysVisitors = allStats
          .filter(stat => new Date(stat.date) >= new Date(sevenDaysAgo.toISOString().split('T')[0]))
          .reduce((acc, stat) => acc + stat.visitors, 0);

      const last7DaysOrdersList = await Order.find({ createdAt: { $gte: sevenDaysAgo }, isPaid: true }).sort({ createdAt: -1 });

      const topProducts = await Order.aggregate([
          { $match: { isPaid: true } }, // dodany filtr na płatność
          { $unwind: "$products" },
          { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
          { $sort: { totalQuantity: -1 } },
          { $limit: 7 },
          {
              $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" },
          {
              $project: {
                  _id: 0,
                  productId: "$_id",
                  name: "$productDetails.name",
                  totalQuantity: 1
              }
          }
      ]);

      res.status(200).json({
          totalOrders, // liczba
          totalRevenue: orders.reduce((acc, order) => acc + order.totalPrice, 0), // suma revenue
          last7DaysOrders, // liczba
          last7DaysRevenue: recentOrders.reduce((acc, order) => acc + order.totalPrice, 0), // suma revenue za ostatnie 7 dni
          totalVisitors, // liczba
          last7DaysVisitors, // liczba
          last7DaysOrdersList, // lista zamówień z ostatnich 7 dni
          topProducts // top produkty
      });
  } catch (e) {
      console.log('ERROR fetching stats: ', e);
      return res.status(500).json({ error: e.message });
  }
}
