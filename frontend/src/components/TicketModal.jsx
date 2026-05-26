import React, { useState, useEffect } from 'react';

const TicketModal = ({ ticket, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('Unassigned');

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || 'Medium');
      setAssignedTo(ticket.assignedTo || 'Unassigned');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setAssignedTo('Unassigned');
    }
  }, [ticket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onSave({
      title,
      description,
      priority,
      assignedTo
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{ticket ? 'Edit Support Ticket' : 'Create New Support Ticket'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Ticket Title *</label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="Brief summary of the issue..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Issue Description *</label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Provide detailed description of the error or request..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority SLA Level</label>
              <select
                id="priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority (48h SLA)</option>
                <option value="Medium">Medium Priority (24h SLA)</option>
                <option value="High">High Priority (8h SLA)</option>
                <option value="Urgent">Urgent Priority (2h SLA)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignee">Assigned Agent</label>
              <input
                type="text"
                id="assignee"
                className="form-input"
                placeholder="Name of agent or team..."
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            {ticket && onDelete && (
              <button 
                type="button" 
                className="btn-danger" 
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this ticket?')) {
                    onDelete(ticket._id);
                  }
                }}
              >
                Delete Ticket
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {ticket ? 'Save Changes' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
