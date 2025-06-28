import React, { useState } from 'react';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiType, FiZap, FiLoader } = FiIcons;

const LongTextSection = ({ unit, onUpdate }) => {
  const [longText, setLongText] = useState(unit.longText || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const { processTextToSnippets } = useLearningUnits();

  const handleChange = (e) => {
    const value = e.target.value;
    setLongText(value);
    onUpdate({ longText: value });
  };

  const handleProcessText = async () => {
    if (!longText.trim()) return;

    setIsProcessing(true);
    try {
      await processTextToSnippets(unit.id, longText);
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Textes:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SafeIcon icon={FiType} className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Langer Text</h3>
        </div>
        <button
          onClick={handleProcessText}
          disabled={!longText.trim() || isProcessing}
          className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isProcessing ? (
            <SafeIcon icon={FiLoader} className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <SafeIcon icon={FiZap} className="h-4 w-4 mr-2" />
          )}
          {isProcessing ? 'Verarbeite...' : 'In Snippets zerlegen'}
        </button>
      </div>

      <textarea
        value={longText}
        onChange={handleChange}
        rows={10}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Geben Sie hier den langen Text ein, der später in kleinere Teile zerlegt werden soll..."
      />
      
      <p className="text-sm text-gray-500 mt-2">
        Dieser Text kann über die Schaltfläche "In Snippets zerlegen" in kleinere Teile aufgeteilt werden.
      </p>
    </div>
  );
};

export default LongTextSection;