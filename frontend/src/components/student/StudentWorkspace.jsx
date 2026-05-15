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

const StudentWorkspace = ({ studentName }) => {
  const [view, setView] = useState('list'); // 'list' | 'workspace' | 'submissions'
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
    return <AssignmentWorkspace assignment={activeAssignment} studentName={studentName} onBack={() => setView('list')} />;
  }

  if (view === 'submissions') {
    return <StudentSubmissionsView studentName={studentName} onBack={() => setView('list')} />;
  }

  return (
    <div className="student-dashboard animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>MY ASSIGNMENTS</h1>
          <p style={{ color: 'var(--text-dim)', fontWeight: '700' }}>ACCESS YOUR WRITING TASKS AND TRACK AI FEEDBACK</p>
        </div>
        <button 
          onClick={() => setView('submissions')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <History size={18} /> SUBMISSIONS HISTORY
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {assignments.map(assignment => (
          <div key={assignment.id} className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#000', fontWeight: '800', background: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '2px solid #000' }}>{assignment.folder}</span>
              <span className={`badge ${assignment.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{assignment.status}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{assignment.title}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
              {assignment.briefing}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid var(--bg-main)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>DUE: {assignment.deadline}</span>
              <button 
                onClick={() => {
                  setActiveAssignment(assignment);
                  setView('workspace');
                }}
                className="btn btn-primary"
              >
                ACCESS TASK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentWorkspace = ({ assignment, studentName, onBack }) => {
  const [draft, setDraft] = useState('');
  const [version, setVersion] = useState(1);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI writing coach. How can I help you with this assignment today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextVersion, setNextVersion] = useState(1);

  useEffect(() => {
    const getNextVersion = async () => {
      try {
        const response = await fetch(`${API_URL}/submissions/next-version/${assignment._id}/${studentName}`);
        if (response.ok) {
          const data = await response.json();
          setNextVersion(data.nextVersion);
          setVersion(data.nextVersion);
        }
      } catch (error) {
        console.error("Error fetching version:", error);
      }
    };
    getNextVersion();
  }, [assignment, studentName]);

  const handleSendMessage = async (text) => {
    const messageToSend = text || currentMessage;
    if (!messageToSend.trim()) return;

    const newUserMessage = { role: 'user', content: messageToSend };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setCurrentMessage('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          currentDraft: draft,
          assignment: assignment
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
      } else {
        const errorData = await response.json();
        setChatHistory([...updatedHistory, { role: 'assistant', content: `⚠️ Error: ${errorData.error || 'Failed to reach AI coach.'}` }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory([...updatedHistory, { role: 'assistant', content: "⚠️ Network error: Could not reach the server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleOpenSubmitModal = async () => {
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          assignmentId: assignment._id,
          studentName: studentName,
          version: nextVersion
        })
      });

      if (response.ok) {
        setShowSubmitModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error submitting your draft.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <div className="workspace-container animate-fade" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass animate-fade" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(72, 187, 120, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
                <CheckCircle2 size={48} />
              </div>
            </div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem', color: 'var(--success)' }}>CONGRATULATIONS!</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>
              Your draft has been submitted successfully. Your teacher and the AI coach will review your work soon.
            </p>
            <button onClick={() => { setShowSuccessModal(false); onBack(); }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              BACK TO DASHBOARD
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>SUBMIT DRAFT</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              You are about to submit <strong>Draft {nextVersion}</strong> of "{assignment.title}".
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>CANCEL</button>
              <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'SENDING...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Left: Briefing */}
      <div className="glass" style={{ padding: '2rem', overflowY: 'auto' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0, textTransform: 'none', fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>← BACK</button>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} /> BRIEFING
        </h3>
        <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          <p style={{ fontWeight: '800', marginBottom: '0.5rem' }}>TASK:</p>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>{assignment.briefing}</p>
          
          <p style={{ fontWeight: '800', marginBottom: '0.5rem' }}>CRITERIA:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['COHERENCE', 'GRAMMAR', 'REGISTER', 'VOCABULARY'].map(item => (
              <div key={item} style={{ fontSize: '0.8rem', padding: '0.75rem', background: '#fff', border: '2px solid var(--border-main)', borderRadius: '4px', fontWeight: '700' }}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Editor */}
      <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PenTool size={20} /> MY DRAFT
          </h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="badge badge-warning">DRAFT {version}</span>
            <button 
              onClick={handleOpenSubmitModal}
              disabled={!draft.trim() || isSubmitting}
              className="btn btn-primary"
              style={{ background: '#48bb78', padding: '0.6rem 1.2rem' }}
            >
              SUBMIT FINAL
            </button>
          </div>
        </div>
        <textarea 
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Start writing your draft here..."
          style={{ flex: 1, background: '#fff', border: '3px solid var(--border-main)', borderRadius: '4px', padding: '1.5rem', fontSize: '1.1rem', lineHeight: '1.7', resize: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: '700' }}>
            WORDS: {wordCount}
          </span>
          <button 
            onClick={() => handleSendMessage("Can you give me full Harmer feedback on this entire draft?")}
            disabled={isChatLoading || !draft.trim()}
            className="btn btn-primary"
          >
            <Send size={18} /> GET AI FEEDBACK
          </button>
        </div>
      </div>

      {/* Right: AI Chat */}
      <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={20} /> AI COACH
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble-${msg.role}`} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {msg.content}
            </div>
          ))}
          {isChatLoading && <div className="chat-bubble chat-bubble-ai">AI is thinking...</div>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your coach..."
            style={{ borderRadius: '8px' }}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={isChatLoading || !currentMessage.trim()}
            className="btn btn-primary"
            style={{ padding: '0 1rem' }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentSubmissionsView = ({ studentName, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const response = await fetch(`${API_URL}/submissions/student/${studentName}`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySubmissions();
  }, [studentName]);

  if (selectedSub) {
    return (
      <div className="animate-fade">
        <button onClick={() => setSelectedSub(null)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>← BACK TO HISTORY</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>YOUR TEXT</h3>
            <div style={{ background: '#fff', padding: '1.5rem', border: '3px solid var(--border-main)', borderRadius: '8px', minHeight: '400px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {selectedSub.textContent}
            </div>
          </div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>TEACHER FEEDBACK</h3>
            {selectedSub.status === 'Sent' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'var(--accent-primary)', padding: '1rem', border: '3px solid var(--border-main)', borderRadius: '8px', fontWeight: '800', textAlign: 'center' }}>
                  FINAL GRADE: {selectedSub.finalGrade}
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', border: '3px solid var(--border-main)', borderRadius: '8px', lineHeight: '1.6' }}>
                  {selectedSub.finalFeedback}
                </div>
                <div style={{ padding: '1rem', background: '#f0f4f8', borderRadius: '8px', border: '2px dashed var(--border-main)', fontSize: '0.85rem', textAlign: 'center', fontWeight: '700' }}>
                   FEEDBACK DADO POR DOCENTE EN COLABORACIÓN CON AI 
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-dim)' }}>
                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Your teacher is still reviewing this draft.</p>
                <p style={{ fontSize: '0.85rem' }}>Check back later!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-history animate-fade">
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>← BACK TO DASHBOARD</button>
      <h1 style={{ marginBottom: '2rem' }}>MY SUBMISSIONS HISTORY</h1>
      
      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-sidebar)', borderBottom: '3px solid var(--border-main)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '1.5rem' }}>ASSIGNMENT</th>
              <th style={{ padding: '1.5rem' }}>VERSION</th>
              <th style={{ padding: '1.5rem' }}>SUBMITTED ON</th>
              <th style={{ padding: '1.5rem' }}>STATUS</th>
              <th style={{ padding: '1.5rem', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '1.5rem', fontWeight: '700' }}>{sub.assignmentId?.title || 'Unknown Assignment'}</td>
                <td style={{ padding: '1.5rem' }}>
                   <span className="badge badge-warning">Draft {sub.version}</span>
                </td>
                <td style={{ padding: '1.5rem', fontSize: '0.9rem' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span className={`badge ${sub.status === 'Sent' ? 'badge-success' : 'badge-warning'}`}>
                    {sub.status === 'Sent' ? 'REVIEWED' : 'PENDING'}
                  </span>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <button onClick={() => setSelectedSub(sub)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>VIEW FEEDBACK</button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>You haven't submitted any drafts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentWorkspace;
