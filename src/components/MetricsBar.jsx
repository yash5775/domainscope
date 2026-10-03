import React from 'react';

export default function MetricsBar({ stats, activeFilter, onSelectFilter }) {
  return (
    <div className="stats-grid">
      {/* Total Card */}
      <div 
        className={`stat-card ${activeFilter === 'all' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('all')}
        title="Click to view all checked domains"
      >
        <span className="stat-title">Total Checked</span>
        <span className="stat-value">{stats.total}</span>
      </div>

      {/* Available Card */}
      <div 
        className={`stat-card stat-available ${activeFilter === 'available' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('available')}
        title="Click to view available domains only"
      >
        <span className="stat-title">Available</span>
        <span className="stat-value text-available">{stats.available}</span>
      </div>

      {/* Registered Card */}
      <div 
        className={`stat-card stat-taken ${activeFilter === 'taken' ? 'active-filter-card' : ''}`}
        onClick={() => onSelectFilter('taken')}
        title="Click to view registered domains only"
      >
        <span className="stat-title">Registered</span>
        <span className="stat-value">{stats.taken}</span>
      </div>

      {/* Errors / Rate Limit Card */}
      <div 
        className="stat-card stat-errors"
        title="Domains that encountered registry rate limit or network timeouts"
      >
        <span className="stat-title">Errors / Rate Limit</span>
        <span className="stat-value">{stats.errors}</span>
      </div>
    </div>
  );
}
