import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loading from './Loading';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <Loading message="Verificando permisos..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RoleBasedRoute;
