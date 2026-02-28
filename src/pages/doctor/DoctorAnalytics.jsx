import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#f87171'];

function DoctorAnalytics() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/doctor').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const { stats, charts } = data || {};

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Analytics</h1>
          <p className="page-subtitle">Your personal performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Appointments", value: stats?.todayAppointments || 0, bg: 'bg-blue-500' },
          { label: 'This Month', value: stats?.monthlyAppointments || 0, bg: 'bg-purple-500' },
          { label: 'Total Appointments', value: stats?.totalAppointments || 0, bg: 'bg-indigo-500' },
          { label: 'Prescriptions Written', value: stats?.totalPrescriptions || 0, bg: 'bg-amber-500' },
          { label: 'Completed', value: stats?.completedAppointments || 0, bg: 'bg-emerald-500' },
          { label: 'Pending', value: stats?.pendingAppointments || 0, bg: 'bg-red-400' }
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-sm">{s.value}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts?.appointmentsByMonth || []}>
              <defs>
                <linearGradient id="docGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#docGrad2)" strokeWidth={2} name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Appointment Status</h3>
          {charts?.appointmentsByStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charts.appointmentsByStatus.map(s => ({ name: s._id, value: s.count }))}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {charts.appointmentsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorAnalytics;
