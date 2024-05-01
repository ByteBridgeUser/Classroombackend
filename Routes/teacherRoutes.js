// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const announcementController = require('../controllers/announcementController');
const { authenticateTeacher } = require('../middleware/authMiddleware');

router.post('/createClass',authenticateTeacher, teacherController.createClass);
router.post('/addAssignment',authenticateTeacher, teacherController.addAssignment);
router.post('/addStudentToClass',authenticateTeacher, teacherController.addStudentToClass);
router.post('/removestudent',authenticateTeacher, teacherController.removeStudentFromClass);
router.post('/removeclass',authenticateTeacher, teacherController.removeClass);
router.get('/viewClasses',authenticateTeacher, teacherController.viewClasses);
router.get('/viewAssignments/:emailid', teacherController.viewAssignments);
router.get('/viewAssignmentspecific/:classId', teacherController.viewAssignmentspecific);
router.post('/searchStudents',teacherController.searchStudents);
router.post('/addAnnouncement', authenticateTeacher, announcementController.addAnnouncement);
router.get('/viewAnnouncements/:classId', announcementController.viewAnnouncements);
router.post('/viewAnnouncementsallteacher', authenticateTeacher, announcementController.viewAnnouncementsallteacher);

module.exports = router;
