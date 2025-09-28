const Settings = require("../db/models/Settings.js");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); 
    }

    const settingsObj = settings.toObject();
    delete settingsObj.smtpSettings.pass;
    delete settingsObj.createdAt;
    delete settingsObj.updatedAt;
    delete settingsObj.__v;
    delete settingsObj._id;

    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ message: "Failed to get settings." });
  }
}


exports.updateSettings = async (req, res) => {
  const { reservationSettings, smtpSettings } = req.body;

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ reservationSettings, smtpSettings });
    } else {
      if (reservationSettings) settings.reservationSettings = reservationSettings;
      if (smtpSettings) settings.smtpSettings = smtpSettings;
      await settings.save();
    }
    res.status(200).json({ message: "Settings updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings." });
  }
};
