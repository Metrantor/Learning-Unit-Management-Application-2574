import React, { useState } from 'react';
import { useLearningUnits } from '../../context/LearningUnitContext';
import MDEditor from '@uiw/react-md-editor';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget } = FiIcons;

const ExplanationTab = ({ unit }) => {
  const { updateLearningUnit } = useLearningUnits();
  const [explanation, setExplanation] = useState(unit.explanation || '');

  const handleChange = (value) => {
    setExplanation(value || '');
    updateLearningUnit(unit.id, { explanation: value || '' });
  };

  return (
    <div className="space-y-6">
      {/* Learning Goals Display (Read-only) */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiTarget} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lernziele (Übersicht)</h3>
        </div>
        
        {unit.learningGoals && unit.learningGoals.length > 0 ? (
          <div className="space-y-2">
            {unit.learningGoals.map((goal, index) => (
              <div key={goal.id} className="flex items-start p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3 mt-0.5">
                  {index + 1}.
                </span>
                <span className="text-gray-900 dark:text-white">{goal.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">Keine Lernziele definiert. Diese können im Tab "Stammdaten" hinzugefügt werden.</p>
        )}
      </div>

      {/* Markdown Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schriftliche Erklärung</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verfassen Sie hier die schriftliche Erklärung der Lerninhalte zur späteren Veröffentlichung. 
            Sie können Markdown-Formatierung verwenden.
          </p>
        </div>
        
        <div className="p-4">
          <MDEditor
            value={explanation}
            onChange={handleChange}
            preview="edit"
            hideToolbar={false}
            visibleDragBar={false}
            data-color-mode="auto"
            textareaProps={{
              placeholder: 'Schreiben Sie hier Ihre schriftliche Erklärung...\n\n**Sie können Markdown verwenden:**\n- **Fett** oder *kursiv*\n- [Links](http://example.com)\n- Listen und mehr',
              style: { fontSize: 14, lineHeight: 1.5, minHeight: 400 }
            }}
          />
        </div>
      </div>

      {/* Preview Section */}
      {explanation && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vorschau</h3>
          <div className="prose dark:prose-invert max-w-none">
            <MDEditor.Markdown source={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplanationTab;