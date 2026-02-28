import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiUserPlus, FiCalendar, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };

function ReceptionistDashboard() {
  const [todayApts, setTodayApts] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/today'),
      api.get('/patients?limit=1')
    ]).then(([aptsRes, patientsRes]) => {
      setTodayApts(aptsRes.data.appointments || []);
      setPatientCount(patientsRes.data.total || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receptionist Dashboard</h1>
          <p className="page-subtitle">Manage today's clinic operations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Register Patient', path: '/receptionist/register-patient', icon: FiUserPlus, color: 'from-blue-500 to-blue-600' },
          { label: 'Book Appointment', path: '/receptionist/book-appointment', icon: FiCalendar, color: 'from-purple-500 to-purple-600' },
          { label: 'Daily Schedule', path: '/receptionist/schedule', icon: FiClock, color: 'from-emerald-500 to-emerald-600' },
          { label: 'All Patients', path: '/patients', icon: FiUsers, color: 'from-amber-500 to-amber-600' }
        ].map((a) => (
          <Link key={a.path} to={a.path} className={`bg-gradient-to-br ${a.color} rounded-2xl p-5 text-white shadow-sm hover:shadow-md transition-shadow`}>
            <a.icon size={24} className="mb-3" />
            <p className="font-semibold text-sm">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{patientCount}</p>
          <p className="text-sm text-gray-500 mt-1">Total Patients</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{todayApts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Today's Appointments</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">{todayApts.filter(a => a.status === 'pending').length}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Today</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
          <Link to="/receptionist/schedule" className="text-primary-600 text-sm flex items-center gap-1">Full View <FiArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : todayApts.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayApts.map((apt) => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-xs font-semibold text-primary-600">{apt.timeSlot}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{apt.patientId?.name}</p>
                  <p className="text-xs text-gray-400">Dr. {apt.doctorId?.name} · {apt.type}</p>
                </div>
                <span className={statusColors[apt.status]}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceptionistDashboard;
