import React, { useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFile, FiUpload, FiDownload, FiTrash2, FiEye } = FiIcons;

const FileManagementSection = ({ unit, onUpdate }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString()
      };
      onUpdate({ powerPointFile: fileData });
    } else {
      alert('Bitte wählen Sie eine PowerPoint-Datei (.pptx) aus.');
    }
  };

  const handleFileRemove = () => {
    if (window.confirm('Möchten Sie die PowerPoint-Datei wirklich entfernen?')) {
      onUpdate({ powerPointFile: null });
    }
  };

  const handleFileDownload = () => {
    // In einer echten Anwendung würde hier der Download implementiert
    alert('Download-Funktion würde hier implementiert werden.');
  };

  const handleFileOpen = () => {
    // In einer echten Anwendung würde hier das Öffnen implementiert
    alert('Öffnen-Funktion würde hier implementiert werden.');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiFile} className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">PowerPoint-Datei</h3>
      </div>

      {unit.powerPointFile ? (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SafeIcon icon={FiFile} className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">{unit.powerPointFile.name}</h4>
                <p className="text-sm text-gray-500">
                  {(unit.powerPointFile.size / 1024 / 1024).toFixed(2)} MB • 
                  Hochgeladen am {new Date(unit.powerPointFile.uploadedAt).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleFileOpen}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Öffnen"
              >
                <SafeIcon icon={FiEye} className="h-4 w-4" />
              </button>
              <button
                onClick={handleFileDownload}
                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Herunterladen"
              >
                <SafeIcon icon={FiDownload} className="h-4 w-4" />
              </button>
              <button
                onClick={handleFileRemove}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Entfernen"
              >
                <SafeIcon icon={FiTrash2} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <SafeIcon icon={FiFile} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Keine PowerPoint-Datei hochgeladen</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
            PowerPoint hochladen
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default FileManagementSection;