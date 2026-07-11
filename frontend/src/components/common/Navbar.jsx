import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ color: 'var(--accent-color)', margin: 0 }}>AutoAura</h2>
      </Link>
      
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user.role === 'admin' && (
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                Admin Portal
              </span>
            )}
            <span style={{ color: 'var(--text-secondary)' }}>Welcome back!</span>
            <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn" style={{ background: 'transparent', color: 'white', border: '1px solid var(--glass-border)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
