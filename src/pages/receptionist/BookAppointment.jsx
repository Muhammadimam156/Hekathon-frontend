import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCalendar } from 'react-icons/fi';

const timeSlots = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

function BookAppointment() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', date: '', timeSlot: '',
    type: 'consultation', reason: '', notes: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/patients?limit=200'),
      api.get('/users/doctors')
    ]).then(([pRes, dRes]) => {
      setPatients(pRes.data.patients || []);
      setDoctors(dRes.data.doctors || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.timeSlot) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-subtitle">Schedule a new patient appointment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Select Patient *</label>
          <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="input-field" required>
            <option value="">-- Select Patient --</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender}, {p.contact})</option>)}
          </select>
        </div>

        <div>
          <label className="label">Select Doctor *</label>
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="input-field" required>
            <option value="">-- Select Doctor --</option>
            {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} {d.specialization ? `(${d.specialization})` : ''}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Appointment Date *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field" min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div>
            <label className="label">Appointment Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="consultation">Consultation</option>
              <option value="followup">Follow-up</option>
              <option value="checkup">Check-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Time Slot *</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setForm({ ...form, timeSlot: slot })}
                className={`p-2 text-xs rounded-lg border font-medium transition-all ${form.timeSlot === slot
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Reason for Visit</label>
          <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="input-field" placeholder="Brief reason for the appointment" />
        </div>

        <div>
          <label className="label">Additional Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field" rows={2} placeholder="Any additional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
            <FiCalendar size={16} /> {saving ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookAppointment;
