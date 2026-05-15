const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const feedbackController = require('../controllers/feedbackController');

// --- ASSIGNMENTS ---

// Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    // Also fetch submission counts for the dashboard
    const assignmentsWithCounts = await Promise.all(assignments.map(async (a) => {
      const submissionsCount = await Submission.countDocuments({ assignmentId: a._id });
      return { ...a.toObject(), submissionsCount, pendingCount: 0 }; // simplified pending logic
    }));
    res.json(assignmentsWithCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Create assignment
router.post('/assignments', async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// --- SUBMISSIONS ---

// Get submissions for an assignment
router.get('/assignments/:id/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Generate Feedback (Calls AI and saves submission)
router.post('/feedback', feedbackController.generateFeedback);

module.exports = router;
