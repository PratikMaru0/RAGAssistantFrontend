// src/App.jsx
import React from "react";
// Change this import
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Chatbot from "./aiUI/Chatbot.jsx";
import Context from "./aiUI/Context";

const App = () => {
  return (
    // And use the Router here (which is now HashRouter)
    <Router>
      <div className="h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Chatbot />} />
          <Route path="/context" element={<Context />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
