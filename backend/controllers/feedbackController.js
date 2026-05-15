const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'MISSING_KEY',
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
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

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const systemPrompt = generateSystemPrompt(assignment);
    let feedbackData = null;

    try {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'MISSING_KEY' || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error("Missing Anthropic API Key");
      }

      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: `Student's Draft:\n"""\n${draft}\n"""` }]
      });

      const responseText = msg.content[0].text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        feedbackData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        feedbackData.source = "Claude 3";
      } else {
        feedbackData = JSON.parse(responseText);
        feedbackData.source = "Claude 3";
      }

    } catch (claudeError) {
      console.warn("⚠️ Claude failed in feedbackController. Attempting Gemini Flash.", claudeError.message);
      
      try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
          throw new Error("Missing Gemini API Key");
        }

        const fullPrompt = `${systemPrompt}\n\nStudent's Draft:\n"""\n${draft}\n"""`;

        const response = await gemini.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
        });
        
        const responseText = response.text;
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          feedbackData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          feedbackData.source = "Gemini Flash";
        } else {
          feedbackData = JSON.parse(responseText);
          feedbackData.source = "Gemini Flash";
        }

      } catch (geminiError) {
        console.warn("⚠️ Gemini fallback failed. Attempting Groq.", geminiError.message);
        
        try {
          if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'MISSING_KEY') {
            throw new Error("Missing Groq API Key");
          }

          const fullPrompt = `${systemPrompt}\n\nStudent's Draft:\n"""\n${draft}\n"""`;

          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            model: "llama3-8b-8192",
            temperature: 0.2,
            max_tokens: 1000,
          });

          const responseText = chatCompletion.choices[0]?.message?.content || "";
          const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
          
          if (jsonMatch) {
            feedbackData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            feedbackData.source = "Groq Llama 3";
          } else {
            feedbackData = JSON.parse(responseText);
            feedbackData.source = "Groq Llama 3";
          }
        } catch (groqError) {
          console.error("⚠️ Groq fallback failed.", groqError.message);
          throw new Error("All AI services failed.");
        }
      }
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
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Server error generating feedback" });
  }
};
