import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Simple placeholder components for now
const Navbar = () => (
  <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
    <h2 style={{ color: 'var(--accent-color)' }}>AutoAura Dealership</h2>
    <div>
      <span style={{ marginRight: '1rem' }}>Welcome!</span>
      <button className="btn btn-primary" style={{ background: 'var(--danger)' }}>Logout</button>
    </div>
  </nav>
);

const Dashboard = () => (
  <div className="container">
    <Navbar />
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Premium Vehicles Await</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Our sleek dashboard is being constructed...</p>
    </div>
  </div>
);

const Login = () => (
  <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Sign In</h2>
      <input type="email" placeholder="Email" className="input-field" style={{ marginBottom: '1rem' }} />
      <input type="password" placeholder="Password" className="input-field" style={{ marginBottom: '2rem' }} />
      <button className="btn btn-primary" style={{ width: '100%' }}>Login</button>
    </div>
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
