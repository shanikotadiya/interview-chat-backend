require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3027;

const { mountApiRoutes } = require('./routes');
const { notFound, errorMiddleware } = require('./middleware/errorHandler');

app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'Interview Chat API' }));

mountApiRoutes(app);

app.use(notFound);
app.use(errorMiddleware);

const { attachSocket } = require('./socket/socket');
attachSocket(io);

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
