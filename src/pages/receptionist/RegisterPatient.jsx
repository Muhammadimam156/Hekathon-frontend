import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUserPlus, FiPlus, FiX } from 'react-icons/fi';

function RegisterPatient() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', contact: '', email: '',
    address: '', bloodGroup: '', allergies: [], chronicConditions: [],
    emergencyContact: { name: '', phone: '', relation: '' }
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.contact) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      await api.post('/patients', form);
      toast.success('Patient registered successfully!');
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({ ...form, allergies: [...form.allergies, allergyInput.trim()] });
      setAllergyInput('');
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setForm({ ...form, chronicConditions: [...form.chronicConditions, conditionInput.trim()] });
      setConditionInput('');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Register New Patient</h1>
          <p className="page-subtitle">Add a new patient to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Age *</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="input-field" placeholder="35" min={0} max={150} required />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Contact Number *</label>
              <input type="tel" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="input-field" placeholder="+92 300 0000000" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="patient@example.com" />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="input-field">
                <option value="">Unknown</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field" placeholder="Full address" />
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Known Allergies</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  className="input-field" placeholder="e.g. Penicillin" />
                <button type="button" onClick={addAllergy} className="btn-secondary flex-shrink-0"><FiPlus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.allergies.map((a, i) => (
                  <span key={i} className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    {a} <button type="button" onClick={() => setForm({ ...form, allergies: form.allergies.filter((_, idx) => idx !== i) })}><FiX size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Chronic Conditions</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={conditionInput} onChange={(e) => setConditionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  className="input-field" placeholder="e.g. Diabetes, Hypertension" />
                <button type="button" onClick={addCondition} className="btn-secondary flex-shrink-0"><FiPlus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.chronicConditions.map((c, i) => (
                  <span key={i} className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    {c} <button type="button" onClick={() => setForm({ ...form, chronicConditions: form.chronicConditions.filter((_, idx) => idx !== i) })}><FiX size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" value={form.emergencyContact.name}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })}
                className="input-field" placeholder="Contact name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.emergencyContact.phone}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })}
                className="input-field" placeholder="+92 300 0000000" />
            </div>
            <div>
              <label className="label">Relation</label>
              <input type="text" value={form.emergencyContact.relation}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })}
                className="input-field" placeholder="Spouse, Parent, etc." />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 md:flex-none justify-center">
            <FiUserPlus size={16} /> {saving ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPatient;
