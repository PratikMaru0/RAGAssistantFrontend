import React, { useRef, useEffect, useState } from "react";
import chatStorage from "../services/chatStorage";

const ChatMessages = ({ messages = [], onClearChat }) => {
  const messagesEndRef = useRef(null);
  const [storedMessages, setStoredMessages] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Load messages from localStorage on component mount
    const savedMessages = chatStorage.getMessages();
    setStoredMessages(savedMessages);
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = () => {
      // Reload all messages from localStorage to avoid duplicates
      const savedMessages = chatStorage.getMessages();
      setStoredMessages(savedMessages);
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, []);

  // Listen for clear chat events
  useEffect(() => {
    if (onClearChat) {
      const handleClear = () => {
        setStoredMessages([]);
      };
      // This will be called when clear chat is triggered
      window.addEventListener("chatCleared", handleClear);
      return () => window.removeEventListener("chatCleared", handleClear);
    }
  }, [onClearChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, storedMessages]);

  // Combine stored messages with new messages
  const allMessages = [...storedMessages, ...messages];

  const renderMessage = (message, index) => {
    const isUser = message.type === "user";
    return (
      <div
        key={message.id || index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mt-6`}
      >
        <div
          className={`text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
            isUser ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome message - only show if no messages */}
        {allMessages.length === 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to RAG Assistant
              </h1>
              <p className="text-gray-300">
                I'm here to help you with questions about your documents. Ask me
                anything!
              </p>
            </div>
          </div>
        )}

        {/* Render all messages */}
        {allMessages.map((message, index) => renderMessage(message, index))}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
