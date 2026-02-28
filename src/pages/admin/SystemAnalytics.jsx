import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#fb923c'];

function SystemAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getAIPredictions = async () => {
    setLoadingAI(true);
    try {
      const res = await api.post('/ai/predictive-analytics', {
        diagnosisData: data?.charts?.commonDiagnoses || [],
        appointmentData: data?.charts?.appointmentsByMonth || [],
        timeframe: 'last 3 months'
      });
      setAiInsights(res.data.data);
    } catch {
      setAiInsights({ error: 'AI temporarily unavailable' });
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const { stats, charts } = data || {};

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Analytics</h1>
          <p className="page-subtitle">Comprehensive clinic performance metrics</p>
        </div>
        <button onClick={getAIPredictions} disabled={loadingAI} className="btn-primary">
          {loadingAI ? 'Analyzing...' : '🧠 AI Predictions'}
        </button>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
            🧠 AI Predictive Insights
          </h3>
          {aiInsights.error ? (
            <p className="text-red-500 text-sm">{aiInsights.error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-700 mb-2">Patient Load Forecast</p>
                <p className="text-sm text-indigo-600">{aiInsights.patientLoadForecast}</p>
              </div>
              {aiInsights.recommendations?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-2">Recommendations</p>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-sm text-indigo-600 flex items-start gap-1.5">
                        <span className="text-indigo-400 mt-0.5">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.mostCommonDiseases?.length > 0 && (
                <div className="col-span-full">
                  <p className="text-sm font-medium text-indigo-700 mb-2">Predicted Top Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.mostCommonDiseases.slice(0, 5).map((d, i) => (
                      <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
                        {d.disease} ({d.percentage || d.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: stats?.totalPatients || 0, color: 'text-blue-600' },
          { label: 'Active Doctors', value: stats?.totalDoctors || 0, color: 'text-green-600' },
          { label: 'Total Appointments', value: stats?.totalAppointments || 0, color: 'text-purple-600' },
          { label: 'Prescriptions', value: stats?.totalPrescriptions || 0, color: 'text-amber-600' }
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.appointmentsByMonth || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Top Diagnoses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.commonDiagnoses?.slice(0, 6) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="diagnosis" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Appointment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={charts?.appointmentsByStatus?.map(s => ({ name: s._id || 'Unknown', value: s.count })) || []}
                cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value"
              >
                {(charts?.appointmentsByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Doctor Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.doctorPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="completedAppointments" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SystemAnalytics;
