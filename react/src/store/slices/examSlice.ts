import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, ExamSection } from '../../api/examApi'; // ייבוא חדש של ExamSection

// ממשק עבור תשובה של משתמש כולל זמן תגובה
export interface UserAnswerDetail {
    answer: string;
    timeTaken: number; // זמן תגובה במילישניות
}

// ממשק UserAnswers יכיל אובייקטים של UserAnswerDetail
export interface UserAnswers {
    [questionId: string]: UserAnswerDetail;
}

export interface ExamState {
    sessionId: string | null; // חדש: מזהה הסשן מהשרת
    sections: ExamSection[]; // חדש: מבנה הבחינה לפי חלקים
    currentSectionIndex: number; // חדש: אינדקס החלק הנוכחי
    questions: Question[]; // כל השאלות של הסשן, סדורות לפי הסדר הכללי
    currentQuestionIndex: number; // אינדקס השאלה הנוכחית בתוך כלל השאלות
    userAnswers: UserAnswers;
    timeLeftInSection: number; // חדש: זמן שנותר לחלק הנוכחי בלבד
    totalTimeLeft: number; // חדש: סך הזמן שנותר לכל הבחינה
    examStatus: 'idle' | 'loading' | 'active' | 'completed' | 'error'; // חדש: מצב הבחינה
    error: string | null; // חדש
}

const initialState: ExamState = {
    sessionId: null,
    sections: [],
    currentSectionIndex: 0,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    timeLeftInSection: 0,
    totalTimeLeft: 0,
    examStatus: 'idle',
    error: null,
};

const examSlice = createSlice({
    name: 'exam',
    initialState,
    reducers: {
        // חדש: אתחול הבחינה עם נתונים מהשרת (מבנה הסשן)
        initializeExam: (state, action: PayloadAction<{
            sessionId: string;
            sections: ExamSection[];
            allQuestions: Question[]; // כל השאלות בסשן, ממוזגות מכל החלקים
            currentSectionIndex: number; // אינדקס החלק אם ממשיכים
            userAnswers: { [questionId: string]: { answer: string; timeTaken: number } }; // תשובות קיימות
        }>) => {
            const { sessionId, sections, allQuestions, currentSectionIndex, userAnswers } = action.payload;
            state.sessionId = sessionId;
            state.sections = sections;
            state.questions = allQuestions;
            state.currentQuestionIndex = 0; // תמיד מתחילים מהשאלה הראשונה בסשן
            state.userAnswers = userAnswers;
            state.currentSectionIndex = currentSectionIndex;

            // אתחל את זמן החלק הנוכחי
            if (sections.length > 0 && currentSectionIndex < sections.length) {
                state.timeLeftInSection = sections[currentSectionIndex].timeLimitSeconds;
            } else {
                state.timeLeftInSection = 0;
            }
            // חישוב זמן כולל נותר (אם ממשיכים סשן - מורכב יותר)
            state.totalTimeLeft = sections.reduce((acc, section) => acc + section.timeLimitSeconds, 0); // נניח שזה הזמן המקסימלי
            state.examStatus = 'active';
            state.error = null;
        },
        setAnswer: (state, action: PayloadAction<{ questionId: string; answer: string; timeTaken: number }>) => {
            state.userAnswers[action.payload.questionId] = {
                answer: action.payload.answer,
                timeTaken: action.payload.timeTaken
            };
        },
        nextQuestion: (state) => {
            const currentSection = state.sections[state.currentSectionIndex];
            const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === currentSection.questions[0]._id);
            const sectionEndQuestionIndex = sectionStartQuestionIndex + currentSection.questions.length - 1;

            if (state.currentQuestionIndex < state.questions.length - 1 && state.currentQuestionIndex < sectionEndQuestionIndex) {
                state.currentQuestionIndex += 1;
            } else if (state.currentQuestionIndex === sectionEndQuestionIndex && state.currentSectionIndex < state.sections.length - 1) {
                // אם הגענו לסוף החלק הנוכחי ויש עוד חלקים, קפוץ לחלק הבא
                state.currentSectionIndex += 1;
                state.currentQuestionIndex = state.questions.findIndex(q => q._id === state.sections[state.currentSectionIndex].questions[0]._id);
                state.timeLeftInSection = state.sections[state.currentSectionIndex].timeLimitSeconds; // אתחל את הטיימר לחלק הבא
            }
        },
        previousQuestion: (state) => {
            const currentSection = state.sections[state.currentSectionIndex];
            const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === currentSection.questions[0]._id);

            if (state.currentQuestionIndex > 0 && state.currentQuestionIndex > sectionStartQuestionIndex) {
                state.currentQuestionIndex -= 1;
            } else if (state.currentQuestionIndex === sectionStartQuestionIndex && state.currentSectionIndex > 0) {
                // אם הגענו לתחילת החלק הנוכחי ויש חלקים קודמים
                state.currentSectionIndex -= 1;
                const prevSection = state.sections[state.currentSectionIndex];
                state.currentQuestionIndex = state.questions.findIndex(q => q._id === prevSection.questions[prevSection.questions.length - 1]._id);
                state.timeLeftInSection = prevSection.timeLimitSeconds; // אתחל את הטיימר לחלק הקודם
            }
        },
        decrementTime: (state) => {
            if (state.timeLeftInSection > 0) {
                state.timeLeftInSection -= 1;
            }
            if (state.totalTimeLeft > 0) {
                state.totalTimeLeft -= 1;
            }
        },
        // חדש: מעבר לחלק הבא באופן יזום (למשל כשהזמן נגמר)
        moveToNextSection: (state) => {
            if (state.currentSectionIndex < state.sections.length - 1) {
                state.currentSectionIndex += 1;
                // עדכן את השאלה הנוכחית לתחילת החלק החדש
                state.currentQuestionIndex = state.questions.findIndex(q => q._id === state.sections[state.currentSectionIndex].questions[0]._id);
                state.timeLeftInSection = state.sections[state.currentSectionIndex].timeLimitSeconds; // אתחל את הטיימר לחלק החדש
            } else {
                state.examStatus = 'completed'; // סיים את הבחינה אם אין יותר חלקים
            }
        },
        resetExam: (state) => {
            Object.assign(state, initialState);
        },
        setExamStatus: (state, action: PayloadAction<ExamState['examStatus']>) => {
            state.examStatus = action.payload;
        },
        setExamError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.examStatus = 'error';
        },
    },
});

