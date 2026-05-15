const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'MISSING_KEY',
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

    // Check for missing key (Fallback mode)
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'MISSING_KEY' || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn("⚠️ Claude API Key missing. Using mock chat response.");
      
      // Basic mock logic based on the last user message
      const lastMsg = formattedMessages[formattedMessages.length - 1].content.toLowerCase();
      let mockReply = "I'm your AI assistant! How can I help you with your draft?";
      
      if (lastMsg.includes("structure") || lastMsg.includes("formal")) {
        mockReply = "For a formal structure, start with a clear greeting like 'Dear Mr. Smith,', state your purpose in the first paragraph, provide details in the second, and end with a formal closing like 'Sincerely,'.";
      } else if (lastMsg.includes("feedback") || lastMsg.includes("paragraph")) {
        if (currentDraft && currentDraft.length > 20) {
          mockReply = "Looking at your draft, you have a good start! Consider making your vocabulary slightly more formal. What synonyms could you use for the words you chose?";
        } else {
          mockReply = "You haven't written much yet! Try writing your first sentence and I'll help you review it.";
        }
      } else if (lastMsg.includes("greeting")) {
         mockReply = "Formal greetings usually use 'Dear' followed by the person's title and last name. If you don't know the name, 'To Whom It May Concern' is acceptable.";
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.json({ reply: mockReply });
    }

    // Call actual Claude API
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 800,
      temperature: 0.3,
      system: systemPrompt,
      messages: formattedMessages
    });

    res.json({ reply: msg.content[0].text });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Error processing chat request." });
  }
};
