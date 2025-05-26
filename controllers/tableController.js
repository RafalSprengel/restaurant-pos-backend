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
    const { tableNumber, reservedTime, reservedDate, customerDetails, message } = req.body;
    const RESERVATION_DURATION_HOURS = 2;

    if (!tableNumber || !reservedTime || !reservedDate || !customerDetails.name || !customerDetails.email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const dateISOstring = `${reservedDate}T${reservedTime}:00.000Z`;
    const startDate = new Date(dateISOstring);

    if (startDate < new Date(Date.now() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000)) {
        return res.status(400).json({
            message: `Reservations must be made at least ${RESERVATION_DURATION_HOURS} hour(s) in advance`
        });
    }

    try {
        const endDate = new Date(startDate.getTime() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000);
        const table = await Table.findOne({ tableNumber });

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const overlappingReservation = await Reservation.findOne({
            tableId: table._id,
            'reservedDate.startDate': { $lt: endDate },
            'reservedDate.endDate': { $gt: startDate }
        });

        if (overlappingReservation) {
            return res.status(409).json({ message: 'Table is already reserved during the selected time' });
        }

        const newReservation = new Reservation({
            tableId: table._id,
            tableNumber,
            reservedDate: {
                startDate,
                endDate
            },
            customerDetails,
            message
        });

        await newReservation.save();
        return res.status(201).json({
            message: 'Reservation created successfully',
            reservation: newReservation
        });

    } catch (err) {
        console.error('ERROR adding reservation:', err);
        return res.status(500).json({ message: 'Internal server error while creating reservation' });
    }
};

exports.getAvailability = async (req, res) => {
    const RESERVATION_HOURS = {
        startHour: 0,
        endHour: 20,
    };

    const MIN_START_TIME_OFFSET = 3; // in hours
    const SLOT_STEP_MINUTES = 60;
    const MAX_DAYS_IN_ADVANCE = 21;
    const { date, tableNumber } = req.query;

    if (!date || !tableNumber) {
        return res.status(400).json({ message: 'Missing date or tableNumber' });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays > MAX_DAYS_IN_ADVANCE) {
        return res.status(400).json({ message: 'Date too far in the future' });
    }

    const now = new Date();
    const nowWithOffset = new Date(now.getTime() + MIN_START_TIME_OFFSET * 60 * 60 * 1000);

    try {
        const table = await Table.findOne({ tableNumber });
        if (!table) return res.status(404).json({ message: 'Table not found' });

        const dayStart = new Date(selectedDate);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setUTCHours(23, 59, 59, 999);

        const reservations = await Reservation.find({
            tableId: table._id,
            'reservedDate.startDate': { $gte: dayStart, $lt: dayEnd }
        });

        function isSlotBusy(slotStart) {
            const slotEnd = new Date(slotStart.getTime() + SLOT_STEP_MINUTES * 60 * 1000);
            return reservations.some(r => {
                const resStart = r.reservedDate.startDate;
                const resEnd = r.reservedDate.endDate;
                return (slotStart < resEnd) && (slotEnd > resStart);
            });
        }

        const availableSlots = [];

        for (let h = RESERVATION_HOURS.startHour; h < RESERVATION_HOURS.endHour; h += SLOT_STEP_MINUTES / 60) {
            const slotStart = new Date(Date.UTC(
                selectedDate.getUTCFullYear(),
                selectedDate.getUTCMonth(),
                selectedDate.getUTCDate(),
                Math.floor(h),
                Math.round((h - Math.floor(h)) * 60),
                0, 0
            ));

            const nowUtc = new Date(new Date().toISOString());
            const nowWithOffsetUtc = new Date(nowUtc.getTime() + MIN_START_TIME_OFFSET * 60 * 60 * 1000);

            if (
                selectedDate.getUTCFullYear() === nowUtc.getUTCFullYear() &&
                selectedDate.getUTCMonth() === nowUtc.getUTCMonth() &&
                selectedDate.getUTCDate() === nowUtc.getUTCDate() &&
                slotStart < nowWithOffsetUtc
            ) {
                continue;
            }

            availableSlots.push({
                time: slotStart.toISOString(),
                available: !isSlotBusy(slotStart),
            });
        }

        return res.json({ slots: availableSlots });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};





