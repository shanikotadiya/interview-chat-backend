const connectorA = require('./connectorA');
const connectorB = require('./connectorB');
const slackConnector = require('./slackConnector');
const slackAdapter = require('../adapters/slackAdapter');

const connectors = [connectorA, connectorB];

function callWithRetry(fn, retries = 1) {
  try {
    return fn();
  } catch (err) {
    if (retries <= 0) return [];
    try {
      return fn();
    } catch {
      return [];
    }
  }
}

function getConversationsFromAll() {
  const fromConnectors = connectors.flatMap((c) => callWithRetry(() => c.getConversations()));
  const rawSlack = callWithRetry(() => slackConnector.fetchConversations());
  const fromSlack = slackAdapter.normalizeConversations(rawSlack);
  const merged = [...fromConnectors, ...fromSlack];
  return merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

module.exports = {
  connectors,
  slackConnector,
  getConversationsFromAll,
};
