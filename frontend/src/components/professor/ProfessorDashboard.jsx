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
  ArrowDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfessorDashboard = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'submissions'
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null); // Used for editing
  const [assignments, setAssignments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/folders`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
        if (data.length > 0 && !activeFolderId) setActiveFolderId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

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

  useEffect(() => {
    fetchFolders();
    fetchAssignments();
  }, []);

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder Name:");
    if (!name) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      fetchFolders();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFolder = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this folder?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/folders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (activeFolderId === id) setActiveFolderId(null);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleEditFolder = async (e, folder) => {
    e.stopPropagation();
    const newName = window.prompt("New folder name:", folder.name);
    if (!newName || newName === folder.name) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/folders/${folder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      fetchFolders();
    } catch (error) {
      console.error("Failed to edit folder:", error);
    }
  };

  const moveFolder = (index, direction) => {
    const newFolders = [...folders];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFolders.length) return;
    const temp = newFolders[index];
    newFolders[index] = newFolders[targetIndex];
    newFolders[targetIndex] = temp;
    setFolders(newFolders); // Visual only for now as requested
  };



  return (
    <div className="professor-dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Professor Panel</h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage assignments and review student feedback</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleCreateFolder} className="btn btn-secondary"><FolderPlus size={18} /> New Folder</button>
          <button onClick={() => { setActiveAssignment(null); setView('create'); }} className="btn btn-primary"><FilePlus size={18} /> Create Assignment</button>
        </div>
      </header>

      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          {/* Folders List */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Folders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {folders.map((folder, index) => (
                <div key={folder._id} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <button 
                    onClick={() => setActiveFolderId(folder._id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: activeFolderId === folder._id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      color: activeFolderId === folder._id ? 'var(--accent-primary)' : 'var(--text-main)',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {folder.name}
                  </button>
                  <button onClick={(e) => moveFolder(index, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}><ArrowUp size={14} /></button>
                  <button onClick={(e) => moveFolder(index, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}><ArrowDown size={14} /></button>
                  <button onClick={(e) => handleEditFolder(e, folder)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}><Edit2 size={14} /></button>
                  <button onClick={(e) => handleDeleteFolder(e, folder._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', padding: '0.2rem' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments Table */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{folders.find(f => f._id === activeFolderId)?.name || 'Assignments'}</h3>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  placeholder="Search assignments..." 
                  style={{ paddingLeft: '2.5rem', width: '250px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Assignment Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Submissions</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="glass-hover" style={{ transition: 'var(--transition)', borderRadius: '10px' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{assignment.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{assignment.type}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={14} color="var(--success)" /> {assignment.submissionsCount}
                          <Clock size={14} color="var(--warning)" style={{ marginLeft: '0.5rem' }} /> {assignment.pendingCount}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${assignment.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem' }} 
                            title="Edit Assignment"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', color: 'var(--accent-secondary)' }} 
                            title="Delete Assignment"
                            onClick={() => handleDelete(assignment._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setActiveAssignment(assignment); setView('submissions'); }}
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem' }}
                            title="View Submissions"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(view === 'create' || view === 'edit') && (
        <AssignmentForm 
          initialData={view === 'edit' ? activeAssignment : null}
          onCancel={() => {
            setView('list');
            setActiveAssignment(null);
          }} 
          onSuccess={() => {
            fetchAssignments();
            setView('list');
            setActiveAssignment(null);
          }} 
        />
      )}

      {view === 'submissions' && activeAssignment && (
        <SubmissionsView assignment={activeAssignment} onBack={() => { setView('list'); setActiveAssignment(null); }} />
      )}
    </div>
  );
};

const AssignmentForm = ({ onCancel, onSuccess, initialData }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    title: '',
    briefing: '',
    criteria: '',
    feedbackStyle: '',
    folder: 'Unit 3 - Writing'
  });

  const systemPrompt = formData.criteria ? `SYSTEM ROLE: You are an expert English Writing Coach...\nCRITERIA TO EVALUATE:\n${formData.criteria}\nCONTEXT:\n${formData.briefing}` : '';

  const handleCreateAssignment = async () => {
    setIsGenerating(true);
    try {
      const url = initialData ? `${API_URL}/assignments/${initialData._id}` : `${API_URL}/assignments`;
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass animate-fade" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Create New Assignment</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              width: '30px', 
              height: '4px', 
              borderRadius: '2px', 
              background: step >= s ? 'var(--accent-primary)' : 'var(--border-subtle)' 
            }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade">
          <div className="input-group">
            <label className="input-label">Assignment Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Email formal requesting extension" 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Briefing for Students</label>
            <textarea 
              rows="4" 
              value={formData.briefing}
              onChange={(e) => setFormData({...formData, briefing: e.target.value})}
              placeholder="Describe the task, context, and word limit..."
            ></textarea>
          </div>
          <button 
            disabled={!formData.title || !formData.briefing}
            onClick={() => setStep(2)} 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Next: Evaluation Criteria
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade">
          <div className="input-group">
            <label className="input-label">Evaluation Criteria</label>
            <textarea 
              rows="6" 
              value={formData.criteria}
              onChange={(e) => setFormData({...formData, criteria: e.target.value})}
              placeholder="- Coherence: Structure...&#10;- Grammar: Verb tenses...&#10;- Register: Formal..."
            ></textarea>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              Tip: You can also upload a PDF/TXT with your notes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
            <button 
              disabled={!formData.criteria}
              onClick={() => setStep(3)} 
              className="btn btn-primary" 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Next: AI Style
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade">
          <div className="input-group">
            <label className="input-label">AI Feedback Style & Examples</label>
            <textarea 
              rows="3" 
              value={formData.feedbackStyle}
              onChange={(e) => setFormData({...formData, feedbackStyle: e.target.value})}
              placeholder="Describe how you like to give feedback..."
            ></textarea>
          </div>
          
          {/* System Prompt Preview */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} color="var(--accent-secondary)" /> Generated System Prompt Preview
            </label>
            <div className="glass" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', border: '1px dashed var(--border-subtle)' }}>
              {systemPrompt || 'Complete previous steps to generate the prompt...'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
            <button 
              onClick={handleCreateAssignment} 
              className="btn btn-primary" 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {isGenerating ? <><Clock size={18} className="animate-spin" /> Saving...</> : <><Sparkles size={18} /> {initialData ? 'Save Changes' : 'Create Assignment'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubmissionsView = ({ assignment, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/assignments/${assignment._id}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      }
    };
    fetchSubmissions();
  }, [assignment._id]);

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    
    // If it was already sent or edited, use finalFeedback. Otherwise, format the AI feedback as text for editing.
    if (sub.finalFeedback) {
      setFinalFeedback(sub.finalFeedback);
    } else {
      const ai = sub.feedbackIA || {};
      const generatedText = `What worked:\n${(ai.whatWorked || []).join('\n')}\n\nAreas to improve:\n${(ai.areasToImprove || []).join('\n')}\n\nHow to improve:\n${(ai.howToImprove || []).join('\n')}`;
      setFinalFeedback(generatedText);
    }
  };

  const handleSendFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/submissions/${selectedSubmission._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ finalFeedback, status: 'Sent' })
      });
      if (response.ok) {
        const updated = await response.json();
        setSubmissions(submissions.map(s => s._id === updated._id ? updated : s));
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Failed to update submission:", error);
    }
  };

  if (selectedSubmission) {
    return (
      <div className="animate-fade">
        <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>← Back to List</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{selectedSubmission.studentName}'s Draft</h3>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', minHeight: '400px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {selectedSubmission.textContent}
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>AI Feedback</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Settings size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Feedback'}
              </button>
            </div>
            
            {isEditing ? (
              <textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                style={{ width: '100%', minHeight: '300px', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-light)', fontSize: '0.9rem' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.5', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px' }}>
                {finalFeedback}
              </div>
            )}
            
            <button 
              onClick={handleSendFeedback}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Release to Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>← Back to Projects</button>
          <h2 style={{ fontSize: '1.8rem' }}>Submissions: {assignment.title}</h2>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1.5rem' }}>
          <div><span style={{ color: 'var(--text-dim)' }}>Total:</span> {submissions.length}</div>
          <div><span style={{ color: 'var(--text-dim)' }}>Pending Review:</span> {submissions.filter(s => s.status !== 'Sent').length}</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Student</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub._id} className="glass-hover">
                <td style={{ padding: '1rem', fontWeight: '600' }}>{sub.studentName}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${sub.status === 'Sent' ? 'badge-success' : 'badge-warning'}`}>
                    {sub.status === 'Sent' ? '✓ Sent' : '○ Pending'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleSelectSubmission(sub)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Review</button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
