const dayjs = require('dayjs');
const isToday = require('dayjs/plugin/isToday');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);

const Table = require('../db/models/Table');
const Reservation = require('../db/models/Reservation');

const START_HOUR_OFFSET = 0;
const RESERVATION_DURATION_HOURS = 2;
const MAX_DAYS_IN_ADVANCE = 21;

const RESERVATION_HOURS = {
  startHour: 10,
  endHour: 23,
};

exports.getTypeOfTables = async (req, res) => {
  try {
    const tables = await Table.find();
    return res.status(200).json(tables);
  } catch (err) {
    console.error('ERROR fetching tables', err);
    return res.status(500).json({ error: 'Error fetching tables' });
  }
};

exports.getReservations = async (req, res) => {
  console.log('wykonuje się get Reservatons')
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const searchString = req.query.search || '';
  const sortBy = req.query.sortBy || 'timeSlot.start';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  const allowedSortFields = ['tableNumber', 'timeSlot.start', 'customerDetails.name', 'customerDetails.email'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'timeSlot.start';

  const search = searchString
    ? {
      $or: [
        { 'customerDetails.name': { $regex: searchString, $options: 'i' } },
        { 'customerDetails.email': { $regex: searchString, $options: 'i' } },
        { message: { $regex: searchString, $options: 'i' } },
      ],
    }
    : {};

  let tableFilter = {};
  if (req.query.tableNumber) {
    const tableNum = parseInt(req.query.tableNumber);
    if (!isNaN(tableNum)) {
      tableFilter = { tableNumber: tableNum };
    }
  }

  try {
    const filters = { ...search, ...tableFilter };

    const reservations = await Reservation.find(filters)
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit)
      .lean();

    const totalReservations = await Reservation.countDocuments(filters);

    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      timeSlot: {
        start: dayjs(reservation.timeSlot.start).format('HH:mm DD-MM-YYYY'),
        end: dayjs(reservation.timeSlot.end).format('HH:mm DD-MM-YYYY'),
      },
    }));

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalReservations / limit),
      reservations: formattedReservations,
    });
  } catch (err) {
    console.error('ERROR fetching reservations', err);
    return res.status(500).json({ error: 'Error fetching reservations' });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id).lean();

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const formattedReservation = {
      ...reservation,
      timeSlot: {
        start: dayjs(reservation.timeSlot.start).format('HH:mm DD-MM-YYYY'),
        end: dayjs(reservation.timeSlot.end).format('HH:mm DD-MM-YYYY'),
      }
    };
    return res.status(200).json(formattedReservation);
  } catch (err) {
    console.error('ERROR fetching reservation by ID', err);
    return res.status(500).json({ error: 'Error fetching reservation' });
  }
};

exports.deleteReservatonById = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' })
    return res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    console.error('ERROR deleting reservation', err);
    return res.status(500).json({ error: 'Error deleting reservation, details:', err });
  }
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
      location,
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

  if (!tableNumber || !reservedTime || !reservedDate || !customerDetails.name || !customerDetails.email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const startDate = dayjs(`${reservedDate}T${reservedTime}`).toDate();
  if (!dayjs(startDate).isValid()) {
    return res.status(400).json({ message: 'Invalid date or time format' });
  }

  if (startDate < new Date(Date.now() + START_HOUR_OFFSET * 60 * 60 * 1000)) {
    return res.status(400).json({
      message: `Reservations must be made at least ${START_HOUR_OFFSET} hour(s) in advance`,
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
      'timeSlot.start': { $lt: endDate },
      'timeSlot.end': { $gt: startDate },
    });

    if (overlappingReservation) {
      return res.status(409).json({ message: 'Table is already reserved during the selected time' });
    }

    const newReservation = new Reservation({
      tableId: table._id,
      tableNumber,
      timeSlot: {
        start: startDate,
        end: endDate,
      },
      customerDetails,
      message,
    });

    await newReservation.save();
    return res.status(201).json({
      message: 'Reservation created successfully',
      reservation_details: {
        tableNumber: newReservation.tableNumber,
        time: dayjs(newReservation.timeSlot.start).format('HH:mm'),
        date: dayjs(newReservation.timeSlot.start).format('DD.MM.YYYY'),
      },
    });
  } catch (err) {
    console.error('ERROR adding reservation:', err);
    return res.status(500).json({ message: 'Internal server error while creating reservation' });
  }
};

exports.getAvailability = async (req, res) => {
  const { date, tableNumber } = req.query;

  if (!date || !tableNumber) {
    return res.status(400).json({ message: 'Missing date or tableNumber' });
  }

  const selectedDate = dayjs(date);
  if (!selectedDate.isValid()) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  let startHour = RESERVATION_HOURS.startHour;

  if (selectedDate.isToday()) {
    const currentHour = dayjs().hour();
    if (currentHour > RESERVATION_HOURS.startHour) {
      startHour = currentHour + START_HOUR_OFFSET + 1;
    } else {
      startHour = RESERVATION_HOURS.startHour;
    }
  }

  const today = dayjs().startOf('day');
  const diffDays = selectedDate.startOf('day').diff(today, 'day');
  if (diffDays > MAX_DAYS_IN_ADVANCE) {
    return res.status(400).json({ message: 'Date too far in the future' });
  }

  try {
    const table = await Table.findOne({ tableNumber });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    const dayStart = dayjs(selectedDate).startOf('day').toDate();
    const dayEnd = dayjs(selectedDate).endOf('day').toDate();

    const reservations = await Reservation.find({
      tableId: table._id,
      'timeSlot.start': { $gte: dayStart, $lt: dayEnd },
    });

    function isSlotBusy(slotStart) {
      const slotEnd = dayjs(slotStart).add(RESERVATION_DURATION_HOURS, 'hour').toDate();

      return reservations.some(r => {
        const resStart = r.timeSlot.start;
        const resEnd = r.timeSlot.end;
        return slotStart < resEnd && slotEnd > resStart;
      });
    }

    const availableSlots = [];

    for (let h = startHour; h <= RESERVATION_HOURS.endHour; h += RESERVATION_DURATION_HOURS) {
      const hour = Math.floor(h);
      const minute = Math.round((h - hour) * 60);
      const slotStart = dayjs(selectedDate).hour(hour).minute(minute).second(0).millisecond(0);

      availableSlots.push({
        time: hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0'),
        available: !isSlotBusy(slotStart),
      });
    }

    return res.json({ slots: availableSlots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
