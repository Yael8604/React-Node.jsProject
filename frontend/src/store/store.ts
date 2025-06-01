// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import examReducer from './slices/examSlice'; // נתיב חדש
// import authReducer from './slices/authSlice'; // אם תחליט להוסיף slice לאימות

export const store = configureStore({
  reducer: {
    exam: examReducer,
    // auth: authReducer, // הוסף כאן את כל ה-reducers של ה-slices שלך
  },
});

// ייצוא טיפוסים עבור ה-store (לשימוש ב-hooks)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;