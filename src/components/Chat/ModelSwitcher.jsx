import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectModels, setModels, setModelsLoading, setModelsError } from '../../store/slices/modelsSlice';
import { selectSelectedModelId, setSelectedModelId } from '../../store/slices/chatStreamSlice';
import api from '../../services/api';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

const ModelSwitcher = () => {
  const dispatch = useDispatch();
  const models = useSelector(selectModels);
  const selectedModelId = useSelector(selectSelectedModelId);
  const loading = useSelector((state) => state.models.loading);
  const error = useSelector((state) => state.models.error);

  // Fetch models from API
  React.useEffect(() => {
    const fetchModels = async () => {
      if (models.length > 0) return; // Only fetch once
      dispatch(setModelsLoading());
      try {
        const response = await api.get('/models');
        const data = response.data;
        dispatch(setModels(data));
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

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer">
            <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C16 9.732 22.268 16 30 16C22.268 16 16 22.268 16 30C16 22.268 9.732 16 2 16C9.732 16 16 9.732 16 2Z" fill="url(#gemini-sparkle)"/>
              <defs>
                <linearGradient id="gemini-sparkle" x1="2" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10B981"/>
                  <stop offset="35%" stopColor="#3B82F6"/>
                  <stop offset="70%" stopColor="#EF4444"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
            </svg>
            <span>{selectedModel?.name || '2.5 Flash'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </MenuButton>
        </div>

        <MenuItems className="absolute left-0 mt-1.5 w-52 origin-top-left rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-30 text-xs focus:outline-none">
          {models.length === 0 ? (
            <div className="px-3.5 py-2 text-slate-400">Loading models...</div>
          ) : (
            models.map((model) => {
              const isSelected = selectedModelId === model.id;
              const isPro = model.name?.toLowerCase().includes('pro');
              return (
                <MenuItem key={model.id}>
                  {({ active }) => (
                    <button
                      onClick={() => handleModelChange(model.id)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between font-medium transition-colors ${
                        isSelected 
                          ? 'text-blue-600 bg-blue-50/60 dark:bg-blue-950/40' 
                          : active 
                          ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{model.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isPro 
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600' 
                          : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                      }`}>
                        {isPro ? 'Pro' : 'Fast'}
                      </span>
                    </button>
                  )}
                </MenuItem>
              );
            })
          )}
        </MenuItems>
      </Menu>
    </div>
  );
};

export default ModelSwitcher;
