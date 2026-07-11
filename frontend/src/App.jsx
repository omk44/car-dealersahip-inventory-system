import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import Dashboard from './components/Dashboard/Dashboard';
import AdminPortal from './components/Admin/AdminPortal';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '5rem' }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminPortal /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
