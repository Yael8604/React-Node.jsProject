// src/store/examSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface ExamState { // ודא שזה מיוצא!
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [key: string]: string };
  status: 'idle' | 'succeeded' | 'loading' | 'failed'; // <--- זה חייב להיות מדויק
  error: string | null;
  timeLeft: number;
  examId: string | null;
}

const initialState: ExamState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  status: 'idle', // <--- ודא שמתחיל מ-idle
  error: null,
  timeLeft: 0,
  examId: null,
};

// פעולה אסינכרונית לטעינת שאלות
export const fetchExamQuestions = createAsyncThunk(
  'exam/fetchQuestions',
  async () => {
    // במימוש אמיתי: קריאת fetch ל-backend
    // const response = await fetch('http://localhost:3000/api/exam/questions');
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Failed to fetch questions');
    // }
    // const data = await response.json();
    // return data.questions as Question[];

    // מוק דאטה זמני
    const mockQuestions: Question[] = [
        { id: '1', text: 'מהי בירת צרפת?', options: ['לונדון', 'ברלין', 'פריז', 'רומא'] },
        { id: '2', text: 'כמה אצבעות יש ביד אחת?', options: ['שלוש', 'ארבע', 'חמש', 'שש'] },
        { id: '3', text: 'איזה כוכב לכת הוא "הכוכב האדום"?', options: ['ונוס', 'מאדים', 'יופיטר', 'שבתאי'] },
    ];
    return new Promise<Question[]>((resolve) => setTimeout(() => resolve(mockQuestions), 1000));
  }
);

// פעולה אסינכרונית לשליחת תשובות
export const submitExamAnswers = createAsyncThunk(
  'exam/submitAnswers',
  async (userAnswers: { [key: string]: string }, { getState }) => {
    // const state = getState() as { exam: ExamState };
    // const examId = state.exam.examId; // אם יש examId מנוהל בסטייט

    // במימוש אמיתי: קריאת fetch ל-backend
    // const response = await fetch('http://localhost:3000/api/exam/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ examId, answers: userAnswers }),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Failed to submit exam');
    // }
    // const resultData = await response.json();
    // return resultData; // לדוגמה, יחזיר את הציון או אישור

    // מוק דאטה זמני
    return new Promise<any>((resolve) => setTimeout(() => resolve({ score: 85, message: 'Exam submitted successfully!' }), 1000));
  }
);


const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // פעולות רגילות
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
    resetExam: (state) => {
        Object.assign(state, initialState); // איפוס כל הסטייט למצב התחלתי
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExamQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.questions = action.payload;
        state.currentQuestionIndex = 0; // אתחל אינדקס שאלה ראשוני
        state.userAnswers = {}; // אאפס תשובות משתמש
        state.timeLeft = 60 * 30; // לדוגמה: 30 דקות לבחינה
        // ייתכן שתרצה גם לקבל examId מהשרת כאן
      })
      .addCase(fetchExamQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load questions';
      })
      .addCase(submitExamAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitExamAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // כאן ניתן לטפל בתוצאת השליחה אם יש צורך
        // לדוגמה, לשמור ציון אם הוא מגיע בתגובה
        // state.score = action.payload.score;
      })
      .addCase(submitExamAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to submit exam';
      });
  },
});

export const { setAnswer, nextQuestion, previousQuestion, decrementTime, resetExam } = examSlice.actions;

export default examSlice.reducer;