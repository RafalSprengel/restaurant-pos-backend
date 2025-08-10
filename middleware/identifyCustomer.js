const jwt = require('jsonwebtoken');
const Customer = require('../db/models/Customer');

const identifyCustomer = async (req, res, next) => {
  try {
    const accessToken = req.cookies.jwt;
    if (!accessToken) return next();

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded._id);
    if (customer) req.customer = customer;
  } catch (err) {
    console.error('Error verifying accessToken (identifyCustomer):', err.message);
  }
  next();
};

module.exports = identifyCustomer;
