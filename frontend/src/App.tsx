import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { Navbar } from './components/layout/Navbar.js';

// Pages
import { LoginPage } from './pages/LoginPage.js';
import { StudentDashboardPage } from './pages/StudentDashboardPage.js';
import { StudentTicketsPage } from './pages/StudentTicketsPage.js';
import { CreateTicketPage } from './pages/CreateTicketPage.js';
import { StaffDashboardPage } from './pages/StaffDashboardPage.js';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage.js';
import { ManagerTicketsPage } from './pages/ManagerTicketsPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { TicketDetailPage } from './pages/TicketDetailPage.js';
import { GetMobileAppPage } from './pages/GetMobileAppPage.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'STAFF' | 'MANAGER')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized for specific sub-route, send to user's home dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {!isLoginPage && <Navbar />}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      {!isLoginPage && (
        <footer className="border-t border-border py-6 bg-card text-center text-xs text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 EduHelp Institutional Support System. All rights reserved.</span>
            <span>Edumerge Solutions Engineering Assessment</span>
          </div>
        </footer>
      )}
    </div>
  );
};

// Root Redirector based on User Role
const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/get-app" element={<GetMobileAppPage />} />

              {/* Root */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/tickets"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/tickets/new"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <CreateTicketPage />
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'MANAGER']}>
                    <StaffDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/tickets"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'MANAGER']}>
                    <StaffDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['MANAGER']}>
                    <ManagerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/tickets"
                element={
                  <ProtectedRoute allowedRoles={['MANAGER']}>
                    <ManagerTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/staff"
                element={
                  <ProtectedRoute allowedRoles={['MANAGER']}>
                    <ManagerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/reports"
                element={
                  <ProtectedRoute allowedRoles={['MANAGER']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Ticket Details */}
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute>
                    <TicketDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
