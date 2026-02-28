import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/authSlice';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import Layout from './components/Layout/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import AIAssistant from './pages/doctor/AIAssistant';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import BookAppointment from './pages/receptionist/BookAppointment';
import DailySchedule from './pages/receptionist/DailySchedule';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';

// Shared Pages
import Patients from './pages/shared/Patients';
import PatientDetail from './pages/shared/PatientDetail';
import Appointments from './pages/shared/Appointments';
import Prescriptions from './pages/shared/Prescriptions';
import PrescriptionForm from './pages/shared/PrescriptionForm';
import DiagnosisLogs from './pages/shared/DiagnosisLogs';

import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Admin */}
        <Route path="admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="admin/subscriptions" element={<ProtectedRoute roles={['admin']}><SubscriptionPlans /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute roles={['admin']}><SystemAnalytics /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="doctor/ai-assistant" element={<ProtectedRoute roles={['doctor']}><AIAssistant /></ProtectedRoute>} />
        <Route path="doctor/analytics" element={<ProtectedRoute roles={['doctor']}><DoctorAnalytics /></ProtectedRoute>} />

        {/* Receptionist */}
        <Route path="receptionist/dashboard" element={<ProtectedRoute roles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
        <Route path="receptionist/register-patient" element={<ProtectedRoute roles={['receptionist', 'admin']}><RegisterPatient /></ProtectedRoute>} />
        <Route path="receptionist/book-appointment" element={<ProtectedRoute roles={['receptionist', 'admin']}><BookAppointment /></ProtectedRoute>} />
        <Route path="receptionist/schedule" element={<ProtectedRoute roles={['receptionist', 'admin']}><DailySchedule /></ProtectedRoute>} />

        {/* Patient */}
        <Route path="patient/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="patient/appointments" element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} />
        <Route path="patient/prescriptions" element={<ProtectedRoute roles={['patient']}><PatientPrescriptions /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="patients" element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist']}><Patients /></ProtectedRoute>} />
        <Route path="patients/:id" element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist']}><PatientDetail /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist']}><Appointments /></ProtectedRoute>} />
        <Route path="prescriptions" element={<ProtectedRoute roles={['admin', 'doctor']}><Prescriptions /></ProtectedRoute>} />
        <Route path="prescriptions/new" element={<ProtectedRoute roles={['doctor']}><PrescriptionForm /></ProtectedRoute>} />
        <Route path="prescriptions/:id/edit" element={<ProtectedRoute roles={['doctor']}><PrescriptionForm /></ProtectedRoute>} />
        <Route path="diagnosis" element={<ProtectedRoute roles={['admin', 'doctor']}><DiagnosisLogs /></ProtectedRoute>} />

        {/* Default redirects */}
        <Route index element={<RoleDashboardRedirect />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function RoleDashboardRedirect() {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  const dashboardMap = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    receptionist: '/receptionist/dashboard',
    patient: '/patient/dashboard'
  };
  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
}

export default App;
