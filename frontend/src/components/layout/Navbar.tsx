import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Ticket,
  BarChart3,
  Users,
  Smartphone,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { NotificationDrawer } from './NotificationDrawer.js';
import { Button } from '../common/Button.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'STUDENT';

  // Navigation Items per Role
  const navItems = [
    ...(role === 'STUDENT'
      ? [
          { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'My Requests', path: '/student/tickets', icon: <Ticket className="w-4 h-4" /> },
        ]
      : []),
    ...(role === 'STAFF'
      ? [
          { label: 'My Work', path: '/staff/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Ticket Queue', path: '/staff/tickets', icon: <Ticket className="w-4 h-4" /> },
        ]
      : []),
    ...(role === 'MANAGER'
      ? [
          { label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Tickets', path: '/manager/tickets', icon: <Ticket className="w-4 h-4" /> },
          { label: 'Staff Workload', path: '/manager/staff', icon: <Users className="w-4 h-4" /> },
          { label: 'Reports & Analytics', path: '/manager/reports', icon: <BarChart3 className="w-4 h-4" /> },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                EduHelp
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {role}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                Institutional Support
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Create Ticket for Students */}
          {role === 'STUDENT' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/student/tickets/new')}
              className="hidden sm:inline-flex"
            >
              New Request
            </Button>
          )}

          {/* Section 7: [ Get Mobile App ] Promo Button */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Smartphone className="w-4 h-4 text-primary" />}
            onClick={() => navigate('/get-app')}
            className="hidden lg:inline-flex border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-foreground"
          >
            Get Mobile App
          </Button>

          {/* In-App Notifications Drawer */}
          <NotificationDrawer />

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-semibold text-xs overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || 'EH'
                )}
              </div>
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-dropdown z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setProfileOpen(false)}
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {user?.department && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">{user.department}</p>
                  )}
                </div>

                <div className="px-1 py-1">
                  <button
                    onClick={() => navigate('/get-app')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-primary" />
                    Download Android APK
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Open mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Collapse */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {role === 'STUDENT' && (
            <Link
              to="/student/tickets/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
            >
              <PlusCircle className="w-4 h-4" />
              Create Request
            </Link>
          )}
          <Link
            to="/get-app"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Smartphone className="w-4 h-4 text-primary" />
            Get Android App
          </Link>
        </div>
      )}
    </header>
  );
};
