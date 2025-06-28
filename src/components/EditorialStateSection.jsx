import React from 'react';
import { EDITORIAL_STATES } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings } = FiIcons;

const EditorialStateSection = ({ unit, onUpdate }) => {
  const handleStateChange = (e) => {
    onUpdate({ editorialState: e.target.value });
  };

  const getStateColor = (state) => {
    const colors = {
      [EDITORIAL_STATES.PLANNING]: 'text-gray-700 bg-gray-100',
      [EDITORIAL_STATES.DRAFT]: 'text-yellow-700 bg-yellow-100',
      [EDITORIAL_STATES.REVIEW]: 'text-blue-700 bg-blue-100',
      [EDITORIAL_STATES.READY]: 'text-green-700 bg-green-100',
      [EDITORIAL_STATES.PUBLISHED]: 'text-purple-700 bg-purple-100'
    };
    return colors[state] || 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiSettings} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Redaktioneller Stand</h3>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={unit.editorialState}
          onChange={handleStateChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {Object.values(EDITORIAL_STATES).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(unit.editorialState)}`}>
          {unit.editorialState}
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Letztes Update:</strong> {new Date(unit.updatedAt).toLocaleString('de-DE')}</p>
        <p><strong>Erstellt am:</strong> {new Date(unit.createdAt).toLocaleString('de-DE')}</p>
      </div>
    </div>
  );
};

export default EditorialStateSection;