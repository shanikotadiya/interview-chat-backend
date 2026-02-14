const { getConversationsFromAll, slackConnector, gmailConnector } = require('../connectors');
const normalization = require('./normalization.service');

// In-memory messages by conversationId (e.g. from socket simulation)
const messagesByConversation = {};

async function getConversations() {
  return getConversationsFromAll();
}

async function getMessages(conversationId) {
  let list = [];
  if (normalization.isSlackConversationId(conversationId)) {
    const channelId = normalization.getSlackChannelId(conversationId);
    const raw = await slackConnector.fetchMessages(channelId);
    list = raw.map((m) => normalization.normalizeSlackMessage(m, channelId)).filter(Boolean);
  } else if (normalization.isGmailConversationId(conversationId)) {
    const threadId = normalization.getGmailThreadId(conversationId);
    const raw = gmailConnector.fetchMessages(threadId);
    list = raw.map((m) => normalization.normalizeGmailMessage(m, threadId)).filter(Boolean);
  }
  const inMemory = messagesByConversation[conversationId] || [];
  list = [...list, ...inMemory];
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Add a message to in-memory store (normalized: id, conversationId, body, createdAt).
 * Used by socket simulation and any other producers.
 */
function addMessage(conversationId, message) {
  const normalized = {
    id: message.id,
    conversationId: String(conversationId),
    body: message.body ?? '',
    createdAt: message.createdAt || new Date().toISOString(),
  };
  if (!messagesByConversation[conversationId]) {
    messagesByConversation[conversationId] = [];
  }
  messagesByConversation[conversationId].push(normalized);
  return normalized;
}

module.exports = { getConversations, getMessages, addMessage };
