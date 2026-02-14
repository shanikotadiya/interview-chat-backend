function getConversations() {
  return [
    { id: 'conv-a1', connectorId: 'A', updatedAt: '2025-02-14T12:00:00Z', title: 'Conversation A1', lastMessage: 'How are you?' },
    { id: 'conv-a2', connectorId: 'A', updatedAt: '2025-02-13T10:00:00Z', title: 'Conversation A2', lastMessage: 'Message in A2' },
  ];
}

module.exports = { getConversations };
