/**
 * Slack connector. Returns raw Slack API format only.
 * No normalization; use normalization.service for app-normalized shape.
 */

// Mock Slack conversations (channels) – realistic Slack API shape
const MOCK_SLACK_CHANNELS = [
  {
    channel_id: 'C001',
    channel_name: 'general',
    unread_count: 2,
    last_message: 'Hello everyone',
    updated_at: '2025-02-14T12:00:00Z',
  },
  {
    channel_id: 'C002',
    channel_name: 'random',
    unread_count: 0,
    last_message: 'Quick question',
    updated_at: '2025-02-14T11:30:00Z',
  },
  {
    channel_id: 'C003',
    channel_name: 'engineering',
    unread_count: 5,
    last_message: 'PR ready for review',
    updated_at: '2025-02-14T10:15:00Z',
  },
];

// Mock Slack messages by channel_id – realistic Slack API shape
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

function fetchConversations() {
  return MOCK_SLACK_CHANNELS.map((ch) => ({ ...ch }));
}

function fetchMessages(channelId) {
  const list = MOCK_SLACK_MESSAGES[channelId] || [];
  return list.map((m) => ({ ...m }));
}

module.exports = { fetchConversations, fetchMessages };
