const express = require('express');
const { getMessages } = require('../controllers/messagesController');
const { wrap } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/:conversationId', wrap(getMessages));

module.exports = router;
