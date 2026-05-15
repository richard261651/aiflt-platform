const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const feedbackController = require('../controllers/feedbackController');
const chatController = require('../controllers/chatController');
const { verifyToken, verifyProfessor } = require('../middleware/authMiddleware');

// --- FOLDERS ---

router.get('/folders', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

router.post('/folders', verifyToken, verifyProfessor, async (req, res) => {
  try {
    const folder = new Folder({ ...req.body, professorId: req.user.id });
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.put('/folders/:id', verifyToken, verifyProfessor, async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

router.delete('/folders/:id', verifyToken, verifyProfessor, async (req, res) => {
  try {
    await Folder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

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
// Get next version number for a student
router.get('/submissions/next-version/:assignmentId/:studentName', async (req, res) => {
  try {
    const { assignmentId, studentName } = req.params;
    const count = await Submission.countDocuments({ assignmentId, studentName });
    res.json({ nextVersion: count + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update submission (For Professor to save edited feedback and mark as Sent)
router.put('/submissions/:id', verifyToken, verifyProfessor, async (req, res) => {
  try {
    const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Generate Feedback (Calls AI and saves submission)
router.post('/feedback', feedbackController.generateFeedback);

// --- CHATBOT ---

// Chat route for student workspace
router.post('/chat', chatController.handleChat);

module.exports = router;
