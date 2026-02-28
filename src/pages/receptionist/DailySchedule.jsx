import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import { format, addDays, subDays } from 'date-fns';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };

function DailySchedule() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async (d) => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments?date=${format(d, 'yyyy-MM-dd')}&limit=100`);
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedule(date); }, [date]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchSchedule(date);
    } catch {
      toast.error('Failed to update');
    }
  };

  const grouped = appointments.reduce((acc, apt) => {
    const doctor = apt.doctorId?.name || 'Unknown';
    if (!acc[doctor]) acc[doctor] = [];
    acc[doctor].push(apt);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Schedule</h1>
          <p className="page-subtitle">Manage today's appointment schedule</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="card flex items-center justify-between">
        <button onClick={() => setDate(d => subDays(d, 1))} className="btn-secondary">
          <FiChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{format(date, 'EEEE, MMMM dd, yyyy')}</p>
          <p className="text-sm text-gray-400">{appointments.length} appointments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDate(new Date())} className="btn-secondary text-sm">Today</button>
          <button onClick={() => setDate(d => addDays(d, 1))} className="btn-secondary">
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
          <div key={status} className="card text-center py-3">
            <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === status).length}</p>
            <span className={`${statusColors[status]} mt-1 inline-block`}>{status}</span>
          </div>
        ))}
      </div>

      {/* Schedule by Doctor */}
      {loading ? (
        <div className="card text-center py-8 text-gray-400">Loading schedule...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No appointments for this day</p>
        </div>
      ) : (
        Object.entries(grouped).map(([doctor, apts]) => (
          <div key={doctor} className="card p-0">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-700">Dr. {doctor}</h3>
              <p className="text-xs text-gray-400">{apts.length} appointments</p>
            </div>
            <div className="divide-y divide-gray-50">
              {apts.sort((a, b) => a.timeSlot?.localeCompare(b.timeSlot)).map((apt) => (
                <div key={apt._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <span className="text-sm font-semibold text-primary-600 w-20 flex-shrink-0">{apt.timeSlot}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{apt.patientId?.name}</p>
                    <p className="text-xs text-gray-400">{apt.patientId?.contact} · <span className="capitalize">{apt.type}</span></p>
                    {apt.reason && <p className="text-xs text-gray-400 truncate">{apt.reason}</p>}
                  </div>
                  <span className={`${statusColors[apt.status]} flex-shrink-0`}>{apt.status}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {apt.status === 'pending' && (
                      <button onClick={() => updateStatus(apt._id, 'confirmed')}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Confirm">
                        <FiCheck size={13} />
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(apt.status) && (
                      <button onClick={() => updateStatus(apt._id, 'cancelled')}
                        className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100" title="Cancel">
                        <FiX size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DailySchedule;
