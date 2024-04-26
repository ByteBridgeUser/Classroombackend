const express = require('express');
const router = express.Router();
const spreadsheetController = require('../controllers/spreadsheetController');
const { authenticateTeacher } = require('../middleware/authMiddleware');


router.post('/link-spreadsheet', spreadsheetController.linkSpreadsheet);
router.get('/fetch-attendance/:studentEmail', spreadsheetController.fetchAttendance);
router.get('/fetch-marks/:studentEmail', spreadsheetController.fetchMarks);

module.exports = router;