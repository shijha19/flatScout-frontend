import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./AppRoutes";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "./contexts/ChatContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>
);
