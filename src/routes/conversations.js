const express = require('express');
const { getConversations } = require('../controllers/conversationsController');

const router = express.Router();

router.get('/', getConversations);

module.exports = router;
