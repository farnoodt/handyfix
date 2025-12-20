import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { configureApiClient } from "@handyfix/api-client";
import "./index.css";


configureApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
