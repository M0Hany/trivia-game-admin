import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div className="admin-logo">
          <h1>Trivia Admin</h1>
        </div>
        <ul className="admin-nav">
          <li className={isActive('/admin/dashboard')}>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li className={isActive('/admin/packs')}>
            <Link to="/admin/packs">Question Packs</Link>
          </li>
          <li className={isActive('/admin/users')}>
            <Link to="/admin/users">Users</Link>
          </li>
          <li className={isActive('/admin/settings')}>
            <Link to="/admin/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <h2>{getPageTitle(location.pathname)}</h2>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

const getPageTitle = (path: string): string => {
  switch (path) {
    case '/admin/dashboard':
      return 'Dashboard';
    case '/admin/packs':
      return 'Question Packs';
    case '/admin/users':
      return 'Users';
    case '/admin/settings':
      return 'Settings';
    default:
      return 'Admin Dashboard';
  }
};

export default Layout; 