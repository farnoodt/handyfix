import React from "react";
import { Link, Outlet } from "react-router-dom";
import * as api from "@handyfix/api-client";

export default function AdminHome() {
  return (
    <div>
      <h2>Admin</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Link to="/admin/services">Services</Link>
        <Link to="/admin/jobs">Jobs</Link>
        <Link to="/admin/blog">Blog</Link>
      </div>
      <Outlet />
    </div>
  );
}
