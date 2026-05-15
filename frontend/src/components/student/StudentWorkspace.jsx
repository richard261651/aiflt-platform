import React, { useState, useEffect } from 'react';
import { 
  Send, 
  History, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Clock,
  MessageCircle,
  PenTool
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://aiflt-backend.onrender.com/api';

const StudentWorkspace = () => {
  const [view, setView] = useState('list'); // 'list' | 'workspace'
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${API_URL}/assignments`);
        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (view === 'workspace') {
    return <AssignmentWorkspace assignment={activeAssignment} onBack={() => setView('list')} />;
  }

  if (view === 'submissions') {
    return <StudentSubmissionsView onBack={() => setView('list')} />;
  }

  return (
    <div className="student-dashboard animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Assignments</h1>
          <p style={{ color: 'var(--text-dim)' }}>Access your writing tasks and track AI feedback</p>
        </div>
        <button 
          onClick={() => setView('submissions')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <History size={18} /> My Submissions
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {assignments.map(assignment => (
          <div key={assignment.id} className="glass glass-hover" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{assignment.folder}</span>
              <span className={`badge ${assignment.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{assignment.status}</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{assignment.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {assignment.briefing}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Deadline: {assignment.deadline}</span>
              <button 
                onClick={() => {
                  setActiveAssignment(assignment);
                  setView('workspace');
                }}
                className="btn btn-primary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Access Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentWorkspace = ({ assignment, onBack }) => {
  const [draft, setDraft] = useState('');
  const [version, setVersion] = useState(1);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI writing coach. How can I help you with this assignment today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextVersion, setNextVersion] = useState(1);

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  const handleSendMessage = async (overrideMessage = null) => {
    const msgToSend = overrideMessage || currentMessage;
    if (!msgToSend.trim()) return;
    
    const newUserMessage = { role: 'user', content: msgToSend };
    const newHistory = [...chatHistory, newUserMessage];
    
    setChatHistory(newHistory);
    setCurrentMessage('');
    setIsChatLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          currentDraft: draft,
          assignment: assignment
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setChatHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Error generating chat response:", error);
      setChatHistory([...newHistory, { role: 'assistant', content: "I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenSubmitModal = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/submissions/next-version/${assignment._id}/${user.name}`);
      const data = await response.json();
      setNextVersion(data.nextVersion);
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error fetching version:", error);
      setShowSubmitModal(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          assignmentId: assignment._id,
          studentName: user.name,
          version: nextVersion
        })
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      alert(`Your draft has been submitted as Draft ${nextVersion}. Your teacher will review it soon.`);
      setShowSubmitModal(false);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="workspace-container animate-fade" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '1.5rem', height: 'calc(100vh - 100px)' }}>
      
      {/* Submit Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Confirm Submission</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              You are about to submit <strong>Draft {nextVersion}</strong> of "{assignment.title}".
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="btn btn-primary" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Left: Briefing */}
      <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back
        </button>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} color="var(--accent-primary)" /> Briefing
        </h3>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Task:</p>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{assignment.briefing}</p>
          
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Context:</p>
          <ul style={{ color: 'var(--text-dim)', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
            <li>Recipient: Your English Teacher</li>
            <li>Purpose: Request 3 more days</li>
            <li>Words: 80-120</li>
            <li>Register: Formal</li>
          </ul>

          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Evaluation Criteria:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Coherence', 'Grammar', 'Register', 'Vocabulary'].map(item => (
              <div key={item} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Editor */}
      <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PenTool size={18} color="var(--accent-primary)" /> My Draft
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={12} /> Draft {version}
            </div>
            <button 
              onClick={handleOpenSubmitModal}
              disabled={!draft.trim() || isSubmitting}
              className="btn btn-primary"
              style={{ background: 'var(--success)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: 'none' }}
            >
              <CheckCircle2 size={16} /> Submit Final Draft
            </button>
          </div>
        </div>
        <textarea 
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            alert("Pasting is disabled for this assignment. Please type your text manually.");
          }}
          onDrop={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          placeholder="Start writing your draft here..."
          style={{ flex: 1, background: 'transparent', border: 'none', resize: 'none', padding: '0', fontSize: '1.05rem', lineHeight: '1.7' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            Words: <strong style={{ color: 'var(--text-light)' }}>{wordCount}</strong>
          </span>
          <button 
            onClick={() => handleSendMessage("Can you give me full Harmer feedback on this entire draft?")}
            disabled={isChatLoading || !draft.trim()}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Send size={16} /> Send to AI
          </button>
        </div>
      </div>

      {/* Right: AI Support Chatbot */}
      <div className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <MessageCircle size={18} color="var(--accent-secondary)" /> AI Writing Coach
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem', marginBottom: 0 }}>
            Ask pedagogical questions based on your draft.
          </p>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className="animate-fade"
              style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.content}</p>
            </div>
          ))}
          {isChatLoading && (
            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-subtle)' }}>
              <Clock size={16} className="animate-spin" color="var(--text-dim)" />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g., How should I start a formal letter?"
              style={{ 
                flex: 1, 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '8px',
                padding: '0.8rem',
                color: 'var(--text-light)',
                fontSize: '0.9rem'
              }}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isChatLoading || !currentMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '0 1rem' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentSubmissionsView = ({ onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/submissions/student/${user.name}`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch my submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySubmissions();
  }, []);

  if (selectedSub) {
    return (
      <div className="animate-fade">
        <button onClick={() => setSelectedSub(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>← Back to Submissions</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>My Text (Draft {selectedSub.version || 1})</h3>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', minHeight: '300px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {selectedSub.textContent}
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Teacher Feedback</h3>
              <div className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                <Sparkles size={12} /> Feedback dado por docente en colaboración con AI
              </div>
            </div>
            
            {selectedSub.finalGrade && (
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--accent-primary)', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Final Grade:</strong> {selectedSub.finalGrade}
              </div>
            )}

            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.5', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px' }}>
              {selectedSub.finalFeedback || "Your teacher hasn't released the final feedback yet."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>← Back to Assignments</button>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>My Submissions</h2>
      
      <div className="glass" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><Clock size={24} className="animate-spin" /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Draft Version</th>
                <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Date Submitted</th>
                <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} className="glass-hover">
                  <td style={{ padding: '1rem', fontWeight: '600' }}>Draft {sub.version || 1}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${sub.status === 'Sent' ? 'badge-success' : 'badge-warning'}`}>
                      {sub.status === 'Sent' ? '✓ Feedback Released' : '○ Pending Teacher Review'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedSub(sub)} 
                      disabled={sub.status !== 'Sent'}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      View Feedback
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>You haven't submitted anything yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentWorkspace;
