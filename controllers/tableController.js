const Table = require('../db/models/Table')
const Reservation = require('../db/models/Reservation.js')

exports.getTables = async (req, res) => {
    try {
        const tables = await Table.find();

        return res.status(200).json(tables)
    } catch {
        console.error('ERROR fetching tables', err);
        return res.status(500).json({ error: 'Error fetching tables' });
    };
}

exports.findAvailableTables = async (req, res) => {
    const reservedDate = req.params.id
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


exports.addTable = async (req, res) => {
    const { tableNumber, capacity, location } = req.body;

    if (!tableNumber || !capacity || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            return res.status(409).json({ error: 'Table with this number already exists' });
        }

        const newTable = new Table({
            tableNumber,
            capacity,
            location
        });

        const savedTable = await newTable.save();
        return res.status(201).json(savedTable);
    } catch (err) {
        console.error('ERROR adding table: ', err);
        return res.status(500).json({ error: 'Error creating table' });
    }
};

exports.addReservation = async (req, res) => {
    const { tableNumber, reservedDate, customerName } = req.body;
    const RESERVATION_DURATION_HOURS = 2;

    if (!tableNumber || !reservedDate || !customerName) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const table = await Table.findOne({ tableNumber });

        if (!table) {
            return res.status(500).json({ error: 'Wrong table number' });
        }

        const startDate = new Date(reservedDate);
        const endDate = new Date(startDate.getTime() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000);

        const overlappingReservation = await Reservation.findOne({
            tableId: table._id,
            reservedDate: { $lt: endDate },
            endDate: { $gt: startDate }
        });
        if (overlappingReservation) {
            return res.status(409).json({ error: 'Table already booked during this time!' });
        }

        const newReservation = new Reservation({
            tableId: table._id,
            reservedDate: startDate,
            endDate: endDate,
            customerName
        });

        await newReservation.save();

        return res.status(201).json({
            message: 'Reservation successful',
            reservation: newReservation
        });

    } catch (err) {
        console.error('ERROR adding reservation:', err);
        return res.status(500).json({ error: 'ERROR adding reservation' });
    }
};
