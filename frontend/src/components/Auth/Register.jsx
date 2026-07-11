import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      login(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', zIndex: 9999 }}>
      {/* Animated Background Orbs */}
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.1, animation: 'float 12s infinite alternate ease-in-out' }}></div>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#10b981', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.15, animation: 'float 9s infinite alternate-reverse ease-in-out' }}></div>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem', position: 'relative', zIndex: 10, animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', backdropFilter: 'blur(20px)', background: 'rgba(26, 29, 45, 0.7)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Join AutoAura</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Request your dealership access.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', padding: '1rem', marginBottom: '2rem', borderRadius: '4px', fontSize: '0.9rem', animation: 'shake 0.4s' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: '0.5rem' }}>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              autoFocus
              placeholder=" "
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '12px', fontSize: '1.1rem', transition: 'all 0.3s' }}
            />
            <label style={{ padding: '0 5px' }}>Full Name</label>
          </div>

          <div className="input-group" style={{ marginBottom: '0.5rem' }}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder=" "
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '12px', fontSize: '1.1rem', transition: 'all 0.3s' }}
            />
            <label style={{ padding: '0 5px' }}>Email Address</label>
          </div>
          
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder=" "
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '12px', fontSize: '1.1rem', transition: 'all 0.3s' }}
            />
            <label style={{ padding: '0 5px' }}>Password</label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ padding: '16px', fontSize: '1.1rem', fontWeight: '600', letterSpacing: '2px', borderRadius: '12px', marginTop: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLoading ? <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div> : 'INITIALIZE ACCESS'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Already have clearance? <Link to="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none', marginLeft: '5px' }}>Authenticate Here</Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(5%, 10%) scale(1.1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-group input:focus { background: rgba(0,0,0,0.4) !important; border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important; }
      `}} />
    </div>
  );
};

export default Register;
