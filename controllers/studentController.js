const Class = require("../models/Class");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

exports.submitAssignment = async (req, res) => {
    try {
        const { studentName, assignmentId } = req.body;
        const student = await Student.findOne({ name: studentName });
        const assignment = await Assignment.findById(assignmentId);

        

        if (!student || !assignment) {
            return res.status(404).json({ error: "Student or Assignment not found" });
        }

        // Ensure the 'students' array is initialized
        if (!assignment.students) {
            assignment.students = [];
        }

        assignment.students.push(student);
        await assignment.save();

        // Ensure the 'assignments' array is initialized
        if (!student.assignments) {
            student.assignments = [];
        }

        student.assignments.push(assignment);
        await student.save();

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.viewAssignments = async (req, res) => {
    try {
        const { emailid } = req.params; // Assuming 'emailid' is provided in the request parameters
        console.log("emailid",emailid)

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

        // Step 2: Find the class(es) in which the student is enrolled
        const classes = await Class.find({ students: student._id });

        // Step 3: Collect the IDs of these classes
        const classIds = classes.map(classData => classData._id);

        // Step 4: Find all assignments where the class ID exists in the classIds array
        const assignments = await Assignment.find({ class: { $in: classIds } }).populate({
            path: 'class',
            select: 'subjectCode'
        });

        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateStudentInfo = async (req, res) => {
    try {
        const { name, semester, rollNo, branch } = req.body;
        const studentId = req.student._id;

        const updatedInfo = {};
        if (name) updatedInfo.name = name;
        if (semester) updatedInfo.semester = semester;
        if (rollNo) updatedInfo.rollNo = rollNo;
        if (branch) updatedInfo.branch = branch;

        const updatedStudent = await Student.findByIdAndUpdate(studentId, updatedInfo, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(updatedStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};