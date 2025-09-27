import React, { useState } from "react";
import chatStorage from "../services/chatStorage";
import axios from "axios";

const ChatInput = ({ onSendMessage, onClearChat }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = {
        type: "user",
        content: message.trim(),
      };

      // Save to localStorage
      chatStorage.addMessage(userMessage);

      setLoading(true);

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/send",
        {
          userQuery: message.trim(),
        }
      );

      console.log("Response: ", response.data);
      setLoading(false);
      setMessage("");
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear all chat messages?")) {
      chatStorage.clearMessages();
      // Dispatch custom event to notify ChatMessages component
      window.dispatchEvent(new CustomEvent("chatCleared"));
      if (onClearChat) {
        onClearChat();
      }
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 pb-safe">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={handleClearChat}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-3 transition-colors flex items-center justify-center min-w-[48px] h-[48px]"
            title="Clear chat history"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
                // Shift+Enter allows new line (default behavior)
              }}
              placeholder="Message RAG Assistant... (Enter to send, Shift+Enter for new line)"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{
                minHeight: "48px",
                maxHeight: "120px",
                height: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 transition-colors flex items-center justify-center min-w-[48px] h-[48px]"
            title="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
