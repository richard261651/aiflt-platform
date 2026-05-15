import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, LayoutDashboard, LogOut, ArrowLeft, Loader2, Menu, X } from 'lucide-react';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentWorkspace from './components/student/StudentWorkspace';

const API_URL = import.meta.env.VITE_API_URL || 'https://aiflt-backend.onrender.com/api';
// Safely compute AUTH_URL by removing /api and any trailing slashes, then appending /auth
const AUTH_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/auth';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('select'); // 'select' | 'teacher-login' | 'student-login'
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeClick = () => {
    setResetKey(prev => prev + 1);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'professor' ? '/login' : '/student-login';
      const body = type === 'professor' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, password: formData.password };

      const response = await fetch(`${AUTH_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('select');
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} /></div>;

  if (!user) {
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
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '550px',
          width: '100%'
        }}>
          {authView === 'select' ? (
            <>
              <img src="/logo.png" alt="AI FLT Logo" style={{ width: '100%', maxWidth: '350px', margin: '0 auto 1.5rem auto', display: 'block' }} />
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                AI FLT
              </h1>
              <p style={{ color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem', fontWeight: '500' }}>
                THE INTELLIGENT WRITING TUTOR.<br/>
                POWERED BY JEREMY HARMER'S METHODOLOGY.
              </p>
            </>
          ) : (
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
              {authView === 'teacher-login' ? 'TEACHER LOGIN' : 'STUDENT WORKSPACE'}
            </h2>
          )}


          
          
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          {authView === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <button 
                className="btn btn-teacher" 
                style={{ padding: '1.2rem', fontSize: '1.1rem', justifyContent: 'center' }}
                onClick={() => setAuthView('teacher-login')}
              >
                <LayoutDashboard size={22} /> I am a Teacher
              </button>
              <button 
                className="btn btn-student" 
                style={{ padding: '1.2rem', fontSize: '1.1rem', justifyContent: 'center' }}
                onClick={() => setAuthView('student-login')}
              >
                <GraduationCap size={22} /> I am a Student
              </button>
            </div>
          )}

          {authView === 'teacher-login' && (
            <form onSubmit={(e) => handleLogin(e, 'professor')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <button type="button" onClick={() => setAuthView('select')} className="btn btn-secondary" style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0, textTransform: 'none', fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '1rem' }}><ArrowLeft size={16} /> BACK</button>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="richard@demo.com" />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="richard123" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>LOGIN</button>
            </form>
          )}

          {authView === 'student-login' && (
            <form onSubmit={(e) => handleLogin(e, 'student')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <button type="button" onClick={() => setAuthView('select')} className="btn btn-secondary" style={{ border: 'none', background: 'none', boxShadow: 'none', padding: 0, textTransform: 'none', fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '1rem' }}><ArrowLeft size={16} /> BACK</button>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Pepito Perez" />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="pepito123" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>ENTER WORKSPACE</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (user.role === 'professor') {
      return <ProfessorDashboard key={`prof-${resetKey}`} />;
    }
    return <StudentWorkspace key={`stud-${resetKey}`} studentName={user.name} />;
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar glass">
        <h2 style={{ fontSize: '1.5rem', color: '#000', margin: 0 }}>AI FLT</h2>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar navigation */}
      <aside className={`sidebar glass ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="logo-section" style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="AI FLT Logo" style={{ width: '100%', maxWidth: '180px', margin: '0 auto' }} />
            <p style={{ color: '#000', fontSize: '0.7rem', fontWeight: '700' }}>HARMER ENGINE</p>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav style={{ flex: 1, marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={handleHomeClick}
          >
            {user.role === 'professor' ? <><LayoutDashboard size={18} /> Teacher Panel</> : <><GraduationCap size={18} /> Student Panel</>}
          </button>
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--error, #ef4444)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="user-profile glass" style={{ padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content animate-fade">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
