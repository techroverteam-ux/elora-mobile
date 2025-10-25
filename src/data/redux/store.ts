import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import navigationReducer from './slices/navigationSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { dummyApi } from './services/dummyApi';
import { authApi } from './services/authApi';
import { sectionsApi } from './services/sectionsApi';
import { dashboardApi } from './services/dashboardApi';
import { mediaApi } from './services/mediaApi';
import { categoriesApi } from './services/categoriesApi';


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    navigation: navigationReducer,
    [dummyApi.reducerPath]: dummyApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [sectionsApi.reducerPath]: sectionsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dummyApi.middleware,
      authApi.middleware,
      sectionsApi.middleware,
      dashboardApi.middleware,
      mediaApi.middleware,
      categoriesApi.middleware,

    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;