const router = express.Router();
const { Customer } = require('../db/models/Customer');

router.all('/customer', authentMiddleware, async (req, res) => {
    const customer = await Customer.findOne({ _id: req.user._id });
    if (!customer) {
        return res.status(401).json({ error: 'Customer not found' });
    }
    res.json({
        _id: req.user.id,
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        role: customer.role,
    });
});
router.get('/getCustomers', authentMiddleware, authorize(['member', 'moderator', 'admin']), ApiController.getCustomers);
router.delete('/deleteCustomer/:id', authentMiddleware, authorize(['admin']), ApiController.deleteCustomer);

module.exports = router;
