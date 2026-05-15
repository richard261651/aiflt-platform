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
  Sparkles
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfessorDashboard = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'submissions'
  const [activeFolder, setActiveFolder] = useState('Unit 3 - Writing');
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const folders = ['Mis Proyectos', 'Unit 1 - Basics', 'Unit 3 - Writing', 'Final Exams'];

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
    fetchAssignments();
  }, []);

  return (
    <div className="professor-dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Professor Panel</h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage assignments and review student feedback</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary"><FolderPlus size={18} /> New Folder</button>
          <button onClick={() => setView('create')} className="btn btn-primary"><FilePlus size={18} /> Create Assignment</button>
        </div>
      </header>

      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          {/* Folders List */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Folders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {folders.map(folder => (
                <button 
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: activeFolder === folder ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: activeFolder === folder ? 'var(--accent-primary)' : 'var(--text-main)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                >
                  {folder}
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Assignments Table */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{activeFolder}</h3>
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
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Action</th>
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
                        <button 
                          onClick={() => setView('submissions')}
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === 'create' && (
        <AssignmentForm 
          onCancel={() => setView('list')} 
          onSuccess={() => {
            fetchAssignments();
            setView('list');
          }} 
        />
      )}

      {view === 'submissions' && (
        <SubmissionsView onBack={() => setView('list')} />
      )}
    </div>
  );
};

const AssignmentForm = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    briefing: '',
    criteria: '',
    feedbackStyle: '',
    folder: 'Unit 3 - Writing' // Default for now
  });

  const systemPrompt = formData.criteria ? `SYSTEM ROLE: You are an expert English Writing Coach...\nCRITERIA TO EVALUATE:\n${formData.criteria}\nCONTEXT:\n${formData.briefing}` : '';

  const handleCreateAssignment = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
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
              {isGenerating ? <><Clock size={18} className="animate-spin" /> Saving...</> : <><Sparkles size={18} /> Create Assignment</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubmissionsView = ({ onBack }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    { id: 1, name: 'Ana Garcia', version: 'v2', status: 'Reviewed', date: '2 hours ago' },
    { id: 2, name: 'Carlos Ruiz', version: 'v1', status: 'Pending', date: '5 hours ago' },
    { id: 3, name: 'Maria Lopez', version: 'v3', status: 'Reviewed', date: '1 day ago' },
  ];

  if (selectedStudent) {
    return (
      <div className="animate-fade">
        <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>← Back to List</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{selectedStudent.name}'s Draft ({selectedStudent.version})</h3>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', minHeight: '400px', lineHeight: '1.6' }}>
              Dear Mr. Johnson,<br/><br/>
              I am writing to request an extension for the essay assignment. I have been very busy lately with other projects and I need more time to finish it properly.<br/><br/>
              I hope you can understand my situation.<br/><br/>
              Best regards,<br/>
              Ana
            </div>
          </div>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>AI Feedback</h3>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}><Settings size={14} /> Edit Feedback</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
                <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>✅ What worked</h4>
                <p style={{ fontSize: '0.9rem' }}>Excellent formal greeting and clear purpose statement.</p>
              </div>
              <div className="glass" style={{ padding: '1rem', borderLeft: '4px solid var(--warning)' }}>
                <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>⚠️ Areas to improve</h4>
                <p style={{ fontSize: '0.9rem' }}>"I have been very busy" is slightly too informal. Consider more professional reasons.</p>
              </div>
              <div className="glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>💡 How to improve</h4>
                <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                  <li>Replace "busy" with "unforeseen circumstances".</li>
                  <li>Specify the number of days for the extension.</li>
                </ul>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Release to Student</button>
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
          <h2 style={{ fontSize: '1.8rem' }}>Submissions: Email formal</h2>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1.5rem' }}>
          <div><span style={{ color: 'var(--text-dim)' }}>Total:</span> 20</div>
          <div><span style={{ color: 'var(--text-dim)' }}>Turned in:</span> 15</div>
          <div><span style={{ color: 'var(--text-dim)' }}>Pending:</span> 5</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Student</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Version</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>AI Feedback</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: '500' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="glass-hover">
                <td style={{ padding: '1rem', fontWeight: '600' }}>{student.name}</td>
                <td style={{ padding: '1rem' }}>{student.version}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${student.status === 'Reviewed' ? 'badge-success' : 'badge-warning'}`}>
                    {student.status === 'Reviewed' ? '✓ Generated' : '○ Pending'}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{student.date}</td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => setSelectedStudent(student)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
