import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiPlus, FiSearch, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger'
};

function Appointments() {
  const { user } = useSelector((s) => s.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const limit = 20;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.get('/appointments', { params });
      const data = res.data;
      const list = data.appointments || data.data || [];
      setAppointments(list);
      setTotal(data.total || list.length);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [page, statusFilter, dateFilter]);

  const handleStatusUpdate = async (aptId, newStatus) => {
    setUpdatingId(aptId);
    try {
      await api.put(`/appointments/${aptId}/status`, { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (aptId) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${aptId}`);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(q) ||
      a.doctorId?.name?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage all clinic appointments</p>
        </div>
        {['admin', 'receptionist'].includes(user?.role) && (
          <Link to="/book-appointment" className="btn-primary">
            <FiPlus size={16} /> Book Appointment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patient or doctor..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field py-2 w-auto">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input-field py-2 w-auto" />
        {(statusFilter || dateFilter) && (
          <button onClick={() => { setStatusFilter(''); setDateFilter(''); setPage(1); }} className="btn-secondary py-2 text-sm">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No appointments found</td></tr>
              ) : filtered.map((apt) => (
                <tr key={apt._id}>
                  <td>
                    <div className="font-medium text-gray-800">{apt.patientId?.name || 'Unknown'}</div>
                    {apt.reason && <div className="text-xs text-gray-400 truncate max-w-[150px]">{apt.reason}</div>}
                  </td>
                  <td>
                    <div className="text-gray-700">{apt.doctorId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{apt.doctorId?.specialization || ''}</div>
                  </td>
                  <td>
                    <div className="text-gray-700 text-sm">{format(new Date(apt.date), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-400">{apt.timeSlot}</div>
                  </td>
                  <td className="capitalize text-sm text-gray-600">{apt.type}</td>
                  <td>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[apt.status] || 'badge-gray'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      {apt.status === 'pending' && ['admin', 'receptionist', 'doctor'].includes(user?.role) && (
                        <button onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                          disabled={updatingId === apt._id}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs" title="Confirm">
                          <FiCheck size={13} />
                        </button>
                      )}
                      {apt.status === 'confirmed' && user?.role === 'doctor' && (
                        <button onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          disabled={updatingId === apt._id}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs" title="Mark Done">
                          <FiCheck size={13} />
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(apt.status) && ['admin', 'receptionist'].includes(user?.role) && (
                        <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                          disabled={updatingId === apt._id}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs" title="Cancel">
                          <FiX size={13} />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(apt._id)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 text-xs" title="Delete">
                          <FiX size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
