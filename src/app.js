const express = require('express');
const cors = require('cors');
const { mountApiRoutes } = require('./routes');
const { notFound, errorMiddleware } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'Interview Chat API' }));

mountApiRoutes(app);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
