import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiImage, FiUpload, FiTrash2, FiCopy, FiEye } = FiIcons;

const ImageManagementSection = ({ unit, onUpdate }) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/jpeg'));

    if (validFiles.length !== files.length) {
      alert('Bitte wählen Sie nur JPEG-Dateien aus.');
    }

    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      const updatedImages = [...(unit.images || []), ...newImages];
      onUpdate({ images: updatedImages });
    }
  };

  const handleImageRemove = (imageId) => {
    if (window.confirm('Möchten Sie dieses Bild wirklich entfernen?')) {
      const updatedImages = unit.images.filter(img => img.id !== imageId);
      onUpdate({ images: updatedImages });
    }
  };

  const handleImageCopy = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('Bild in Zwischenablage kopiert.');
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
      alert('Fehler beim Kopieren des Bildes.');
    }
  };

  const handleImageOpen = (imageUrl, imageName) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>${imageName}</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f3f4f6;">
          <img src="${imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${imageName}" />
        </body>
      </html>
    `);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SafeIcon icon={FiImage} className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Bilder</h3>
          {unit.images && unit.images.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
              {unit.images.length}
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
          Bilder hochladen
        </button>
      </div>

      {unit.images && unit.images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unit.images.map((image) => (
            <div key={image.id} className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <img
                  src={image.url}
                  alt={image.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm truncate" title={image.name}>
                  {image.name}
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  {(image.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleImageOpen(image.url, image.name)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Öffnen"
                  >
                    <SafeIcon icon={FiEye} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleImageCopy(image.url)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="In Zwischenablage kopieren"
                  >
                    <SafeIcon icon={FiCopy} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleImageRemove(image.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Löschen"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <SafeIcon icon={FiImage} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Keine Bilder hochgeladen</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
            Erste Bilder hochladen
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageManagementSection;