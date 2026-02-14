const conversationService = require('../services/conversationService');
const slackConnector = require('../connectors/slackConnector');
const normalization = require('../services/normalization.service');
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

async function postMessage(req, res) {
  const { platform, channelId, text } = req.body || {};
  if (!platform || !channelId || text == null) {
    return res.status(400).json({ success: false, message: 'platform, channelId and text are required' });
  }

  if (platform === 'slack') {
    const rawChannelId = normalization.isSlackConversationId(channelId)
      ? normalization.getSlackChannelId(channelId)
      : channelId;
    const message = await slackConnector.sendSlackMessage(rawChannelId, String(text).trim());
    return res.status(201).json({
      id: message.id,
      conversationId: normalization.isSlackConversationId(channelId) ? channelId : `slack-${message.channelId}`,
      channelId: message.channelId,
      body: message.text,
      text: message.text,
      senderName: message.senderName,
      createdAt: message.createdAt,
      platform: 'slack',
      isOwnMessage: true,
    });
  }

  if (platform === 'gmail') {
    const threadId = normalization.isGmailConversationId(channelId)
      ? normalization.getGmailThreadId(channelId)
      : channelId;
    const conversationId = normalization.isGmailConversationId(channelId) ? channelId : `gmail-${threadId}`;
    const message = conversationService.addMessage(conversationId, {
      id: `gmail-msg-${Date.now()}`,
      body: String(text).trim(),
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({
      id: message.id,
      conversationId,
      body: message.body,
      createdAt: message.createdAt,
      platform: 'gmail',
    });
  }

  return res.status(400).json({ success: false, message: 'platform must be slack or gmail' });
}

module.exports = { getMessagesByQuery, getMessages, postMessage };
