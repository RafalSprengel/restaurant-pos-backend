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
    const { tableNumber, reservedDateTime, customerName } = req.body;
    const RESERVATION_DURATION_HOURS = 2;

    if (!tableNumber || !reservedDateTime || !customerName) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const regex = /^([01]?\d|2[0-3]):([0-5]?\d) (0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(20\d{2})$/;
        const match = reservedDateTime.match(regex);

        if (!match) {
            return res.status(400).json({ error: 'Invalid reservedDate format. Expected HH:mm DD.MM.YYYY.' });
        }

        const [, hours, minutes, day, month, year] = match;

        const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        const endDate = new Date(startDate.getTime() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000);

        const table = await Table.findOne({ tableNumber });

        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        const overlappingReservation = await Reservation.findOne({
            tableId: table._id,
            'reservedDate.startDate': { $lt: endDate },
            'reservedDate.endDate': { $gt: startDate }
        });

        if (overlappingReservation) {
            return res.status(409).json({ error: 'Table already booked during this time!' });
        }

        const newReservation = new Reservation({
            tableId: table._id,
            tableNumber,
            reservedDate: {
                startDate,
                endDate
            },
            customerName,
        });

        await newReservation.save();

        return res.status(201).json({
            message: 'Reservation successful',
            reservation: newReservation
        });

    } catch (err) {
        console.error('ERROR adding reservation:', err);
        return res.status(500).json({ error: 'Error adding reservation' });
    }
};



exports.getAvailability = async (req, res) => {
  const RESERVATION_HOURS = {
    startHour: 11,
    endHour: 20,
  };

  const SLOT_DURATION_MINUTES = 120;
  const MAX_DAYS_IN_ADVANCE = 21;
  const { date, tableNumber } = req.query;

  if (!date || !tableNumber) {
    return res.status(400).json({ message: 'Missing date or tableNumber' });
  }

  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays > MAX_DAYS_IN_ADVANCE) {
    return res.status(400).json({ message: 'Date too far in the future' });
  }

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
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      return reservations.some(r => {
        const resStart = r.reservedDate.startDate;
        const resEnd = r.reservedDate.endDate;
        return (slotStart < resEnd) && (slotEnd > resStart);
      });
    }

    const availableSlots = [];
    for (let h = RESERVATION_HOURS.startHour; h < RESERVATION_HOURS.endHour; h++) {
      for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
        const slotStart = new Date(selectedDate);
        slotStart.setUTCHours(h, m, 0, 0);

        availableSlots.push({
          time: slotStart.toISOString(),
          available: !isSlotBusy(slotStart),
        });
      }
    }

    return res.json({ slots: availableSlots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};



