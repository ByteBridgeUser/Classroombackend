
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

exports.addAnnouncement = async (req, res) => {
    try {
        const { classId, title, content } = req.body;
        console.log('Received classId:', classId, title, content);
        const targetClass = await Class.findById(classId);

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const newAnnouncement = new Announcement({
            title,
            content,
            class: targetClass._id,
        });

        await newAnnouncement.save();
        targetClass.announcements.push(newAnnouncement);
        await targetClass.save();

        res.json(newAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.viewAnnouncements = async (req, res) => {
    try {
        const { classId } = req.params;
        const targetClass = await Class.findById(classId).populate('announcements');

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(targetClass.announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.viewAnnouncementsall = async (req, res) => {
    try {
        const { emailid } = req.body; // Assuming 'emailid' is provided in the request body

        // Step 1: Find the student based on the provided email ID
        let student = await Student.findOne({ email: emailid });
        if (!student) {
            // If no student found, check if it's a teacher's email
            const teacher = await Teacher.findOne({ email: emailid }).populate('child');
            if (teacher && teacher.child) {
                // If the teacher has a child associated, use that student's ID
                student = teacher.child;
            } else {
                // If no student or teacher with a child is found, return appropriate message
                return res.status(404).json({ error: 'No user found associated with this email' });
            }
        }

        // Step 2: Retrieve all classes in which the student is enrolled
        const targetClasses = await Class.find({ students: student._id }).populate({
            path: 'announcements',
            populate: {
                path: 'class',
                select: 'subjectCode'
            }
        });

        // Step 3: Extract announcements from each class
        const allAnnouncements = targetClasses.flatMap(cls => cls.announcements);

        res.json(allAnnouncements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.viewAnnouncementsallteacher = async (req, res) => {
    try {
        const { emailid } = req.body;

        // Step 1: Find the student based on the provided email ID
        console.log(emailid);
        const teacher = await Teacher.findOne({email: emailid });

        if (!teacher) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Step 2: Retrieve all classes in which the student is enrolled
        const targetClasses = await Class.find({ teacher: teacher._id }).populate({
            path: 'announcements',
            populate: {
                path: 'class',
                select: 'subjectCode'
            }
        });

        // Step 3: Extract announcements from each class
        const allAnnouncements = targetClasses.flatMap(cls => cls.announcements);

        res.json(allAnnouncements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};