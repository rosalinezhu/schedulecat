const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    availability: {type: mongoose.Schema.Types.Mixed, required: true, default: {}},
})

module.exports = mongoose.model('Availability', availabilitySchema);
