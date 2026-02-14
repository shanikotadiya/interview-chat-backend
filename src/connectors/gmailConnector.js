/**
 * Gmail connector. Returns raw Gmail API format only.
 * No normalization; use normalization.service for app-normalized shape.
 */

// Mock Gmail conversations (threads) – realistic Gmail API shape
const MOCK_GMAIL_THREADS = [
  {
    threadId: 'thread_001',
    subject: 'Project update',
    snippet: 'Here is the latest status on the project...',
    unread: true,
    updated_at: '2025-02-14T12:00:00Z',
  },
  {
    threadId: 'thread_002',
    subject: 'Re: Meeting tomorrow',
    snippet: 'Sounds good, see you at 10am.',
    unread: false,
    updated_at: '2025-02-14T11:15:00Z',
  },
  {
    threadId: 'thread_003',
    subject: 'Invoice #1234',
    snippet: 'Please find the attached invoice.',
    unread: true,
    updated_at: '2025-02-14T09:30:00Z',
  },
];

// Mock Gmail messages by threadId – realistic Gmail API shape
const MOCK_GMAIL_MESSAGES = {
  thread_001: [
    { id: 'msg_001_a', from: 'alice@example.com', body: 'Here is the latest status on the project.', date: '2025-02-14T11:00:00Z' },
    { id: 'msg_001_b', from: 'bob@example.com', body: 'Thanks for the update.', date: '2025-02-14T11:05:00Z' },
    { id: 'msg_001_c', from: 'alice@example.com', body: 'I will send more details by EOD.', date: '2025-02-14T12:00:00Z' },
  ],
  thread_002: [
    { id: 'msg_002_a', from: 'bob@example.com', body: 'Can we meet tomorrow at 10am?', date: '2025-02-14T10:00:00Z' },
    { id: 'msg_002_b', from: 'alice@example.com', body: 'Sounds good, see you at 10am.', date: '2025-02-14T11:15:00Z' },
  ],
  thread_003: [
    { id: 'msg_003_a', from: 'billing@example.com', body: 'Please find the attached invoice.', date: '2025-02-14T09:30:00Z' },
  ],
};

function fetchConversations() {
  return MOCK_GMAIL_THREADS.map((t) => ({ ...t }));
}

function fetchMessages(threadId) {
  const list = MOCK_GMAIL_MESSAGES[threadId] || [];
  return list.map((m) => ({ ...m }));
}

module.exports = { fetchConversations, fetchMessages };
