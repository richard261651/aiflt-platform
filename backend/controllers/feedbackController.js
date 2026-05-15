const Anthropic = require('@anthropic-ai/sdk');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'MISSING_KEY',
});

const generateSystemPrompt = (assignmentData) => {
  return `
    SYSTEM ROLE: You are an expert English Writing Coach specializing in the Harmer Feedback methodology.
    
    CRITERIA TO EVALUATE:
    ${assignmentData.criteria}
    
    FEEDBACK PRINCIPLES:
    1. CLARITY: Be specific. Reference parts of the student's text.
    2. ACTIONABLE: Don't just point out errors; suggest how to fix them.
    3. BALANCED: Start with positive reinforcements before areas of improvement.
    4. NON-PRESCRIPTIVE: Use phrases like "You might consider..." or "One way to improve this is..."
    
    ASSIGNMENT CONTEXT:
    ${assignmentData.briefing}
    
    STYLE: ${assignmentData.feedbackStyle || 'Supportive and professional'}

    IMPORTANT INSTRUCTION: 
    You MUST return your response ONLY as a valid JSON object. Do not include markdown formatting or extra text outside the JSON.
    Use this exact structure:
    {
      "whatWorked": ["Point 1", "Point 2"],
      "areasToImprove": ["Point 1", "Point 2"],
      "howToImprove": ["Point 1", "Point 2"]
    }
  `;
};

exports.generateFeedback = async (req, res) => {
  try {
    const { draft, assignmentId, studentName } = req.body;

    if (!draft || !assignmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Fetch Assignment to get criteria
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    let feedbackData;

    // 2. Call Claude API
    try {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error("Missing or placeholder Anthropic API Key.");
      }

      console.log("Calling Claude API...");
      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        temperature: 0.2,
        system: generateSystemPrompt(assignment),
        messages: [
          {
            role: "user",
            content: `Here is the student's draft. Please evaluate it and return the JSON feedback.\n\nDRAFT:\n${draft}`
          }
        ]
      });

      const responseText = msg.content[0].text;
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      feedbackData = {
        whatWorked: parsedData.whatWorked || ["Feedback generated successfully."],
        areasToImprove: parsedData.areasToImprove || ["Some areas noted by Claude."],
        howToImprove: parsedData.howToImprove || ["Suggestions provided."],
        source: 'Claude AI'
      };

    } catch (apiError) {
      console.warn("⚠️ Claude API Error or Missing Key. Falling back to Mock Feedback.", apiError.message);
      
      feedbackData = {
        whatWorked: [
          "[Mock] Your opening reflects a good understanding of the formal register required for this task.",
          "[Mock] The overall structure follows the 'opening-body-closing' pattern effectively."
        ],
        areasToImprove: [
          "[Mock] The transition between the second and third paragraph feels slightly abrupt. Consider using a linking phrase.",
          "[Mock] Some vocabulary choices like 'really bad' lean towards informal spoken English rather than formal written English."
        ],
        howToImprove: [
          "[Mock] Try using 'unfortunate circumstances' or 'regrettable situation' instead of 'really bad'.",
          "[Mock] Add a concluding sentence that summarizes your request specifically, e.g., 'I look forward to your positive response regarding this extension'."
        ],
        source: 'Mock Fallback'
      };
    }

    // 3. Save Submission to DB
    const newSubmission = new Submission({
      assignmentId,
      studentName: studentName || 'Anonymous Student',
      textContent: draft,
      feedbackIA: feedbackData
    });

    await newSubmission.save();

    res.json({ success: true, feedback: feedbackData, submissionId: newSubmission._id });

  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Server error generating feedback" });
  }
};
