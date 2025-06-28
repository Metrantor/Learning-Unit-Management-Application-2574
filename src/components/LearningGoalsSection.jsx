import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiPlus, FiTrash2 } = FiIcons;

const LearningGoalsSection = ({ unit, onUpdate }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const updatedGoals = [
      ...unit.learningGoals,
      {
        id: uuidv4(),
        text: newGoal.trim(),
        createdAt: new Date().toISOString()
      }
    ];
    
    onUpdate({ learningGoals: updatedGoals });
    setNewGoal('');
  };

  const removeGoal = (goalId) => {
    const updatedGoals = unit.learningGoals.filter(goal => goal.id !== goalId);
    onUpdate({ learningGoals: updatedGoals });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGoal();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiTarget} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Lernziele</h3>
      </div>

      <div className="space-y-4">
        {unit.learningGoals.length > 0 && (
          <div className="space-y-2">
            {unit.learningGoals.map((goal, index) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 mr-3 mt-0.5">
                    {index + 1}.
                  </span>
                  <span className="text-gray-900">{goal.text}</span>
                </div>
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Neues Lernziel hinzufügen..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={addGoal}
            disabled={!newGoal.trim()}
            className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningGoalsSection;