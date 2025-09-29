import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chatbot from "./aiUI/Chatbot.jsx";
import Context from "./aiUI/Context";

const App = () => {
  return (
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
