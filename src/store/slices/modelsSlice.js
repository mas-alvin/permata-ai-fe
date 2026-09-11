import { createSlice } from '@reduxjs/toolkit';

const modelsSlice = createSlice({
  name: 'models',
  initialState: {
    models: [],
    loading: false,
    error: null,
  },
  reducers: {
    setModels(state, action) {
      state.models = action.payload;
      state.loading = false;
    },
    setModelsLoading(state) {
      state.loading = true;
    },
    setModelsError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setModels, setModelsLoading, setModelsError } = modelsSlice.actions;

const emptyModelsArray = [];
export const selectModels = (state) => state.models.models.length > 0 ? state.models.models : emptyModelsArray;
export const selectModelsLoading = (state) => state.models.loading;

export default modelsSlice.reducer;
