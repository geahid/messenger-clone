// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      await login(email, password);
      navigate('/');
    } catch { setError('Authentication failed. Check credentials.'); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    try {
      setError(''); setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) { setError('Google sign-in failed.'); }
    finally { setGoogleLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hex-bg"
      style={{ background: 'linear-gradient(135deg, #020508 0%, #050a18 50%, #040810 100%)' }}>

      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #00f5ff, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8" style={{ background: 'radial-gradient(circle, #bf00ff, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-5" style={{ background: 'radial-gradient(circle, #39ff14, transparent)', transform: 'translate(-50%,-50%)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 relative">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #0044aa, #3300cc)', border: '1px solid rgba(0,245,255,0.5)', boxShadow: '0 0 30px rgba(0,245,255,0.3), inset 0 0 20px rgba(0,100,255,0.2)' }} />
            <svg className="relative w-10 h-10" style={{ color: '#00f5ff', filter: 'drop-shadow(0 0 8px #00f5ff)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.792 1.31 5.29 3.38 6.983V21l3.086-1.695A10.596 10.596 0 0012 19.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-widest mb-1" style={{ fontFamily: 'Rajdhani,sans-serif', color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>NEXUS</h1>
          <p className="text-xs tracking-widest" style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(0,245,255,0.4)' }}>// SECURE CHAT PROTOCOL</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-6" style={{ background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,245,255,0.05)' }}>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />
          <div className="absolute top-0 right-0 w-4 h-4" style={{ borderTop: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />
          <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />
          <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff6699', fontFamily: 'Share Tech Mono,monospace' }}>
              ⚠ {error}
            </div>
          )}

          {/* Google Sign In */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-4 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e8f4ff', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, letterSpacing: '1px', fontSize: '14px' }}>
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            SIGN IN WITH GOOGLE
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,245,255,0.1)' }} />
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: '10px', color: 'rgba(0,245,255,0.4)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,245,255,0.1)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5 tracking-widest" style={{ fontFamily: 'Rajdhani,sans-serif', color: 'rgba(0,245,255,0.6)', fontWeight: 600 }}>EMAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="gaming-input w-full px-4 py-2.5 rounded-xl text-sm"
                placeholder="user@nexus.gg" />
            </div>
            <div>
              <label className="block text-xs mb-1.5 tracking-widest" style={{ fontFamily: 'Rajdhani,sans-serif', color: 'rgba(0,245,255,0.6)', fontWeight: 600 }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="gaming-input w-full px-4 py-2.5 rounded-xl text-sm"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gaming w-full py-3 rounded-xl text-white text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  AUTHENTICATING...
                </span>
              ) : '[ SIGN IN ]'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ fontFamily: 'Share Tech Mono,monospace', color: 'rgba(90,120,160,0.8)' }}>
            No account?{' '}
            <Link to="/register" className="transition-colors hover:underline" style={{ color: '#00f5ff' }}>REGISTER</Link>
          </p>
        </div>
      </div>
    </div>
  );
}