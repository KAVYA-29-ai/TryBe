import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Layout from './components/Layout';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

import HomeFeed from './pages/HomeFeed';
import Discover from './pages/Discover';
import MyCollege from './pages/MyCollege';
import CollegeExplore from './pages/CollegeExplore';

import Clubs from './pages/Clubs';
import ClubDashboard from './pages/ClubDashboard';
import Work from './pages/Work';

import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';

import LegalPage from './pages/LegalPage';
import Contact from './pages/Contact';

import { AppProvider, useApp } from './context/AppContext';

// ─────────────────────────────────────────────
// Protected Layout
// ─────────────────────────────────────────────

function ProtectedLayout() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

// ─────────────────────────────────────────────
// Public Auth Routes
// ─────────────────────────────────────────────

function PublicAuthRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* ═══════════════════════════════════════
              PUBLIC ROUTES
          ═══════════════════════════════════════ */}

          <Route
            path="/"
            element={<Welcome />}
          />

          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicAuthRoute>
                <Signup />
              </PublicAuthRoute>
            }
          />

          <Route
            path="/onboarding"
            element={<Onboarding />}
          />

          {/* Legal / Support */}

          <Route
            path="/privacy"
            element={<LegalPage type="privacy" />}
          />

          <Route
            path="/terms"
            element={<LegalPage type="terms" />}
          />

          <Route
            path="/guidelines"
            element={<LegalPage type="guidelines" />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* ═══════════════════════════════════════
              AUTHENTICATED APPLICATION
          ═══════════════════════════════════════ */}

          <Route element={<ProtectedLayout />}>

            {/* Home */}
            <Route
              path="/home"
              element={<HomeFeed />}
            />

            {/* Discovery */}
            <Route
              path="/discover"
              element={<Discover />}
            />

            {/* College */}
            <Route
              path="/college"
              element={<MyCollege />}
            />

            <Route
              path="/college/:collegeId"
              element={<CollegeExplore />}
            />

            {/* Clubs */}
            <Route
              path="/clubs"
              element={<Clubs />}
            />

            <Route
              path="/clubs/:id"
              element={<ClubDashboard />}
            />

            {/* Work */}
            <Route
              path="/work"
              element={<Work />}
            />

            {/* ═══════════════════════════════════
                COMMUNICATION
            ═══════════════════════════════════ */}

            <Route
              path="/messages"
              element={<Messages />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Help */}
            <Route
              path="/help"
              element={<Help />}
            />

          </Route>

          {/* ═══════════════════════════════════════
              FALLBACK
          ═══════════════════════════════════════ */}

          <Route
            path="*"
            element={<Navigate to="/home" replace />}
          />

        </Routes>
      </Router>
    </AppProvider>
  );
}