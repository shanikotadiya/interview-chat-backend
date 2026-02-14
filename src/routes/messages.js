const express = require('express');
const { getMessages } = require('../controllers/messagesController');

const router = express.Router();

router.get('/:conversationId', getMessages);

module.exports = router;
