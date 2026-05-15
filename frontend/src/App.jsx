import React, { useState, useEffect } from 'react';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentWorkspace from './components/student/StudentWorkspace';
import { UserCircle, GraduationCap, LayoutDashboard, PenTool } from 'lucide-react';

function App() {
  const [role, setRole] = useState('professor'); // 'professor' or 'student'
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  // Simple routing logic for the demo
  const renderContent = () => {
    if (role === 'professor') {
      return <ProfessorDashboard />;
    }
    return <StudentWorkspace />;
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar glass">
        <div className="logo-section">
          <h2 style={{ 
            fontSize: '1.5rem', 
            background: 'linear-gradient(135deg, #fff, #94a3b8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            AI FLT
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Harmer Feedback Engine</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setRole('professor')}
            className={`btn ${role === 'professor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <GraduationCap size={20} />
            Professor Panel
          </button>
          <button 
            onClick={() => setRole('student')}
            className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <UserCircle size={20} />
            Student Panel
          </button>
        </nav>

        <div className="user-profile glass" style={{ padding: '1rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {role === 'professor' ? 'P' : 'S'}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                {role === 'professor' ? 'Dr. Richard' : 'Student Ana'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {role === 'professor' ? 'Lead Educator' : 'Upper Intermediate'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="main-content animate-fade">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
