import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUser, FiEdit2, FiEye, FiTrash2, FiFilter } from 'react-icons/fi';

function Patients() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (gender) params.append('gender', gender);
      const res = await api.get(`/patients?${params}`);
      setPatients(res.data.patients || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [search, gender, page]);

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      fetchPatients();
    } catch {
      toast.error('Failed to delete patient');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage all registered patients</p>
        </div>
        {['admin', 'receptionist', 'doctor'].includes(user?.role) && (
          <Link to="/receptionist/register-patient" className="btn-primary">
            <FiPlus size={16} /> Add Patient
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9" placeholder="Search patients by name or contact..." />
          </div>
          <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Blood Group</th>
                <th>Conditions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <FiUser size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No patients found</p>
                </td></tr>
              ) : patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.age} yrs</td>
                  <td><span className="badge-gray capitalize">{p.gender}</span></td>
                  <td className="text-gray-600">{p.contact}</td>
                  <td>
                    {p.bloodGroup ? <span className="badge-danger">{p.bloodGroup}</span> : '—'}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.chronicConditions?.slice(0, 2).map((c, i) => (
                        <span key={i} className="badge-warning text-xs">{c}</span>
                      ))}
                      {p.chronicConditions?.length > 2 && <span className="text-xs text-gray-400">+{p.chronicConditions.length - 2}</span>}
                      {!p.chronicConditions?.length && <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/patients/${p._id}`} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded">
                        <FiEye size={15} />
                      </Link>
                      {['admin', 'receptionist', 'doctor'].includes(user?.role) && (
                        <>
                          <button onClick={() => navigate(`/patients/${p._id}?edit=true`)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                            <FiEdit2 size={15} />
                          </button>
                          {user?.role === 'admin' && (
                            <button onClick={() => deletePatient(p._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patients;
