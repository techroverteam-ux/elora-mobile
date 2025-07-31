import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  previousRoute: string | null;
}

const initialState: NavigationState = {
  previousRoute: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setPreviousRoute(state, action: PayloadAction<string | null>) {
      state.previousRoute = action.payload;
    },
  },
});

export const { setPreviousRoute } = navigationSlice.actions;
export default navigationSlice.reducer;