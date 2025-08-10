const mongoose = require('mongoose');

const ReservationSettingsSchema = new mongoose.Schema({
  startHour: { type: Number, default: 10 },
  endHour: { type: Number, default: 23 },
  startHourOffset: { type: Number, default: 0 },
  reservationDurationHours: { type: Number, default: 2 },
  maxDaysInAdvance: { type: Number, default: 21 },
}, { _id: false,strict: true  });

const SmtpSettingsSchema = new mongoose.Schema({
  host: { type: String, required: true },
  port: { type: Number, required: true },
  secure: { type: Boolean, default: false },
  user: { type: String, required: true },
  pass: { type: String, required: true }
}, { _id: false ,strict: true });

const SettingsSchema = new mongoose.Schema({
  reservationSettings: ReservationSettingsSchema,
  smtpSettings: SmtpSettingsSchema,
}, { timestamps: true ,strict: true });

const Settings = mongoose.model('Settings', SettingsSchema);
module.exports = Settings;
