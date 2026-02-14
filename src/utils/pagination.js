/**
 * Paginate an array and return standard response shape.
 * @param {Array} items - Full list of items
 * @param {number} page - 1-based page number
 * @param {number} limit - Items per page
 * @returns {{ data: Array, page: number, limit: number, total: number, totalPages: number }}
 */
function paginate(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    page: safePage,
    limit,
    total,
    totalPages,
  };
}

module.exports = { paginate };
