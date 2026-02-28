import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const dashboardMap = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      patient: '/patient/dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
