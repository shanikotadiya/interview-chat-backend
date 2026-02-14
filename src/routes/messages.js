const express = require('express');
const { getMessagesByQuery, getMessages, postMessage } = require('../controllers/messagesController');
const { wrap } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', wrap(getMessagesByQuery));
router.get('/:conversationId', wrap(getMessages));
router.post('/', wrap(postMessage));

module.exports = router;
