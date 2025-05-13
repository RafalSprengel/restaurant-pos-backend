const Table = require('../db/models/Table')

exports.getTables = async (req, res) => {
    try {
        const tables = await Table.find();
        if (tables) {
            return res.status(200).json(tables)
        } else {
            return res.status(404).json({ error: 'Tables not found' });
        }
    } catch {
        console.error('ERROR fetching tables', err);
        return res.status(500).json({ error: 'Error fetching tables' });
    };
}
async (reservedDate) => {
    const tables = await Table.find();

    const availableTables = [];

    for (let table of tables) {
        const existingReservation = await Reservation.findOne({
            table: table._id,
            reservedDate: reservedDate,
        });

        if (!existingReservation) {
            availableTables.push(table);
        }
    }

    return availableTables;
};
