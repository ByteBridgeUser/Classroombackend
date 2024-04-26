const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');

exports.searchStudents = async (req, res) => {
    try {
        const { name, rollNo, semester, branch } = req.query;

        // Build the search criteria
        const searchCriteria = {};
        if (name) searchCriteria.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive regex
        if (rollNo) searchCriteria.rollNo = rollNo;
        if (semester) searchCriteria.semester = semester;
        if (branch) searchCriteria.branch = branch;

        // const projection = { _id: 0 };

        const students = await Student.find(searchCriteria);

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createClass = async (req, res) => {
    try {
      const { name, semester, section, subject, subjectCode, spreadsheetLink } = req.body;
  
      // Validate required fields
      if (!name || !semester || !section || !subject || !subjectCode || !spreadsheetLink) {
        return res.status(400).json({ error: 'Please fill all the fields' });
      }
  
      // Find the teacher by name
      const teacher = await Teacher.findOne({ name });
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      // Create a new class instance
      const newClass = new Class({
        semester: semester.toUpperCase(), // Convert semester to uppercase
        section: section.toUpperCase(), // Convert section to uppercase
        teacher: teacher._id,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1), // Capitalize subject name
        subjectCode: subjectCode.toUpperCase(), // Convert subject code to uppercase
        spreadsheetLink
      });
  
      // Save the new class
      await newClass.save();
  
      // Update teacher's classes array
      teacher.classes.push(newClass);
      await teacher.save();
  
      // Return the newly created class in the response
      res.json(newClass);
    } catch (error) {
      console.error('Error creating class:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.addAssignment = async (req, res) => {
    try {
        const { classId, title, description, dueDate } = req.body;
        const targetClass = await Class.findById(classId);

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            class: targetClass._id,
        });

        await newAssignment.save();
        targetClass.assignments.push(newAssignment);
        await targetClass.save();

        res.json(newAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.addStudentToClass = async (req, res) => {
    try {
        const { classId, studentNames } = req.body;
        const targetClass = await Class.findById(classId);

        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        for (const studentName of studentNames) {
            const student = await Student.findOne({ name: studentName });

            if (!student) {
                console.error(`Student "${studentName}" not found`);
                continue; // Skip adding this student and proceed with the next one
            }

            // Check if the student already exists in the class based on object ID
            const existingStudent = targetClass.students.find(student => student.equals(student._id));
            if (existingStudent) {
                console.error(`Student "${studentName}" is already in the class`);
                return res.status(400).json({ error: `Student "${studentName}" is already in the class` });
                // continue; // Skip adding this student and proceed with the next one
            }

            targetClass.students.push(student);
        }

        await targetClass.save();

        return res.json(targetClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.removeStudentFromClass = async (req, res) => {
    try {
        const { classId, studentId } = req.body;

        // Find the target class
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check if the student exists in the class
        const studentIndex = targetClass.students.findIndex(s => s.equals(studentId));
        if (studentIndex === -1) {
            console.error(`Student with ID "${studentId}" is not in the class`);
            return res.status(400).json({ error: `Student with ID "${studentId}" is not in the class` });
        }

        // Remove the student from the class
        targetClass.students.splice(studentIndex, 1);
        await targetClass.save();

        // Delete the student object
        // await Student.findByIdAndDelete(studentId);

        return res.json(targetClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.removeClass = async (req, res) => {
    try {
        const { classId, email } = req.body;

        // Find the target class
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: email });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Remove the class from the teacher's classes array
        const classIndex = teacher.classes.findIndex(c => c.equals(classId));
        if (classIndex === -1) {
            console.error(`Class with ID "${classId}" is not associated with teacher`);
            return res.status(400).json({ error: `Class with ID "${classId}" is not associated with teacher` });
        }
        teacher.classes.splice(classIndex, 1);

        // Save the updated teacher
        await teacher.save();

        // Delete the class object
        await Class.findByIdAndDelete(classId);

        return res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





exports.viewClasses = async (req, res) => {
    try {
        const { name } = req.query;
        const teacher = await Teacher.findOne({ name }).populate('classes');

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json(teacher.classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.viewAssignments = async (req, res) => {
    try {
      const { emailid } = req.params;
  
      // Find the student document by email to get its ObjectId
      const teacher = await Teacher.findOne({ email: emailid });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const teacherId = teacher._id;
  
      // Find the class(es) in which the student is enrolled
      const classes = await Class.find({ teacher: teacherId });
  
      // Collect the IDs of these classes
      const classIds = classes.map(classData => classData._id);
  
      // Find all assignments where the class ID exists in the classIds array
      const assignments = await Assignment.find({ class: { $in: classIds } }).populate({
        path: 'class',
        select: 'subjectCode'
      });
  
      res.json(assignments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  exports.viewAssignmentspecific = async (req, res) => {
    try {
      const { classId } = req.params;
  
      // Find the class by its ID
      const cls = await Class.findById(classId);
  
      if (!cls) {
        return res.status(404).json({ error: "Class not found" });
      }
  
      // Find assignments associated with the specified class ID
      const assignments = await Assignment.find({ class: classId });
  
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
