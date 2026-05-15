// Initial mock data for the AI FLT Platform

export const INITIAL_DATA = {
  folders: ['Mis Proyectos', 'Unit 1 - Basics', 'Unit 3 - Writing', 'Final Exams'],
  assignments: [
    { 
      id: 'email-001', 
      title: 'Email formal', 
      folder: 'Unit 3 - Writing', 
      status: 'Active', 
      submissionsCount: 15, 
      pendingCount: 5,
      briefing: 'Write a formal email to your professor requesting a 3-day extension for the essay assignment.',
      criteria: '- Coherence: Clear structure\n- Grammar: Formal verb tenses\n- Register: No colloquialisms\n- Vocab: Professional terms',
      feedbackStyle: 'Specific, encouraging, with concrete examples.',
      deadline: 'May 15'
    },
    { 
      id: 'narrative-001', 
      title: 'Narrative paragraph', 
      folder: 'Unit 3 - Writing', 
      status: 'Closed', 
      submissionsCount: 20, 
      pendingCount: 0,
      briefing: 'Write a narrative paragraph about a memorable childhood experience.',
      criteria: '- Chronology: Use sequence markers\n- Grammar: Past tenses\n- Description: Vivid adjectives',
      feedbackStyle: 'Creative and constructive.',
      deadline: 'May 20'
    }
  ],
  submissions: [
    {
      id: 'sub-ana-001',
      studentId: 'ana-456',
      assignmentId: 'email-001',
      studentName: 'Ana Garcia',
      version: 1,
      textContent: "Dear Mr. Johnson, I am writing to request an extension for the essay assignment. I have been very busy lately and I need more time.",
      status: 'Reviewed',
      feedbackIA: {
        whatWorked: ["Excellent formal greeting."],
        areasToImprove: ["'Very busy' is too informal."],
        howToImprove: ["Use 'unforeseen circumstances'."]
      },
      timestamp: '2 hours ago'
    }
  ]
};
