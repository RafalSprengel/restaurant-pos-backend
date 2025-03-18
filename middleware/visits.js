const Visit = require('../db/models/Visit');

const visits = async(req, res, next) => {
    const today = new Date().toISOString().split('T')[0];

    if (!req.cookies.visited) {
        await Visit.findOneAndUpdate(
            { date: today },
            { $inc: { visitors: 1 } },
            { upsert: true, new: true }
        );

        res.cookie('visited', 'true', { maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    }

    next();
}
module.exports = visits;