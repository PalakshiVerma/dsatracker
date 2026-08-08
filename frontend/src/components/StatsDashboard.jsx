/**
 * ============================================================================
 * FILE PURPOSE: Analytics Progress Dashboard View Component
 * LOCATION: frontend/src/components/StatsDashboard.jsx
 * 
 * MONGODB CONCEPT CONSUMPTION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Consumes analytical endpoints GET /stats/summary, GET /stats/topic-progress, and GET /stats/timeline.
 * 
 * 2. Schema Modeling:
 *    - Visualizes aggregated metrics derived from Topic and Problem schemas.
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Displays topic mastery progress produced by joining `topics` collection via $lookup.
 * 
 * 4. Indexing for Query Performance:
 *    - Displays analytical aggregations calculated efficiently over indexed fields.
 * 
 * 5. Aggregation Pipelines:
 *    - Direct UI visualizer for MongoDB Aggregation Pipelines:
 *      a) GET /stats/summary: Rendered as Overview Metric Cards (Difficulty & Status $group counts).
 *      b) GET /stats/topic-progress: Rendered as Topic Mastery Progress Bars ($group, $cond, $lookup, $unwind, $project).
 *      c) GET /stats/timeline: Rendered as Monthly Activity Momentum cards ($dateToString, $group).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Layers, CheckCircle2, Bookmark, Flame } from 'lucide-react';

const StatsDashboard = ({ apiUrl }) => {
  const [summary, setSummary] = useState({ byDifficulty: [], byStatus: [] });
  const [topicProgress, setTopicProgress] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sumRes, topicRes, timeRes] = await Promise.all([
        axios.get(`${apiUrl}/stats/summary`),
        axios.get(`${apiUrl}/stats/topic-progress`),
        axios.get(`${apiUrl}/stats/timeline`),
      ]);
      setSummary(sumRes.data || { byDifficulty: [], byStatus: [] });
      setTopicProgress(topicRes.data || []);
      setTimeline(timeRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Could not load statistics. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Computing aggregation analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
        <p>{error}</p>
        <button onClick={fetchStats} style={{ marginTop: '1rem', background: 'var(--danger)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Retry</button>
      </div>
    );
  }

  // Calculate totals
  const totalCount = summary.byDifficulty.reduce((acc, curr) => acc + curr.count, 0);

  const getDifficultyCount = (diff) => {
    const item = summary.byDifficulty.find(d => d._id === diff);
    return item ? item.count : 0;
  };

  const getStatusCount = (stat) => {
    const item = summary.byStatus.find(s => s._id === stat);
    return item ? item.count : 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <BarChart3 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Solved</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Easy / Medium / Hard</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px' }}>
              <span style={{ color: '#10b981' }}>{getDifficultyCount('Easy')}</span> / {' '}
              <span style={{ color: '#f59e0b' }}>{getDifficultyCount('Medium')}</span> / {' '}
              <span style={{ color: '#ef4444' }}>{getDifficultyCount('Hard')}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Bookmark size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Revise Later</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{getStatusCount('Revise Later')}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Important Questions</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{getStatusCount('Important')}</div>
          </div>
        </div>

      </div>

      {/* 2. Topic Progress Breakdown */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
          Topic Mastery Breakdown
        </h3>

        {topicProgress.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No topic progress available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {topicProgress.map((tp, idx) => {
              const easyPct = totalCount ? (tp.easy / tp.totalSolved) * 100 : 0;
              const medPct = totalCount ? (tp.medium / tp.totalSolved) * 100 : 0;
              const hardPct = totalCount ? (tp.hard / tp.totalSolved) * 100 : 0;

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600' }}>{tp.topic}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>{tp.totalSolved}</strong> solved (
                      <span style={{ color: '#10b981' }}>{tp.easy} Easy</span> · {' '}
                      <span style={{ color: '#f59e0b' }}>{tp.medium} Med</span> · {' '}
                      <span style={{ color: '#ef4444' }}>{tp.hard} Hard</span>)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${easyPct}%`, backgroundColor: '#10b981', height: '100%' }} title={`Easy: ${tp.easy}`} />
                    <div style={{ width: `${medPct}%`, backgroundColor: '#f59e0b', height: '100%' }} title={`Medium: ${tp.medium}`} />
                    <div style={{ width: `${hardPct}%`, backgroundColor: '#ef4444', height: '100%' }} title={`Hard: ${tp.hard}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Monthly Activity Timeline */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
          Monthly Solving Momentum
        </h3>

        {timeline.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No activity timeline available yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {timeline.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{item._id}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{item.count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>problems</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StatsDashboard;
