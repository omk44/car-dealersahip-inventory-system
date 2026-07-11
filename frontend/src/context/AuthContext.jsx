import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for token on initial load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setUser({ id: decoded.id, role: decoded.role, name: decoded.name, email: decoded.email });
        }
      } catch (err) {
        console.error("Invalid token found in storage");
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    const decoded = jwtDecode(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser({ id: decoded.id, role: decoded.role, name: decoded.name, email: decoded.email });
    navigate('/'); // Redirect to dashboard
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
