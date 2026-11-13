import React from 'react';
import permataIcon from '../../assets/permata-icon.png';
import permataIconDark from '../../assets/permata-icon-dark.png';
import { useDispatch, useSelector } from 'react-redux';
import { selectModels, setModels, setModelsLoading, setModelsError } from '../../store/slices/modelsSlice';
import { selectSelectedModelId, setSelectedModelId } from '../../store/slices/chatStreamSlice';
import api from '../../services/api';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

const ModelSwitcher = ({ dropUp = false, inInput = false }) => {
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
          <MenuButton
            className={
              inInput
                ? 'py-1 px-2 sm:px-2.5 bg-slate-50 dark:bg-[#1c1720] hover:bg-slate-100 dark:hover:bg-[#251e2a] text-slate-700 dark:text-slate-300 font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer'
                : 'py-1.5 px-3 rounded-full text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer'
            }
          >
            {/* <img src={permataIcon} alt="Permata" className="w-3.5 h-3.5 object-contain dark:hidden" />
            <img src={permataIconDark} alt="Permata" className="w-3.5 h-3.5 object-contain hidden dark:block" /> */}
            <span className="truncate max-w-[130px]">{selectedModel?.name || 'Permata Flash 1.0'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-50 dark:text-slate-50" />
          </MenuButton>
        </div>

        <MenuItems
          className={`absolute left-0 w-56 z-50 text-xs focus:outline-none overflow-hidden rounded-2xl bg-white dark:bg-[#19151d] shadow-2xl border border-slate-200 dark:border-[#2a222c] py-1.5 ${
            dropUp ? 'bottom-full mb-1.5 origin-bottom-left' : 'top-full mt-1.5 origin-top-left'
          }`}
        >
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
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between font-medium transition-colors cursor-pointer ${
                        isSelected 
                          ? 'text-[#6a0017] dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 font-semibold border-l-2 border-[#800020] dark:border-amber-400' 
                          : active 
                          ? 'bg-slate-50 dark:bg-[#201a24] text-slate-900 dark:text-slate-100' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{model.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isPro 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50' 
                          : isFlash
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/50 dark:border-rose-700/50'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40'
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
