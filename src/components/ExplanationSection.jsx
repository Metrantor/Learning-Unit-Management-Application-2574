import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit } = FiIcons;

const ExplanationSection = ({ unit, onUpdate }) => {
  const [explanation, setExplanation] = useState(unit.explanation || '');

  const handleChange = (e) => {
    const value = e.target.value;
    setExplanation(value);
    onUpdate({ explanation: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiEdit} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Schriftliche Erklärung</h3>
      </div>

      <textarea
        value={explanation}
        onChange={handleChange}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Schriftliche Erklärung der Inhalte zur späteren Veröffentlichung..."
      />
      
      <p className="text-sm text-gray-500 mt-2">
        Diese schriftliche Erklärung dient zur späteren Veröffentlichung der Lerninhalte.
      </p>
    </div>
  );
};

export default ExplanationSection;