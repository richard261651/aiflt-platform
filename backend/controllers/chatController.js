const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenAI } = require('@google/genai');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'MISSING_KEY',
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
});

exports.handleChat = async (req, res) => {
  try {
    const { messages, currentDraft, assignment } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const systemPrompt = `
You are an English writing assistant for language learners. 
Your role is to GUIDE, not to write for the student.

RULES:
- Never write sentences or paragraphs for the student.
- Never correct their text directly. Instead, ask guiding questions 
  or explain the rule so they can fix it themselves.
- Always be encouraging, clear, and concise.
- Base all feedback on Jeremy Harmer's FLT principles:
  1. Balanced: mention what is working before what needs improvement
  2. Clear: reference specific parts of their text
  3. Actionable: give a concrete suggestion or question
  4. Non-prescriptive: suggest options, never one single answer

WHAT YOU CAN DO:
- Explain text structures (formal letter, essay, email, etc.)
- Answer questions like "How do I start a formal letter?"
- Give feedback on a specific paragraph when asked
- Explain grammar rules with examples
- Encourage the student to keep writing and revising

WHAT YOU CANNOT DO:
- Write any part of the student's text
- Give the student a model answer
- Tell them word-for-word what to write

CONTEXT:
The student is currently writing:
"""
${currentDraft || '(Empty)'}
"""

The assignment is:
Title: ${assignment?.title || 'Unknown'}
Briefing: ${assignment?.briefing || 'Unknown'}
Criteria: ${assignment?.criteria || 'Unknown'}

Always respond in the same language the student uses to ask.
    `;

    // Process messages for Anthropic (only role and content are allowed)
    // We assume the frontend sends { role: 'user' | 'assistant', content: string }
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let replyText = '';

    try {
      // 1. Try Claude first
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'MISSING_KEY' || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error("Missing Anthropic API Key");
      }
      
      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 800,
        temperature: 0.3,
        system: systemPrompt,
        messages: formattedMessages
      });
      replyText = msg.content[0].text;

    } catch (claudeError) {
      console.warn("⚠️ Claude failed or key missing. Attempting Gemini Flash fallback.", claudeError.message);
      
      try {
        // 2. Try Gemini Flash
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
          throw new Error("Missing Gemini API Key");
        }

        // Format for Gemini (Convert system prompt + history into a single string for simplicity in basic chat, or use systemInstruction)
        const geminiHistory = formattedMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        const fullPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${geminiHistory}\n\nASSISTANT:`;

        const response = await gemini.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
        });
        
        replyText = response.text;

      } catch (geminiError) {
        console.warn("⚠️ Gemini fallback failed. Using mock chat response.", geminiError.message);
        
        // 3. Fallback to Mock
        const lastMsg = formattedMessages[formattedMessages.length - 1].content.toLowerCase();
        replyText = "I'm your AI assistant! How can I help you with your draft?";
        
        if (lastMsg.includes("structure") || lastMsg.includes("formal")) {
          replyText = "For a formal structure, start with a clear greeting like 'Dear Mr. Smith,', state your purpose in the first paragraph, provide details in the second, and end with a formal closing like 'Sincerely,'.";
        } else if (lastMsg.includes("feedback") || lastMsg.includes("paragraph") || lastMsg.includes("harmer")) {
          if (currentDraft && currentDraft.length > 20) {
            replyText = "Looking at your draft, you have a good start! What worked: Your structure is clear. Areas to improve: Consider making your vocabulary slightly more formal. How to improve: What synonyms could you use for the words you chose?";
          } else {
            replyText = "You haven't written much yet! Try writing your first sentence and I'll help you review it.";
          }
        } else if (lastMsg.includes("greeting")) {
           replyText = "Formal greetings usually use 'Dear' followed by the person's title and last name. If you don't know the name, 'To Whom It May Concern' is acceptable.";
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      }
    }

    res.json({ reply: replyText });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Error processing chat request." });
  }
};
