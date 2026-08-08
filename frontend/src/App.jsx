import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import ProblemForm from './components/ProblemForm';
import ProblemList from './components/ProblemList';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://dsatracker-project2-14.onrender.com');

function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/problems`);
      const fetchedData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setProblems(fetchedData);
      setError(null);
    } catch (err) {
      setError('Could not fetch problems. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await axios.delete(`${API_URL}/problems/${id}`);
        setProblems(problems.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete problem.');
      }
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingProblem(null);
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty ? problem.difficulty === filterDifficulty : true;
    const matchesType = filterType ? problem.type === filterType : true;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  // Get unique types for filter dropdown
  const uniqueTypes = [...new Set(problems.map(p => p.type))];

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DSA Problem Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your progress, solve by topic, and never forget a trick.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          style={{ 
            backgroundColor: 'var(--accent-primary)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Plus size={20} />
          Add Problem
        </button>
      </header>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search problems or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Topics</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button 
            onClick={fetchProblems}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem' }}
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading problems...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
          <p>{error}</p>
          <button onClick={fetchProblems} style={{ marginTop: '1rem', background: 'var(--danger)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Retry</button>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No problems found. Start by adding your first solved question!</p>
        </div>
      ) : (
        <ProblemList 
          problems={filteredProblems} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          apiUrl={API_URL}
        />
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingProblem ? 'Edit Problem' : 'Add New Problem'}</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <ProblemForm 
              onClose={closeModal} 
              onSuccess={() => { fetchProblems(); closeModal(); }}
              editingProblem={editingProblem}
              apiUrl={API_URL}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
