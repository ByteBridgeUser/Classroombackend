const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const announcementController = require('../controllers/announcementController');
const { authenticateStudent } = require('../middleware/authMiddleware');

router.get('/viewAssignments/:emailid',studentController.viewAssignments);
router.post('/submitAssignment', authenticateStudent, studentController.submitAssignment);
router.patch('/updateInfo', authenticateStudent, studentController.updateStudentInfo);
router.get('/viewAnnouncements/:classId', announcementController.viewAnnouncements);
router.post('/viewAnnouncementsall', announcementController.viewAnnouncementsall);

module.exports = router;
