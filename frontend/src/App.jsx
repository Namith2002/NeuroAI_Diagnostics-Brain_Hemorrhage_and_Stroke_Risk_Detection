import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Public pages
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Patient & Staff pages
import Dashboard from './pages/Dashboard';
import UploadScan from './pages/UploadScan';
import AnalysisResult from './pages/AnalysisResult';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import GraphAnalytics from './pages/GraphAnalytics';
import AwarenessDocumentation from './pages/AwarenessDocumentation';
import EpilepsyPrediction from './pages/EpilepsyPrediction';
import NotFound from './pages/NotFound';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* Public portals */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected clinical workspaces */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-scan" 
            element={
              <ProtectedRoute>
                <UploadScan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis-result" 
            element={
              <ProtectedRoute>
                <AnalysisResult />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documentation" 
            element={
              <ProtectedRoute>
                <AwarenessDocumentation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/epilepsy-prediction" 
            element={
              <ProtectedRoute>
                <EpilepsyPrediction />
              </ProtectedRoute>
            } 
          />

          {/* Secure Admin Operations Dashboard */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph-analytics" 
            element={
              <ProtectedRoute adminOnly={true}>
                <GraphAnalytics />
              </ProtectedRoute>
            } 
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
