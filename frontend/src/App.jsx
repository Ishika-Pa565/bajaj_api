import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Board from './components/Board';
import Metrics from './components/Metrics';
import TicketModal from './components/TicketModal';

// Setup dynamic API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://bajaj-api-3-ae2u.onrender.com';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to real-time sync server');
    });

    socketInstance.on('ticket_created', (newTicket) => {
      setTickets((prev) => Array.isArray(prev) ? [newTicket, ...prev] : [newTicket]);
    });

    socketInstance.on('ticket_updated', (updatedTicket) => {
      setTickets((prev) => 
        Array.isArray(prev) ? prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)) : [updatedTicket]
      );
    });

    socketInstance.on('ticket_deleted', (deletedId) => {
      setTickets((prev) => Array.isArray(prev) ? prev.filter((t) => t._id !== deletedId) : []);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch tickets initially
  useEffect(() => {
    fetchTickets();
    
    // Periodically fetch tickets every 15 seconds to sync SLA breach statuses
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, [priorityFilter, slaFilter]);

  const fetchTickets = async () => {
    try {
      let url = `${API_URL}/api/tickets?`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (slaFilter) {
        if (slaFilter === 'breached') url += `slaBreached=true&`;
        if (slaFilter === 'active') url += `slaBreached=false&`;
      }
      
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        console.error('API response is not an array:', response.data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/tickets/${ticketId}/status`, {
        status: newStatus
      });
      // State updates automatically via Socket.io broadcast
    } catch (error) {
      // Catch and display transition validation errors from backend
      const errMsg = error.response?.data?.message || 'Error updating status';
      showToast(errMsg);
    }
  };

  const handleSaveTicket = async (ticketData) => {
    try {
      if (selectedTicket) {
        // Edit existing ticket
        await axios.patch(`${API_URL}/api/tickets/${selectedTicket._id}`, ticketData);
      } else {
        // Create new ticket
        await axios.post(`${API_URL}/api/tickets`, ticketData);
      }
      setIsModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error saving ticket:', error);
      showToast(error.response?.data?.message || 'Failed to save ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await axios.delete(`${API_URL}/api/tickets/${ticketId}`);
      setIsModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showToast('Failed to delete ticket');
    }
  };

  // Filter tickets client-side for real-time search
  const ticketList = Array.isArray(tickets) ? tickets : [];
  const filteredTickets = ticketList.filter(ticket => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower) ||
      (ticket.assignedTo && ticket.assignedTo.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <h1>DeskFlow</h1>
          <p>Real-Time Helpdesk & SLA Kanban Board</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setSelectedTicket(null);
          setIsModalOpen(true);
        }}>
          <span>+</span> New Ticket
        </button>
      </header>

      {/* Metrics Section */}
      <Metrics tickets={tickets} />

      {/* Filter Section */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, description or agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>

          <select 
            className="filter-select"
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
          >
            <option value="">All SLA Statuses</option>
            <option value="active">SLA Active</option>
            <option value="breached">SLA Breached</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <Board 
        tickets={filteredTickets}
        onUpdateStatus={handleUpdateStatus}
        onEditClick={(ticket) => {
          setSelectedTicket(ticket);
          setIsModalOpen(true);
        }}
      />

      {/* Ticket Create/Edit Modal */}
      {isModalOpen && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTicket(null);
          }}
          onSave={handleSaveTicket}
          onDelete={handleDeleteTicket}
        />
      )}

      {/* Error / Warning Toast Alerts */}
      {toastMessage && (
        <div className="toast">
          <span className="toast-icon">⚠️</span>
          <div className="toast-message">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default App;
