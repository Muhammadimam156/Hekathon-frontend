import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiSearch, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';

const RISK_COLORS = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-danger'
};

function DiagnosisLogs() {
  const { user } = useSelector((s) => s.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const endpoint = flaggedOnly ? '/diagnosis/flagged' : '/diagnosis';
      const res = await api.get(endpoint, { params: { page, limit, riskLevel: riskFilter || undefined } });
      const list = res.data.logs || res.data.data || [];
      setLogs(list);
      setTotal(res.data.total || list.length);
    } catch {
      toast.error('Failed to load diagnosis logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, riskFilter, flaggedOnly]);

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.patientId?.name?.toLowerCase().includes(q) ||
      log.symptoms?.some((s) => s.toLowerCase().includes(q)) ||
      log.aiResponse?.possibleConditions?.some((c) => c.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Diagnosis Logs</h1>
          <p className="page-subtitle">AI-assisted diagnosis history and risk flags</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patient or symptoms..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>
        <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }} className="input-field py-2 w-auto">
          <option value="">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-medium select-none">
          <input type="checkbox" checked={flaggedOnly} onChange={(e) => { setFlaggedOnly(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded accent-red-500" />
          <FiAlertTriangle size={13} className="text-red-500" /> Flagged Only
        </label>
        {(riskFilter || flaggedOnly) && (
          <button onClick={() => { setRiskFilter(''); setFlaggedOnly(false); setPage(1); }} className="btn-secondary py-2 text-sm">Clear</button>
        )}
      </div>

      {/* Log Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No diagnosis logs found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <div key={log._id} onClick={() => setSelected(log)}
              className="card card-hover cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.riskLevel === 'high' ? 'bg-red-100' : log.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <FiAlertTriangle size={18} className={
                      log.riskLevel === 'high' ? 'text-red-600' : log.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{log.patientId?.name || 'Unknown'}</p>
                      {log.isRiskFlagged && (
                        <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <FiAlertTriangle size={10} /> Risk Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Dr. {log.doctorId?.name} · {format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${RISK_COLORS[log.riskLevel] || 'badge-gray'}`}>
                  {log.riskLevel || 'Unknown'} Risk
                </span>
              </div>

              {/* Symptoms */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {log.symptoms?.map((s, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>

              {/* AI Conditions */}
              {log.aiResponse?.possibleConditions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">AI Suggested Conditions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.aiResponse.possibleConditions.slice(0, 3).map((c, i) => (
                      <span key={i} className="badge-info text-xs">{c}</span>
                    ))}
                    {log.aiResponse.possibleConditions.length > 3 && (
                      <span className="text-xs text-gray-400">+{log.aiResponse.possibleConditions.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {log.flagReason && (
                <div className="mt-3 bg-red-50 rounded-lg p-2.5 text-xs text-red-700">
                  <span className="font-medium">Flag reason:</span> {log.flagReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{total} total logs</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-bold">Diagnosis Detail</h2>
                <p className="text-sm text-gray-400">{selected.patientId?.name} · {format(new Date(selected.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-secondary p-2 text-lg">×</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="font-semibold text-gray-800">{selected.patientId?.name}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Age / Gender</p>
                  <p className="font-semibold text-gray-800">{selected.age} yr · {selected.gender}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Risk Level</p>
                  <p className={`font-semibold capitalize ${selected.riskLevel === 'high' ? 'text-red-600' : selected.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selected.riskLevel}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {selected.symptoms?.map((s, i) => (
                    <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {selected.aiResponse && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-blue-800">AI Analysis</p>
                  {selected.aiResponse.possibleConditions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">Possible Conditions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.aiResponse.possibleConditions.map((c, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.aiResponse.explanation && (
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">Explanation</p>
                      <p className="text-sm text-blue-800">{selected.aiResponse.explanation}</p>
                    </div>
                  )}
                  {selected.aiResponse.suggestedTests?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">Suggested Tests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.aiResponse.suggestedTests.map((t, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-blue-700"><span className="font-medium">Urgency:</span> {selected.aiResponse.urgency || '—'}</span>
                  </div>
                </div>
              )}

              {selected.finalDiagnosis && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Final Diagnosis</p>
                  <p className="text-gray-700 text-sm">{selected.finalDiagnosis}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosisLogs;
