const Message = require('../db/models/Message');
const nodemailer = require('nodemailer');
const Settings = require('../db/models/Settings.js');

exports.newMessageFromForm = async (req, res) => {
  const { name, email, subject, body } = req.body;

  if (!name || !email || !subject || !body) {
    return res.status(400).json({ body: 'All fields are required.' });
  }

  let newMessage;
  try {
    newMessage = await Message.create({ name, email, subject, body });
  } catch (dbErr) {
    console.error('Database error on message creation:', dbErr);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
  try {
    const settings = await Settings.findOne({}).sort({ createdAt: -1 });
    if (!settings) {
      console.error('SMTP settings not found in database.');
      return res.status(201).json({ message: 'Message sent successfully.' });
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpSettings.host,
      port: settings.smtpSettings.port,
      secure: settings.smtpSettings.secure,
      auth: {
        user: settings.smtpSettings.user,
        pass: settings.smtpSettings.pass
      }
    });

    const adminMailOptions = {
      from: 'sprengel.rafal@gmail.com',
      to: settings.smtpSettings.user,
      subject: `New message from justcode.co.uk: ${subject}`,
      text: `From: ${name} <${email}>\n\n${body}`
    };

    const customerMailOptions = {
      from: 'sprengel.rafal@gmail.com',
      to: email,
      subject: `Copy of your message: ${subject}`,
      text: `You sent the following message to us:\n\n${body}\n\nWe will get back to you shortly.`
    };

    try {
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(customerMailOptions);
    } catch (emailErr) {
      console.error('Failed to send emails. Check SMTP configuration. Message saved to DB.', emailErr);
    }

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('General error during email processing (message saved to DB):', err);
    res.status(201).json({ message: 'Message sent successfully.' });
  }
};

exports.getReceivedMessages = async (req, res) => {
  try {
    result = await Message.find({ type: 'received' })
    res.status(200).json(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve messages. Details: ' + err.message })
  }
}

exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ isRead: false, type: 'received' });
    res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve messages count. Details: ' + err.message });
  }
};

exports.getSentMessages = async (req, res) => {
  try {
    result = await Message.find({ type: 'sent' })
    res.status(200).json(result)
  } catch (err) {
    console.error(err);
  }
}

exports.getMessageById = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    await Message.findOneAndUpdate({ _id: id }, { isRead: true }, { new: true });
    res.status(200).json(message);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve message.' });
  }
};

exports.deleteMessageById = async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete message.' });
  }
};

exports.deleteMessages = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'IDs array is required.' });
  }

  try {
    const result = await Message.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({ message: 'Messages deleted successfully.', deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete messages. Details: " + err.message });
  }
};

exports.getMessages = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  const searchString = req.query.search || '';
  const type = req.query.type; // 'received' or 'sent'

  const filter = {};

  if (type === 'received' || type === 'sent') {
    filter.type = type;
  }

  if (searchString) {
    filter.$or = [
      { name: { $regex: searchString, $options: 'i' } },
      { email: { $regex: searchString, $options: 'i' } },
      { subject: { $regex: searchString, $options: 'i' } },
      { body: { $regex: searchString, $options: 'i' } },
    ];
  }

  try {
    const messages = await Message.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offset)
      .limit(limit);

    const total = await Message.countDocuments(filter);

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      messages,
    });
  } catch (err) {
    console.error('ERROR fetching messages:', err);
    return res.status(500).json({ error: 'Error fetching messages' });
  }
};

exports.replyToMessage = async (req, res) => {
  const { originalMessageId, body, subject } = req.body;

  if (!originalMessageId || !body || !subject) {
    return res.status(400).json({ message: 'Original message  id, body, and subject are required.' });
  }

  try {
    const originalMessage = await Message.findOne({
      _id: originalMessageId,
      type: 'received'
    });

    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found.' });
    }

    const replyMessage = await Message.create({
      name: originalMessage.name,
      email: originalMessage.email,
      subject,
      body,
      type: 'sent',
      isRead: true, // Mark as read since it's a reply
      originalTopic: originalMessageId
    });

    res.status(201).json({ message: 'Reply sent successfully.', replyMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send reply.' });
  }
};
