import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout
import AdminLayout from './components/AdminLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Questions from './pages/Questions';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import QuestionPacks from './pages/QuestionPacks';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/packs" element={<QuestionPacks />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
