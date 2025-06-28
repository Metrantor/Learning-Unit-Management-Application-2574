import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFileText } = FiIcons;

const NotesSection = ({ unit, onUpdate }) => {
  const [notes, setNotes] = useState(unit.notes || '');

  const handleChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    onUpdate({ notes: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiFileText} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Notizen</h3>
      </div>

      <textarea
        value={notes}
        onChange={handleChange}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Ihre Notizen zu dieser Lerneinheit..."
      />
    </div>
  );
};

export default NotesSection;