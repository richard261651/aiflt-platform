import React, { useState, useEffect } from 'react';
import { 
  Send, 
  History, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  return (
    <div className="student-dashboard animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Assignments</h1>
        <p style={{ color: 'var(--text-dim)' }}>Access your writing tasks and track AI feedback</p>
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
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [version, setVersion] = useState(1);

  const handleSendToAI = async () => {
    if (!draft.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          assignmentId: assignment._id || assignment.id, // Support both mongo _id and local id for smooth transition
          studentName: 'Student Ana' // Mock logged in user
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const result = data.feedback;
      
      setFeedback({
        ok: result.whatWorked[0] || "Good start.",
        warn: result.areasToImprove[0] || "Needs some work.",
        tips: result.howToImprove || ["Review your structure."],
        source: result.source
      });
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback({
        ok: "Draft submitted.",
        warn: "Could not generate AI feedback due to an error.",
        tips: ["Please try again later or ask your professor."]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="workspace-container animate-fade" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '1.5rem', height: 'calc(100vh - 100px)' }}>
      
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
          <div className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={12} /> Version {version}
          </div>
        </div>
        <textarea 
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Start writing your draft here..."
          style={{ flex: 1, background: 'transparent', border: 'none', resize: 'none', padding: '0', fontSize: '1.05rem', lineHeight: '1.7' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            onClick={handleSendToAI}
            disabled={isAnalyzing || !draft.trim()}
            className="btn btn-primary"
            style={{ padding: '0.8rem 2rem' }}
          >
            {isAnalyzing ? <><Clock className="animate-spin" size={18} /> Analyzing...</> : <><Send size={18} /> Send to AI</>}
          </button>
        </div>
      </div>

      {/* Right: Feedback */}
      <div className="glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-secondary)" /> AI Feedback
          </div>
          {feedback?.source && (
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-dim)' }}>
              {feedback.source}
            </span>
          )}
        </h3>

        {!feedback && !isAnalyzing && (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-dim)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Sparkles size={30} opacity={0.3} />
            </div>
            <p style={{ fontSize: '0.9rem' }}>Send your draft to receive Harmer-based feedback</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
            <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
            <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
          </div>
        )}

        {feedback && !isAnalyzing && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', borderLeft: '3px solid var(--success)' }}>
              <h4 style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} /> What worked
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{feedback.ok}</p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', borderLeft: '3px solid var(--warning)' }}>
              <h4 style={{ color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={14} /> Areas to improve
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{feedback.warn}</p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', borderLeft: '3px solid var(--accent-secondary)' }}>
              <h4 style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lightbulb size={14} /> How to improve
              </h4>
              <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                {feedback.tips.map((tip, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{tip}</li>)}
              </ul>
            </div>

            <button 
              onClick={() => {
                setVersion(v => v + 1);
                setFeedback(null);
              }}
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Re-evaluate version {version + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWorkspace;
