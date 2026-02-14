/**
 * Pure normalization: raw Slack/Gmail API shape → app-normalized shape.
 * No side effects. Used by conversation.service and connectors.
 */

const SLACK_PREFIX = 'slack-';
const GMAIL_PREFIX = 'gmail-';

function normalizeSlackConversation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: `${SLACK_PREFIX}${raw.channel_id}`,
    title: raw.channel_name ?? '',
    unreadCount: raw.unread_count ?? 0,
    updatedAt: raw.updated_at,
    lastMessage: raw.last_message ?? '',
    platform: 'slack',
  };
}

function normalizeGmailConversation(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: `${GMAIL_PREFIX}${raw.threadId}`,
    title: raw.subject ?? '',
    unreadCount: raw.unread ? 1 : 0,
    updatedAt: raw.updated_at,
    lastMessage: raw.snippet ?? '',
    platform: 'gmail',
  };
}

function normalizeSlackMessage(raw, channelId) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.ts,
    conversationId: `${SLACK_PREFIX}${channelId}`,
    body: raw.text ?? '',
    createdAt: raw.created_at,
    platform: 'slack',
  };
}

function normalizeGmailMessage(raw, threadId) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    conversationId: `${GMAIL_PREFIX}${threadId}`,
    body: raw.body ?? '',
    createdAt: raw.date,
    platform: 'gmail',
  };
}

function isSlackConversationId(conversationId) {
  return typeof conversationId === 'string' && conversationId.startsWith(SLACK_PREFIX);
}

function isGmailConversationId(conversationId) {
  return typeof conversationId === 'string' && conversationId.startsWith(GMAIL_PREFIX);
}

function getSlackChannelId(conversationId) {
  return isSlackConversationId(conversationId) ? conversationId.slice(SLACK_PREFIX.length) : null;
}

function getGmailThreadId(conversationId) {
  return isGmailConversationId(conversationId) ? conversationId.slice(GMAIL_PREFIX.length) : null;
}

module.exports = {
  normalizeSlackConversation,
  normalizeGmailConversation,
  normalizeSlackMessage,
  normalizeGmailMessage,
  isSlackConversationId,
  isGmailConversationId,
  getSlackChannelId,
  getGmailThreadId,
  SLACK_PREFIX,
  GMAIL_PREFIX,
};
