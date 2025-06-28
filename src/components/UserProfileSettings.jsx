import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiUpload, FiClipboard, FiSave, FiCamera } = FiIcons;

const UserProfileSettings = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    avatar: user.avatar
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClipboardPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            setIsUploading(true);
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              setFormData(prev => ({ ...prev, avatar: event.target.result }));
              setIsUploading(false);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert('Kein Bild in der Zwischenablage gefunden.');
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Zwischenablage:', error);
      alert('Fehler beim Zugriff auf die Zwischenablage.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw"
      >
        <div className="flex items-center mb-6">
          <SafeIcon icon={FiUser} className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profil bearbeiten</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
              >
                <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
                Hochladen
              </button>
              <button
                type="button"
                onClick={handleClipboardPaste}
                className="inline-flex items-center px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
              >
                <SafeIcon icon={FiClipboard} className="h-4 w-4 mr-2" />
                Einfügen
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4 mr-2" />
              Speichern
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfileSettings;