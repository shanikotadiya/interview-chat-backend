const app = require('./app');

// On Vercel (serverless), export app so api/index.js can serve all routes
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  module.exports = app;
} else {
  const config = require('./config');
  const http = require('http');
  const { Server } = require('socket.io');

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin || config.frontendUrl,
      methods: ['GET', 'POST'],
    },
  });

  const PORT = config.port;

  const { attachSocket } = require('./socket/socket');
  attachSocket(io);

  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
