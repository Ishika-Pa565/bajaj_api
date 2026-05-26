import React from 'react';

const Metrics = ({ tickets }) => {
  const ticketList = Array.isArray(tickets) ? tickets : [];
  const activeTickets = ticketList.filter(t => t.status !== 'Closed').length;
  const inProgress = ticketList.filter(t => t.status === 'In Progress').length;
  const closed = ticketList.filter(t => t.status === 'Closed').length;
  const breached = ticketList.filter(t => t.slaBreached && t.status !== 'Closed').length;

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
