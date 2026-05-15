const Groq = require('groq-sdk');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const { draft, assignmentId, studentName, version } = req.body;

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
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Evaluate the draft according to the Harmer methodology and return only the JSON." }
        ],
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content || "{}";
      feedbackData = JSON.parse(responseText);
      feedbackData.source = "Groq (Llama 3)";

    } catch (groqError) {
      console.error("❌ Groq failed in feedbackController:", groqError.message);
      feedbackData = {
        whatWorked: ["Draft received successfully.", "The system is processing your text."],
        areasToImprove: ["Connectivity with AI service was briefly interrupted."],
        howToImprove: ["Please try again to get full pedagogical feedback based on Harmer's methodology."],
        source: "Fallback Error"
      };
    }

    const newSubmission = new Submission({
      assignmentId,
      studentName: studentName || 'Anonymous Student',
      textContent: draft,
      feedbackIA: feedbackData,
      version: version || 1,
      status: 'Pending'
    });

    await newSubmission.save();

    res.json({ success: true, feedback: feedbackData, submissionId: newSubmission._id });

  } catch (error) {
    console.error("FEEDBACK ERROR:", error.message);
    res.status(500).json({ error: "Error processing feedback request." });
  }
};
