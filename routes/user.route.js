const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const userMiddleware = require('../middleware/user.middleware')


router.post('/login', userController.login);
router.post('/clock-in', userController.clockIn);
router.post('/clock-out', userController.clockOut);
router.post('/request-break', userMiddleware.verifyToken, userController.requestBreak);
router.get('/view-analytics', userMiddleware.verifyToken, userController.analytics);
router.get('/get-cuser', userController.getCurrentUser);
router.get('/get-clock', userController.getOrganizationClock);
router.get('/get-clock-in-data', userController.getUserClockInData);

module.exports = router;