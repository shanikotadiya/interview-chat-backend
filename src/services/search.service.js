const { getConversationsFromAll } = require('../connectors');

/**
 * Search conversations by query string across id, title, and lastMessage (case insensitive).
 * Merges from all connectors first, then filters.
 * @param {string} q - Search query (empty/whitespace returns [])
 * @returns {Array} Filtered conversations, sorted by updatedAt descending
 */
async function searchConversations(q) {
  const trimmed = typeof q === 'string' ? String(q).trim() : '';
  if (trimmed === '') return [];

  const all = await getConversationsFromAll();
  const lower = trimmed.toLowerCase();

  return all.filter((conv) => {
    const id = (conv.id || '').toLowerCase();
    const title = (conv.title || '').toLowerCase();
    const lastMessage = (conv.lastMessage || '').toLowerCase();
    return id.includes(lower) || title.includes(lower) || lastMessage.includes(lower);
  });
}

module.exports = { searchConversations };
