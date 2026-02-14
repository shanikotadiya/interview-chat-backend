const conversationService = require('../services/conversationService');

const SIMULATION_INTERVAL_MS = 15 * 1000;
const TYPING_DURATION_MS = 3000;

const SIMULATED_BODIES = [
  'Simulated message',
  'New update',
  'Hello from simulation',
  'Auto-generated message',
  'Ping',
];

function generateMessageId() {
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Normalized Message shape: id, conversationId, body, createdAt.
 */
function createSimulatedMessage(conversationId) {
  return {
    id: generateMessageId(),
    conversationId,
    body: SIMULATED_BODIES[Math.floor(Math.random() * SIMULATED_BODIES.length)],
    createdAt: new Date().toISOString(),
  };
}

function pickRandomConversation() {
  return conversationService.getConversations().then((conversations) => {
    if (!conversations.length) return null;
    return conversations[Math.floor(Math.random() * conversations.length)];
  });
}

function startSimulation(socket) {
  const intervalId = setInterval(() => {
    if (!socket.connected) {
      clearInterval(intervalId);
      return;
    }
    pickRandomConversation().then((conversation) => {
      if (!conversation) return;
      const message = createSimulatedMessage(conversation.id);
      conversationService.addMessage(conversation.id, message);
      socket.emit('new_message', message);
    });
  }, SIMULATION_INTERVAL_MS);

  return intervalId;
}

function setupTypingIndicator(socket, user) {
  const pendingStops = new Map();

  function clearPending(conversationId) {
    const id = pendingStops.get(conversationId);
    if (id) clearTimeout(id);
    pendingStops.delete(conversationId);
  }

  socket.on('typing_start', (conversationId) => {
    if (!conversationId) return;
    const cid = String(conversationId);
    clearPending(cid);
    socket.broadcast.emit('user_typing', { conversationId: cid, userId: user });
    const timeoutId = setTimeout(() => {
      pendingStops.delete(cid);
      socket.broadcast.emit('typing_stop', { conversationId: cid, userId: user });
    }, TYPING_DURATION_MS);
    pendingStops.set(cid, timeoutId);
  });

  socket.on('disconnect', () => {
    pendingStops.forEach((id) => clearTimeout(id));
    pendingStops.clear();
  });
}

function attachSocket(io) {
  io.on('connection', (socket) => {
    const user = socket.handshake.auth?.userId ?? socket.id;
    console.log('User connected:', user, '(socket:', socket.id + ')');

    setupTypingIndicator(socket, user);

    socket.on('disconnect', () => {
      console.log('User disconnected:', user, '(socket:', socket.id + ')');
    });
  });
}

module.exports = { attachSocket };
