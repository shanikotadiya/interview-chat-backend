require('dotenv').config();

const frontendUrl = process.env.FRONTEND_URL 
const corsOriginRaw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
const corsOrigin = corsOriginRaw.includes(',')
  ? corsOriginRaw.split(',').map((s) => s.trim()).filter(Boolean)
  : corsOriginRaw;
const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl,
  corsOrigin,
};

module.exports = config;
