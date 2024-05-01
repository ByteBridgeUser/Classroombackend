const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
    ],
    child :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    
    }
});

teacherSchema.methods.comparePassword = async function (enteredPassword) {
    try {
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error; // Rethrow the error for centralized error handling
    }
};

teacherSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;