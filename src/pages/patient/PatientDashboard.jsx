import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { FiCalendar, FiFileText, FiUser, FiHeart } from 'react-icons/fi';
import { format } from 'date-fns';

function PatientDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments?limit=5'),
      api.get('/prescriptions?limit=5')
    ]).then(([aptsRes, rxRes]) => {
      setAppointments(aptsRes.data.appointments || []);
      setPrescriptions(rxRes.data.prescriptions || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Health Portal</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/patient/appointments" className="card-hover flex items-center gap-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <FiCalendar size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Appointments</p>
            <p className="text-sm text-gray-400">{appointments.length} records</p>
          </div>
        </Link>
        <Link to="/patient/prescriptions" className="card-hover flex items-center gap-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <FiFileText size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Prescriptions</p>
            <p className="text-sm text-gray-400">{prescriptions.length} records</p>
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Appointments</h3>
          <Link to="/patient/appointments" className="text-primary-600 text-sm">View all</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <div className="text-center py-6">
            <FiCalendar size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No appointments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((apt) => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FiUser size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Dr. {apt.doctorId?.name}</p>
                  <p className="text-xs text-gray-400">{format(new Date(apt.date), 'MMM dd, yyyy')} · {apt.timeSlot}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Prescriptions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Prescriptions</h3>
          <Link to="/patient/prescriptions" className="text-primary-600 text-sm">View all</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-6">
            <FiFileText size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No prescriptions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.slice(0, 3).map((rx) => (
              <div key={rx._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FiHeart size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{rx.diagnosis}</p>
                  <p className="text-xs text-gray-400">Dr. {rx.doctorId?.name} · {format(new Date(rx.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <a href={`/api/prescriptions/${rx._id}/pdf`} target="_blank" rel="noreferrer"
                  className="text-xs bg-primary-600 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700">
                  PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
