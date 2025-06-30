const mongoose = require('mongoose');

const ReservationSettingsSchema = new mongoose.Schema({
  startHour: { type: Number, default: 10 },
  endHour: { type: Number, default: 23 },
  startHourOffset: { type: Number, default: 0 },
  reservationDurationHours: { type: Number, default: 2 },
  maxDaysInAdvance: { type: Number, default: 21 },
}, { _id: false });

const MessageSettingsSchema = new mongoose.Schema({
  adminEmail: { type: String },
  gmailUser: { type: String },
  gmailPass: { type: String },
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  reservationSettings: ReservationSettingsSchema,
  messageSettings: MessageSettingsSchema,
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
module.exports = Settings;
