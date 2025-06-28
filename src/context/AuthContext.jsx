import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('mockUser');
    const savedCodes = localStorage.getItem('invitationCodes');
    const savedUsers = localStorage.getItem('users');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    
    if (savedCodes) {
      setInvitationCodes(JSON.parse(savedCodes));
    } else {
      // Initialize with default admin code
      const defaultCodes = [{
        id: uuidv4(),
        code: 'ADMIN2024',
        email: 'admin@example.com',
        role: 'admin',
        used: false,
        createdAt: new Date().toISOString()
      }];
      setInvitationCodes(defaultCodes);
      localStorage.setItem('invitationCodes', JSON.stringify(defaultCodes));
    }
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('invitationCodes', JSON.stringify(invitationCodes));
  }, [invitationCodes]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const loginWithInvitationCode = (email, code) => {
    const invitation = invitationCodes.find(inv => 
      inv.code === code && 
      inv.email.toLowerCase() === email.toLowerCase() && 
      !inv.used
    );
    
    if (!invitation) {
      throw new Error('Ungültiger Einladungscode oder E-Mail-Adresse');
    }
    
    // Mark invitation as used
    setInvitationCodes(prev => prev.map(inv => 
      inv.id === invitation.id ? { ...inv, used: true, usedAt: new Date().toISOString() } : inv
    ));
    
    // Create user
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: invitation.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsAuthenticated(true);
    
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    
    return newUser;
  };

  const updateUserProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    
    // Update in users list too
    setUsers(prev => prev.map(u => 
      u.id === user.id ? updatedUser : u
    ));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
  };

  const createInvitationCode = (email, role = 'user') => {
    const newCode = {
      id: uuidv4(),
      code: `INV${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      email: email.toLowerCase(),
      role,
      used: false,
      createdAt: new Date().toISOString()
    };
    
    setInvitationCodes(prev => [...prev, newCode]);
    return newCode;
  };

  const deleteInvitationCode = (id) => {
    setInvitationCodes(prev => prev.filter(code => code.id !== id));
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const isAdmin = user && user.role === 'admin';

  const value = {
    isAuthenticated,
    user,
    isLoading,
    isAdmin,
    loginWithInvitationCode,
    updateUserProfile,
    logout,
    
    // Admin functions
    invitationCodes,
    users,
    createInvitationCode,
    deleteInvitationCode,
    updateUserRole,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};