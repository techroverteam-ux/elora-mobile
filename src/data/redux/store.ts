import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { dummyApi } from './services/dummyApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [dummyApi.reducerPath]: dummyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dummyApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;