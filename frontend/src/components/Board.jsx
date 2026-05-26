import React from 'react';
import TicketCard from './TicketCard';

const Board = ({ tickets, onUpdateStatus, onEditClick }) => {
  const ticketList = Array.isArray(tickets) ? tickets : [];
  const statuses = [
    { id: 'Open', title: 'Open / Backlog', class: 'column-open' },
    { id: 'In Progress', title: 'In Progress', class: 'column-progress' },
    { id: 'Under Review', title: 'Under Review', class: 'column-review' },
    { id: 'Closed', title: 'Resolved / Closed', class: 'column-closed' }
  ];

  // Drag and Drop handlers
  const handleDragStart = (e, ticketId) => {
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      onUpdateStatus(ticketId, targetStatus);
    }
  };

  return (
    <div className="kanban-board">
      {statuses.map((status) => {
        const columnTickets = ticketList.filter(t => t.status === status.id);
        
        return (
          <div 
            key={status.id} 
            className={`kanban-column ${status.class}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            <div className="column-header">
              <span className="column-title">
                <span className="column-indicator"></span>
                {status.title}
              </span>
              <span className="column-count">{columnTickets.length}</span>
            </div>

            <div className="cards-list">
              {columnTickets.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  border: '1.5px dashed rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100px'
                }}>
                  No Tickets
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket._id)}
                  >
                    <TicketCard 
                      ticket={ticket}
                      onUpdateStatus={onUpdateStatus}
                      onEditClick={onEditClick}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Board;
