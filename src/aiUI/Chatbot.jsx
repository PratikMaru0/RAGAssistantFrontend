import React, { useState } from "react";
import Header from "./Header";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} onClearChat={handleClearChat} />
      </div>
      <div className="sticky bottom-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
        />
      </div>
    </div>
  );
};

export default Chatbot;
