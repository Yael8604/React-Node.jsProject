// src/store/slices/examSlice.ts (הקובץ המעודכן)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// טיפוסי Question ייובאו כעת מ-src/api/examApi.ts
import { Question, UserAnswers } from '../../api/examApi'; // ודא נתיב נכון

export interface ExamState {
  questions: Question[]; // נתונים אלו יועברו עכשיו מה-props או ממקום אחר
  currentQuestionIndex: number;
  userAnswers: UserAnswers; // שונה ל-UserAnswers
  // מצבי status ו-error יטופלו עכשיו ישירות על ידי React Query
  // status: 'idle' | 'loading' | 'succeeded' | 'failed';
  // error: string | null;
  timeLeft: number;
  examId: string | null; // זה עדיין יכול להיות חלק מה-Client State אם הוא מנוהל בצד הלקוח
}

const initialState: ExamState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  // status: 'idle', // הוסר
  // error: null, // הוסר
  timeLeft: 60 * 30, // זמן התחלתי, אם הוא קבוע או מגיע מ-Client State
  examId: null,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // פעולות רגילות (Client State)
    setAnswer: (state, action: PayloadAction<{ questionId: string; answer: string }>) => {
      state.userAnswers[action.payload.questionId] = action.payload.answer;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    decrementTime: (state) => {
      state.timeLeft -= 1;
    },
    // פעולה זו תשמש לאתחול שאלות שהתקבלו מ-React Query
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.userAnswers = {};
      state.timeLeft = 60 * 30; // אתחל את זמן הבחינה כאן אם הוא קשור לטעינת שאלות
    },
    resetExam: (state) => {
      Object.assign(state, initialState); // איפוס כל הסטייט למצב התחלתי
    }
  },
  // extraReducers יוסר מכיוון שאין יותר createAsyncThunks כאן
  // extraReducers: (builder) => { ... }
});

export const { setAnswer, nextQuestion, previousQuestion, decrementTime, setQuestions, resetExam } = examSlice.actions;

export default examSlice.reducer;