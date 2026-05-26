import React from 'react';

const Metrics = ({ tickets }) => {
  const activeTickets = tickets.filter(t => t.status !== 'Closed').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const closed = tickets.filter(t => t.status === 'Closed').length;
  const breached = tickets.filter(t => t.slaBreached && t.status !== 'Closed').length;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span className="metric-title">Total Active</span>
        <span className="metric-value">{activeTickets}</span>
      </div>
      <div className="metric-card active">
        <span className="metric-title">In Progress</span>
        <span className="metric-value">{inProgress}</span>
      </div>
      <div className="metric-card breached">
        <span className="metric-title">SLA Breached</span>
        <span className="metric-value">{breached}</span>
      </div>
      <div className="metric-card resolved">
        <span className="metric-title">Resolved</span>
        <span className="metric-value">{closed}</span>
      </div>
    </div>
  );
};

export default Metrics;
