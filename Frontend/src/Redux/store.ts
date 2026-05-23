;
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // middleware and devTools are fine with defaults from RTK
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;