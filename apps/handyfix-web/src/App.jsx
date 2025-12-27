import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import SiteLayout from "./layout/SiteLayout.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.tsx";
import BlogList from "./pages/BlogList.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";


export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="*" element={<div className="container" style={{ padding: 16 }}>Not found</div>} />
      </Route>
    </Routes>
  );
}
