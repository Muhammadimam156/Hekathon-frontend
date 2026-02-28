import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiFileText, FiPlus, FiSearch, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

function Prescriptions() {
  const { user } = useSelector((s) => s.auth);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const limit = 15;

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions', { params: { page, limit } });
      const list = res.data.prescriptions || res.data.data || [];
      setPrescriptions(list);
      setTotal(res.data.total || list.length);
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      toast.success('Prescription deleted');
      fetchPrescriptions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = prescriptions.filter((rx) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      rx.patientId?.name?.toLowerCase().includes(q) ||
      rx.diagnosis?.toLowerCase().includes(q) ||
      rx.doctorId?.name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">View and manage all prescriptions</p>
        </div>
        {user?.role === 'doctor' && (
          <Link to="/prescriptions/new" className="btn-primary">
            <FiPlus size={16} /> New Prescription
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="card flex gap-3">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patient, diagnosis or doctor..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>
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
                <th>Diagnosis</th>
                <th>Medicines</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No prescriptions found</td></tr>
              ) : filtered.map((rx) => (
                <tr key={rx._id}>
                  <td>
                    <div className="font-medium text-gray-800">{rx.patientId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{rx.patientId?.age} yr · {rx.patientId?.gender}</div>
                  </td>
                  <td className="text-gray-700">{rx.doctorId?.name || 'Unknown'}</td>
                  <td className="max-w-[160px]">
                    <p className="text-gray-700 text-sm truncate">{rx.diagnosis}</p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {rx.medicines?.slice(0, 2).map((m, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{m.name}</span>
                      ))}
                      {rx.medicines?.length > 2 && (
                        <span className="text-xs text-gray-400">+{rx.medicines.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">
                    {rx.createdAt ? format(new Date(rx.createdAt), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelected(rx)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="View">
                        <FiEye size={13} />
                      </button>
                      <a href={`/api/prescriptions/${rx._id}/pdf`} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Download PDF">
                        <FiDownload size={13} />
                      </a>
                      {(user?.role === 'admin' || (user?.role === 'doctor' && rx.doctorId?._id === user?._id)) && (
                        <button onClick={() => handleDelete(rx._id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                          <FiTrash2 size={13} />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Prescription Detail</h2>
              <button onClick={() => setSelected(null)} className="btn-secondary p-2"><FiSearch size={14} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Patient:</span> <span className="font-medium">{selected.patientId?.name}</span></div>
                <div><span className="text-gray-400">Doctor:</span> <span className="font-medium">{selected.doctorId?.name}</span></div>
                <div className="col-span-2"><span className="text-gray-400">Diagnosis:</span> <span className="font-medium">{selected.diagnosis}</span></div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">Medicines</p>
                <div className="space-y-2">
                  {selected.medicines?.map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{m.name} — {m.dosage}</span>
                        <span className="text-xs text-gray-400">{m.duration}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{m.frequency}{m.instructions ? ` · ${m.instructions}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selected.instructions && (
                <div><p className="font-semibold text-gray-800 mb-1">Instructions</p><p className="text-gray-600 text-sm">{selected.instructions}</p></div>
              )}
              {selected.aiExplanation && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="font-semibold text-blue-800 text-sm mb-1">AI Explanation</p>
                  <p className="text-blue-700 text-sm">{selected.aiExplanation}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Close</button>
                <a href={`/api/prescriptions/${selected._id}/pdf`} target="_blank" rel="noreferrer"
                  className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
                  <FiDownload size={14} /> Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
