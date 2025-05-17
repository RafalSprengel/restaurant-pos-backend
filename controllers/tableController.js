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
    const reservedDate = req.params.id;
    if (isNaN(reservedDate)) {
        return res.status(400).json({ error: 'Invalid date format' });
    }
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

// GET /api/reservations/availability?date=2025-05-20&tableNumber=1

exports.getAvailability = async (req, res) => {
    const RESERVATION_HOURS = {
        startHour: 11,
        endHour: 20,
    };

    const SLOT_DURATION_MINUTES = 30;
    const RESERVATION_DURATION_MINUTES = 120;

    const MAX_DAYS_IN_ADVANCE = 21;
    const { date, tableNumber } = req.query;

    if (!date || !tableNumber) {
        return res.status(400).json({ message: 'Missing date or tableNumber' });
    }
                                       
    const selectedDate = new Date(date);
    const today = new Date();
    const diffDays = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays > MAX_DAYS_IN_ADVANCE) {
        return res.status(400).json({ message: 'Date too far in the future' });
    }

    try {
        const table = await Table.findOne({ tableNumber });
        if (!table) return res.status(404).json({ message: 'Table not found' });

        const dayStart = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0));
        const dayEnd = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 999));

        const reservations = await Reservation.find({
            tableId: table._id,
            reservedDate: {
                $gte: dayStart,
                $lt: dayEnd,
            }
        });

       
        const SLOT_DURATION_MINUTES = 30;
        function isSlotBusy(slotStartUTC) {
            const slotEndUTC = new Date(slotStartUTC.getTime() + SLOT_DURATION_MINUTES * 60000);
            return reservations.some(r => {
                const resStart = new Date(r.reservedDate);
                const resEnd = new Date(r.endDate);
                return (slotStartUTC < resEnd) && (slotEndUTC > resStart);
            });
        }


        const availableSlots = [];
        for (let h = RESERVATION_HOURS.startHour; h < RESERVATION_HOURS.endHour; h++) {
            for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
                const slotUTC = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), h, m, 0));
                availableSlots.push({
                    time: slotUTC.toISOString(), 
                    available: !isSlotBusy(slotUTC),
                });
            }
        }

        return res.json({ slots: availableSlots });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

