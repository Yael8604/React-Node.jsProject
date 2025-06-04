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
            currentQuestionIndex: number; // **הוספנו את זה כאן ל-PayloadAction**
            timeLeftInSection: number; // **הוספנו את זה כאן ל-PayloadAction**
        }>) => {
            // שינוי כאן: קבלת currentQuestionIndex ו-timeLeftInSection מה-payload
            const { 
                sessionId, 
                sections, 
                allQuestions, 
                currentSectionIndex, 
                userAnswers, 
                currentQuestionIndex: initialQuestionIndex, // שימוש בשם שונה כדי למנוע התנגשות
                timeLeftInSection: initialTimeLeftInSection // שימוש בשם שונה
            } = action.payload;

            state.sessionId = sessionId;
            state.sections = sections;
            state.questions = allQuestions;
            state.currentQuestionIndex = initialQuestionIndex; // **משתמשים בערך שהגיע מה-payload**
            state.userAnswers = userAnswers;
            state.currentSectionIndex = currentSectionIndex;

            // אתחל את זמן החלק הנוכחי באמצעות הערך שהגיע ב-payload
            state.timeLeftInSection = initialTimeLeftInSection;
            
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
            // בדיקת בטיחות: וודא שהחלק הנוכחי קיים ויש בו שאלות
            if (!currentSection || !currentSection.questions || currentSection.questions.length === 0) {
                console.warn("Cannot move to next question: current section or its questions are undefined/empty.");
                return;
            }

            const sectionStartQuestionId = currentSection.questions[0]?._id; // שימוש ב-?. כדי למנוע שגיאות אם המערך ריק
            const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === sectionStartQuestionId);
            
            // בדיקת בטיחות: וודא שאינדקס השאלה ההתחלתי נמצא
            if (sectionStartQuestionIndex === -1) {
                console.error("Could not find start question of current section in global questions array.");
                return;
            }

            const sectionEndQuestionIndex = sectionStartQuestionIndex + currentSection.questions.length - 1;

            if (state.currentQuestionIndex < state.questions.length - 1 && state.currentQuestionIndex < sectionEndQuestionIndex) {
                state.currentQuestionIndex += 1;
            } else if (state.currentQuestionIndex === sectionEndQuestionIndex && state.currentSectionIndex < state.sections.length - 1) {
                // אם הגענו לסוף החלק הנוכחי ויש עוד חלקים, קפוץ לחלק הבא
                state.currentSectionIndex += 1;
                const nextSection = state.sections[state.currentSectionIndex];
                // בדיקת בטיחות: וודא שהחלק הבא קיים ויש בו שאלות
                if (!nextSection || !nextSection.questions || nextSection.questions.length === 0) {
                    console.warn("Next section or its questions are undefined/empty, cannot set current question index for next section.");
                    return;
                }
                state.currentQuestionIndex = state.questions.findIndex(q => q._id === nextSection.questions[0]._id);
                state.timeLeftInSection = state.sections[state.currentSectionIndex].timeLimitSeconds; // אתחל את הטיימר לחלק הבא
            }
        },
        previousQuestion: (state) => {
            const currentSection = state.sections[state.currentSectionIndex];
            // בדיקת בטיחות: וודא שהחלק הנוכחי קיים ויש בו שאלות
            if (!currentSection || !currentSection.questions || currentSection.questions.length === 0) {
                console.warn("Cannot move to previous question: current section or its questions are undefined/empty.");
                return;
            }

            const sectionStartQuestionId = currentSection.questions[0]?._id; // שימוש ב-?.
            const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === sectionStartQuestionId);

            // בדיקת בטיחות: וודא שאינדקס השאלה ההתחלתי נמצא
            if (sectionStartQuestionIndex === -1) {
                console.error("Could not find start question of current section in global questions array for previous.");
                return;
            }

            if (state.currentQuestionIndex > 0 && state.currentQuestionIndex > sectionStartQuestionIndex) {
                state.currentQuestionIndex -= 1;
            } else if (state.currentQuestionIndex === sectionStartQuestionIndex && state.currentSectionIndex > 0) {
                // אם הגענו לתחילת החלק הנוכחי ויש חלקים קודמים
                state.currentSectionIndex -= 1;
                const prevSection = state.sections[state.currentSectionIndex];
                // בדיקת בטיחות: וודא שהחלק הקודם קיים ויש בו שאלות
                if (!prevSection || !prevSection.questions || prevSection.questions.length === 0) {
                    console.warn("Previous section or its questions are undefined/empty, cannot set current question index for previous.");
                    return;
                }
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
                const nextSection = state.sections[state.currentSectionIndex];
                // בדיקת בטיחות: וודא שהחלק הבא קיים ויש בו שאלות
                if (!nextSection || !nextSection.questions || nextSection.questions.length === 0) {
                    console.warn("Next section or its questions are undefined/empty during moveToNextSection.");
                    return;
                }
                state.currentQuestionIndex = state.questions.findIndex(q => q._id === nextSection.questions[0]._id);
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



// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Question, ExamSection } from '../../api/examApi'; // ייבוא חדש של ExamSection

// // ממשק עבור תשובה של משתמש כולל זמן תגובה
// export interface UserAnswerDetail {
//     answer: string;
//     timeTaken: number; // זמן תגובה במילישניות
// }

// // ממשק UserAnswers יכיל אובייקטים של UserAnswerDetail
// export interface UserAnswers {
//     [questionId: string]: UserAnswerDetail;
// }

// export interface ExamState {
//     sessionId: string | null; // חדש: מזהה הסשן מהשרת
//     sections: ExamSection[]; // חדש: מבנה הבחינה לפי חלקים
//     currentSectionIndex: number; // חדש: אינדקס החלק הנוכחי
//     questions: Question[]; // כל השאלות של הסשן, סדורות לפי הסדר הכללי
//     currentQuestionIndex: number; // אינדקס השאלה הנוכחית בתוך כלל השאלות
//     userAnswers: UserAnswers;
//     timeLeftInSection: number; // חדש: זמן שנותר לחלק הנוכחי בלבד
//     totalTimeLeft: number; // חדש: סך הזמן שנותר לכל הבחינה
//     examStatus: 'idle' | 'loading' | 'active' | 'completed' | 'error'; // חדש: מצב הבחינה
//     error: string | null; // חדש
// }

// const initialState: ExamState = {
//     sessionId: null,
//     sections: [],
//     currentSectionIndex: 0,
//     questions: [],
//     currentQuestionIndex: 0,
//     userAnswers: {},
//     timeLeftInSection: 0,
//     totalTimeLeft: 0,
//     examStatus: 'idle',
//     error: null,
// };

// const examSlice = createSlice({
//     name: 'exam',
//     initialState,
//     reducers: {
//         // חדש: אתחול הבחינה עם נתונים מהשרת (מבנה הסשן)
//         initializeExam: (state, action: PayloadAction<{
//             sessionId: string;
//             sections: ExamSection[];
//             allQuestions: Question[]; // כל השאלות בסשן, ממוזגות מכל החלקים
//             currentSectionIndex: number; // אינדקס החלק אם ממשיכים
//             userAnswers: { [questionId: string]: { answer: string; timeTaken: number } }; // תשובות קיימות
//         }>) => {
//             const { sessionId, sections, allQuestions, currentSectionIndex, userAnswers } = action.payload;
//             state.sessionId = sessionId;
//             state.sections = sections;
//             state.questions = allQuestions;
//             state.currentQuestionIndex = 0; // תמיד מתחילים מהשאלה הראשונה בסשן
//             state.userAnswers = userAnswers;
//             state.currentSectionIndex = currentSectionIndex;

//             // אתחל את זמן החלק הנוכחי
//             if (sections.length > 0 && currentSectionIndex < sections.length) {
//                 state.timeLeftInSection = sections[currentSectionIndex].timeLimitSeconds;
//             } else {
//                 state.timeLeftInSection = 0;
//             }
//             // חישוב זמן כולל נותר (אם ממשיכים סשן - מורכב יותר)
//             state.totalTimeLeft = sections.reduce((acc, section) => acc + section.timeLimitSeconds, 0); // נניח שזה הזמן המקסימלי
//             state.examStatus = 'active';
//             state.error = null;
//         },
//         setAnswer: (state, action: PayloadAction<{ questionId: string; answer: string; timeTaken: number }>) => {
//             state.userAnswers[action.payload.questionId] = {
//                 answer: action.payload.answer,
//                 timeTaken: action.payload.timeTaken
//             };
//         },
//         nextQuestion: (state) => {
//             const currentSection = state.sections[state.currentSectionIndex];
//             const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === currentSection.questions[0]._id);
//             const sectionEndQuestionIndex = sectionStartQuestionIndex + currentSection.questions.length - 1;

//             if (state.currentQuestionIndex < state.questions.length - 1 && state.currentQuestionIndex < sectionEndQuestionIndex) {
//                 state.currentQuestionIndex += 1;
//             } else if (state.currentQuestionIndex === sectionEndQuestionIndex && state.currentSectionIndex < state.sections.length - 1) {
//                 // אם הגענו לסוף החלק הנוכחי ויש עוד חלקים, קפוץ לחלק הבא
//                 state.currentSectionIndex += 1;
//                 state.currentQuestionIndex = state.questions.findIndex(q => q._id === state.sections[state.currentSectionIndex].questions[0]._id);
//                 state.timeLeftInSection = state.sections[state.currentSectionIndex].timeLimitSeconds; // אתחל את הטיימר לחלק הבא
//             }
//         },
//         previousQuestion: (state) => {
//             const currentSection = state.sections[state.currentSectionIndex];
//             const sectionStartQuestionIndex = state.questions.findIndex(q => q._id === currentSection.questions[0]._id);

//             if (state.currentQuestionIndex > 0 && state.currentQuestionIndex > sectionStartQuestionIndex) {
//                 state.currentQuestionIndex -= 1;
//             } else if (state.currentQuestionIndex === sectionStartQuestionIndex && state.currentSectionIndex > 0) {
//                 // אם הגענו לתחילת החלק הנוכחי ויש חלקים קודמים
//                 state.currentSectionIndex -= 1;
//                 const prevSection = state.sections[state.currentSectionIndex];
//                 state.currentQuestionIndex = state.questions.findIndex(q => q._id === prevSection.questions[prevSection.questions.length - 1]._id);
//                 state.timeLeftInSection = prevSection.timeLimitSeconds; // אתחל את הטיימר לחלק הקודם
//             }
//         },
//         decrementTime: (state) => {
//             if (state.timeLeftInSection > 0) {
//                 state.timeLeftInSection -= 1;
//             }
//             if (state.totalTimeLeft > 0) {
//                 state.totalTimeLeft -= 1;
//             }
//         },
//         // חדש: מעבר לחלק הבא באופן יזום (למשל כשהזמן נגמר)
//         moveToNextSection: (state) => {
//             if (state.currentSectionIndex < state.sections.length - 1) {
//                 state.currentSectionIndex += 1;
//                 // עדכן את השאלה הנוכחית לתחילת החלק החדש
//                 state.currentQuestionIndex = state.questions.findIndex(q => q._id === state.sections[state.currentSectionIndex].questions[0]._id);
//                 state.timeLeftInSection = state.sections[state.currentSectionIndex].timeLimitSeconds; // אתחל את הטיימר לחלק החדש
//             } else {
//                 state.examStatus = 'completed'; // סיים את הבחינה אם אין יותר חלקים
//             }
//         },
//         resetExam: (state) => {
//             Object.assign(state, initialState);
//         },
//         setExamStatus: (state, action: PayloadAction<ExamState['examStatus']>) => {
//             state.examStatus = action.payload;
//         },
//         setExamError: (state, action: PayloadAction<string | null>) => {
//             state.error = action.payload;
//             state.examStatus = 'error';
//         },
//     },
// });

// export const {
//     initializeExam,
//     setAnswer,
//     nextQuestion,
//     previousQuestion,
//     decrementTime,
//     moveToNextSection,
//     resetExam,
//     setExamStatus,
//     setExamError
// } = examSlice.actions;
// export default examSlice.reducer;

