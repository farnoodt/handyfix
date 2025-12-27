import { Route, Routes, Outlet } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";
import MyJobDetail from "./pages/jobs/MyJobDetail";

import PortalLayout from "./layout/PortalLayout";

import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";

import Login from "./pages/Login";

import MyJobs from "./pages/jobs/MyJobs";
import BookJob from "./pages/jobs/BookJob";
import AdminHome from "./pages/admin/AdminHome";
import LeadsPage from "./pages/LeadsPage";
import AdminAiAssistant from "./pages/AdminAiAssistant";


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="admin/ai" element={<RequireAuth><AdminAiAssistant /></RequireAuth>} />
          
          <Route
            path="/my-jobs"
            element={
              <RequireAuth>
                <Outlet />
              </RequireAuth>
            }
          >
            <Route index element={<MyJobs />} />
            <Route path=":id" element={<MyJobDetail />} />
          </Route>
          <Route
            path="/book"
            element={
              <RequireAuth>
                <BookJob />
              </RequireAuth>
            }
          />
                  <Route
            path="/leads"
            element={
              <RequireAuth>
                <LeadsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminHome />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
