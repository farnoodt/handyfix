import { NavLink } from "react-router-dom";
import "./Header.css";


<header className="portal-header">
  <div className="portal-header-inner">
    <NavLink to="/" className="portal-brand">
      <span className="portal-brand-dot" />
      HandyFix
    </NavLink>

    <nav className="portal-nav">
      <NavLink to="/services" className={({isActive}) => isActive ? "portal-link active" : "portal-link"}>Services</NavLink>
      <NavLink to="/book" className={({isActive}) => isActive ? "portal-link active" : "portal-link"}>Book</NavLink>
      <NavLink to="/my-jobs" className={({isActive}) => isActive ? "portal-link active" : "portal-link"}>My Jobs</NavLink>
      <NavLink to="/blog" className={({isActive}) => isActive ? "portal-link active" : "portal-link"}>Blog</NavLink>
      <NavLink to="/admin" className={({isActive}) => isActive ? "portal-link active" : "portal-link"}>Admin</NavLink>
    </nav>

    <div className="portal-spacer" />

    <span className="portal-user">admin@handyfix.local</span>
    <button className="btn-primary">Logout</button>
  </div>
</header>

