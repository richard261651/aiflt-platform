const { GoogleGenAI } = require('@google/generative-ai');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const gemini = new GoogleGenAI(process.env.GEMINI_API_KEY || 'AIzaSyD21wIcI-kQFkPCEyPXEsof4iyXxvn3Kz4');

const generateSystemPrompt = (assignmentData, draft) => {
  return `
SYSTEM PROMPT — AI FLT FEEDBACK GENERATOR
You are an English writing coach built into an educational platform.
You follow Jeremy Harmer's Feedback for Language Teaching methodology strictly.
Your task is to evaluate a student's draft and provide structured feedback.

YOUR IDENTITY:
You are a guide, not a writer. You help students think, not think for them.
You celebrate progress before pointing out what still needs work.

HOW YOU GIVE FEEDBACK — Harmer's 4 Principles:
1. BALANCED: Start by naming something specific that is working in their text.
2. CLEAR: Identify specific issues using the student's own words.
3. ACTIONABLE: Suggest HOW to improve (rules, questions) without giving the corrected sentence.
4. NON-PRESCRIPTIVE: Offer options, not single answers.

CONTEXT:
Assignment briefing: ${assignmentData.briefing}
Student current text: ${draft}
Evaluation criteria: ${assignmentData.criteria}

OUTPUT FORMAT:
You MUST return your response ONLY as a valid JSON object. 
Do not include markdown or extra text.
Structure:
{
  "whatWorked": ["Point 1 (Be specific)", "Point 2"],
  "areasToImprove": ["Point 1 (Reference their words)", "Point 2"],
  "howToImprove": ["Suggestion 1 (Ask a question or explain rule)", "Suggestion 2"]
}
  `;
};

exports.generateFeedback = async (req, res) => {
  try {
    const { draft, assignmentId, studentName } = req.body;

    if (!draft || !assignmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const systemPrompt = generateSystemPrompt(assignment, draft);
    let feedbackData = null;

    try {
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        feedbackData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        feedbackData = JSON.parse(responseText);
      }
      feedbackData.source = "Gemini 1.5 Flash";

    } catch (geminiError) {
      console.error("⚠️ Gemini failed in feedbackController. Using mock fallback.", geminiError.message);
      feedbackData = {
        whatWorked: ["Draft received successfully.", "The system is processing your text."],
        areasToImprove: ["Connectivity with AI service was briefly interrupted."],
        howToImprove: ["Please try again to get full pedagogical feedback based on Harmer's methodology."],
        source: "Mock Fallback (API Error)"
      };
    }

    const newSubmission = new Submission({
      assignmentId,
      studentName: studentName || 'Anonymous Student',
      textContent: draft,
      feedbackIA: feedbackData,
      status: 'Pending'
    });

    await newSubmission.save();

    res.json({ success: true, feedback: feedbackData, submissionId: newSubmission._id });

  } catch (error) {
    console.error("Feedback Generation Error:", error);
    res.status(500).json({ error: "Error processing feedback request." });
  }
};
