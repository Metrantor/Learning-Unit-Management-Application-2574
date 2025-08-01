import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiEdit3, FiCheck, FiX, FiTag } = FiIcons;

const PREDEFINED_COLORS = [
  { name: 'Blau', value: '#3B82F6', bg: 'bg-blue-500', text: 'text-white' },
  { name: 'Grün', value: '#10B981', bg: 'bg-green-500', text: 'text-white' },
  { name: 'Rot', value: '#EF4444', bg: 'bg-red-500', text: 'text-white' },
  { name: 'Gelb', value: '#F59E0B', bg: 'bg-yellow-500', text: 'text-white' },
  { name: 'Lila', value: '#8B5CF6', bg: 'bg-purple-500', text: 'text-white' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500', text: 'text-white' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500', text: 'text-white' },
  { name: 'Orange', value: '#F97316', bg: 'bg-orange-500', text: 'text-white' },
  { name: 'Türkis', value: '#06B6D4', bg: 'bg-cyan-500', text: 'text-white' },
  { name: 'Grau', value: '#6B7280', bg: 'bg-gray-500', text: 'text-white' }
];

const TagsManager = ({ tags = [], onChange, selectedTags = [], onSelectionChange, showSelection = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTag, setNewTag] = useState({ label: '', color: PREDEFINED_COLORS[0].value });

  const handleAddTag = () => {
    if (!newTag.label.trim()) return;

    const tag = {
      id: uuidv4(),
      label: newTag.label.trim(),
      color: newTag.color,
      createdAt: new Date().toISOString()
    };

    onChange([...tags, tag]);
    setNewTag({ label: '', color: PREDEFINED_COLORS[0].value });
    setShowAddForm(false);
  };

  const handleEditTag = (tagId, updates) => {
    const updatedTags = tags.map(tag =>
      tag.id === tagId ? { ...tag, ...updates } : tag
    );
    onChange(updatedTags);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId) => {
    if (window.confirm('Möchten Sie diesen Tag wirklich löschen?')) {
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      onChange(updatedTags);
      
      // Remove from selection if it was selected
      if (selectedTags.includes(tagId)) {
        onSelectionChange(selectedTags.filter(id => id !== tagId));
      }
    }
  };

  const handleTagSelection = (tagId) => {
    if (!showSelection || !onSelectionChange) return;

    if (selectedTags.includes(tagId)) {
      onSelectionChange(selectedTags.filter(id => id !== tagId));
    } else {
      onSelectionChange([...selectedTags, tagId]);
    }
  };

  const getColorStyle = (colorValue) => {
    return {
      backgroundColor: colorValue,
      color: '#FFFFFF'
    };
  };

  const getColorClass = (colorValue) => {
    const colorObj = PREDEFINED_COLORS.find(c => c.value === colorValue);
    return colorObj ? `${colorObj.bg} ${colorObj.text}` : 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SafeIcon icon={FiTag} className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags {tags.length > 0 && `(${tags.length})`}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-1 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
        >
          <SafeIcon icon={FiPlus} className="h-3 w-3 mr-1" />
          Tag hinzufügen
        </button>
      </div>

      {/* Tags List */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="relative group">
              {editingTag === tag.id ? (
                <EditTagForm
                  tag={tag}
                  onSave={(updates) => handleEditTag(tag.id, updates)}
                  onCancel={() => setEditingTag(null)}
                />
              ) : (
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    showSelection
                      ? `cursor-pointer ${
                          selectedTags.includes(tag.id)
                            ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800'
                            : 'hover:opacity-80'
                        }`
                      : ''
                  }`}
                  style={getColorStyle(tag.color)}
                  onClick={() => handleTagSelection(tag.id)}
                >
                  <span>{tag.label}</span>
                  {selectedTags.includes(tag.id) && showSelection && (
                    <SafeIcon icon={FiCheck} className="h-3 w-3 ml-1" />
                  )}
                  {!showSelection && (
                    <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTag(tag.id);
                        }}
                        className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded"
                      >
                        <SafeIcon icon={FiEdit3} className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.id);
                        }}
                        className="p-0.5 hover:bg-white hover:bg-opacity-20 rounded"
                      >
                        <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Tag Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag-Name
              </label>
              <input
                type="text"
                value={newTag.label}
                onChange={(e) => setNewTag(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Tag-Name eingeben..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farbe auswählen
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTag(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                      newTag.color === color.value
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTag({ label: '', color: PREDEFINED_COLORS[0].value });
                }}
                className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddTag}
                disabled={!newTag.label.trim()}
                className="px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {tags.length === 0 && !showAddForm && (
        <div className="text-center py-4">
          <SafeIcon icon={FiTag} className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Noch keine Tags erstellt</p>
        </div>
      )}
    </div>
  );
};

const EditTagForm = ({ tag, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    label: tag.label,
    color: tag.color
  });

  const handleSave = () => {
    if (!editData.label.trim()) return;
    onSave(editData);
  };

  return (
    <div className="inline-flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
      <input
        type="text"
        value={editData.label}
        onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        autoFocus
      />
      <div className="flex space-x-1">
        {PREDEFINED_COLORS.slice(0, 5).map((color) => (
          <button
            key={color.value}
            onClick={() => setEditData(prev => ({ ...prev, color: color.value }))}
            className={`w-4 h-4 rounded-full ${color.bg} border transition-all ${
              editData.color === color.value
                ? 'border-gray-900 dark:border-white scale-110'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ))}
      </div>
      <button
        onClick={handleSave}
        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded"
      >
        <SafeIcon icon={FiCheck} className="h-3 w-3" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
      >
        <SafeIcon icon={FiX} className="h-3 w-3" />
      </button>
    </div>
  );
};

export default TagsManager;