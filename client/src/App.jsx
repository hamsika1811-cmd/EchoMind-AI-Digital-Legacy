import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MemoryVault from "./pages/MemoryVault.jsx";
import AddMemory from "./pages/AddMemory.jsx";
import MemoryDetails from "./pages/MemoryDetails.jsx";
import EditMemory from "./pages/EditMemory.jsx";
import EchoMindAI from "./pages/EchoMindAI.jsx";
import LegacyAccess from "./pages/LegacyAccess.jsx";
import IncomingLegacyAccess from "./pages/IncomingLegacyAccess.jsx";
import AuditLog from "./pages/AuditLog.jsx";
import LegacyProfile from "./pages/LegacyProfile.jsx";
import Export from "./pages/Export.jsx";
import Settings from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/memories" element={<ProtectedRoute><MemoryVault /></ProtectedRoute>} />
      <Route path="/memories/new" element={<ProtectedRoute><AddMemory /></ProtectedRoute>} />
      <Route path="/memories/:id" element={<ProtectedRoute><MemoryDetails /></ProtectedRoute>} />
      <Route path="/memories/:id/edit" element={<ProtectedRoute><EditMemory /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><EchoMindAI /></ProtectedRoute>} />
      <Route path="/access" element={<ProtectedRoute><LegacyAccess /></ProtectedRoute>} />
      <Route path="/incoming" element={<ProtectedRoute><IncomingLegacyAccess /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><LegacyProfile /></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
