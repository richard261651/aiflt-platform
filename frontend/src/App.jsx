import React, { useState } from 'react';
import { Sparkles, GraduationCap, LayoutDashboard } from 'lucide-react';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentWorkspace from './components/student/StudentWorkspace';

function App() {
  const [role, setRole] = useState(null); // null = Landing Page, 'professor' | 'student'

  if (!role) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main)',
        padding: '2rem'
      }}>
        <div className="glass animate-fade" style={{
          padding: '4rem',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={32} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
            AI FLT Platform
          </h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Feedback for Language Teaching powered by Jeremy Harmer's methodology and AI.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
              onClick={() => setRole('professor')}
            >
              <LayoutDashboard size={20} /> I am a Teacher
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
              onClick={() => setRole('student')}
            >
              <GraduationCap size={20} /> I am a Student
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Sidebar Nav */}
        <nav style={{ flex: 1, marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={`btn ${role === 'professor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRole('professor')}
            style={{ width: '100%', justifyContent: 'flex-start', background: role === 'professor' ? '' : 'transparent' }}
          >
            <LayoutDashboard size={18} /> Teacher Panel
          </button>
          <button 
            className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRole('student')}
            style={{ width: '100%', justifyContent: 'flex-start', background: role === 'student' ? '' : 'transparent' }}
          >
            <GraduationCap size={18} /> Student Panel
          </button>
        </nav>

        {/* Logout / Back to Landing */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setRole(null)}
            style={{ width: '100%', justifyContent: 'center', background: 'transparent' }}
          >
            Back to Home
          </button>
        </div>

        <div className="user-profile glass" style={{ padding: '1rem', marginTop: '1rem' }}>
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
