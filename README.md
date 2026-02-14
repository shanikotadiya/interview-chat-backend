# Unified Chat Connector

A full-stack chat integration platform that connects Slack (real API) and Gmail (mocked API) into a unified dashboard interface.

This project demonstrates real-time communication, API integration, clean architecture, and scalable project structure using modern web technologies.

---

# 🚀 Project Overview

The application allows users to:

- View Slack channels
- Fetch Slack messages
- Display messages in a modern dashboard UI
- Poll for real-time updates
- Maintain clean separation between frontend and backend

Slack is integrated using the official Slack Web API.
Gmail connector is implemented as a mocked API layer.

---

# 🏗️ Architecture

Frontend and Backend are completely separated.

Frontend:
- Next.js (SSR enabled)
- Redux (no redux-thunk)
- SCSS for styling
- Polling-based updates (no socket.io in production)

Backend:
- Node.js
- Express.js
- Slack Web API
- RESTful architecture
- Environment-based configuration

Deployment:
- Frontend: Vercel
- Backend: Vercel (Serverless REST only)

---

