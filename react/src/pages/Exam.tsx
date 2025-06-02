// src/pages/Exam.tsx (הקובץ המעודכן לשימוש ב-React Query ו-Redux ל-Client State)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';

// ייבוא ה-hooks של React Query מהקובץ
import { useExamQuestions, useSubmitExam } from '../api/examApi';

import {
  setAnswer,
  nextQuestion,
  previousQuestion,
  decrementTime,
  resetExam,
  setQuestions // ייבוא פעולה חדשה לאתחול השאלות מה-slice
} from '../store/slices/examSlice';

const Exam: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ***** שימוש ב-React Query לאחזור נתוני שרת (שאלות הבחינה) *****
  const { data: questionsData, isLoading, isError, error } = useExamQuestions();

  // ***** שימוש ב-Redux עבור Client State (שאלות הבחינה הנוכחית, תשובות משתמש, טיימר) *****
  const { questions, currentQuestionIndex, userAnswers, timeLeft } = useAppSelector(
    (state) => state.exam
  );

  // ***** שימוש ב-React Query לשליחת נתוני שרת (שליחת תשובות) *****
  const { mutate: submitExam, isPending: isSubmitting } = useSubmitExam();

  // טעינת שאלות בפעם הראשונה לסטייט של Redux
  // useEffect זה יפעל רק פעם אחת כשהנתונים יגיעו בהצלחה
  useEffect(() => {
    if (questionsData && questions.length === 0) { // אם הנתונים הגיעו וסטייט הרדקס ריק
      dispatch(setQuestions(questionsData)); // אתחל את השאלות בסטייט של רדקס
    }
  }, [questionsData, dispatch, questions.length]);

  // לוגיקה של שעון עצר (Client State)
  useEffect(() => {
    // השעון יתחיל רק אם יש שאלות (כלומר, הבחינה התחילה)
    if (questions.length > 0 && timeLeft > 0 && !isLoading && !isSubmitting) {
      const timer = setInterval(() => {
        dispatch(decrementTime());
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && questions.length > 0 && !isSubmitting) {
      // הזמן אזל, שלח בחינה אוטומטית
      submitExam(userAnswers, {
        onSuccess: () => {
          dispatch(resetExam());
          navigate('/results');
        },
        onError: (err) => {
          console.error("Auto-submit failed:", err);
          // ניתן להציג הודעת שגיאה למשתמש
        }
      });
    }
  }, [timeLeft, questions.length, isLoading, isSubmitting, dispatch, submitExam, userAnswers, navigate]);


  const handleAnswerChange = (questionId: string, answer: string) => {
    dispatch(setAnswer({ questionId, answer }));
  };

  const handleNext = () => {
    dispatch(nextQuestion());
  };

  const handlePrevious = () => {
    dispatch(previousQuestion());
  };

  const handleSubmitExam = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לסיים את הבחינה? לא תוכל לחזור ולשנות תשובות.')) {
      submitExam(userAnswers, { // קריאה ל-mutate של React Query
        onSuccess: () => {
          dispatch(resetExam()); // איפוס הסטייט של הבחינה ב-Redux
          navigate('/results');
        },
        onError: (err) => {
          console.error("Manual submit failed:", err);
          // ניתן להציג הודעת שגיאה למשתמש
        }
      });
    }
  };

  // מצבי טעינה ושגיאה מטופלים עכשיו ישירות על ידי React Query
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-semibold text-gray-700">
        טוען שאלות...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        שגיאה בטעינת שאלות: {error?.message}
      </div>
    );
  }

  // רק לאחר שהנתונים נטענו, נבדוק אם יש שאלות
  if (!questionsData || questionsData.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        לא נמצאו שאלות לבחינה.
      </div>
    );
  }

  // מכאן והלאה נשתמש ב-questions מסטייט הרדקס
  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="container mx-auto p-8 max-w-xl bg-white rounded-lg shadow-xl mt-10">
      <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">בחינה פסיכוטכנית</h3>

      <div className="text-right mb-4">
        <p className="text-lg font-medium text-gray-600">
          שאלה {currentQuestionIndex + 1} מתוך {questions.length}
        </p>
        <p className={`text-sm font-bold ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
          זמן שנותר: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
        <p className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion?.text}</p> {/* הוספתי ? ליתר ביטחון */}
        <div className="space-y-3">
          {currentQuestion?.options.map((option: string, index: number) => ( // הוספתי ? ליתר ביטחון
            <label key={index} className="flex items-center text-lg cursor-pointer">
              <input
                type="radio"
                name={currentQuestion.id}
                value={option}
                checked={userAnswers[currentQuestion.id] === option}
                onChange={() => handleAnswerChange(currentQuestion.id, option)}
                className="form-radio h-5 w-5 text-primary-600 transition-colors duration-200"
              />
              <span className="mr-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isLoading || isSubmitting}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          הקודם
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={isLoading || isSubmitting}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הבא
          </button>
        ) : (
          <button
            onClick={handleSubmitExam}
            disabled={isLoading || isSubmitting}
            className="bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'שולח...' : 'סיים בחינה'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Exam;