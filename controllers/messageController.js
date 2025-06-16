const Message = require('../db/models/Message');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'sprengel.rafal@gmail.com';

exports.addMessage = async (req, res) => {
  const { name, email, subject, body } = req.body;

  if (!name || !email || !subject || !body) {
    return res.status(400).json({ body: 'All fields are required.' });
  }

  try {
    const newMessage = await Message.create({ name, email, subject, body });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sprengel.rafal@gmail.com',
        pass: 'xlul nrqf molp oguy'
      }
    });

    const adminMailOptions = {
      from: 'sprengel.rafal@gmail.com',
      to: ADMIN_EMAIL,
      subject: `New message from justcode.co.uk: ${subject}`,
      text: `From: ${name} <${email}>\n\n${body}`
    };

    const customerMailOptions = {
      from: 'sprengel.rafal@gmail.com',
      to: email,
      subject: `Copy of your message: ${subject}`,
      text: `You sent the following message to us:\n\n${body}\n\nWe will get back to you shortly.`
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' });
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
    console.error
    res.status(500).json({ message: 'Failed to delete message.' });
  }
};


exports.deleteMessages = async (req, res) => {
  const { ids } = req.body;
  console.log(ids)

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

