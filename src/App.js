import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import LoginScreen from './components/LoginScreen.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import { lazyWithRetry } from './utils/lazyWithRetry.js';

// Lazy load role-specific modules with auto-retry mechanisms for high reliability
const TeamleaderModule = lazyWithRetry(() => import('teamleader/src/App'));
const AdminModule = lazyWithRetry(() => import('superadmin-dashboard/src/App'));
const HRModule = lazyWithRetry(() => import('human-resource-app/src/App'));
const PMModule = lazyWithRetry(() => import('pm-manager-dashboard/src/App'));
const EmployeeModule = lazyWithRetry(() => import('employee/src/App'));

const RoleRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = (user.role || '').trim().toLowerCase().replace(/\s+/g, '');
  const userDesig = (user.designation || '').trim().toLowerCase().replace(/\s+/g, '');
  
  // DEBUG Removed
  // 1. Admin roles: Highest priority (including Executive roles)
  const isAdmin = userRole.includes('admin') || userDesig.includes('admin') || 
                  userRole.includes('founder') || userRole.includes('ceo') || 
                  userRole.includes('director') || userDesig.includes('founder') || 
                  userDesig.includes('ceo');
  
  if (isAdmin) {
    return <AdminModule />;
  }

  // 2. Project Manager roles
  const isPM = userRole === 'pm' || userRole === 'manager' || 
               userRole.includes('projectmanager') || userDesig.includes('projectmanager') || 
               userDesig === 'pm' || userDesig === 'manager';
  
  if (isPM) {
    return <PMModule />;
  }

  // 3. Team Leader roles
  const isTL = userRole === 'teamleader' || userRole === 'tl' || 
               userRole.includes('teamlead') || userDesig.includes('teamlead') ||
               userRole.includes('leadengineer') || userDesig.includes('leadengineer') ||
               userRole === 'leadsoftwareengineer' || userDesig === 'leadsoftwareengineer';
  
  if (isTL) {
    return <TeamleaderModule />;
  }

  // 4. HR roles
  const isHR = userRole === 'hr' || userRole.includes('humanresource') || userDesig.includes('humanresource');
  
  if (isHR) {
    return <HRModule />;
  }

  // 5. Employee roles: Final fallback
  return <EmployeeModule />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontWeight: 'bold', color: '#1e293b' }}>LOADING MODULE...</div>}>
            <Routes>
              {/* 1. Explicit Role Routes (for deep linking) */}
              <Route path="/admin/*" element={<AdminModule />} />
              <Route path="/hr/*" element={<HRModule />} />
              <Route path="/pm/*" element={<PMModule />} />
              <Route path="/employee/*" element={<EmployeeModule />} />
              <Route path="/tl/*" element={<TeamleaderModule />} />
              <Route path="/teamleader/*" element={<TeamleaderModule />} />

              {/* 2. Authentication */}
              <Route path="/login" element={<LoginScreen />} />

              {/* 3. Dynamic Root Handler (handles /dashboard based on login) */}
              <Route path="/*" element={<RoleRouter />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
