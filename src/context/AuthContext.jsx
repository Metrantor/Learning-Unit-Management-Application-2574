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
    console.log('🚀 AuthProvider initializing with Supabase...');
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

      // Load invitation codes from Supabase
      const { data: codes, error: codesError } = await supabase
        .from('invitation_codes_4k9x2')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) {
        console.error('❌ Error loading invitation codes:', codesError);
      } else {
        console.log('📋 Loaded invitation codes from Supabase:', codes);
        setInvitationCodes(codes || []);
      }

      // Load users from Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('users_auth_4k9x2')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('❌ Error loading users:', usersError);
      } else {
        console.log('👥 Loaded users from Supabase:', usersData);
        setUsers(usersData || []);
      }

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ AuthProvider initialized');
    }
  };

  const loginWithInvitationCode = async (email, code) => {
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Code:', code);
    
    // Trim and normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();
    
    console.log('🔍 Normalized email:', normalizedEmail);
    console.log('🔍 Normalized code:', normalizedCode);
    
    try {
      // Find matching invitation code in Supabase
      const { data: invitations, error: inviteError } = await supabase
        .from('invitation_codes_4k9x2')
        .select('*')
        .eq('code', normalizedCode)
        .eq('email', normalizedEmail)
        .eq('is_active', true)
        .single();

      if (inviteError || !invitations) {
        console.error('❌ No matching invitation found:', inviteError);
        throw new Error('Ungültiger Einladungscode oder E-Mail-Adresse');
      }

      console.log('🎫 Found invitation in Supabase:', invitations);

      // Check if user already exists in Supabase
      const { data: existingUsers, error: userError } = await supabase
        .from('users_auth_4k9x2')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      let currentUser;

      if (existingUsers && !userError) {
        // User exists, update role if needed
        console.log('👤 Existing user login:', existingUsers.email);
        
        if (existingUsers.role !== invitations.role) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users_auth_4k9x2')
            .update({ 
              role: invitations.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUsers.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating user role:', updateError);
            currentUser = existingUsers;
          } else {
            currentUser = updatedUser;
          }
        } else {
          currentUser = existingUsers;
        }
      } else {
        // Create new user in Supabase
        console.log('✨ Creating new user in Supabase');
        
        const newUserData = {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: invitations.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
          invitation_code: invitations.code
        };

        const { data: newUser, error: createError } = await supabase
          .from('users_auth_4k9x2')
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating user:', createError);
          throw new Error('Fehler beim Erstellen des Benutzers');
        }

        console.log('✅ New user created in Supabase:', newUser);
        currentUser = newUser;
      }

      // Set authentication state
      setUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem('mockUser', JSON.stringify(currentUser));
      
      // Reload data to reflect changes
      await loadInitialData();
      
      console.log('✅ Login successful');
      return currentUser;

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users_auth_4k9x2')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user profile:', error);
        throw error;
      }

      setUser(updatedUser);
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      await loadInitialData(); // Reload to reflect changes
      
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
      const newCode = {
        code: `CODE${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        email: email.toLowerCase().trim(),
        role,
        is_active: true,
        description: description || `Einladung für ${email}`
      };

      const { data, error } = await supabase
        .from('invitation_codes_4k9x2')
        .insert([newCode])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating invitation code:', error);
        throw error;
      }

      console.log('➕ Created new invitation code in Supabase:', data);
      await loadInitialData(); // Reload data
      return data;
    } catch (error) {
      console.error('❌ Error creating invitation code:', error);
      throw error;
    }
  };

  const deleteInvitationCode = async (id) => {
    try {
      const { error } = await supabase
        .from('invitation_codes_4k9x2')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting invitation code:', error);
        throw error;
      }

      console.log('🗑️ Deleted invitation code from Supabase:', id);
      await loadInitialData(); // Reload data
    } catch (error) {
      console.error('❌ Error deleting invitation code:', error);
      throw error;
    }
  };

  const toggleInvitationCode = async (id) => {
    try {
      const code = invitationCodes.find(c => c.id === id);
      if (!code) return;

      const { error } = await supabase
        .from('invitation_codes_4k9x2')
        .update({ 
          is_active: !code.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error toggling invitation code:', error);
        throw error;
      }

      console.log('🔄 Toggled invitation code in Supabase:', id);
      await loadInitialData(); // Reload data
    } catch (error) {
      console.error('❌ Error toggling invitation code:', error);
      throw error;
    }
  };

  const updateInvitationCode = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('invitation_codes_4k9x2')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating invitation code:', error);
        throw error;
      }

      console.log('✏️ Updated invitation code in Supabase:', id);
      await loadInitialData(); // Reload data
    } catch (error) {
      console.error('❌ Error updating invitation code:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users_auth_4k9x2')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating user role:', error);
        throw error;
      }

      // Update current user if it's the same user
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      }

      console.log('✅ Updated user role in Supabase:', userId);
      await loadInitialData(); // Reload data
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users_auth_4k9x2')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
      }

      console.log('🗑️ Deleted user from Supabase:', userId);
      await loadInitialData(); // Reload data
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  };

  // Reset function for development/testing
  const resetAuth = async () => {
    try {
      console.log('🔄 Resetting auth system...');
      
      // Clear local storage
      localStorage.removeItem('mockUser');
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear Supabase tables
      await supabase.from('users_auth_4k9x2').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('invitation_codes_4k9x2').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Recreate admin code
      await supabase
        .from('invitation_codes_4k9x2')
        .insert([{
          code: 'ADMIN2024',
          email: 'admin@example.com',
          role: 'admin',
          is_active: true,
          description: 'Standard Admin-Zugang'
        }]);
      
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
    resetAuth, // For debugging
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