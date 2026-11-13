import React from 'react';
import permataIcon from '../../assets/permata-icon.png';
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
          <MenuButton className="py-1.5 px-3 rounded-full  text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer">
            <img src={permataIcon} alt="Permata" className="w-3.5 h-3.5 object-contain" />
            <span>{selectedModel?.name || 'Permata Flash 1.0'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-600/70 dark:text-amber-400/70" />
          </MenuButton>
        </div>

        <MenuItems className="absolute left-0 mt-1.5 w-52 origin-top-left rounded-sm bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs focus:outline-none">
          {models.length === 0 ? (
            <div className="px-3.5 py-2 text-slate-400">Loading models...</div>
          ) : (
            models.map((model) => {
              const isSelected = selectedModelId === model.id;
              const isPro = model.name?.toLowerCase().includes('pro');
              const isFlash = model.name?.toLowerCase().includes('flash');
              return (
                <MenuItem key={model.id}>
                  {({ active }) => (
                    <button
                      onClick={() => handleModelChange(model.id)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between font-medium transition-colors ${
                        isSelected 
                          ? 'text-amber-800 dark:text-amber-300 bg-amber-200/10 font-semibold border-l-2 border-[#800020]' 
                          : active 
                          ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{model.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isPro 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50' 
                          : isFlash
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/50'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/40'
                      }`}>
                        {isPro ? 'Pro' : isFlash ? 'Flash' : 'Fast'}
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
