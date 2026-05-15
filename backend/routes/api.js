const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const feedbackController = require('../controllers/feedbackController');
const chatController = require('../controllers/chatController');

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

// Update assignment
router.put('/assignments/:id', async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!updatedAssignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment
router.delete('/assignments/:id', async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Also delete associated submissions to keep db clean
    await Submission.deleteMany({ assignmentId: req.params.id });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
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

// --- CHATBOT ---

// Chat route for student workspace
router.post('/chat', chatController.handleChat);

module.exports = router;
