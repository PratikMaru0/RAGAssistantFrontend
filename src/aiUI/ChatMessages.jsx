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
    const isThinking = message.isThinking;

    return (
      <div
        key={message.id || index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mt-6`}
      >
        <div
          className={`text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
            isUser ? "bg-blue-600" : "bg-gray-800"
          } ${isThinking ? "opacity-70" : ""}`}
        >
          {isThinking ? (
            <div className="flex items-center space-x-2">
              <span>{message.content}</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          ) : (
            message.content
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome message - only show if no messages */}
        {allMessages.length === 0 && (
          <div className="flex justify-center">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-800/80 to-gray-900 p-8 shadow-xl">
              <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5h-2v-2h2v2zm0-4h-2V6h2v6.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
                    Welcome to RAG Assistant
                  </h1>
                  <p className="text-gray-300">
                    I'm here to help you with questions about your documents.
                    Ask me anything!
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/60 p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full  text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Upload PDF files</p>
                    <p className="text-sm text-gray-400">
                      Add documents to build context.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/60 p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full  text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Perform Q&A</p>
                    <p className="text-sm text-gray-400">
                      Ask anything about your uploaded PDFs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/60 p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full  text-sm font-bold text-white">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Delete the chat</p>
                    <p className="text-sm text-gray-400">
                      Press the delete icon to clear the conversation.
                    </p>
                  </div>
                </div>
              </div>
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
