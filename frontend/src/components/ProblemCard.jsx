import React from 'react';
import { ExternalLink, Edit3, Trash2, Calendar, Tag, Globe, CheckCircle2 } from 'lucide-react';

const ProblemCard = ({ problem, onEdit, onDelete, apiUrl }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solved': return 'var(--success)';
      case 'Revise Later': return 'var(--warning)';
      case 'Important': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'High': return { label: 'High 🟢', color: '#10b981' };
      case 'Low': return { label: 'Low 🔴', color: '#ef4444' };
      default: return { label: 'Medium 🟡', color: '#f59e0b' };
    }
  };

  const topicName = problem.topic?.name || (typeof problem.topic === 'string' ? problem.topic : problem.type) || 'General';

  const notesList = Array.isArray(problem.notes)
    ? problem.notes
    : (typeof problem.notes === 'string' && problem.notes.trim() ? [{ content: problem.notes, confidence: 'Medium' }] : []);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {problem.screenshot && (
        <div style={{ width: '100%', height: '200px', backgroundColor: '#000', overflow: 'hidden' }}>
          <img 
            src={`${apiUrl}${problem.screenshot}`} 
            alt={problem.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}
      
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <span className={`badge badge-${(problem.difficulty || 'Easy').toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span style={{ fontSize: '0.8rem', color: getStatusColor(problem.status), fontWeight: '600', border: `1px solid ${getStatusColor(problem.status)}`, padding: '2px 8px', borderRadius: '4px' }}>
            {problem.status}
          </span>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: '1.3' }}>{problem.title}</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
            <Tag size={14} />
            {topicName}
          </div>
          {problem.platform && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={14} />
              {problem.platform}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} />
            {formatDate(problem.dateSolved)}
          </div>
        </div>

        {notesList.length > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            padding: '1rem', 
            borderRadius: '8px', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            borderLeft: `3px solid var(--accent-primary)`,
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
              Revision History ({notesList.length})
            </div>
            {notesList.map((note, idx) => {
              const conf = getConfidenceBadge(note.confidence);
              return (
                <div key={idx} style={{ marginBottom: idx === notesList.length - 1 ? 0 : '0.75rem', paddingBottom: idx === notesList.length - 1 ? 0 : '0.75rem', borderBottom: idx === notesList.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: conf.color, fontWeight: '600' }}>{conf.label}</span>
                    {note.createdAt && <span>{formatDate(note.createdAt)}</span>}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{note.content}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => onEdit(problem)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '0.2rem' }}
              title="Edit"
            >
              <Edit3 size={18} />
            </button>
            <button 
              onClick={() => onDelete(problem._id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '0.2rem' }}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          {problem.problemUrl && (
            <a 
              href={problem.problemUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--accent-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontSize: '0.9rem', 
                fontWeight: '500', 
                textDecoration: 'none' 
              }}
            >
              View Problem
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
