import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './context/AuthContext';
import theme from './theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Apartments from './pages/Apartments/Apartments';
import Maintenance from './pages/Maintenance/Maintenance';
import DamageReports from './pages/DamageReports/DamageReports';
import Payments from './pages/Payments/Payments';
import Notifications from './pages/Notifications/Notifications';
import Users from './pages/Users/Users';
import Airbnb from './pages/Airbnb/Airbnb';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import RoleBasedRoute from './components/common/RoleBasedRoute';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <Loading message="Verificando sesión..." fullScreen />;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/apartments"
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'owner']}>
                      <Layout>
                        <Apartments />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Layout>
                        <Maintenance />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/damage-reports"
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'owner', 'tenant', 'airbnb_guest']}>
                      <Layout>
                        <DamageReports />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Layout>
                        <Payments />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'owner', 'tenant', 'airbnb_guest']}>
                      <Layout>
                        <Notifications />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Layout>
                        <Users />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/airbnb"
                  element={
                    <RoleBasedRoute allowedRoles={['admin', 'owner', 'security']}>
                      <Layout>
                        <Airbnb />
                      </Layout>
                    </RoleBasedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
