const mongoose = require('mongoose')
const { database_url } = require('../config.js')
mongoose.connect(database_url)