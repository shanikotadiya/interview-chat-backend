const { getConversationsFromAll, slackConnector, gmailConnector } = require('../connectors');
const normalization = require('./normalization.service');

// In-memory messages by conversationId (replace with DB/connectors as needed)
const messagesByConversation = {
  'conv-a1': [
    { id: 'm1', conversationId: 'conv-a1', body: 'Hello', createdAt: '2025-02-14T11:00:00Z' },
    { id: 'm2', conversationId: 'conv-a1', body: 'Hi there', createdAt: '2025-02-14T11:01:00Z' },
    { id: 'm3', conversationId: 'conv-a1', body: 'How are you?', createdAt: '2025-02-14T11:02:00Z' },
  ],
  'conv-a2': [
    { id: 'm4', conversationId: 'conv-a2', body: 'Message in A2', createdAt: '2025-02-13T09:00:00Z' },
  ],
  'conv-b1': [
    { id: 'm5', conversationId: 'conv-b1', body: 'B1 message', createdAt: '2025-02-14T11:30:00Z' },
  ],
  'conv-b2': [],
};

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
