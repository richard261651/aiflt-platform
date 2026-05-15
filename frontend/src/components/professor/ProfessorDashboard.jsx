import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  MoreVertical, 
  Search, 
  Eye, 
  CheckCircle, 
  Clock,
  Settings,
  Sparkles,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'https://aiflt-backend.onrender.com/api';

const ProfessorDashboard = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'submissions'
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [folders, setFolders] = useState([
    { id: 'f1', name: 'B2 Writing Tasks', assignments: 12 },
    { id: 'f2', name: 'C1 Essays', assignments: 8 }
  ]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

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

  const handleCreateAssignment = () => {
    setView('create');
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setView('submissions');
  };

  if (view === 'submissions') {
    return <SubmissionsView assignment={selectedAssignment} onBack={() => setView('list')} />;
  }

  return (
    <div className="professor-dashboard animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DASHBOARD</h1>
          <p style={{ color: 'var(--text-dim)', fontWeight: '700' }}>Manage folders and writing assignments</p>
        </div>
        <button onClick={handleCreateAssignment} className="btn btn-primary">
          <FilePlus size={18} /> NEW ASSIGNMENT
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* Left: Folders */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem' }}>FOLDERS</h3>
            <button className="btn btn-secondary" style={{ padding: '0.3rem', border: 'none', boxShadow: 'none' }}><FolderPlus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {folders.map(folder => (
              <button 
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className="btn btn-secondary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'space-between',
                  background: activeFolderId === folder.id ? 'var(--accent-primary)' : 'transparent',
                  border: activeFolderId === folder.id ? '3px solid var(--border-main)' : 'none',
                  boxShadow: 'none'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ChevronRight size={14} /> {folder.name}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{folder.assignments}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Assignments List */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Search assignments..." 
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><ArrowUp size={16} /></button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><ArrowDown size={16} /></button>
            </div>
          </div>

          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '700' }}>
                  <th style={{ padding: '0.5rem 1rem' }}>TITLE</th>
                  <th style={{ padding: '0.5rem 1rem' }}>FOLDER</th>
                  <th style={{ padding: '0.5rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.5rem 1rem' }}>SUBMISSIONS</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id} className="glass" style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{assignment.title}</td>
                    <td style={{ padding: '1rem' }}>{assignment.folder}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${assignment.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #000' }}>
                          <div style={{ width: '65%', height: '100%', background: 'var(--accent-primary)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>14/22</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleViewSubmissions(assignment)} className="btn btn-secondary" style={{ padding: '0.4rem' }}><Eye size={16} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><Edit2 size={16} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmissionsView = ({ assignment, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [finalGrade, setFinalGrade] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${API_URL}/submissions/assignment/${assignment._id}`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };
    fetchSubmissions();
  }, [assignment]);

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    setFinalGrade(sub.finalGrade || '');
    setFinalFeedback(sub.finalFeedback || sub.feedbackIA?.howToImprove?.join('\n') || '');
    setIsEditing(false);
  };

  const handleSaveFeedback = async () => {
    try {
      const response = await fetch(`${API_URL}/submissions/${selectedSubmission._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          finalGrade,
          finalFeedback,
          status: 'Sent'
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setSubmissions(submissions.map(s => s._id === updated._id ? updated : s));
        setSelectedSubmission(updated);
        setIsEditing(false);
        alert("Feedback saved and sent to student.");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  };

  const handleDownload = (sub) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Writing Submission Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Student: ${sub.studentName}`, 20, 35);
    doc.text(`Assignment: ${assignment.title}`, 20, 42);
    doc.text(`Date: ${new Date(sub.createdAt).toLocaleDateString()}`, 20, 49);
    
    doc.line(20, 55, 190, 55);
    
    doc.setFontSize(14);
    doc.text("Student Text:", 20, 65);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(sub.textContent, 170);
    doc.text(splitText, 20, 72);
    
    const yAfterText = 72 + (splitText.length * 5) + 10;
    
    doc.setFontSize(14);
    doc.text("Professor Feedback:", 20, yAfterText);
    doc.setFontSize(10);
    doc.text(`Grade: ${sub.finalGrade || 'Pending'}`, 20, yAfterText + 7);
    const splitFeedback = doc.splitTextToSize(sub.finalFeedback || "No feedback provided yet.", 170);
    doc.text(splitFeedback, 20, yAfterText + 14);
    
    doc.save(`${sub.studentName}_submission.pdf`);
  };

  if (selectedSubmission) {
    return (
      <div className="animate-fade">
        <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>← BACK TO LIST</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{selectedSubmission.studentName}'S DRAFT</h3>
            <div style={{ background: '#fff', padding: '1.5rem', border: '2px solid var(--border-main)', borderRadius: '8px', minHeight: '400px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {selectedSubmission.textContent}
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>AI + TEACHER FEEDBACK</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Settings size={14} /> {isEditing ? 'CANCEL EDIT' : 'EDIT FEEDBACK'}
              </button>
            </div>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Final Grade / Note</label>
                  <input 
                    type="text"
                    value={finalGrade}
                    onChange={(e) => setFinalGrade(e.target.value)}
                    placeholder="e.g. 8.5/10 or Excellent"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Detailed Feedback</label>
                  <textarea
                    value={finalFeedback}
                    onChange={(e) => setFinalFeedback(e.target.value)}
                    style={{ minHeight: '200px' }}
                  />
                </div>
                <button onClick={handleSaveFeedback} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>SAVE & RELEASE TO STUDENT</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedSubmission.finalGrade && (
                  <div style={{ background: 'var(--accent-primary)', padding: '1rem', border: '3px solid var(--border-main)', borderRadius: '8px', fontWeight: '700' }}>
                    FINAL GRADE: {selectedSubmission.finalGrade}
                  </div>
                )}
                <div style={{ background: '#f9fbfd', padding: '1.5rem', border: '2px solid var(--border-main)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.finalFeedback || "No professor feedback yet. Click Edit to add your final comments."}
                </div>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', border: '2px dashed var(--border-main)', borderRadius: '8px' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.6 }}>ORIGINAL AI SUGGESTIONS:</p>
                  <ul style={{ fontSize: '0.8rem', paddingLeft: '1rem' }}>
                    {selectedSubmission.feedbackIA?.howToImprove?.map((tip, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{tip}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-view animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1rem', border: 'none', boxShadow: 'none' }}>← BACK</button>
          <h1 style={{ fontSize: '2rem' }}>SUBMISSIONS: {assignment.title}</h1>
        </div>
      </header>

      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-main)', borderBottom: '3px solid var(--border-main)' }}>
            <tr style={{ textAlign: 'left', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem' }}>STUDENT</th>
              <th style={{ padding: '1rem' }}>VERSION</th>
              <th style={{ padding: '1rem' }}>SUBMITTED AT</th>
              <th style={{ padding: '1rem' }}>STATUS</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '1rem', fontWeight: '700' }}>{sub.studentName}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-warning">Draft {sub.version || 1}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${sub.status === 'Sent' ? 'badge-success' : 'badge-warning'}`}>
                    {sub.status === 'Sent' ? 'SENT' : 'PENDING'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleDownload(sub)} className="btn btn-secondary" style={{ padding: '0.5rem', border: 'none', boxShadow: 'none' }} title="Download PDF"><Download size={16} /></button>
                    <button onClick={() => handleSelectSubmission(sub)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>REVIEW</button>
                  </div>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
