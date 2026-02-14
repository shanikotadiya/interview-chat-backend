const express = require('express');
const { getConversations, searchConversations } = require('../controllers/conversationsController');

const router = express.Router();

router.get('/search', searchConversations);
router.get('/', getConversations);

module.exports = router;
