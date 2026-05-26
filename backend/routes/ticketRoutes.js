const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Allowed status transitions mapping
const ALLOWED_TRANSITIONS = {
  'Open': ['In Progress'],
  'In Progress': ['Open', 'Under Review'],
  'Under Review': ['In Progress', 'Closed'],
  'Closed': ['Open']
};

// Helper function to update SLA breach flags dynamically
const updateSlaStatus = async (tickets) => {
  const updatedTickets = [];
  for (let ticket of tickets) {
    if (ticket.status !== 'Closed' && !ticket.slaBreached) {
      const elapsedHours = (Date.now() - new Date(ticket.createdAt)) / (1000 * 60 * 60);
      if (elapsedHours > ticket.slaLimitHours) {
        ticket.slaBreached = true;
        await ticket.save();
      }
    }
    updatedTickets.push(ticket);
  }
  return updatedTickets;
};

// @route   GET /api/tickets
// @desc    Get all tickets with filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, slaBreached, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (slaBreached) query.slaBreached = slaBreached === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } }
      ];
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });
    
    // Check SLA status before returning
    tickets = await updateSlaStatus(tickets);
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tickets
// @desc    Create a new ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;
    
    const newTicket = new Ticket({
      title,
      description,
      priority,
      assignedTo
    });

    const savedTicket = await newTicket.save();
    
    // Broadcast via socket
    if (req.io) {
      req.io.emit('ticket_created', savedTicket);
    }

    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PATCH /api/tickets/:id/status
// @desc    Update ticket status with transition verification
router.patch('/:id/status', async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const ticket = await Ticket.findById(req.id || req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const currentStatus = ticket.status;

    // Check if newStatus is valid transition from currentStatus
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ 
        message: `Invalid status transition: cannot move ticket from '${currentStatus}' to '${newStatus}'.`
      });
    }

    ticket.status = newStatus;
    const updatedTicket = await ticket.save();

    // Broadcast via socket
    if (req.io) {
      req.io.emit('ticket_updated', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PATCH /api/tickets/:id
// @desc    Update ticket details
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;

    const updatedTicket = await ticket.save();

    // Broadcast via socket
    if (req.io) {
      req.io.emit('ticket_updated', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/tickets/:id
// @desc    Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await Ticket.deleteOne({ _id: req.params.id });

    // Broadcast via socket
    if (req.io) {
      req.io.emit('ticket_deleted', req.params.id);
    }

    res.json({ message: 'Ticket deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
