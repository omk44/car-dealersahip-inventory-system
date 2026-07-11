import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isLightMode, setIsLightMode] = useState(
    localStorage.getItem('theme') === 'light'
  );

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  return (
    <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ color: 'var(--accent-color)', margin: 0 }}>AutoAura</h2>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={() => setIsLightMode(!isLightMode)} 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: '0.3s' }}
          title="Toggle Theme"
        >
          {isLightMode ? '🌙' : '☀️'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', transition: '0.3s', border: '1px solid var(--accent-color)' }}>
                  Admin Portal ✨
                </span>
              </Link>
            )}
            <span style={{ color: 'var(--text-secondary)' }}>Welcome back!</span>
            <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
