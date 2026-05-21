import React, { useState } from 'react';
import axios from 'axios';
import { MdClose, MdError } from 'react-icons/md';

const EmergencyAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !patientEmail) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.append('patient_name', patientName);
      params.append('patient_email', patientEmail);
      
      const res = await axios.post('/api/auth/emergency-account', params);
      
      // Save token
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('email', res.data.email);
      
      setSuccess(true);
      setPatientName('');
      setPatientEmail('');
      
      // Call callback after 2 seconds
      setTimeout(() => {
        onSuccess(res.data);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create emergency account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-red-900 border-b border-red-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🚨 Emergency Account
          </h2>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-red-100 transition"
          >
            <MdClose size={24} />
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Account Created!</h3>
            <p className="text-slate-300 mb-4">
              Your emergency account has been created successfully.
            </p>
            <p className="text-slate-400 text-sm">
              You can now upload your brain scan and get immediate analysis.
            </p>
            <p className="text-yellow-400 text-sm mt-4">
              Redirecting to upload scanner...
            </p>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-slate-300 text-sm mb-4">
              Create a temporary account for emergency patient evaluation. This allows immediate scan upload and analysis before formal registration.
            </p>

            {error && (
              <div className="p-3 bg-red-900 border border-red-700 text-red-100 rounded-lg text-sm flex items-start gap-2">
                <MdError className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient's full name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Patient Email
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="Enter patient's email"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3 text-sm text-yellow-100">
              <strong>⚠️ Important:</strong> This account is for emergency use only. 
              The patient must complete full registration and provide detailed medical history after stabilization.
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmergencyAccountModal;
