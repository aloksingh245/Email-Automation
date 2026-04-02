import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Mail, Users, Send } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Send size={28} />
          <span>EmailAuto</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Campaigns</span>
          </NavLink>
          <NavLink to="/templates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Mail size={20} />
            <span>Templates</span>
          </NavLink>
          <NavLink to="/senders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Senders</span>
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
