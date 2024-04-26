const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    semester: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
    },
    subject: String,
    subjectCode: String,
    assignments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
        },
    ],
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        },
    ],
    announcements: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Announcement',
        },
    ],
    spreadsheetLink: {
        type: String,
        required: true,
    },
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;