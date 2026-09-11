import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectModels, setModels, setModelsLoading, setModelsError } from '../../store/slices/modelsSlice';
import { selectSelectedModelId, setSelectedModelId } from '../../store/slices/chatStreamSlice';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const ModelSwitcher = () => {
  const dispatch = useDispatch();
  const models = useSelector(selectModels);
  const selectedModelId = useSelector(selectSelectedModelId);
  const loading = useSelector((state) => state.models.loading);
  const error = useSelector((state) => state.models.error);

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      if (models.length > 0) return; // Only fetch once
      dispatch(setModelsLoading());
      try {
        const response = await fetch('http://localhost:8011/api/models', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        dispatch(setModels(data));
        // Set default selected model if none selected
        if (!selectedModelId && data.length > 0) {
          dispatch(setSelectedModelId(data[0].id));
        }
      } catch (err) {
        dispatch(setModelsError(err.message));
      }
    };

    fetchModels();
  }, [dispatch, models.length, selectedModelId]);

  const handleModelChange = (modelId) => {
    dispatch(setSelectedModelId(modelId));
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  if (loading) {
    return (
      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <span className="text-sm text-gray-500">Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <span className="text-sm text-red-600">Error loading models</span>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <span className="text-sm text-gray-500">No models available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <span className="flex items-center">
              {selectedModel?.name || 'Select Model'}
            </span>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </MenuButton>
        </div>

        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {models.map((model) => (
            <MenuItem key={model.id}>
              {({ active }) => (
                <button
                  onClick={() => handleModelChange(model.id)}
                  className={`${selectedModelId === model.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center rounded-md px-2 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  <span className="truncate">{model.name}</span>
                  {selectedModelId === model.id && (
                    <span className="ml-auto text-indigo-600">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};

export default ModelSwitcher;
