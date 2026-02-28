import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/prescriptions?limit=50').then(res => setPrescriptions(res.data.prescriptions || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Prescriptions</h1>
          <p className="page-subtitle">View and download your prescriptions</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card text-center py-12">
          <FiFileText size={40} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400">No prescriptions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div key={rx._id} className="card-hover cursor-pointer" onClick={() => setSelected(rx)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{rx.diagnosis}</p>
                  <p className="text-sm text-gray-500 mt-1">Dr. {rx.doctorId?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(rx.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <a
                  href={`/api/prescriptions/${rx._id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <FiDownload size={13} /> PDF
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {rx.medicines?.slice(0, 3).map((m, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{m.name}</span>
                ))}
                {rx.medicines?.length > 3 && <span className="text-xs text-gray-400">+{rx.medicines.length - 3} more</span>}
              </div>
              {rx.aiExplanation && (
                <div className="mt-3 bg-purple-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-purple-700 mb-1">🧠 AI Explanation</p>
                  <p className="text-xs text-purple-600 line-clamp-2">{rx.aiExplanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{selected.diagnosis}</h3>
              <a href={`/api/prescriptions/${selected._id}/pdf`} target="_blank" rel="noreferrer" className="btn-primary text-sm">
                <FiDownload size={15} /> Download PDF
              </a>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Doctor:</span> <span className="font-medium ml-1">Dr. {selected.doctorId?.name}</span></div>
                <div><span className="text-gray-400">Date:</span> <span className="font-medium ml-1">{format(new Date(selected.createdAt), 'MMM dd, yyyy')}</span></div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Prescribed Medicines</h4>
                <div className="space-y-2">
                  {selected.medicines?.map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-800 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.dosage} · {m.frequency} · {m.duration}</p>
                      {m.instructions && <p className="text-xs text-gray-400 mt-1">{m.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selected.instructions && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 text-sm mb-1">Instructions</h4>
                  <p className="text-blue-700 text-sm">{selected.instructions}</p>
                </div>
              )}
              {selected.aiExplanation && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-800 text-sm mb-1">🧠 AI Explanation</h4>
                  <p className="text-purple-700 text-sm">{selected.aiExplanation}</p>
                </div>
              )}
              {selected.aiLifestyleAdvice && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800 text-sm mb-1">Lifestyle Advice</h4>
                  <p className="text-green-700 text-sm">{selected.aiLifestyleAdvice}</p>
                </div>
              )}
              {selected.followUpDate && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-amber-700 text-sm font-medium">📅 Follow-up: {format(new Date(selected.followUpDate), 'MMMM dd, yyyy')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPrescriptions;
