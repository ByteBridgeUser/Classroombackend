const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const Class = require('../models/Class');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const Student = require('../models/Student');
const Teacher= require('../models/Teacher')
// const { google } = require('googleapis');
// const { JWT } = require('google-auth-library');
// const fs = require('fs');
// const Class = require('../models/Class');
// const { google } = require("googleapis");



exports.linkSpreadsheet = async (req, res) => {
  try {
    const { classId } = req.body;
    const targetClass = await Class.findById(classId);

    if (!targetClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Load the service account key
    const serviceAccountFile = 'serviceAccountKey.json';
    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountFile));

    // Set up JWT credentials
    const credentials = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Authorize the client
    await credentials.authorize();

    // Create a new spreadsheet
    const sheets = google.sheets({ version: 'v4', auth: credentials });
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: `Class ${classId} Spreadsheet`, // Modify as needed
        },
      },
    });

    // Store the spreadsheet link in the target class in your database
    targetClass.spreadsheetLink = spreadsheet.data.spreadsheetUrl;
    console.log(targetClass);
    await targetClass.save();

    res.json({ message: 'Spreadsheet created and linked successfully', spreadsheetUrl: spreadsheet.data.spreadsheetUrl });
  } catch (error) {
    console.error('Error creating and linking spreadsheet:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Function to fetch attendance data from the linked spreadsheet
// Controller function to calculate attendance percentage for a student based on email
exports.fetchMarks = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    // Find the student by email to get their roll number
    let student = await Student.findOne({ email: studentEmail });

    // If no student found, try to find via teacher's child email
    if (!student) {
      const teacher = await Teacher.findOne({ email: studentEmail }).populate('child');
      if (teacher && teacher.child) {
        student = teacher.child;
      } else {
        return res.status(404).json({ error: 'Student not found' });
      }
    }

    const studentRollNo = student.rollno;

    // Find all classes in which the student is enrolled
    const enrolledClasses = await Class.find({ students: student._id });

    if (enrolledClasses.length === 0) {
      return res.status(404).json({ error: 'Student is not enrolled in any classes' });
    }

    // Array to store simplified marks data
    const simplifiedMarksData = [];

    // Iterate over each enrolled class to fetch marks data
    for (const cls of enrolledClasses) {
      const spreadsheetLink = cls.spreadsheetLink;
      const spreadsheetId = extractSpreadsheetId(spreadsheetLink);

      if (!spreadsheetId) {
        console.warn('Invalid spreadsheet link for class:', cls._id);
        continue; // Skip processing this class
      }

      // Authenticate with Google Sheets API
      const auth = new google.auth.GoogleAuth({
        keyFile: "serviceAccountKey.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });

      // Read rows from the spreadsheet for the class (Sheet2)
      let response;
      try {
        response = await googleSheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Sheet2", // Update with your sheet name or range
        });
      } catch (error) {
        console.warn(`Error fetching data for class ${cls._id}:`, error.message);
        continue; // Skip processing this class if there's an error fetching data
      }

      // Check if the response contains valid data
      if (!response.data || !response.data.values || response.data.values.length === 0) {
        console.warn(`No valid data found for class ${cls._id} in Sheet2`);
        continue; // Skip processing this class if no valid data is found
      }

      // Process the marks data for the class
      const [headers, ...rows] = response.data.values;
      const rollNoIndex = headers.indexOf(""); // Assuming roll numbers are in the first column

      if (rollNoIndex === -1) {
        console.warn('Roll number column not found in marks data for class:', cls._id);
        continue; // Skip processing this class if roll number column is not found
      }

      const rollNoToMarks = {};

      for (const row of rows) {
        const rollNo = row[rollNoIndex];
        const validMarks = row.slice(1).filter(value => !isNaN(parseFloat(value))); // Filter out non-numeric values
        const marksCount = validMarks.length;
        const totalMarks = validMarks.reduce((sum, value) => sum + parseFloat(value), 0);
        const averageMarks = marksCount > 0 ? totalMarks / marksCount : 0;
        const marksPercentage = (averageMarks / 100) * 100; // Assuming marks are out of 100

        if (rollNo === studentRollNo) {
          simplifiedMarksData.push({
            name: cls.subjectCode,
            uv: isNaN(marksPercentage) ? 0 : marksPercentage, // Format percentage as a string
          });
          break; // Break loop after processing the student's marks for this class
        }
      }
    }

    // Return simplified marks data in the desired format
    res.json(simplifiedMarksData);
  } catch (error) {
    console.error('Error calculating marks percentage:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.fetchAttendance = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    // Find the student by email to get their roll number
    let student = await Student.findOne({ email: studentEmail });

    // If no student found, try to find via teacher's child email
    if (!student) {
      const teacher = await Teacher.findOne({ email: studentEmail }).populate('child');
      if (teacher && teacher.child) {
        student = teacher.child;
      } else {
        return res.status(404).json({ error: 'Student not found' });
      }
    }

    const studentRollNo = student.rollno;

    // Find all classes in which the student is enrolled
    const enrolledClasses = await Class.find({ students: student._id });

    if (enrolledClasses.length === 0) {
      return res.status(404).json({ error: 'Student is not enrolled in any classes' });
    }

    // Array to store simplified attendance data
    const simplifiedAttendanceData = [];

    // Iterate over each enrolled class to fetch attendance data
    for (const cls of enrolledClasses) {
      const spreadsheetLink = cls.spreadsheetLink;
      const spreadsheetId = extractSpreadsheetId(spreadsheetLink);

      if (!spreadsheetId) {
        console.warn('Invalid spreadsheet link for class:', cls._id);
        continue; // Skip processing this class
      }

      // Authenticate with Google Sheets API
      const auth = new google.auth.GoogleAuth({
        keyFile: "serviceAccountKey.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });

      // Read rows from the spreadsheet for the class
      const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1", // Update with your sheet name or range
      });

      // Convert attendance data into an object with roll numbers as keys
      const [headers, ...rows] = response.data.values;
      const rollNoIndex = headers.indexOf(""); // Assuming roll numbers are in the first column

      if (rollNoIndex === -1) {
        console.warn('Roll number column not found in attendance data for class:', cls._id);
        continue; // Skip processing this class
      }

      const rollNoToAttendance = {};

      for (const row of rows) {
        const rollNo = row[rollNoIndex];
        rollNoToAttendance[rollNo] = row.slice(1); // Exclude the first element (roll number)
      }

      // Calculate attendance percentage for the student
      const attendanceValues = rollNoToAttendance[studentRollNo] || Array(headers.length - 1).fill('0');
      const totalClasses = attendanceValues.length;
      const presentCount = attendanceValues.filter(value => value === 'P').length;
      const absentCount = attendanceValues.filter(value => value === 'A').length;
      const attendancePercentage = (presentCount / (presentCount + absentCount)) * 100;

      // Add attendance data to the simplified attendance array
      simplifiedAttendanceData.push({
        name: cls.subjectCode,
        uv: isNaN(attendancePercentage) ? 0 : attendancePercentage, // Format percentage as a string
      });
    }

    // Return simplified attendance data in the desired format
    res.json(simplifiedAttendanceData);
  } catch (error) {
    console.error('Error calculating attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Helper function to extract spreadsheet ID from the spreadsheet link
function extractSpreadsheetId(spreadsheetLink) {
  const parts = spreadsheetLink.split('/');
  return parts[parts.length - 2];
}