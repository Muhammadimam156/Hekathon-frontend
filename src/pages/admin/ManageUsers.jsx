import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight,
  FiUser, FiFilter
} from 'react-icons/fi';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', specialization: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'doctor', specialization: '', phone: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, specialization: user.specialization || '', phone: user.phone || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const { password, ...updateData } = form;
        await api.put(`/users/${editUser._id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', form);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}/toggle-status`);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const updateSubscription = async (userId, plan) => {
    try {
      await api.put(`/users/${userId}/subscription`, { plan });
      toast.success(`Subscription updated to ${plan}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const roleColors = {
    admin: 'badge-danger',
    doctor: 'badge-info',
    receptionist: 'badge-success',
    patient: 'badge-gray'
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Create and manage all system users</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9" placeholder="Search by name or email..." />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field pl-8 pr-8">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={roleColors[u.role]}>{u.role}</span></td>
                  <td className="text-gray-500">{u.specialization || '—'}</td>
                  <td className="text-gray-500">{u.phone || '—'}</td>
                  <td>
                    <select value={u.subscriptionPlan} onChange={(e) => updateSubscription(u._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => toggleStatus(u)} className={`text-xl ${u.isActive ? 'text-emerald-500' : 'text-gray-300'}`}>
                      {u.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editUser ? 'Edit User' : 'Create User'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" required />
              </div>
              {!editUser && (
                <div>
                  <label className="label">Password *</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field" required minLength={6} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              {form.role === 'doctor' && (
                <div>
                  <label className="label">Specialization</label>
                  <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="input-field" placeholder="e.g. Cardiologist" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : editUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
