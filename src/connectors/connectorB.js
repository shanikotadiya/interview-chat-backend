function getConversations() {
  return [
    { id: 'conv-b1', connectorId: 'B', updatedAt: '2025-02-14T11:30:00Z', title: 'Conversation B1' },
    { id: 'conv-b2', connectorId: 'B', updatedAt: '2025-02-12T09:00:00Z', title: 'Conversation B2' },
  ];
}

module.exports = { getConversations };
