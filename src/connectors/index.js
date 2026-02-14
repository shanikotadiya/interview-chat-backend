const connectorA = require('./connectorA');
const connectorB = require('./connectorB');

const connectors = [connectorA, connectorB];

function getConversationsFromAll() {
  const merged = connectors.flatMap((c) => c.getConversations());
  return merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

module.exports = { connectors, getConversationsFromAll };
