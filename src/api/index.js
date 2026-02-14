const app = require('../app');

if (process.env.VERCEL) {
  module.exports = app;
} else {
  const config = require('../config');
  const http = require('http');
  const { Server } = require('socket.io');

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: config.frontendUrl } });

  const PORT = config.port;

  const { attachSocket } = require('../socket/socket');
  attachSocket(io);

  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
