const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  folder: { type: String, default: 'General' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  briefing: { type: String, required: true },
  criteria: { type: String, required: true },
  feedbackStyle: { type: String },
  deadline: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
