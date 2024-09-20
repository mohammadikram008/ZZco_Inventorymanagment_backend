const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.post('/', historyController.createHistory);
router.get('/', historyController.getHistory);
router.get('/user/:userId', historyController.getUserHistory);

module.exports = router;