const conversationsRouter = require('./conversations');
const messagesRouter = require('./messages');

function mountApiRoutes(app) {
  app.use('/api/conversations', conversationsRouter);
  app.use('/api/messages', messagesRouter);
}

module.exports = { mountApiRoutes };
