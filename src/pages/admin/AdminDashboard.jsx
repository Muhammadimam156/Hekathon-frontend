import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FiUsers, FiUserCheck, FiCalendar, FiFileText,
  FiTrendingUp, FiAlertCircle, FiArrowRight, FiActivity
} from 'react-icons/fi';

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#f87171', '#a78bfa'];

function StatCard({ title, value, icon: Icon, color, subtitle, trend }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {trend && (
        <div className={`text-sm font-semibold ${parseFloat(trend) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {parseFloat(trend) >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const { stats, charts } = data || {};

  const statusPieData = charts?.appointmentsByStatus?.map(s => ({
    name: s._id || 'Unknown',
    value: s.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening in your clinic today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary text-sm">
            <FiUsers size={16} /> Manage Users
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={FiUsers} color="bg-blue-500"
          subtitle={`+${stats?.newPatientsThisMonth || 0} this month`} />
        <StatCard title="Active Doctors" value={stats?.totalDoctors || 0} icon={FiUserCheck} color="bg-emerald-500"
          subtitle={`${stats?.totalReceptionists || 0} receptionists`} />
        <StatCard title="Monthly Appointments" value={stats?.monthlyAppointments || 0} icon={FiCalendar} color="bg-violet-500"
          trend={stats?.monthlyGrowth || 0} />
        <StatCard title="Total Prescriptions" value={stats?.totalPrescriptions || 0} icon={FiFileText} color="bg-amber-500"
          subtitle="All time" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <FiAlertCircle className="text-yellow-600" size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingAppointments || 0}</p>
            <p className="text-sm text-gray-500">Pending Approvals</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <FiActivity className="text-green-600" size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.completedAppointments || 0}</p>
            <p className="text-sm text-gray-500">Completed Appointments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiTrendingUp className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalAppointments || 0}</p>
            <p className="text-sm text-gray-500">Total Appointments</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Trend */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Appointments</h3>
          {charts?.appointmentsByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts.appointmentsByMonth}>
                <defs>
                  <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#color1)" strokeWidth={2} name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>

        {/* Appointment Status Pie */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Appointment Status</h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value">
                  {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Common Diagnoses + Doctor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Diagnoses</h3>
            <Link to="/prescriptions" className="text-primary-600 text-sm flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          {charts?.commonDiagnoses?.length > 0 ? (
            <div className="space-y-3">
              {charts.commonDiagnoses.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{d.diagnosis}</span>
                      <span className="text-gray-500 flex-shrink-0 ml-2">{d.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min((d.count / (charts.commonDiagnoses[0]?.count || 1)) * 100, 100)}%`,
                        background: COLORS[i % COLORS.length]
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No diagnosis data available</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Doctor Performance</h3>
            <Link to="/admin/users" className="text-primary-600 text-sm flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          {charts?.doctorPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.doctorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="completedAppointments" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
