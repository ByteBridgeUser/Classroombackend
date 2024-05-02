const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    dueDate: String,
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
