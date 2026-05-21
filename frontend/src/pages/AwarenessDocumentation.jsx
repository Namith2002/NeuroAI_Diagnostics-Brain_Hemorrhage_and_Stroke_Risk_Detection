import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { MdDownload, MdBook } from 'react-icons/md';

const AwarenessDocumentation = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reports/documentation/available');
      setDocuments(res.data.available_documents || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch documentation: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoc = async (docId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/reports/documentation/${docId}`);
      setSelectedDoc({ id: docId, ...res.data });
      setError('');
    } catch (err) {
      setError('Failed to load document: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const res = await axios.get(`/api/reports/documentation/${docId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NeuroAI_${docId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Failed to download document');
    }
  };

  if (loading && !selectedDoc) {
    return (
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-2xl">Loading documentation...</div>
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

          <h1 className="text-4xl font-bold text-white mb-2">Awareness & Educational Documentation</h1>
          <p className="text-slate-400 mb-8">Comprehensive guides for patients and healthcare professionals</p>

          <div className="grid grid-cols-3 gap-8">
            {/* Document List Sidebar */}
            <div className="col-span-1">
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-700 border-b border-slate-600">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MdBook /> Documents
                  </h2>
                </div>
                <div className="space-y-2 p-4">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedDoc?.id === doc.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">{doc.title}</div>
                      <div className="text-xs mt-1 opacity-75 line-clamp-2">{doc.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Reference */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Reference</h3>
                <button
                  onClick={() => {
                    axios.get('/api/reports/documentation/quick-reference/first-aid')
                      .then(res => {
                        setSelectedDoc({
                          id: 'first-aid',
                          title: res.data.title,
                          content: res.data.content
                        });
                      })
                      .catch(err => setError('Failed to load quick reference'));
                  }}
                  className="w-full text-left p-3 rounded-lg bg-red-900 hover:bg-red-800 text-red-100 transition border border-red-700"
                >
                  <div className="font-semibold text-sm">🚨 Emergency First-Aid Guide</div>
                  <div className="text-xs mt-1">Quick reference for emergency situations</div>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="col-span-2">
              {selectedDoc ? (
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="p-6 bg-slate-700 border-b border-slate-600 flex justify-between items-start">
                    <h2 className="text-2xl font-semibold text-white">{selectedDoc.title}</h2>
                    <button
                      onClick={() => handleDownload(selectedDoc.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      <MdDownload /> Download
                    </button>
                  </div>
                  <div className="p-6 text-slate-200 whitespace-pre-wrap max-h-[600px] overflow-auto font-sans text-sm leading-relaxed">
                    {selectedDoc.content}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
                  <MdBook className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400">Select a document to view its content</p>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">📚 For Patients</h3>
              <p className="text-slate-300 text-sm">
                Understand your condition, recovery process, and when to seek emergency help.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">🏥 For Caregivers</h3>
              <p className="text-slate-300 text-sm">
                Learn how to support recovery and recognize warning signs that require medical attention.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">👨‍⚕️ For Healthcare Providers</h3>
              <p className="text-slate-300 text-sm">
                Reference guides for emergency protocols and stroke-epilepsy management strategies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessDocumentation;
