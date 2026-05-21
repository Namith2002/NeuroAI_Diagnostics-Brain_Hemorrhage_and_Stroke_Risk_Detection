import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraphAnalytics = () => {
  const [locationData, setLocationData] = useState([]);
  const [strokeEpilepsyData, setStrokeEpilepsyData] = useState(null);
  const [riskSeverityData, setRiskSeverityData] = useState([]);
  const [accuracyData, setAccuracyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const [locationRes, strokeRes, riskRes, accuracyRes] = await Promise.all([
        axios.get('/api/admin/graph-analysis/location-distribution'),
        axios.get('/api/admin/graph-analysis/stroke-epilepsy-correlation'),
        axios.get('/api/admin/graph-analysis/risk-severity-scatter'),
        axios.get('/api/admin/graph-analysis/dataset-accuracy-comparison')
      ]);

      // Format location data for pie chart
      const locData = Object.entries(locationRes.data.location_distribution || {}).map(([location, percentage]) => ({
        name: location,
        value: percentage
      }));
      setLocationData(locData);

      setStrokeEpilepsyData(strokeRes.data);
      setRiskSeverityData(riskRes.data.data_points || []);
      setAccuracyData(accuracyRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch graph data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-2xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-slate-950">
          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-100 rounded-lg">
              {error}
            </div>
          )}

          <h1 className="text-4xl font-bold text-white mb-8">Graph Analytics & Insights</h1>

          {/* Location Distribution Chart */}
          <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">Hemorrhage Location Distribution</h2>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-center py-8">No hemorrhage data available</div>
            )}
          </div>

          {/* Stroke-Epilepsy Correlation */}
          {strokeEpilepsyData && (
            <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Stroke-Epilepsy Risk Correlation</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(strokeEpilepsyData.stroke_ranges || {}).map(([range, count]) => (
                  <div key={range} className="bg-slate-700 p-4 rounded">
                    <div className="text-slate-300 text-sm">Stroke Risk {range}%</div>
                    <div className="text-white text-2xl font-bold">{count}</div>
                    <div className="text-blue-400 text-sm">Avg Epilepsy: {strokeEpilepsyData.avg_epilepsy_by_stroke[range] || 0}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk vs Severity Scatter */}
          {riskSeverityData.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Risk vs Severity Analysis</h2>
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="severity" stroke="#cbd5e1" label={{ value: 'Severity %', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis type="number" dataKey="stroke_risk" stroke="#cbd5e1" label={{ value: 'Stroke Risk %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Scatter name="Hemorrhages" data={riskSeverityData} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dataset Accuracy Comparison */}
          {accuracyData && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Dataset Accuracy Comparison</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3">Kaggle Dataset</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-slate-300 text-sm">Total Scans</div>
                      <div className="text-white text-2xl font-bold">{accuracyData.kaggle.total_scans}</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-sm">Average Accuracy</div>
                      <div className="text-blue-400 text-2xl font-bold">{accuracyData.kaggle.avg_accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-sm">Average Precision</div>
                      <div className="text-green-400 text-2xl font-bold">{accuracyData.kaggle.avg_precision}%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3">Real-Time Dataset</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-slate-300 text-sm">Total Scans</div>
                      <div className="text-white text-2xl font-bold">{accuracyData.realtime.total_scans}</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-sm">Average Accuracy</div>
                      <div className="text-blue-400 text-2xl font-bold">{accuracyData.realtime.avg_accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-slate-300 text-sm">Average Precision</div>
                      <div className="text-green-400 text-2xl font-bold">{accuracyData.realtime.avg_precision}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-600 rounded">
                <h3 className="text-lg font-semibold text-white mb-3">Performance Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-300 text-sm">Accuracy Difference</div>
                    <div className={`text-2xl font-bold ${accuracyData.comparison.accuracy_difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {accuracyData.comparison.accuracy_difference > 0 ? '+' : ''}{accuracyData.comparison.accuracy_difference}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-300 text-sm">Precision Difference</div>
                    <div className={`text-2xl font-bold ${accuracyData.comparison.precision_difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {accuracyData.comparison.precision_difference > 0 ? '+' : ''}{accuracyData.comparison.precision_difference}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphAnalytics;
