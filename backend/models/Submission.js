const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentName: { type: String, required: true },
  version: { type: Number, default: 1 },
  textContent: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Sent'], default: 'Pending' },
  feedbackIA: {
    whatWorked: [String],
    areasToImprove: [String],
    howToImprove: [String],
    source: String
  },
  finalFeedback: { type: String },
  finalGrade: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
