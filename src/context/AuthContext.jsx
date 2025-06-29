import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../lib/supabase';

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

  // Load data from Supabase on mount
  useEffect(() => {
    console.log('🚀 AuthProvider initializing...');
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check for existing session
      const savedUser = localStorage.getItem('mockUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Existing session restored:', userData.email);
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('mockUser');
        }
      }

      // Load invitation codes
      await loadInvitationCodes();
      // Load users
      await loadUsers();
    } catch (error) {
      console.error('❌ Error loading initial auth data:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ AuthProvider initialized');
    }
  };

  const loadInvitationCodes = async () => {
    try {
      console.log('🔑 Loading invitation codes...');
      const { data, error } = await supabase
        .from('invitation_codes_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInvitationCodes(data);
        localStorage.setItem('invitationCodes_sb2024', JSON.stringify(data));
        console.log('✅ Loaded invitation codes from Supabase:', data.length);

        // Falls keine Codes da sind, erstelle Admin-Code
        if (data.length === 0) {
          await createDefaultAdminCode();
        }
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localCodes = JSON.parse(localStorage.getItem('invitationCodes_sb2024') || '[]');
        setInvitationCodes(localCodes);
        if (localCodes.length === 0) {
          await createDefaultAdminCode();
        }
      }
    } catch (error) {
      console.error('❌ Error loading invitation codes:', error);
      const localCodes = JSON.parse(localStorage.getItem('invitationCodes_sb2024') || '[]');
      setInvitationCodes(localCodes);
      if (localCodes.length === 0) {
        await createDefaultAdminCode();
      }
    }
  };

  const loadUsers = async () => {
    try {
      console.log('👥 Loading users...');
      const { data, error } = await supabase
        .from('users_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
        localStorage.setItem('users_sb2024', JSON.stringify(data));
        console.log('✅ Loaded users from Supabase:', data.length);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localUsers = JSON.parse(localStorage.getItem('users_sb2024') || '[]');
        setUsers(localUsers);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      const localUsers = JSON.parse(localStorage.getItem('users_sb2024') || '[]');
      setUsers(localUsers);
    }
  };

  // NEUE FUNKTION: Default Admin Code erstellen
  const createDefaultAdminCode = async () => {
    try {
      console.log('🔧 Creating default admin code...');
      const newCode = {
        id: uuidv4(),
        code: 'ADMIN2024',
        email: 'admin@example.com',
        role: 'admin',
        is_active: true, // 🔥 WICHTIG: STANDARDMÄSSIG AKTIV!
        description: 'Default Admin Code',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('invitation_codes_sb2024')
          .insert([newCode])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created admin code in Supabase:', data);
          const updatedCodes = [data, ...invitationCodes];
          setInvitationCodes(updatedCodes);
          localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
          return data;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating admin code locally');
      const updatedCodes = [newCode, ...invitationCodes];
      setInvitationCodes(updatedCodes);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
      return newCode;
    } catch (error) {
      console.error('❌ Error creating default admin code:', error);
      // ULTIMATE FALLBACK
      const fallbackCode = {
        id: 'fallback-admin',
        code: 'ADMIN2024',
        email: 'admin@example.com',
        role: 'admin',
        is_active: true, // 🔥 WICHTIG: STANDARDMÄSSIG AKTIV!
        description: 'Fallback Admin Code',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setInvitationCodes([fallbackCode]);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify([fallbackCode]));
    }
  };

  const loginWithInvitationCode = async (email, code) => {
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Code:', code);

    // Trim and normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    try {
      // Find matching invitation code
      let matchingCode = invitationCodes.find(code =>
        code.code === normalizedCode &&
        code.email === normalizedEmail &&
        code.is_active === true
      );

      if (!matchingCode) {
        console.error('❌ No matching invitation found');
        throw new Error('Ungültiger Einladungscode oder E-Mail-Adresse');
      }

      console.log('🎫 Found invitation:', matchingCode);

      // Check if user already exists
      let currentUser = users.find(user => user.email === normalizedEmail);

      if (!currentUser) {
        // Create new user
        console.log('✨ Creating new user');
        const newUserData = {
          id: uuidv4(),
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: matchingCode.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
          invitation_code: matchingCode.code,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Try Supabase first
        try {
          const { data, error } = await supabase
            .from('users_sb2024')
            .insert([newUserData])
            .select()
            .single();

          if (!error && data) {
            console.log('✅ Created user in Supabase:', data);
            currentUser = data;
            const updatedUsers = [data, ...users];
            setUsers(updatedUsers);
            localStorage.setItem('users_sb2024', JSON.stringify(updatedUsers));
          }
        } catch (supabaseError) {
          console.log('⚠️ Supabase failed, using local storage');
        }

        if (!currentUser) {
          // Fallback: Local storage
          console.log('📝 Creating user locally');
          currentUser = newUserData;
          const updatedUsers = [newUserData, ...users];
          setUsers(updatedUsers);
          localStorage.setItem('users_sb2024', JSON.stringify(updatedUsers));
        }
      } else {
        console.log('👤 Existing user login:', currentUser.email);
      }

      // Set authentication state
      setUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem('mockUser', JSON.stringify(currentUser));

      console.log('✅ Login successful');
      return currentUser;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      console.log('📝 Updating user profile:', user.id);
      const updatedUser = {
        ...user,
        ...profileData,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('users_sb2024')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (!error) {
          console.log('✅ Updated user profile in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      setUser(updatedUser);
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));

      // Update users list
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('users_sb2024', JSON.stringify(updatedUsers));

      console.log('✅ User profile updated');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 User logged out');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
  };

  const createInvitationCode = async (email, role = 'user', description = '') => {
    try {
      console.log('🆕 Creating invitation code for:', email);
      const newCode = {
        id: uuidv4(),
        code: `CODE${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        email: email.toLowerCase().trim(),
        role,
        is_active: true, // 🔥 WICHTIG: NEUE CODES SIND STANDARDMÄSSIG AKTIV!
        description: description || `Einladung für ${email}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('invitation_codes_sb2024')
          .insert([newCode])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created invitation code in Supabase:', data);
          const updatedCodes = [data, ...invitationCodes];
          setInvitationCodes(updatedCodes);
          localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
          return data;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating invitation code locally');
      const updatedCodes = [newCode, ...invitationCodes];
      setInvitationCodes(updatedCodes);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
      return newCode;
    } catch (error) {
      console.error('❌ Error creating invitation code:', error);
      throw error;
    }
  };

  const deleteInvitationCode = async (id) => {
    try {
      console.log('🗑️ Deleting invitation code:', id);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('invitation_codes_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted invitation code from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state
      const updatedCodes = invitationCodes.filter(code => code.id !== id);
      setInvitationCodes(updatedCodes);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('❌ Error deleting invitation code:', error);
      throw error;
    }
  };

  const toggleInvitationCode = async (id) => {
    try {
      console.log('🔄 Toggling invitation code:', id);
      const currentCode = invitationCodes.find(c => c.id === id);
      if (!currentCode) return;

      const updates = {
        is_active: !currentCode.is_active,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('invitation_codes_sb2024')
          .update(updates)
          .eq('id', id);

        if (!error) {
          console.log('✅ Toggled invitation code in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase toggle failed');
      }

      // Always update local state
      const updatedCodes = invitationCodes.map(code =>
        code.id === id ? { ...code, ...updates } : code
      );
      setInvitationCodes(updatedCodes);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('❌ Error toggling invitation code:', error);
      throw error;
    }
  };

  const updateInvitationCode = async (id, updates) => {
    try {
      console.log('📝 Updating invitation code:', id);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('invitation_codes_sb2024')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated invitation code in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedCodes = invitationCodes.map(code =>
        code.id === id ? { ...code, ...updateData } : code
      );
      setInvitationCodes(updatedCodes);
      localStorage.setItem('invitationCodes_sb2024', JSON.stringify(updatedCodes));
    } catch (error) {
      console.error('❌ Error updating invitation code:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      console.log('📝 Updating user role:', userId, 'to', newRole);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('users_sb2024')
          .update({
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (!error) {
          console.log('✅ Updated user role in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: newRole, updated_at: new Date().toISOString() } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users_sb2024', JSON.stringify(updatedUsers));

      // Update current user if it's the same user
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole, updated_at: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      console.log('🗑️ Deleting user:', userId);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('users_sb2024')
          .delete()
          .eq('id', userId);

        if (!error) {
          console.log('✅ Deleted user from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users_sb2024', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  };

  // Reset function for development/testing
  const resetAuth = async () => {
    try {
      console.log('🔄 Resetting auth system...');
      localStorage.removeItem('mockUser');
      localStorage.removeItem('users_sb2024');
      localStorage.removeItem('invitationCodes_sb2024');
      setUser(null);
      setIsAuthenticated(false);
      setUsers([]);
      setInvitationCodes([]);
      await loadInitialData();
      console.log('✅ Auth system reset complete');
    } catch (error) {
      console.error('❌ Error resetting auth system:', error);
      throw error;
    }
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
    resetAuth,
    // Admin functions
    invitationCodes,
    users,
    createInvitationCode,
    deleteInvitationCode,
    toggleInvitationCode,
    updateInvitationCode,
    updateUserRole,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};