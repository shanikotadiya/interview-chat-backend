const config = require('./config');
const express = require('express');
const cors = require('cors');
const { mountApiRoutes } = require('./routes');
const { notFound, errorMiddleware } = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'Interview Chat API' }));

mountApiRoutes(app);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
