const express = require('express');
const { getMessagesByQuery, getMessages } = require('../controllers/messagesController');
const { wrap } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', wrap(getMessagesByQuery));
router.get('/:conversationId', wrap(getMessages));

module.exports = router;