export const {
    initializeExam,
    setAnswer,
    nextQuestion,
    previousQuestion,
    decrementTime,
    moveToNextSection,
    resetExam,
    setExamStatus,
    setExamError
} = examSlice.actions;
export default examSlice.reducer;

// // src/store/slices/examSlice.ts (הקובץ המעודכן)
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// // טיפוסי Question ייובאו כעת מ-src/api/examApi.ts
// import { Question, UserAnswers } from '../../api/examApi'; // ודא נתיב נכון

// export interface ExamState {
//   questions: Question[]; // נתונים אלו יועברו עכשיו מה-props או ממקום אחר
//   currentQuestionIndex: number;
//   userAnswers: UserAnswers; // שונה ל-UserAnswers
//   // מצבי status ו-error יטופלו עכשיו ישירות על ידי React Query
//   // status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   // error: string | null;
//   timeLeft: number;
//   examId: string | null; // זה עדיין יכול להיות חלק מה-Client State אם הוא מנוהל בצד הלקוח
// }

// const initialState: ExamState = {
//   questions: [],
//   currentQuestionIndex: 0,
//   userAnswers: {},
//   // status: 'idle', // הוסר
//   // error: null, // הוסר
//   timeLeft: 60 * 30, // זמן התחלתי, אם הוא קבוע או מגיע מ-Client State
//   examId: null,
// };

// const examSlice = createSlice({
//   name: 'exam',
//   initialState,
//   reducers: {
//     // פעולות רגילות (Client State)
//     setAnswer: (state, action: PayloadAction<{ questionId: string; answer: string }>) => {
//       state.userAnswers[action.payload.questionId] = action.payload.answer;
//     },
//     nextQuestion: (state) => {
//       if (state.currentQuestionIndex < state.questions.length - 1) {
//         state.currentQuestionIndex += 1;
//       }
//     },
//     previousQuestion: (state) => {
//       if (state.currentQuestionIndex > 0) {
//         state.currentQuestionIndex -= 1;
//       }
//     },
//     decrementTime: (state) => {
//       state.timeLeft -= 1;
//     },
//     // פעולה זו תשמש לאתחול שאלות שהתקבלו מ-React Query
//     setQuestions: (state, action: PayloadAction<Question[]>) => {
//       state.questions = action.payload;
//       state.currentQuestionIndex = 0;
//       state.userAnswers = {};
//       state.timeLeft = 60 * 30; // אתחל את זמן הבחינה כאן אם הוא קשור לטעינת שאלות
//     },
//     resetExam: (state) => {
//       Object.assign(state, initialState); // איפוס כל הסטייט למצב התחלתי
//     }
//   },
//   // extraReducers יוסר מכיוון שאין יותר createAsyncThunks כאן
//   // extraReducers: (builder) => { ... }
// });

// export const { setAnswer, nextQuestion, previousQuestion, decrementTime, setQuestions, resetExam } = examSlice.actions;

// export default examSlice.reducer;