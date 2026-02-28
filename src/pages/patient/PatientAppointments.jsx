import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments?limit=50').then(res => setAppointments(res.data.appointments || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Your appointment history</p>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <FiCalendar size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No appointments found</p>
                  <p className="text-gray-400 text-xs">Your appointments will appear here once booked by the clinic.</p>
                </td></tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td className="font-medium">Dr. {apt.doctorId?.name}</td>
                    <td>
                      <p className="font-medium">{format(new Date(apt.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-400">{apt.timeSlot}</p>
                    </td>
                    <td><span className="badge-gray capitalize">{apt.type}</span></td>
                    <td className="text-gray-500">{apt.reason || '-'}</td>
                    <td><span className={statusColors[apt.status]}>{apt.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;
