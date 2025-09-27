import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
      <nav className="bg-gray-800">
        <div className="flex justify-between items-center mx-auto max-w-screen-xl px-4 py-3">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-semibold text-white">
              RAG Assistant
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/context"
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/context"
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-700"
              }`}
              aria-label="Context"
              title="Context"
            >
              📁
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
