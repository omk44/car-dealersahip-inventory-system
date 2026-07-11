import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import Dashboard from './components/Dashboard/Dashboard';

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
