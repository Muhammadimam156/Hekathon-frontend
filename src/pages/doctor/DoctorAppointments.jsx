import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiSearch, FiFilter, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger'
};

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      const res = await api.get(`/appointments?${params}`);
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter, dateFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Manage your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-8">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="input-field" />
          <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="btn-secondary text-sm">Clear Filters</button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No appointments found</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {apt.patientId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{apt.patientId?.name}</p>
                        <p className="text-xs text-gray-400">{apt.patientId?.age}y · {apt.patientId?.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-gray-700">{format(new Date(apt.date), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-gray-400">{apt.timeSlot}</p>
                  </td>
                  <td><span className="badge-gray capitalize">{apt.type}</span></td>
                  <td className="text-gray-500 max-w-xs truncate">{apt.reason || '—'}</td>
                  <td><span className={statusColors[apt.status]}>{apt.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {apt.status === 'pending' && (
                        <button onClick={() => updateStatus(apt._id, 'confirmed')}
                          className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs" title="Confirm">
                          <FiCheck size={14} />
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(apt.status) && (
                        <>
                          <button onClick={() => updateStatus(apt._id, 'completed')}
                            className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 text-xs" title="Complete">
                            ✓
                          </button>
                          <button onClick={() => updateStatus(apt._id, 'cancelled')}
                            className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100" title="Cancel">
                            <FiX size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointments;
