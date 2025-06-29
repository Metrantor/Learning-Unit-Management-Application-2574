import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiKey, FiPlus, FiTrash2, FiMail, FiShield, FiClock, FiCheck, FiX, FiRefreshCw, FiEdit2, FiToggleLeft, FiToggleRight } = FiIcons;

const AdminPanel = () => {
  const { invitationCodes, users, createInvitationCode, deleteInvitationCode, toggleInvitationCode, updateInvitationCode, updateUserRole, deleteUser, resetAuth } = useAuth();
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'user',
    description: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('invitations');
  const [editingCode, setEditingCode] = useState(null);

  const handleCreateInvitation = (e) => {
    e.preventDefault();
    if (!newInvitation.email.trim()) return;

    createInvitationCode(newInvitation.email, newInvitation.role, newInvitation.description);
    setNewInvitation({ email: '', role: 'user', description: '' });
    setShowCreateForm(false);
  };

  const handleUpdateCode = (codeId, updates) => {
    updateInvitationCode(codeId, updates);
    setEditingCode(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getRoleColor = (role) => {
    return role === 'admin'
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  };

  // 🔥 FIX: Toggle function for invitation codes
  const handleToggleCode = async (codeId) => {
    try {
      console.log('🔄 Toggling invitation code:', codeId);
      await toggleInvitationCode(codeId);
      console.log('✅ Toggle successful');
    } catch (error) {
      console.error('❌ Toggle failed:', error);
      alert('Fehler beim Umschalten des Status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Benutzerverwaltung</h2>
          <p className="text-gray-600 dark:text-gray-400">Verwalten Sie Benutzer und Einladungscodes (Passwörter)</p>
        </div>

        {/* Debug Reset Button */}
        <button
          onClick={() => {
            if (window.confirm('🔄 Auth-System zurücksetzen? (Nur für Entwicklung/Tests)')) {
              resetAuth();
              window.location.reload();
            }
          }}
          className="inline-flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <SafeIcon icon={FiRefreshCw} className="h-4 w-4 mr-2" />
          Reset (Debug)
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
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
              <span>Einladungscodes ({invitationCodes.length})</span>
            </div>
          </button>
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
        </nav>
      </div>

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Einladungscodes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Diese Codes funktionieren wie Passwörter und können beliebig oft verwendet werden.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
                Neuen Code erstellen
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
                        E-Mail-Adresse *
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Beschreibung (optional)
                    </label>
                    <input
                      type="text"
                      value={newInvitation.description}
                      onChange={(e) => setNewInvitation(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      placeholder="z.B. 'Projektleiter Marketing'"
                    />
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
                      Code erstellen
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Invitations List */}
            {invitationCodes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Noch keine Einladungscodes erstellt.
              </p>
            ) : (
              <div className="space-y-3">
                {invitationCodes.map((invitation) => (
                  <div
                    key={invitation.id}
                    className={`p-4 rounded-lg border ${
                      invitation.is_active
                        ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-full ${
                          invitation.is_active
                            ? 'bg-green-100 dark:bg-green-800'
                            : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                          <SafeIcon
                            icon={invitation.is_active ? FiKey : FiX}
                            className={`h-4 w-4 ${
                              invitation.is_active
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{invitation.email}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                              {invitation.role === 'admin' ? 'Administrator' : 'Benutzer'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invitation.is_active
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            }`}>
                              {invitation.is_active ? 'Aktiv' : 'Deaktiviert'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <strong>Code:</strong> <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">{invitation.code}</span>
                          </p>
                          {invitation.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {invitation.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Erstellt: {formatDate(invitation.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* 🔥 FIXED TOGGLE BUTTON */}
                        <button
                          onClick={() => handleToggleCode(invitation.id)}
                          className={`p-2 rounded transition-colors ${
                            invitation.is_active
                              ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          title={invitation.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          <SafeIcon
                            icon={invitation.is_active ? FiToggleRight : FiToggleLeft}
                            className="h-4 w-4"
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Einladungscode für ${invitation.email} wirklich löschen?`)) {
                              deleteInvitationCode(invitation.id);
                            }
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          title="Code löschen"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                        {user.invitation_code && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Code: <span className="font-mono">{user.invitation_code}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Registriert: {formatDate(user.created_at)}
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
    </div>
  );
};

export default AdminPanel;