const conversationService = require('../services/conversationService');
const searchService = require('../services/search.service');
const { paginate } = require('../utils/pagination');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePaginationQuery(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit };
}

function getConversations(req, res) {
  const { page, limit } = parsePaginationQuery(req);
  const all = conversationService.getConversations();
  const result = paginate(all, page, limit);
  res.json(result);
}

function searchConversations(req, res) {
  const { page, limit } = parsePaginationQuery(req);
  const matches = searchService.searchConversations(req.query.q);
  const result = paginate(matches, page, limit);
  res.json(result);
}

module.exports = { getConversations, searchConversations };
