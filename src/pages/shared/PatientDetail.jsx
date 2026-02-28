import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiCalendar, FiFileText, FiAlertTriangle, FiEdit2, FiSave, FiX, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState({ appointments: [], prescriptions: [], diagnosisLogs: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get(`/patients/${id}/history`)
    ]).then(([pRes, hRes]) => {
      setPatient(pRes.data.patient);
      setForm(pRes.data.patient);
      setHistory(hRes.data);
    }).catch(() => {
      toast.error('Failed to load patient');
      navigate('/patients');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/patients/${id}`, form);
      setPatient(form);
      setEditing(false);
      toast.success('Patient updated successfully');
    } catch {
      toast.error('Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (!patient) return <div className="text-center py-12 text-gray-400">Patient not found</div>;

  const tabs = [
    { id: 'info', label: 'Info', icon: FiUser },
    { id: 'appointments', label: `Appointments (${history.appointments.length})`, icon: FiCalendar },
    { id: 'prescriptions', label: `Prescriptions (${history.prescriptions.length})`, icon: FiFileText },
    { id: 'diagnosis', label: `Diagnosis (${history.diagnosisLogs.length})`, icon: FiAlertTriangle }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary text-sm">← Back</button>
          <div>
            <h1 className="page-title">{patient.name}</h1>
            <p className="page-subtitle">{patient.age} years · {patient.gender} · {patient.contact}</p>
          </div>
        </div>
        {['admin', 'receptionist', 'doctor'].includes(user?.role) && !editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <FiEdit2 size={15} /> Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSave} className="space-y-5">
          {/* Alerts */}
          {patient.allergies?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm">Known Allergies</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.allergies.map((a, i) => <span key={i} className="badge-danger">{a}</span>)}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Age', key: 'age', type: 'number' },
                { label: 'Contact', key: 'contact', type: 'tel' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Address', key: 'address', type: 'text' }
              ].map((field) => (
                <div key={field.key} className={field.key === 'address' ? 'col-span-2' : ''}>
                  <label className="label">{field.label}</label>
                  {editing ? (
                    <input type={field.type} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="input-field" />
                  ) : (
                    <p className="text-gray-700 text-sm py-2">{patient[field.key] || '—'}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="label">Gender</label>
                {editing ? (
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-700 text-sm py-2 capitalize">{patient.gender}</p>
                )}
              </div>
              <div>
                <label className="label">Blood Group</label>
                {editing ? (
                  <select value={form.bloodGroup || ''} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input-field">
                    <option value="">Unknown</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                ) : (
                  <p className="text-gray-700 text-sm py-2">{patient.bloodGroup || 'Unknown'}</p>
                )}
              </div>
            </div>
            {editing && (
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary"><FiX size={15} /> Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary"><FiSave size={15} /> {saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Chronic Conditions</h3>
            {patient.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map((c, i) => <span key={i} className="badge-warning">{c}</span>)}
              </div>
            ) : <p className="text-gray-400 text-sm">None recorded</p>}
          </div>
        </form>
      )}

      {activeTab === 'appointments' && (
        <div className="card p-0">
          <div className="divide-y divide-gray-50">
            {history.appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No appointments found</div>
            ) : history.appointments.map((apt) => (
              <div key={apt._id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FiCalendar size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Dr. {apt.doctorId?.name}</p>
                  <p className="text-xs text-gray-400">{format(new Date(apt.date), 'MMM dd, yyyy')} · {apt.timeSlot} · <span className="capitalize">{apt.type}</span></p>
                  {apt.reason && <p className="text-xs text-gray-500 mt-0.5">{apt.reason}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-3">
          {history.prescriptions.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">No prescriptions found</div>
          ) : history.prescriptions.map((rx) => (
            <div key={rx._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{rx.diagnosis}</p>
                  <p className="text-xs text-gray-400 mt-1">Dr. {rx.doctorId?.name} · {format(new Date(rx.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <a href={`/api/prescriptions/${rx._id}/pdf`} target="_blank" rel="noreferrer"
                  className="btn-primary text-xs py-1.5 px-3">PDF</a>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {rx.medicines?.map((m, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{m.name} - {m.dosage}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'diagnosis' && (
        <div className="space-y-3">
          {history.diagnosisLogs.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">No diagnosis logs found</div>
          ) : history.diagnosisLogs.map((log) => (
            <div key={log._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-gray-400">Dr. {log.doctorId?.name}</p>
                </div>
                {log.isRiskFlagged && (
                  <span className="badge-danger flex items-center gap-1"><FiAlertTriangle size={11} /> Risk Flagged</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {log.symptoms?.map((s, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
              {log.aiResponse?.possibleConditions?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">AI Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {log.aiResponse.possibleConditions.slice(0, 3).map((c, i) => (
                      <span key={i} className="badge-info text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientDetail;
