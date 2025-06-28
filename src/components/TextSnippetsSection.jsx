import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPackage, FiCopy } = FiIcons;

const TextSnippetsSection = ({ unit }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Hier könnte eine Toast-Nachricht angezeigt werden
    });
  };

  if (!unit.textSnippets || unit.textSnippets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiPackage} className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Text-Snippets</h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          Noch keine Text-Snippets vorhanden. Verwenden Sie die Funktion "In Snippets zerlegen" im Abschnitt "Langer Text".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiPackage} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Text-Snippets</h3>
        <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
          {unit.textSnippets.length}
        </span>
      </div>

      <div className="space-y-3">
        {unit.textSnippets.map((snippet, index) => (
          <div key={snippet.id} className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    Snippet {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(snippet.createdAt).toLocaleString('de-DE')}
                  </span>
                </div>
                <p className="text-gray-900">{snippet.content}</p>
              </div>
              <button
                onClick={() => copyToClipboard(snippet.content)}
                className="ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="In Zwischenablage kopieren"
              >
                <SafeIcon icon={FiCopy} className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextSnippetsSection;