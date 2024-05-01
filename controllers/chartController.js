const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

// Controller function to fetch total number of students and classes by teacher's email
const getStudentsAndClassesByTeacherEmail = async (req, res) => {
    try {
        const teacherEmail = req.body.teacherEmail; // Assuming 'teacherEmail' is provided in the request body

        // Fetch total number of students
        const totalStudents = await Student.countDocuments();

        // Fetch total number of classes by teacher's email
        const teacher = await Teacher.findOne({ email: teacherEmail }).populate('classes');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const totalClassesByTeacher = teacher.classes.length;

        // Send response with total students and classes
        res.status(200).json({
            totalStudents: totalStudents,
            totalClassesByTeacher: totalClassesByTeacher,
        });
    } catch (error) {
        console.error('Error fetching students and classes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getClassDataByTeacherEmail = async (req, res) => {
    try {
        const teacherEmail = req.body.teacherEmail; // Assuming 'teacherEmail' is provided in the request body

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: teacherEmail });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all classes created by the teacher
        const classes = await Class.find({ teacher: teacher._id }).populate('students');

        // Prepare the response data
        const classData = classes.map((cls) => ({
            name: cls.subjectCode,
            uv: cls.students.length, // Count of students in the class
        }));

        // Send the response in the specified format
        res.status(200).json(classData);
    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getClassDataWithAnnouncementsAndAssignmentsByTeacherEmail = async (req, res) => {
    try {
        const teacherEmail = req.body.teacherEmail; // Assuming 'teacherEmail' is provided in the request body

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: teacherEmail });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all classes created by the teacher with populated announcements and assignments
        const classes = await Class.find({ teacher: teacher._id })
            .populate('announcements')
            .populate('assignments');

        // Prepare the response data
        const classData = classes.map((cls) => ({
            name: cls.subjectCode,
            uv: cls.announcements.length, // Count of announcements in the class
            pv: cls.assignments.length, // Count of assignments in the class
        }));

        // Send the response in the specified format
        res.status(200).json(classData);
    } catch (error) {
        console.error('Error fetching class data with announcements and assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


//user1 controllers
const getClassesByStudentEmail = async (req, res) => {
    try {
        const { studentEmail } = req.body; // Get the studentEmail from the request body

        // First, try to find the student by email
        let student = await Student.findOne({ email: studentEmail });
        if (!student) {
            // If no student found, check if it's a teacher's email
            const teacher = await Teacher.findOne({ email: studentEmail }).populate('child');
            if (teacher && teacher.child) {
                // If the teacher has a child associated, use that student's ID
                student = teacher.child;
            } else {
                // If no student or teacher with a child is found, return appropriate message
                return res.status(404).json({ message: 'No student found associated with this email' });
            }
        }

        // Find all classes where the found student is present
        const classes = await Class.find({ students: student._id }).populate('assignments');

        // Prepare the response data
        const classData = classes.map(cls => ({
            name: cls.subjectCode,
            pv: cls.assignments.length, // Count of assignments in the class
        }));

        // Send the response in the specified format
        res.status(200).json(classData);
    } catch (error) {
        console.error('Error fetching classes for student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getTeachersAndClassesByStudentEmail = async (req, res) => {
    try {
        const { studentEmail } = req.body; // Assuming 'studentEmail' is provided in the request body

        // Fetch total number of teachers in the app
       const totalTeachers = await Teacher.aggregate([
            {
                $match: { child: { $exists: false } }
            }
        ]);

        // Try to find the student by email
        let student = await Student.findOne({ email: studentEmail });
        if (!student) {
            // If no student found, check if it's a teacher's email
            const teacher = await Teacher.findOne({ email: studentEmail }).populate('child');
            if (teacher && teacher.child) {
                // If the teacher has a child associated, use that student's ID
                student = teacher.child;
            } else {
                // If no student or teacher with a child is found, return appropriate message
                return res.status(404).json({ message: 'No student found associated with this email' });
            }
        }

        // Find all classes where the found student is enrolled
        const studentClasses = await Class.find({ students: student._id }).populate('assignments');
        const numberOfClasses = studentClasses.length;

        // Send response with total teachers and number of classes for the student
        res.status(200).json({
            totalTeachers: totalTeachers.length,
            numberOfClasses: numberOfClasses,
        });
    } catch (error) {
        console.error('Error fetching teachers and classes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
//user1 controllers


module.exports = { getStudentsAndClassesByTeacherEmail,getClassDataByTeacherEmail,getClassDataWithAnnouncementsAndAssignmentsByTeacherEmail,getClassesByStudentEmail,getTeachersAndClassesByStudentEmail };
