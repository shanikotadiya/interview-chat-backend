/**
 * Maps raw Gmail API format to app-normalized format.
 * Gmail connector returns raw only; this adapter does normalization.
 */

const GMAIL_CONVERSATION_PREFIX = 'gmail-';

function normalizeConversations(gmailThreads) {
  if (!Array.isArray(gmailThreads)) return [];
  return gmailThreads.map((t) => ({
    id: `${GMAIL_CONVERSATION_PREFIX}${t.threadId}`,
    connectorId: 'gmail',
    updatedAt: t.updated_at,
    title: t.subject ?? '',
    lastMessage: t.snippet ?? '',
  }));
}

function normalizeMessages(gmailMessages, threadId) {
  if (!Array.isArray(gmailMessages)) return [];
  const conversationId = `${GMAIL_CONVERSATION_PREFIX}${threadId}`;
  return gmailMessages.map((m) => ({
    id: m.id,
    conversationId,
    body: m.body ?? '',
    createdAt: m.date,
  }));
}

function isGmailConversationId(conversationId) {
  return typeof conversationId === 'string' && conversationId.startsWith(GMAIL_CONVERSATION_PREFIX);
}

function gmailThreadIdFromConversationId(conversationId) {
  if (!isGmailConversationId(conversationId)) return null;
  return conversationId.slice(GMAIL_CONVERSATION_PREFIX.length);
}

module.exports = {
  normalizeConversations,
  normalizeMessages,
  isGmailConversationId,
  gmailThreadIdFromConversationId,
  GMAIL_CONVERSATION_PREFIX,
};
