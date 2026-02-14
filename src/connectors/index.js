const connectorA = require('./connectorA');
const connectorB = require('./connectorB');
const slackConnector = require('./slackConnector');
const gmailConnector = require('./gmailConnector');
const slackAdapter = require('../adapters/slackAdapter');
const gmailAdapter = require('../adapters/gmailAdapter');

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
  const rawGmail = callWithRetry(() => gmailConnector.fetchConversations());
  const fromGmail = gmailAdapter.normalizeConversations(rawGmail);
  const merged = [...fromConnectors, ...fromSlack, ...fromGmail];
  return merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

module.exports = {
  connectors,
  slackConnector,
  gmailConnector,
  getConversationsFromAll,
};
