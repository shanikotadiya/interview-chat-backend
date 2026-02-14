const { getConversationsFromAll } = require('../connectors');

/**
 * Search conversations by query string across title and lastMessage (case insensitive).
 * Merges from all connectors first, then filters.
 * @param {string} q - Search query (empty/whitespace returns [])
 * @returns {Array} Filtered conversations, sorted by updatedAt descending
 */
function searchConversations(q) {
  const trimmed = typeof q === 'string' ? q.trim() : '';
  if (trimmed === '') return [];

  const all = getConversationsFromAll();
  const lower = trimmed.toLowerCase();

  return all.filter((conv) => {
    const title = (conv.title || '').toLowerCase();
    const lastMessage = (conv.lastMessage || '').toLowerCase();
    return title.includes(lower) || lastMessage.includes(lower);
  });
}

module.exports = { searchConversations };
