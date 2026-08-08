import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProblemForm = ({ onClose, onSuccess, editingProblem, apiUrl }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    platform: '',
    problemUrl: '',
    dateSolved: new Date().toISOString().split('T')[0],
    notes: '',
    confidence: 'Medium',
    status: 'Solved',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`${apiUrl}/topics`);
      setTopics(res.data || []);
    } catch (err) {
      console.error('Failed to fetch topics', err);
    }
  };

  useEffect(() => {
    if (editingProblem) {
      const topicVal = editingProblem.topic?._id || editingProblem.topic || editingProblem.type || '';
      const initialNotes = Array.isArray(editingProblem.notes)
        ? editingProblem.notes.map(n => n.content).join('\n')
        : (editingProblem.notes || '');

      setFormData({
        title: editingProblem.title || '',
        difficulty: editingProblem.difficulty || 'Easy',
        platform: editingProblem.platform || '',
        problemUrl: editingProblem.problemUrl || '',
        dateSolved: editingProblem.dateSolved ? new Date(editingProblem.dateSolved).toISOString().split('T')[0] : '',
        notes: initialNotes,
        confidence: 'Medium',
        status: editingProblem.status || 'Solved',
      });

      setSelectedTopic(topicVal);
    }
  }, [editingProblem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTopicSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__ADD_NEW__') {
      setIsCustomTopic(true);
      setSelectedTopic('');
    } else {
      setIsCustomTopic(false);
      setSelectedTopic(value);
    }
  };

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const topicToSubmit = isCustomTopic ? customTopic.trim() : selectedTopic;
    if (!topicToSubmit) {
      alert('Please select or enter a topic.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('topic', topicToSubmit);
    data.append('difficulty', formData.difficulty);
    data.append('platform', formData.platform);
    data.append('problemUrl', formData.problemUrl);
    data.append('dateSolved', formData.dateSolved);
    data.append('status', formData.status);
    data.append('confidence', formData.confidence);

    if (editingProblem && editingProblem.notes) {
      data.append('newNoteContent', formData.notes);
    } else {
      data.append('notes', formData.notes);
    }

    if (screenshot) {
      data.append('screenshot', screenshot);
    }

    try {
      if (editingProblem) {
        await axios.put(`${apiUrl}/problems/${editingProblem._id}`, data);
      } else {
        await axios.post(`${apiUrl}/problems`, data);
      }
      onSuccess();
    } catch (err) {
      alert('Error saving problem. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Problem Title *</label>
        <input 
          type="text" name="title" value={formData.title} onChange={handleChange} required 
          placeholder="e.g. Reverse a Linked List" style={{ width: '100%' }} 
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Topic *</label>
        {!isCustomTopic ? (
          <select value={selectedTopic} onChange={handleTopicSelectChange} required style={{ width: '100%' }}>
            <option value="">-- Select Topic --</option>
            {topics.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
            <option value="__ADD_NEW__">+ Add New Topic...</option>
          </select>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} required 
              placeholder="e.g. Dynamic Programming" style={{ width: '100%' }} 
            />
            <button type="button" onClick={() => setIsCustomTopic(false)} style={{ padding: '0 8px' }}>Cancel</button>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Difficulty *</label>
        <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={{ width: '100%' }}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Platform</label>
        <input 
          type="text" name="platform" value={formData.platform} onChange={handleChange} 
          placeholder="e.g. LeetCode, GFG" style={{ width: '100%' }} 
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Problem URL</label>
        <input 
          type="url" name="problemUrl" value={formData.problemUrl} onChange={handleChange} 
          placeholder="https://leetcode.com/..." style={{ width: '100%' }} 
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date Solved</label>
        <input type="date" name="dateSolved" value={formData.dateSolved} onChange={handleChange} style={{ width: '100%' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
        <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%' }}>
          <option value="Solved">Solved</option>
          <option value="Revise Later">Revise Later</option>
          <option value="Important">Important</option>
        </select>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)' }}>
            {editingProblem ? 'Add Revision Note' : 'Initial Revision Note'}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confidence:</span>
            <select name="confidence" value={formData.confidence} onChange={handleChange} style={{ padding: '2px 8px' }}>
              <option value="Low">Low 🔴</option>
              <option value="Medium">Medium 🟡</option>
              <option value="High">High 🟢</option>
            </select>
          </div>
        </div>
        <textarea 
          name="notes" value={formData.notes} onChange={handleChange} rows="3" 
          placeholder="Key observations, edge cases, complexity..." style={{ width: '100%', resize: 'vertical' }} 
        />
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Screenshot/Image</label>
        <input type="file" onChange={handleFileChange} accept="image/*" style={{ width: '100%', padding: '10px' }} />
        {editingProblem && editingProblem.screenshot && !screenshot && (
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Keep empty to retain existing screenshot.</p>
        )}
      </div>

      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '6px' }}>
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '600' }}
        >
          {loading ? 'Saving...' : editingProblem ? 'Update Problem' : 'Save Problem'}
        </button>
      </div>
    </form>
  );
};

export default ProblemForm;
