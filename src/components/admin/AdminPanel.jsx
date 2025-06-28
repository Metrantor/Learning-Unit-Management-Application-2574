import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiKey, FiPlus, FiTrash2, FiMail, FiShield, FiClock, FiCheck, FiX } = FiIcons;

const AdminPanel = () => {
  const { invitationCodes, users, createInvitationCode, deleteInvitationCode, updateUserRole, deleteUser } = useAuth();
  const [newInvitation, setNewInvitation] = useState({ email: '', role: 'user' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const handleCreateInvitation = (e) => {
    e.preventDefault();
    if (!newInvitation.email.trim()) return;
    
    createInvitationCode(newInvitation.email, newInvitation.role);
    setNewInvitation({ email: '', role: 'user' });
    setShowCreateForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Benutzerverwaltung</h2>
        <p className="text-gray-600 dark:text-gray-400">Verwalten Sie Benutzer und Einladungscodes</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUsers} className="h-4 w-4" />
              <span>Benutzer ({users.length})</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('invitations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'invitations'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiKey} className="h-4 w-4" />
              <span>Einladungen ({invitationCodes.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registrierte Benutzer</h3>
            
            {users.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Noch keine Benutzer registriert.
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{user.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Registriert: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-none ${getRoleColor(user.role)}`}
                      >
                        <option value="user">Benutzer</option>
                        <option value="admin">Administrator</option>
                      </select>
                      
                      <button
                        onClick={() => {
                          if (window.confirm(`Benutzer ${user.name} wirklich löschen?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        title="Benutzer löschen"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Einladungscodes</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
                Neue Einladung
              </button>
            </div>

            {/* Create Invitation Form */}
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <form onSubmit={handleCreateInvitation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-Mail-Adresse
                      </label>
                      <input
                        type="email"
                        value={newInvitation.email}
                        onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        placeholder="benutzer@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rolle
                      </label>
                      <select
                        value={newInvitation.role}
                        onChange={(e) => setNewInvitation(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        <option value="user">Benutzer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                    >
                      Einladung erstellen
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Invitations List */}
            {invitationCodes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Noch keine Einladungen erstellt.
              </p>
            ) : (
              <div className="space-y-3">
                {invitationCodes.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${invitation.used ? 'bg-gray-100 dark:bg-gray-600' : 'bg-green-100 dark:bg-green-900'}`}>
                        <SafeIcon 
                          icon={invitation.used ? FiCheck : FiMail} 
                          className={`h-4 w-4 ${invitation.used ? 'text-gray-500 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}`} 
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{invitation.email}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                            {invitation.role === 'admin' ? 'Administrator' : 'Benutzer'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invitation.used 
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          }`}>
                            {invitation.used ? 'Verwendet' : 'Aktiv'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Code: <span className="font-mono font-semibold">{invitation.code}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Erstellt: {formatDate(invitation.createdAt)}
                          {invitation.used && invitation.usedAt && (
                            <span> • Verwendet: {formatDate(invitation.usedAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (window.confirm(`Einladung für ${invitation.email} wirklich löschen?`)) {
                          deleteInvitationCode(invitation.id);
                        }
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                      title="Einladung löschen"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;