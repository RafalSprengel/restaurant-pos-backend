const Order = require('../db/models/Order');
const Customer = require('../db/models/Customer');
const Visit = require('../db/models/Visit');

exports.getStats = async (req,res)=>{
    try{
const orders = await Order.find({});
const totalOrders = orders.length;
const recentOrders = orders.filter(order => order.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // last 7 days
const last7DaysOrders = recentOrders.length;

const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const allStats = await Visit.find();

  const totalVisitors = allStats.reduce((acc, stat) => acc + stat.visitors, 0);

  const last7DaysVisitors = allStats
    .filter(stat => new Date(stat.date) >= new Date(sevenDaysAgo.toISOString().split('T')[0]))
    .reduce((acc, stat) => acc + stat.visitors, 0)
  
const ordersLast7days = await Order.find({createdAt:{$gte:sevenDaysAgo}}).sort({ createdAt: -1 });

const topProducts = await Order.aggregate([
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
    totalOrders,
    totalRevenue: orders.reduce((acc, order) => acc + order.totalPrice, 0),
    last7DaysOrders,
    last7DaysRevenue: recentOrders.reduce((acc, order) => acc + order.totalPrice, 0),
    totalVisitors,
    last7DaysVisitors,
    ordersLast7days,
    topProducts
});
    }catch(e){
        console.log('ERROR fetching stats: ', e);
        return res.status(500).json({ error: e.message });
    }
}