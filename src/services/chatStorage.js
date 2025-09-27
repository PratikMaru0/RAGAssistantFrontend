// Chat Storage Service using localStorage
class ChatStorageService {
  constructor() {
    this.storageKey = 'rag_chat_messages';
  }

  // Save messages to localStorage
  saveMessages(messages) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }

  // Get messages from localStorage
  getMessages() {
    try {
      const messages = localStorage.getItem(this.storageKey);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error getting messages from localStorage:', error);
      return [];
    }
  }

  // Add a new message
  addMessage(message) {
    const messages = this.getMessages();
    messages.push({
      ...message,
      id: Date.now() + Math.random(), // Simple ID generation
      timestamp: new Date().toISOString()
    });
    this.saveMessages(messages);
    return messages;
  }

  // Clear all messages
  clearMessages() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing messages from localStorage:', error);
    }
  }

  // Get message count
  getMessageCount() {
    return this.getMessages().length;
  }

  // Remove thinking message (the last message with isThinking flag)
  removeThinkingMessage() {
    const messages = this.getMessages();
    const filteredMessages = messages.filter(msg => !msg.isThinking);
    this.saveMessages(filteredMessages);
  }
}

export default new ChatStorageService();
