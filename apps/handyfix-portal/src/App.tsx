import { Navigate, Route, Routes } from "react-router-dom";
import PortalLayout from "./layout/PortalLayout";

import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import WorkSamplesPage from "./pages/WorkSamplesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";

import BookJob from "./pages/jobs/BookJob";
import MyJobs from "./pages/jobs/MyJobs";
import MyJobDetail from "./pages/jobs/MyJobDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminHome from "./pages/admin/AdminHome";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminJobDetail from "./pages/admin/AdminJobDetail";
import AdminServices from "./pages/admin/AdminServices";
import AdminBlog from "./pages/admin/AdminBlog";

export default function App() {
  return (
    <Routes>
      <Route element={<PortalLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/work-samples" element={<WorkSamplesPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Jobs */}
        <Route path="/jobs/book" element={<BookJob />} />
        <Route path="/jobs" element={<MyJobs />} />
        <Route path="/jobs/:id" element={<MyJobDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/jobs/:id" element={<AdminJobDetail />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/blog" element={<AdminBlog />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
