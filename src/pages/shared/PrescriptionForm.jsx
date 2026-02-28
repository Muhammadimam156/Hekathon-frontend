import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiZap, FiSave } from 'react-icons/fi';

const EMPTY_MEDICINE = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

function PrescriptionForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useSelector((s) => s.auth);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: params.get('patient') || '',
    appointmentId: params.get('appointment') || '',
    diagnosis: '',
    medicines: [{ ...EMPTY_MEDICINE }],
    instructions: '',
    followUpDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    api.get('/patients').then((res) => setPatients(res.data.patients || res.data.data || []));
    api.get('/appointments', { params: { status: 'confirmed' } }).then((res) => {
      const list = res.data.appointments || res.data.data || [];
      setAppointments(list.filter((a) => a.doctorId?._id === user?._id || a.doctorId === user?._id));
    });
  }, []);

  const setMedicine = (idx, field, value) => {
    const updated = form.medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setForm({ ...form, medicines: updated });
  };

  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { ...EMPTY_MEDICINE }] });
  const removeMedicine = (idx) => setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) });

  const handleAI = async () => {
    if (!form.diagnosis || form.medicines.filter((m) => m.name).length === 0) {
      toast.error('Add diagnosis and at least one medicine first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/ai/prescription-explanation', {
        diagnosis: form.diagnosis,
        medicines: form.medicines.filter((m) => m.name),
        includeUrdu: false
      });
      setAiResult(res.data);
      toast.success('AI explanation generated');
    } catch {
      toast.error('AI explanation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) { toast.error('Please select a patient'); return; }
    if (!form.diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    if (form.medicines.filter((m) => m.name.trim()).length === 0) { toast.error('Add at least one medicine'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        medicines: form.medicines.filter((m) => m.name.trim()),
        aiExplanation: aiResult?.explanation || '',
        aiLifestyleAdvice: aiResult?.lifestyleAdvice || ''
      };
      await api.post('/prescriptions', payload);
      toast.success('Prescription created!');
      navigate('/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Prescription</h1>
          <p className="page-subtitle">Create a prescription with optional AI explanation</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient & Appointment */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Patient Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Patient *</label>
              <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="input-field" required>
                <option value="">Select patient...</option>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.age}yr)</option>)}
              </select>
            </div>
            <div>
              <label className="label">Linked Appointment</label>
              <select value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} className="input-field">
                <option value="">None</option>
                {appointments.map((a) => <option key={a._id} value={a._id}>{a.patientId?.name} — {new Date(a.date).toLocaleDateString()}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Diagnosis & Instructions</h3>
          <div>
            <label className="label">Diagnosis *</label>
            <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              className="input-field" placeholder="e.g., Acute Pharyngitis" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">General Instructions</label>
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="input-field" rows={3} placeholder="Rest, hydration, follow-up in..." />
            </div>
            <div>
              <label className="label">Follow-up Date</label>
              <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Medicines</h3>
            <button type="button" onClick={addMedicine} className="btn-secondary text-sm py-1.5">
              <FiPlus size={14} /> Add Medicine
            </button>
          </div>
          {form.medicines.map((m, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine #{idx + 1}</span>
                {form.medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(idx)} className="text-red-400 hover:text-red-600">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="label">Name *</label>
                  <input type="text" value={m.name} onChange={(e) => setMedicine(idx, 'name', e.target.value)}
                    className="input-field" placeholder="e.g., Amoxicillin" />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input type="text" value={m.dosage} onChange={(e) => setMedicine(idx, 'dosage', e.target.value)}
                    className="input-field" placeholder="e.g., 500mg" />
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <select value={m.frequency} onChange={(e) => setMedicine(idx, 'frequency', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Four times daily</option>
                    <option>Every 8 hours</option>
                    <option>As needed</option>
                    <option>At bedtime</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input type="text" value={m.duration} onChange={(e) => setMedicine(idx, 'duration', e.target.value)}
                    className="input-field" placeholder="e.g., 7 days" />
                </div>
                <div className="col-span-2">
                  <label className="label">Special Instructions</label>
                  <input type="text" value={m.instructions} onChange={(e) => setMedicine(idx, 'instructions', e.target.value)}
                    className="input-field" placeholder="e.g., Take after meals" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Explanation */}
        {user?.subscriptionPlan === 'pro' || user?.role === 'admin' ? (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">AI Patient Explanation</h3>
              <button type="button" onClick={handleAI} disabled={aiLoading} className="btn-primary text-sm py-1.5">
                <FiZap size={14} /> {aiLoading ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            {aiResult ? (
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                  <p className="text-blue-800 text-sm">{aiResult.explanation}</p>
                </div>
                {aiResult.lifestyleAdvice && (
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Lifestyle Advice</p>
                    <p className="text-blue-800 text-sm">{aiResult.lifestyleAdvice}</p>
                  </div>
                )}
                {aiResult.isFallback && (
                  <p className="text-xs text-blue-400 italic">Generated without AI API (demo mode)</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Click "Generate with AI" to create a patient-friendly explanation of this prescription.</p>
            )}
          </div>
        ) : (
          <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <div className="flex items-center gap-3">
              <FiZap className="text-yellow-500" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">AI Explanation — Pro Feature</p>
                <p className="text-yellow-700 text-sm">Upgrade to Pro to generate patient-friendly AI explanations.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            <FiSave size={15} /> {saving ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PrescriptionForm;
