import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Feedback Engine based on Jeremy Harmer's principles.
 * Focuses on Clarity, Actionability, Balance, and Non-prescriptiveness.
 */

// Initialize the client. In a real frontend app, this is dangerous if exposed to the public.
// We use dangerouslyAllowBrowser for this local prototype.
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || 'MISSING_KEY',
  dangerouslyAllowBrowser: true 
});

export const generateSystemPrompt = (assignmentData) => {
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

export const generateHarmerFeedback = async (studentText, assignmentData) => {
  const systemPrompt = generateSystemPrompt(assignmentData);

  try {
    // Check if API key looks obviously missing/invalid before making the request
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error("Missing or placeholder Anthropic API Key.");
    }

    // REAL CLAUDE API CALL
    console.log("Calling Claude API...");
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Using Haiku for speed/cost in prototyping
      max_tokens: 1000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the student's draft. Please evaluate it and return the JSON feedback.\n\nDRAFT:\n${studentText}`
        }
      ]
    });

    const responseText = msg.content[0].text;
    console.log("Claude Response Received.");
    
    // Attempt to parse the JSON. 
    // Claude usually respects the JSON-only prompt, but we strip potential markdown blocks just in case.
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    
    return {
      whatWorked: parsedData.whatWorked || ["Feedback generated successfully."],
      areasToImprove: parsedData.areasToImprove || ["Some areas noted by Claude."],
      howToImprove: parsedData.howToImprove || ["Suggestions provided."],
      metadata: { source: 'Claude AI', generatedAt: new Date().toISOString() }
    };

  } catch (error) {
    // FALLBACK TO MOCK
    console.warn("⚠️ Claude API Error or Missing Key. Falling back to Mock Feedback.", error.message);
    
    // Simulate a brief delay to match the API feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
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
      metadata: { source: 'Mock Fallback', generatedAt: new Date().toISOString() }
    };
  }
};
