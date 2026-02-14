/**
 * Slack connector. Returns raw Slack API format only.
 * Uses @slack/web-api for real channels; normalization.service for app-normalized shape.
 */

const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Fetches real Slack public channels where the bot is a member.
 * @returns {Promise<Array<{ id: string, name: string }>>}
 */
async function getSlackChannels() {
  if (!process.env.SLACK_BOT_TOKEN) return [];

  const result = await slackClient.conversations.list({ types: 'public_channel' });
  const channels = result.channels || [];
  return channels
    .filter((channel) => channel.is_member === true)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
    }));
}

/**
 * Fetches real Slack channel history. Returns empty array on failure or missing token.
 * @param {string} channelId - Slack channel ID
 * @returns {Promise<Array<{ id: string, text: string, sender: string, createdAt: string, platform: string }>>}
 */
async function getSlackMessages(channelId) {
  if (!process.env.SLACK_BOT_TOKEN || !channelId) return [];

  try {
    const result = await slackClient.conversations.history({ channel: channelId });
    const messages = result.messages || [];
    const mapped = messages
      .map((message) => ({
        id: message.ts,
        text: message.text ?? '',
        sender: message.user ?? '',
        createdAt: message.ts,
        platform: 'slack',
      }))
      .sort((a, b) => parseFloat(a.createdAt) - parseFloat(b.createdAt));
    return mapped;
  } catch (err) {
    return [];
  }
}

// Mock Slack messages by channel_id (fallback when no token or API failure)
const MOCK_SLACK_MESSAGES = {
  C001: [
    { ts: '1707890123.000001', user: 'U001', text: 'Hello everyone', created_at: '2025-02-14T11:00:00Z' },
    { ts: '1707890183.000002', user: 'U002', text: 'Hi there!', created_at: '2025-02-14T11:01:00Z' },
    { ts: '1707890243.000003', user: 'U001', text: 'How are you?', created_at: '2025-02-14T11:02:00Z' },
  ],
  C002: [
    { ts: '1707888000.000001', user: 'U003', text: 'Quick question', created_at: '2025-02-14T10:00:00Z' },
  ],
  C003: [
    { ts: '1707885000.000001', user: 'U001', text: 'PR ready for review', created_at: '2025-02-14T09:30:00Z' },
  ],
};

/**
 * Fetches conversations (channels) in raw Slack shape for the pipeline.
 * Maps getSlackChannels() to channel_id, channel_name, etc.
 */
async function fetchConversations() {
  const channels = await getSlackChannels();
  return channels.map((ch) => ({
    channel_id: ch.id,
    channel_name: ch.name,
    unread_count: 0,
    last_message: '',
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Fetches messages for the pipeline. Uses getSlackMessages when token is set;
 * maps to raw shape (ts, user, text, created_at) for normalization. Falls back to mock on failure.
 */
async function fetchMessages(channelId) {
  if (process.env.SLACK_BOT_TOKEN) {
    const list = await getSlackMessages(channelId);
    return list.map((m) => ({
      ts: m.id,
      user: m.sender,
      text: m.text,
      created_at: m.createdAt,
    }));
  }
  const list = MOCK_SLACK_MESSAGES[channelId] || [];
  return list.map((m) => ({ ...m }));
}

module.exports = { getSlackChannels, getSlackMessages, fetchConversations, fetchMessages };
