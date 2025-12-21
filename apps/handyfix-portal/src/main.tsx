import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import "./index.css";
import "./App.css";
import { configureApiClient } from "@handyfix/api-client";

configureApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  tokenStorageKey: import.meta.env.VITE_TOKEN_KEY,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
