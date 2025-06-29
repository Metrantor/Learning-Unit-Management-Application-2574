import React, { useState, useRef } from 'react';
import { useLearningUnits } from '../../context/LearningUnitContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiVideo, FiUpload, FiDownload, FiTrash2, FiPlay, FiMessageCircle, FiSend, FiUser } = FiIcons;

const VideoTab = ({ unit }) => {
  const { updateLearningUnit, currentUser } = useLearningUnits();
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newComment, setNewComment] = useState('');
  const videoInputRef = useRef(null);

  // 🚀 FIXED: Real Supabase Storage Upload (NO BASE64!)
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Bitte wählen Sie eine Videodatei aus.');
      return;
    }

    // Check file size (limit to 500MB for Supabase)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('Die Videodatei ist zu groß. Maximale Größe: 500MB');
      return;
    }

    setIsVideoUploading(true);
    setUploadProgress(0);

    try {
      // 📁 Step 1: Generate unique filename
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `videos/${unit.id}/${timestamp}_${cleanFileName}`;
      
      console.log('🚀 Uploading to Supabase Storage:', fileName);
      setUploadProgress(10);

      // 📤 Step 2: Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learning-units')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Supabase upload failed:', uploadError);
        throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
      }

      setUploadProgress(60);
      console.log('✅ File uploaded to Supabase:', uploadData.path);

      // 🔗 Step 3: Get public URL
      const { data: urlData } = supabase.storage
        .from('learning-units')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Keine öffentliche URL erhalten');
      }

      setUploadProgress(80);
      console.log('🔗 Public URL generated:', urlData.publicUrl);

      // 💾 Step 4: Create video metadata (NO BASE64!)
      const videoData = {
        id: unit.video?.id || Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        storagePath: fileName,
        publicUrl: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
        comments: unit.video?.comments || []
      };

      setUploadProgress(90);

      // 💾 Step 5: Update learning unit (LIGHTWEIGHT - no file data!)
      await updateLearningUnit(unit.id, { video: videoData });

      setUploadProgress(100);
      
      console.log('✅ Video uploaded successfully - NO localStorage overflow!');
      
      // Success feedback
      setTimeout(() => {
        setIsVideoUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('❌ Error uploading video:', error);
      
      // Show specific error to user
      let errorMessage = 'Unbekannter Fehler beim Upload';
      if (error.message.includes('quota')) {
        errorMessage = 'Speicherplatz erschöpft. Bitte Administrator kontaktieren.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Netzwerkfehler. Bitte Internetverbindung prüfen.';
      } else {
        errorMessage = error.message;
      }
      
      alert(`Fehler beim Upload: ${errorMessage}`);
      setIsVideoUploading(false);
      setUploadProgress(0);
    }

    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleVideoRemove = async () => {
    if (window.confirm('Möchten Sie das Video wirklich entfernen?')) {
      try {
        // 🗑️ Step 1: Delete from Supabase Storage
        if (unit.video?.storagePath) {
          console.log('🗑️ Deleting from Supabase Storage:', unit.video.storagePath);
          
          const { error: deleteError } = await supabase.storage
            .from('learning-units')
            .remove([unit.video.storagePath]);

          if (deleteError) {
            console.warn('⚠️ Could not delete from storage:', deleteError);
            // Continue anyway - metadata cleanup is more important
          } else {
            console.log('✅ File deleted from Supabase Storage');
          }
        }

        // 🗑️ Step 2: Remove video metadata
        await updateLearningUnit(unit.id, { video: null });
        console.log('✅ Video completely removed');
        
      } catch (error) {
        console.error('❌ Error removing video:', error);
        alert('Fehler beim Entfernen des Videos: ' + error.message);
      }
    }
  };

  const handleVideoDownload = () => {
    if (unit.video?.publicUrl) {
      // Direct download from Supabase
      const link = document.createElement('a');
      link.href = unit.video.publicUrl;
      link.download = unit.video.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Video-URL nicht verfügbar.');
    }
  };

  // Comment Management for Video
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: currentUser,
        createdAt: new Date().toISOString()
      };

      const updatedVideo = {
        ...unit.video,
        comments: [newCommentObj, ...(unit.video.comments || [])]
      };

      await updateLearningUnit(unit.id, { video: updatedVideo });
      setNewComment('');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Fehler beim Hinzufügen des Kommentars');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      try {
        const updatedComments = unit.video.comments.filter(comment => comment.id !== commentId);
        const updatedVideo = {
          ...unit.video,
          comments: updatedComments
        };
        await updateLearningUnit(unit.id, { video: updatedVideo });
      } catch (error) {
        console.error('❌ Error deleting comment:', error);
        alert('Fehler beim Löschen des Kommentars');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Video Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <SafeIcon icon={FiVideo} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Laden Sie hier das Hauptvideo für diese Lerneinheit hoch. Das Video wird in Supabase Storage gespeichert (bis 500MB).
          </p>
        </div>

        <div className="p-6">
          {/* Upload Progress */}
          {isVideoUploading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Video wird hochgeladen...
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {uploadProgress < 20 && 'Datei wird vorbereitet...'}
                {uploadProgress >= 20 && uploadProgress < 70 && 'Upload zu Supabase Storage...'}
                {uploadProgress >= 70 && uploadProgress < 95 && 'URL wird generiert...'}
                {uploadProgress >= 95 && 'Metadaten werden gespeichert...'}
              </p>
            </div>
          )}

          {unit.video && !isVideoUploading ? (
            <div className="space-y-4">
              {/* Video Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiVideo} className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{unit.video.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(unit.video.size / 1024 / 1024).toFixed(2)} MB • Hochgeladen am {new Date(unit.video.uploadedAt).toLocaleDateString('de-DE')}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 dark:text-green-400">Supabase Storage</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleVideoDownload}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                      title="Herunterladen"
                    >
                      <SafeIcon icon={FiDownload} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleVideoRemove}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                      title="Entfernen"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full max-h-96"
                  src={unit.video.publicUrl}
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    console.log('Trying to load video from:', unit.video.publicUrl);
                  }}
                >
                  <source src={unit.video.publicUrl} type={unit.video.type} />
                  Ihr Browser unterstützt keine Videowiedergabe.
                </video>
              </div>
            </div>
          ) : !isVideoUploading ? (
            <div className="text-center py-8">
              <SafeIcon icon={FiVideo} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Kein Video hochgeladen</p>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
                Video hochladen
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Maximale Dateigröße: 500MB • Wird in Supabase Storage gespeichert
              </p>
            </div>
          ) : null}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Comments Section - Only show if video exists */}
      {unit.video && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <SafeIcon icon={FiMessageCircle} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video-Kommentare</h3>
              {unit.video.comments && unit.video.comments.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                  {unit.video.comments.length}
                </span>
              )}
            </div>
          </div>

          <div className="p-4">
            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Kommentar zum Video hinzufügen..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <SafeIcon icon={FiSend} className="h-4 w-4 mr-2" />
                      Kommentar senden
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List - Newest First */}
            {unit.video.comments && unit.video.comments.length > 0 ? (
              <div className="space-y-4">
                {unit.video.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                            {comment.author.id === currentUser.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Noch keine Kommentare zum Video vorhanden.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTab;