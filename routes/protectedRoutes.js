const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/protectedRouteForTeacher', authMiddleware.authenticateTeacher, (req, res) => {
    res.json({ message: 'This route is protected for teachers' });
});

router.get('/protectedRouteForStudent', authMiddleware.authenticateStudent, (req, res) => {
    res.json({ message: 'This route is protected for students' });
});

module.exports = router;
