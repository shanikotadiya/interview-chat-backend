const conversationService = require('../services/conversationService');
const slackConnector = require('../connectors/slackConnector');
const { paginate } = require('../utils/pagination');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

async function getMessagesByQuery(req, res) {
  const { platform, channelId } = req.query;
  if (platform !== 'slack' || !channelId) {
    return res.status(400).json({ success: false, message: 'platform=slack and channelId are required' });
  }
  const normalized = await slackConnector.getSlackMessages(channelId);
  res.json(normalized);
}

async function getMessages(req, res) {
  const { conversationId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));

  const all = await conversationService.getMessages(conversationId);
  const result = paginate(all, page, limit);

  res.json(result);
}

module.exports = { getMessagesByQuery, getMessages };
