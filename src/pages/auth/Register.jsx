import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/authSlice';
import { FiUser, FiMail, FiLock, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '', phone: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(register(form));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-4">
            <FiHeart className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MediCare</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-9" placeholder="Dr. John Smith" required />
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9" placeholder="Min 6 characters" required />
              </div>
            </div>

            <div>
              <label className="label">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input-field">
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {form.role === 'doctor' && (
              <div>
                <label className="label">Specialization</label>
                <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="input-field" placeholder="e.g. Cardiologist, General Physician" />
              </div>
            )}

            <div>
              <label className="label">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="+92 300 0000000" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
