/**
 * Slack connector. Returns raw Slack API format only.
 * Uses @slack/web-api for real channels; normalization.service for app-normalized shape.
 */

const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
console.log("Slack token exists:", !!process.env.SLACK_BOT_TOKEN);

/** In-memory cache: userId -> { real_name, name } to avoid repeated users.info calls */
const userCache = new Map();

/**
 * Resolves display name for a user ID. Uses cache; fetches via users.info if missing.
 * @param {string} userId - Slack user ID
 * @returns {Promise<string>} real_name OR name, or userId if fetch fails
 */
async function resolveUserName(userId) {
  if (!userId) return '';
  const cached = userCache.get(userId);
  if (cached) return cached.real_name || cached.name || userId;

  try {
    const result = await slackClient.users.info({ user: userId });
    if (!result.ok || !result.user) return userId;
    const user = result.user;
    const entry = { real_name: user.real_name ?? '', name: user.name ?? '' };
    userCache.set(userId, entry);
    return entry.real_name || entry.name || userId;
  } catch (err) {
    console.error("Slack API error:", err.data || err);
    userCache.set(userId, { real_name: userId, name: userId });
    return userId;
  }
}

function getCachedDisplayName(userId) {
  if (!userId) return '';
  const entry = userCache.get(userId);
  return entry ? (entry.real_name || entry.name || userId) : userId;
}

/** Slack mention format: <@U12345> or <@U12345|display> */
const MENTION_REGEX = /<@(U[A-Z0-9]+)(?:\|[^>]*)?>/g;

/**
 * Replaces <@USERID> in text with cached display name (real_name or name).
 */
function replaceMentionsWithNames(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(MENTION_REGEX, (_, userId) => getCachedDisplayName(userId));
}

/**
 * Extracts unique user IDs from text (e.g. <@U123> or <@U123|name>).
 */
function extractUserIdsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const ids = [];
  let match;
  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

/**
 * Fetches real Slack public channels.
 * Temporarily includes all public channels (is_member filter removed for debugging).
 * @returns {Promise<Array<{ id: string, name: string }>>}
 */
async function getSlackChannels() {
  if (!process.env.SLACK_BOT_TOKEN) return [];

  console.log("Fetching Slack channels...");
  let result;
  try {
    result = await slackClient.conversations.list({ types: 'public_channel' });
  } catch (err) {
    console.error("Slack API error:", err.data || err);
    throw err;
  }
  console.log("Slack API raw response:", result);
  console.log("Slack channels count:", result.channels?.length);

  const channels = result.channels || [];
  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
  }));
}

/**
 * Fetches Slack channel history and returns normalized messages (oldest first).
 * @param {string} channelId - Slack channel ID
 * @returns {Promise<Array<{ id: string, channelId: string, text: string, senderName: string, createdAt: string, platform: string }>>}
 */
async function getSlackMessages(channelId) {
  if (!process.env.SLACK_BOT_TOKEN || !channelId) return [];

  console.log(channelId);
  try {
    const result = await slackClient.conversations.history({
      channel: channelId,
      limit: 50,
    });
    const filtered = (result.messages || []).filter(
      (msg) => !msg.subtype && msg.type === 'message'
    );
    const messages = filtered.reverse();
    const normalized = messages.map((msg) => ({
      id: msg.ts,
      channelId,
      text: msg.text ?? '',
      senderName: msg.user || 'Unknown',
      createdAt: new Date(parseFloat(msg.ts) * 1000).toISOString(),
      platform: 'slack',
    }));
    return normalized;
  } catch (err) {
    console.error("Slack API error:", err.data || err);
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
    }));
  }
  const list = MOCK_SLACK_MESSAGES[channelId] || [];
  return list.map((m) => ({ ...m }));
}

const SLACK_PREFIX = 'slack-';

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
  };
}

module.exports = { getSlackChannels, getSlackMessages, sendSlackMessage, fetchConversations, fetchMessages };
