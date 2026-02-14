/**
 * Slack connector. Returns raw Slack API format only.
 * Uses @slack/web-api for real channels; normalization.service for app-normalized shape.
 */
require("dotenv").config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
let slackAuthWarned = false;
let cachedBotUserId = null;

async function getBotUserId() {
  if (cachedBotUserId !== null) return cachedBotUserId;
  if (!process.env.SLACK_BOT_TOKEN) return null;
  try {
    const result = await slackClient.auth.test();
    cachedBotUserId = result.user_id || null;
    return cachedBotUserId;
  } catch {
    return null;
  }
}

function warnSlackAuth(context = '') {
  if (!slackAuthWarned) {
    slackAuthWarned = true;
    console.warn("Slack not authenticated (missing or invalid SLACK_BOT_TOKEN).", context);
  }
}

/**
 * Fetches real Slack public channels. Returns [] when token is missing or API fails (e.g. not_authed).
 * @returns {Promise<Array<{ id: string, name: string }>>}
 */
async function getSlackChannels() {
  if (!process.env.SLACK_BOT_TOKEN) return [];

  try {
    const result = await slackClient.conversations.list({ types: 'public_channel' });
    const channels = result.channels || [];
    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
    }));
  } catch (err) {
    const errData = err.data || err;
    if (errData?.error === 'not_authed' || errData?.error === 'invalid_auth') {
      warnSlackAuth("Skipping Slack channels.");
    } else {
      console.error("Slack API error:", errData);
    }
    return [];
  }
}

/**
 * Fetches Slack channel history and returns normalized messages (oldest first).
 * Filters out system messages (subtype). Sets isOwnMessage for bot/own messages.
 * @param {string} channelId - Slack channel ID
 * @returns {Promise<Array<{ id, channelId, text, body, senderName, createdAt, platform, isOwnMessage }>>}
 */
async function getSlackMessages(channelId) {
  if (!process.env.SLACK_BOT_TOKEN || !channelId) return [];

  try {
    const botUserId = await getBotUserId();
    const result = await slackClient.conversations.history({
      channel: channelId,
      limit: 50,
    });
    const filtered = (result.messages || []).filter(
      (msg) => !msg.subtype && msg.type === 'message'
    );
    const messages = filtered.reverse();
    return messages.map((msg) => {
      const isOwnMessage = (botUserId && msg.user === botUserId) || !!msg.bot_id;
      const text = msg.text ?? '';
      const createdAt = new Date(parseFloat(msg.ts) * 1000).toISOString();
      return {
        id: msg.ts,
        ts: msg.ts,
        channelId,
        text,
        body: text,
        senderName: msg.user || 'Unknown',
        createdAt,
        platform: 'slack',
        isOwnMessage,
      };
    });
  } catch (err) {
    const errData = err.data || err;
    if (errData?.error === 'not_authed' || errData?.error === 'invalid_auth') {
      warnSlackAuth("Returning no messages for Slack.");
    } else {
      console.error("Slack API error:", errData);
    }
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
      user: m.senderName,
      text: m.text,
      created_at: m.createdAt,
      isOwnMessage: m.isOwnMessage,
    }));
  }
  const list = MOCK_SLACK_MESSAGES[channelId] || [];
  return list.map((m) => ({ ...m }));
}

/**
 * Sends a message to a Slack channel. Returns the full normalized message (no { success: true }).
 * @param {string} channelId - Slack channel ID
 * @param {string} text - Message text
 * @returns {Promise<{ id: string, channelId: string, text: string, senderName: string, createdAt: string, platform: string }>}
 * @throws {Error} When token is missing, channelId/text invalid, or Slack API errors
 */
async function sendSlackMessage(channelId, text) {
  if (!process.env.SLACK_BOT_TOKEN) {
    const err = new Error('Slack is not configured (missing SLACK_BOT_TOKEN)');
    err.code = 'SLACK_NOT_CONFIGURED';
    throw err;
  }
  if (!channelId || typeof text !== 'string') {
    const err = new Error('channelId and text are required');
    err.code = 'INVALID_ARGUMENTS';
    throw err;
  }

  let response;
  try {
    response = await slackClient.chat.postMessage({
      channel: channelId,
      text,
    });
  } catch (err) {
    console.error("Slack API error:", err.data || err);
    const wrapped = new Error(err.message || 'Slack API error');
    wrapped.code = err.data?.error || 'SLACK_API_ERROR';
    wrapped.originalError = err;
    throw wrapped;
  }

  if (!response.ok) {
    const err = new Error(response.error || 'Slack postMessage failed');
    err.code = 'SLACK_API_ERROR';
    throw err;
  }

  return {
    id: response.ts,
    channelId,
    text,
    senderName: 'You',
    createdAt: new Date(parseFloat(response.ts) * 1000).toISOString(),
    platform: 'slack',
    isOwnMessage: true,
  };
}

module.exports = { getSlackChannels, getSlackMessages, sendSlackMessage, fetchConversations, fetchMessages };
