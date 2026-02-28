import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { FiCalendar, FiFileText, FiUsers, FiCpu, FiArrowRight, FiClock } from 'react-icons/fi';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger'
};

function DoctorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [todayApts, setTodayApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/doctor'),
      api.get('/appointments/today')
    ]).then(([statsRes, aptsRes]) => {
      setStats(statsRes.data);
      setTodayApts(aptsRes.data.appointments || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="page-subtitle">Dr. {user?.name} · {user?.specialization || 'General Physician'}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/doctor/ai-assistant" className="btn-primary">
            <FiCpu size={16} /> AI Assistant
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: stats?.stats?.todayAppointments || 0, icon: FiClock, color: 'bg-blue-500' },
          { label: 'Monthly Appointments', value: stats?.stats?.monthlyAppointments || 0, icon: FiCalendar, color: 'bg-purple-500' },
          { label: 'Total Prescriptions', value: stats?.stats?.totalPrescriptions || 0, icon: FiFileText, color: 'bg-amber-500' },
          { label: 'Pending', value: stats?.stats?.pendingAppointments || 0, icon: FiUsers, color: 'bg-red-500' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}>
              <s.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Today's Appointments</h3>
            <Link to="/doctor/appointments" className="text-primary-600 text-sm flex items-center gap-1">
              All <FiArrowRight size={14} />
            </Link>
          </div>
          {todayApts.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApts.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {apt.patientId?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{apt.patientId?.name}</p>
                    <p className="text-xs text-gray-400">{apt.timeSlot} · {apt.type}</p>
                  </div>
                  <span className={statusColors[apt.status]}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Overview</h3>
          {stats?.charts?.appointmentsByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.charts.appointmentsByMonth}>
                <defs>
                  <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#docGrad)" strokeWidth={2} name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View Patients', path: '/patients', icon: FiUsers, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { label: 'Add Prescription', path: '/prescriptions/new', icon: FiFileText, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
            { label: 'AI Symptom Checker', path: '/doctor/ai-assistant', icon: FiCpu, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
            { label: 'My Analytics', path: '/doctor/analytics', icon: FiCalendar, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' }
          ].map((action) => (
            <Link key={action.path} to={action.path}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}>
              <action.icon size={22} />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
