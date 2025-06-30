const Settings = require("../db/models/Settings.js");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings." });
  }
};

exports.updateSettings = async (req, res) => {
  const { reservationSettings, messageSettings } = req.body;

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ reservationSettings, messageSettings });
    } else {
      settings.reservationSettings = reservationSettings;
      settings.messageSettings = messageSettings;
      await settings.save();
    }
    res.status(200).json({ message: "Settings updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings." });
  }
};
