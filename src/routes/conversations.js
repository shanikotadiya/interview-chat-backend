const express = require('express');
const { getConversations, searchConversations } = require('../controllers/conversationsController');
const { wrap } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/search', wrap(searchConversations));
router.get('/', wrap(getConversations));

module.exports = router;
