const conversationService = require('../services/conversationService');

const SIMULATION_INTERVAL_MS = 15 * 1000;

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
  const conversations = conversationService.getConversations();
  if (conversations.length === 0) return null;
  return conversations[Math.floor(Math.random() * conversations.length)];
}

function startSimulation(socket) {
  const intervalId = setInterval(() => {
    if (!socket.connected) {
      clearInterval(intervalId);
      return;
    }
    const conversation = pickRandomConversation();
    if (!conversation) return;

    const message = createSimulatedMessage(conversation.id);
    conversationService.addMessage(conversation.id, message);
    socket.emit('new_message', message);
  }, SIMULATION_INTERVAL_MS);

  return intervalId;
}

function attachSocket(io) {
  io.on('connection', (socket) => {
    const user = socket.handshake.auth?.userId ?? socket.id;
    console.log('User connected:', user, '(socket:', socket.id + ')');

    const intervalId = startSimulation(socket);

    socket.on('disconnect', () => {
      clearInterval(intervalId);
      console.log('User disconnected:', user, '(socket:', socket.id + ')');
    });
  });
}

module.exports = { attachSocket };
