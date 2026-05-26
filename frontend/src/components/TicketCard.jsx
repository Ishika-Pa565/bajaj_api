import React, { useState, useEffect } from 'react';

const TicketCard = ({ ticket, onUpdateStatus, onEditClick }) => {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [slaState, setSlaState] = useState('normal'); // normal, warning, breached

  useEffect(() => {
    if (ticket.status === 'Closed') {
      if (ticket.slaBreached) {
        setTimeLeftStr('Breached at resolution');
        setSlaState('breached');
        setProgressPercent(100);
      } else {
        setTimeLeftStr('SLA Met');
        setSlaState('normal');
        setProgressPercent(0);
      }
      return;
    }

    const calculateSla = () => {
      const createdAtMs = new Date(ticket.createdAt).getTime();
      const slaDurationMs = ticket.slaLimitHours * 60 * 60 * 1000;
      const targetTimeMs = createdAtMs + slaDurationMs;
      const nowMs = Date.now();
      const remainingMs = targetTimeMs - nowMs;

      // Calculate progress percentage
      const elapsedMs = nowMs - createdAtMs;
      const percent = Math.min(100, Math.max(0, (elapsedMs / slaDurationMs) * 100));
      setProgressPercent(percent);

      if (remainingMs <= 0) {
        setSlaState('breached');
        const diffMs = Math.abs(remainingMs);
        const hours = Math.floor(diffMs / (3600000));
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeLeftStr(`-${hours}h ${mins}m ${secs}s`);
      } else {
        const hours = Math.floor(remainingMs / (3600000));
        const mins = Math.floor((remainingMs % 3600000) / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);

        if (percent > 75) {
          setSlaState('warning');
        } else {
          setSlaState('normal');
        }
      }
    };

    calculateSla();
    const interval = setInterval(calculateSla, 1000);
    return () => clearInterval(interval);
  }, [ticket]);

  // Handle transition triggering
  const triggerTransition = (newStatus) => {
    onUpdateStatus(ticket._id, newStatus);
  };

  const getSlaClass = () => {
    if (slaState === 'breached') return 'sla-breached';
    if (slaState === 'warning') return 'sla-warning';
    return 'sla-normal';
  };

  const getSlaFillClass = () => {
    if (slaState === 'breached') return 'breached';
    if (slaState === 'warning') return 'warning';
    return 'normal';
  };

  return (
    <div className={`ticket-card ${getSlaClass()}`}>
      <div className="card-header">
        <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </span>
        <button 
          className="btn-edit" 
          onClick={() => onEditClick(ticket)}
          title="Edit Details"
        >
          ✏️
        </button>
      </div>

      <div className="card-title">{ticket.title}</div>
      <div className="card-desc">{ticket.description}</div>

      <div className="sla-status-box">
        <div className="sla-label-row">
          <span>SLA ({ticket.slaLimitHours}h limit)</span>
          <span className={`sla-timer ${slaState === 'breached' ? 'breached' : slaState === 'warning' ? 'warning' : 'active'}`}>
            {timeLeftStr}
          </span>
        </div>
        {ticket.status !== 'Closed' && (
          <div className="sla-progress-bar">
            <div 
              className={`sla-progress-fill ${getSlaFillClass()}`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="assignee">
          <div className="assignee-avatar">
            {ticket.assignedTo ? ticket.assignedTo.charAt(0) : 'U'}
          </div>
          <span>{ticket.assignedTo || 'Unassigned'}</span>
        </div>

        <div className="transition-controls">
          {ticket.status === 'Open' && (
            <button 
              className="btn-transition" 
              onClick={() => triggerTransition('In Progress')}
              title="Start Work (Move to In Progress)"
            >
              ▶️
            </button>
          )}

          {ticket.status === 'In Progress' && (
            <>
              <button 
                className="btn-transition" 
                onClick={() => triggerTransition('Open')}
                title="Send back to Open"
              >
                ◀️
              </button>
              <button 
                className="btn-transition" 
                onClick={() => triggerTransition('Under Review')}
                title="Submit for Review"
              >
                👁️
              </button>
            </>
          )}

          {ticket.status === 'Under Review' && (
            <>
              <button 
                className="btn-transition" 
                onClick={() => triggerTransition('In Progress')}
                title="Reject (Send back to In Progress)"
              >
                ❌
              </button>
              <button 
                className="btn-transition" 
                onClick={() => triggerTransition('Closed')}
                title="Approve & Resolve (Move to Closed)"
              >
                ✅
              </button>
            </>
          )}

          {ticket.status === 'Closed' && (
            <button 
              className="btn-transition" 
              onClick={() => triggerTransition('Open')}
              title="Reopen Ticket"
            >
              🔄
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
