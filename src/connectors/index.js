const slackConnector = require('./slackConnector');
const gmailConnector = require('./gmailConnector');
const normalization = require('../services/normalization.service');

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

async function callWithRetryAsync(fn, retries = 1) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) return [];
    try {
      return await fn();
    } catch {
      return [];
    }
  }
}

async function getConversationsFromAll() {
  const rawSlack = await callWithRetryAsync(() => slackConnector.fetchConversations());
  const fromSlack = rawSlack.map(normalization.normalizeSlackConversation).filter(Boolean);
  const rawGmail = callWithRetry(() => gmailConnector.fetchConversations());
  const fromGmail = rawGmail.map(normalization.normalizeGmailConversation).filter(Boolean);
  const merged = [...fromSlack, ...fromGmail];
  return merged.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

module.exports = {
  slackConnector,
  gmailConnector,
  getConversationsFromAll,
};
