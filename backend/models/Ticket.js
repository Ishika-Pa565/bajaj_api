const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Under Review', 'Closed'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  slaLimitHours: {
    type: Number,
  },
  slaBreached: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: String,
    default: 'Unassigned',
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true,
});

// Pre-save hook to calculate SLA limit and manage history
ticketSchema.pre('save', function (next) {
  if (this.isModified('priority') || !this.slaLimitHours) {
    switch (this.priority) {
      case 'Urgent':
        this.slaLimitHours = 2; // 2 hours
        break;
      case 'High':
        this.slaLimitHours = 8; // 8 hours
        break;
      case 'Medium':
        this.slaLimitHours = 24; // 24 hours
        break;
      case 'Low':
        this.slaLimitHours = 48; // 48 hours
        break;
      default:
        this.slaLimitHours = 24;
    }
  }

  // If status history is empty, initialize it with current status
  if (this.statusHistory.length === 0 || this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }

  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
