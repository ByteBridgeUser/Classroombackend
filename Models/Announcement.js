const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;