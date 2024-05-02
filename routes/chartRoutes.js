const express = require('express');
const router = express.Router();
const {getStudentsAndClassesByTeacherEmail, getClassDataByTeacherEmail,getClassDataWithAnnouncementsAndAssignmentsByTeacherEmail,getClassesByStudentEmail,getTeachersAndClassesByStudentEmail} = require('../controllers/chartController');


router.post('/user2/doughnut', getStudentsAndClassesByTeacherEmail);
router.post('/user2/line', getClassDataByTeacherEmail);
router.post('/user2/bar', getClassDataWithAnnouncementsAndAssignmentsByTeacherEmail);
router.post('/user1/line2', getClassesByStudentEmail);
router.post('/user1/doughnut', getTeachersAndClassesByStudentEmail);

module.exports = router;
