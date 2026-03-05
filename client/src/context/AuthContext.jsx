import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ucab_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('ucab_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('ucab_token');
    if (!token) return;
    API.get('/users/profile').catch((err) => {
      if (err.response?.status === 404 || err.response?.data?.deleted) {
        localStorage.removeItem('ucab_user');
        localStorage.removeItem('ucab_token');
        setUser(null);
        setAccountDeleted(true);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const forceLogoutDeleted = () => {
    localStorage.removeItem('ucab_user');
    localStorage.removeItem('ucab_token');
    setUser(null);
    setAccountDeleted(true);
  };

  const loginUser = (userData, token) => {
    localStorage.setItem('ucab_user', JSON.stringify(userData));
    localStorage.setItem('ucab_token', token);
    setUser(userData);
    setAccountDeleted(false);
  };

  const logoutUser = () => {
    localStorage.removeItem('ucab_user');
    localStorage.removeItem('ucab_token');
    setUser(null);
    setAccountDeleted(false);
  };

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('ucab_admin', JSON.stringify(adminData));
    localStorage.setItem('ucab_admin_token', token);
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('ucab_admin');
    localStorage.removeItem('ucab_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      user, admin, accountDeleted,
      loginUser, logoutUser,
      loginAdmin, logoutAdmin,
      forceLogoutDeleted,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);