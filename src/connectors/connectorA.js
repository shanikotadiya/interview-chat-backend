function getConversations() {
  return [
    { id: 'conv-a1', connectorId: 'A', updatedAt: '2025-02-14T12:00:00Z', title: 'Conversation A1' },
    { id: 'conv-a2', connectorId: 'A', updatedAt: '2025-02-13T10:00:00Z', title: 'Conversation A2' },
  ];
}

module.exports = { getConversations };
