import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiCpu, FiAlertTriangle, FiZap, FiInfo, FiSend } from 'react-icons/fi';

const riskColors = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200'
};

function AIAssistant() {
  const { user } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [tab, setTab] = useState('symptom');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const isPro = user?.subscriptionPlan === 'pro';

  // Symptom Checker State
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [history, setHistory] = useState('');

  // Prescription Explanation State
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [urdu, setUrdu] = useState(false);

  useEffect(() => {
    api.get('/patients?limit=100').then(res => setPatients(res.data.patients || [])).catch(console.error);
  }, []);

  const runSymptomChecker = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return toast.error('Please enter symptoms');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/symptom-checker', {
        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
        age, gender, history, patientId: selectedPatient
      });
      setResult({ type: 'symptom', data: res.data.data, isFallback: res.data.isFallback });
      if (res.data.isFallback) toast('AI API not configured. Showing generic response.', { icon: 'ℹ️' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const runPrescriptionExplanation = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return toast.error('Please enter diagnosis');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/prescription-explanation', {
        diagnosis, medicines: medicines.filter(m => m.name), urdu
      });
      setResult({ type: 'prescription', data: res.data.data, isFallback: res.data.isFallback });
      if (res.data.isFallback) toast('AI API not configured. Showing generic response.', { icon: 'ℹ️' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => {
    const m = [...medicines];
    m[i][field] = value;
    setMedicines(m);
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-subtitle">Intelligent medical assistance powered by Gemini AI</p>
          </div>
        </div>
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <FiCpu size={36} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pro Feature</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            AI Assistant features require a Pro subscription. Please upgrade your plan to access AI-powered symptom checking and prescription explanations.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['AI Symptom Checker', 'Prescription Explanation', 'Risk Flagging', 'Predictive Analytics'].map(f => (
              <span key={f} className="badge-info">{f}</span>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">Contact your admin to upgrade to Pro plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FiCpu className="text-purple-500" /> AI Assistant
          </h1>
          <p className="page-subtitle">Powered by Gemini AI · Smart medical assistance for doctors</p>
        </div>
        <span className="badge-info text-xs flex items-center gap-1"><FiZap size={11} /> Pro Feature</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => { setTab('symptom'); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'symptom' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
          🔍 Symptom Checker
        </button>
        <button onClick={() => { setTab('prescription'); setResult(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'prescription' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
          💊 Prescription Explainer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          {tab === 'symptom' ? (
            <form onSubmit={runSymptomChecker} className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-2">Smart Symptom Analysis</h3>
              <div>
                <label className="label">Select Patient (Optional)</label>
                <select value={selectedPatient} onChange={(e) => {
                  setSelectedPatient(e.target.value);
                  const p = patients.find(p => p._id === e.target.value);
                  if (p) { setAge(p.age?.toString()); setGender(p.gender); }
                }} className="input-field">
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Symptoms *</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                  className="input-field" rows={3} placeholder="Enter symptoms separated by commas: fever, headache, cough..." required />
                <p className="text-xs text-gray-400 mt-1">Separate multiple symptoms with commas</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input-field" placeholder="35" min={0} max={150} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Medical History</label>
                <textarea value={history} onChange={(e) => setHistory(e.target.value)}
                  className="input-field" rows={2} placeholder="Known conditions, allergies, previous diagnoses..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing symptoms...
                  </span>
                ) : <><FiSend size={16} /> Analyze Symptoms</>}
              </button>
            </form>
          ) : (
            <form onSubmit={runPrescriptionExplanation} className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-2">AI Prescription Explainer</h3>
              <div>
                <label className="label">Diagnosis *</label>
                <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                  className="input-field" placeholder="e.g. Upper Respiratory Tract Infection" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Medicines</label>
                  <button type="button" onClick={addMedicine} className="text-primary-600 text-xs font-medium">+ Add</button>
                </div>
                {medicines.map((m, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                    <input value={m.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                      className="input-field text-sm" placeholder="Medicine name" />
                    <input value={m.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                      className="input-field text-sm" placeholder="Dosage (500mg)" />
                    <input value={m.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                      className="input-field text-sm" placeholder="Frequency (3x/day)" />
                    <input value={m.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                      className="input-field text-sm" placeholder="Duration (7 days)" />
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(i)} className="text-red-500 text-xs col-span-2 text-left">Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="urdu" checked={urdu} onChange={(e) => setUrdu(e.target.checked)}
                  className="rounded text-primary-600" />
                <label htmlFor="urdu" className="text-sm text-gray-600">Include Urdu explanation</label>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Generating explanation...' : <><FiSend size={16} /> Generate Explanation</>}
              </button>
            </form>
          )}
        </div>

        {/* Results */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🧠 AI Analysis Results
          </h3>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiCpu size={48} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Run an AI analysis to see results here</p>
              <p className="text-gray-300 text-xs mt-1">Results are for doctor assistance only</p>
            </div>
          ) : result.type === 'symptom' ? (
            <div className="space-y-4">
              {result.isFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <FiInfo size={14} className="text-yellow-500 mt-0.5" />
                  <p className="text-xs text-yellow-700">AI API not configured. Showing fallback response. Configure GEMINI_API_KEY for full AI features.</p>
                </div>
              )}
              {/* Risk Level */}
              <div className={`rounded-xl border p-4 ${riskColors[result.data.riskLevel]}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FiAlertTriangle size={16} />
                  <span className="font-semibold text-sm">Risk Level: {result.data.riskLevel?.toUpperCase()}</span>
                </div>
                <p className="text-xs opacity-80">{result.data.urgency}</p>
              </div>
              {/* Possible Conditions */}
              {result.data.possibleConditions?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 text-sm mb-2">Possible Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {result.data.possibleConditions.map((c, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Suggested Tests */}
              {result.data.suggestedTests?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 text-sm mb-2">Suggested Tests</p>
                  <ul className="space-y-1">
                    {result.data.suggestedTests.map((t, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Explanation */}
              {result.data.explanation && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-700 text-sm mb-1">Analysis</p>
                  <p className="text-sm text-gray-600">{result.data.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {result.isFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <FiInfo size={14} className="text-yellow-500 mt-0.5" />
                  <p className="text-xs text-yellow-700">AI API not configured. Configure GEMINI_API_KEY for full features.</p>
                </div>
              )}
              {result.data.explanation && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-medium text-blue-800 text-sm mb-1">Patient Explanation</p>
                  <p className="text-sm text-blue-700">{result.data.explanation}</p>
                </div>
              )}
              {result.data.lifestyleAdvice?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 text-sm mb-2">Lifestyle Advice</p>
                  <ul className="space-y-1.5">
                    {result.data.lifestyleAdvice.map((a, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.data.preventiveAdvice && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="font-medium text-green-800 text-sm mb-1">Preventive Advice</p>
                  <p className="text-sm text-green-700">{result.data.preventiveAdvice}</p>
                </div>
              )}
              {result.data.urduExplanation && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-medium text-purple-800 text-sm mb-1">اردو وضاحت</p>
                  <p className="text-sm text-purple-700 text-right font-urdu leading-relaxed">{result.data.urduExplanation}</p>
                </div>
              )}
              {result.data.importantNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="font-medium text-amber-800 text-sm mb-1">⚠️ Important Notes</p>
                  <p className="text-sm text-amber-700">{result.data.importantNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
