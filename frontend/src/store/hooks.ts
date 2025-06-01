// src/store/hooks.ts

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
// **חשוב מאוד:** ייבא את הטיפוסים מתוך קובץ ה-store הראשי שלך
import type { RootState, AppDispatch } from './store'; // הנתיב הזה חייב להיות מדויק

// השתמש ב-hooks האלה בכל האפליקציה במקום ב-useDispatch ו-useSelector הרגילים
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;