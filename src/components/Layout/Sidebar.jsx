import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  FiHome, FiUsers, FiCalendar, FiFileText, FiBarChart2,
  FiCpu, FiClipboard, FiUserPlus, FiSettings, FiLogOut,
  FiCreditCard, FiActivity, FiAlertTriangle, FiX, FiHeart
} from 'react-icons/fi';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
    { label: 'Manage Users', icon: FiUsers, path: '/admin/users' },
    { label: 'Patients', icon: FiActivity, path: '/patients' },
    { label: 'Appointments', icon: FiCalendar, path: '/appointments' },
    { label: 'Prescriptions', icon: FiFileText, path: '/prescriptions' },
    { label: 'Diagnosis Logs', icon: FiClipboard, path: '/diagnosis' },
    { label: 'Analytics', icon: FiBarChart2, path: '/admin/analytics' },
    { label: 'Subscriptions', icon: FiCreditCard, path: '/admin/subscriptions' }
  ],
  doctor: [
    { label: 'Dashboard', icon: FiHome, path: '/doctor/dashboard' },
    { label: 'My Appointments', icon: FiCalendar, path: '/doctor/appointments' },
    { label: 'Patients', icon: FiUsers, path: '/patients' },
    { label: 'Prescriptions', icon: FiFileText, path: '/prescriptions' },
    { label: 'Diagnosis Logs', icon: FiClipboard, path: '/diagnosis' },
    { label: 'AI Assistant', icon: FiCpu, path: '/doctor/ai-assistant' },
    { label: 'My Analytics', icon: FiBarChart2, path: '/doctor/analytics' }
  ],
  receptionist: [
    { label: 'Dashboard', icon: FiHome, path: '/receptionist/dashboard' },
    { label: 'Daily Schedule', icon: FiCalendar, path: '/receptionist/schedule' },
    { label: 'Register Patient', icon: FiUserPlus, path: '/receptionist/register-patient' },
    { label: 'Book Appointment', icon: FiCalendar, path: '/receptionist/book-appointment' },
    { label: 'All Patients', icon: FiUsers, path: '/patients' },
    { label: 'All Appointments', icon: FiActivity, path: '/appointments' }
  ],
  patient: [
    { label: 'Dashboard', icon: FiHome, path: '/patient/dashboard' },
    { label: 'My Appointments', icon: FiCalendar, path: '/patient/appointments' },
    { label: 'My Prescriptions', icon: FiFileText, path: '/patient/prescriptions' }
  ]
};

const roleColors = {
  admin: 'from-violet-700 to-purple-900',
  doctor: 'from-blue-700 to-blue-900',
  receptionist: 'from-emerald-700 to-teal-900',
  patient: 'from-sky-600 to-cyan-800'
};

const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  patient: 'Patient'
};

function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navItems = navConfig[user?.role] || [];
  const colorClass = roleColors[user?.role] || 'from-gray-700 to-gray-900';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 bg-gradient-to-b ${colorClass} text-white flex-shrink-0`}>
        <SidebarContent user={user} navItems={navItems} handleLogout={handleLogout} roleLabels={roleLabels} />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gradient-to-b ${colorClass} text-white transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FiHeart className="text-red-300 text-xl" />
            <span className="font-bold text-lg">MediCare</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <FiX size={20} />
          </button>
        </div>
        <SidebarContent user={user} navItems={navItems} handleLogout={handleLogout} roleLabels={roleLabels} />
      </aside>
    </>
  );
}

function SidebarContent({ user, navItems, handleLogout, roleLabels }) {
  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FiHeart className="text-red-300 text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MediCare</h1>
            <p className="text-white/60 text-xs">AI Clinic System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-white/60 text-xs">{roleLabels[user?.role]}</p>
          </div>
          {user?.subscriptionPlan === 'pro' && (
            <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-semibold">PRO</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export default Sidebar;
