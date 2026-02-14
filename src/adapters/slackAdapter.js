/**
 * Maps raw Slack API format to app-normalized format.
 * Slack connector returns raw only; this adapter does normalization.
 */

const SLACK_CONVERSATION_PREFIX = 'slack-';

function normalizeConversations(slackChannels) {
  if (!Array.isArray(slackChannels)) return [];
  return slackChannels.map((ch) => ({
    id: `${SLACK_CONVERSATION_PREFIX}${ch.channel_id}`,
    connectorId: 'slack',
    updatedAt: ch.updated_at,
    title: ch.channel_name,
    lastMessage: ch.last_message ?? '',
  }));
}

function normalizeMessages(slackMessages, channelId) {
  if (!Array.isArray(slackMessages)) return [];
  const conversationId = `${SLACK_CONVERSATION_PREFIX}${channelId}`;
  return slackMessages.map((m) => ({
    id: m.ts,
    conversationId,
    body: m.text ?? '',
    createdAt: m.created_at,
  }));
}

function isSlackConversationId(conversationId) {
  return typeof conversationId === 'string' && conversationId.startsWith(SLACK_CONVERSATION_PREFIX);
}

function slackChannelIdFromConversationId(conversationId) {
  if (!isSlackConversationId(conversationId)) return null;
  return conversationId.slice(SLACK_CONVERSATION_PREFIX.length);
}

module.exports = {
  normalizeConversations,
  normalizeMessages,
  isSlackConversationId,
  slackChannelIdFromConversationId,
  SLACK_CONVERSATION_PREFIX,
};
