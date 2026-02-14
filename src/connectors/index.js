const connectorA = require('./connectorA');
const connectorB = require('./connectorB');

const connectors = [connectorA, connectorB];

function callWithRetry(getConversations, retries = 1) {
  try {
    return getConversations();
  } catch (err) {
    if (retries <= 0) return [];
    try {
      return getConversations();
    } catch {
      return [];
    }
  }
}

function getConversationsFromAll() {
  const merged = connectors.flatMap((c) => callWithRetry(() => c.getConversations()));
  return merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

module.exports = { connectors, getConversationsFromAll };
