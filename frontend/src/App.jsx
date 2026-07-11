import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const Dashboard = () => (
  <div className="container">
    <Navbar />
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Premium Vehicles Await</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Our sleek dashboard is being constructed...</p>
    </div>
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
