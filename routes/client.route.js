// const express = require('express');
// const router = express.Router();
// const clientController = require('../controllers/client.controller');
// const checkNumber = require('../middleware/news.middleware');
// const clientMiddleware = require('../middleware/client.middleware');

// /* CLIENTS WILL BE CALLED TENANTS INTERCHANGEABLY */
// router.post('/sign-up', clientController.signUp);
// router.post('/login', clientController.login);
// // router.get('/dashboard', clientController.dashboard);
// app.post('/add-user', newClient.verifyToken, newClient.addUser);
// app.post('/add-location', newClient.verifyToken, newClient.addLocation);
// app.post('/add-location-mod', newClient.verifyToken, newClient.addLocationMod);

// // router.get('/view-users', clientController.viewUsers);
// // router.get('/analytics', clientController.viewAnalytics);
// // router.get('/notifications', clientController.notifications); 
// // router.post('/settings', clientController.settings);

// module.exports = router;


const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const checkNumber = require('../middleware/news.middleware');
const clientMiddleware = require('../middleware/client.middleware');

/* CLIENTS WILL BE CALLED TENANTS INTERCHANGEABLY */
router.post('/sign-up', clientController.signUp);
router.post('/login', clientController.login);
// router.get('/dashboard', clientController.dashboard);
router.post('/add-user', clientMiddleware.verifyToken, clientController.addUser);
router.post('/add-location', clientMiddleware.verifyToken, clientController.addLocation);
router.post('/add-location-mod', clientMiddleware.verifyToken, clientController.addLocationMod);

router.get('/view-users', clientController.viewUsers);
// router.get('/analytics', clientController.viewAnalytics);
// router.get('/notifications', clientController.notifications);
// router.post('/settings', clientController.settings);

module.exports = router;
