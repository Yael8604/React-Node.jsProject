// src/pages/Exam.tsx (הקובץ המתוקן)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ****** הסר את שתי השורות האלה לגמרי ******
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../store/store'; // ייבוא ה-types

// ****** השאר רק את הייבוא הזה ******
import { useAppSelector, useAppDispatch } from '../store/hooks'; 

import {
  fetchExamQuestions,
  setAnswer,
  nextQuestion,
  previousQuestion,
  submitExamAnswers,
  decrementTime,
  resetExam
} from '../store/slices/examSlice'; // ודא שנתיב זה נכון

const Exam: React.FC = () => {
  const navigate = useNavigate();
  // ****** השתמש ב-useAppDispatch בלבד. אין צורך בפרשנות טיפוס ידנית. ******
  const dispatch = useAppDispatch(); 

  // ****** השתמש ב-useAppSelector בלבד. אין צורך בפרשנות טיפוס ידנית. ******
  const { questions, currentQuestionIndex, userAnswers, status, error, timeLeft } = useAppSelector(
    (state) => state.exam // TypeScript ידע לבד ש-state הוא RootState
  );

  // טעינת שאלות בפעם הראשונה
  useEffect(() => {
    // השוואה זו ל-status === 'idle' הייתה הבעיה המקורית, ועכשיו עם useAppSelector נכון היא תעבוד.
    if (status === 'idle') {
      dispatch(fetchExamQuestions());
    }
  }, [status, dispatch]);

  // לוגיקה של שעון עצר (פשוטה)
  useEffect(() => {
    if (status === 'succeeded' && timeLeft > 0) {
      const timer = setInterval(() => {
        dispatch(decrementTime());
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && status === 'succeeded') {
      // הזמן אזל, שלח בחינה אוטומטית
      dispatch(submitExamAnswers(userAnswers)).then(() => {
        dispatch(resetExam()); // אופציונלי: איפוס הסטייט של הבחינה
        navigate('/results');
      });
    }
  }, [timeLeft, status, dispatch, userAnswers, navigate]);

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
      await dispatch(submitExamAnswers(userAnswers));
      dispatch(resetExam()); // אופציונלי: איפוס הסטייט של הבחינה
      navigate('/results');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-semibold text-gray-700">
        טוען שאלות...
      </div>
    );
  }

  if (status === 'failed' || error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        שגיאה: {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        לא נמצאו שאלות לבחינה.
      </div>
    );
  }

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
        <p className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion.text}</p>
        <div className="space-y-3">
          {/* ****** תיקון שגיאות 'implicitly has any type' ****** */}
          {/* הטיפוסים Question ו-options הוגדרו, אז TypeScript יסיק אותם. */}
          {currentQuestion.options.map((option: string, index: number) => ( // אפשר לפרש במפורש לבהירות
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
          disabled={currentQuestionIndex === 0 || status === 'loading'}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          הקודם
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={status === 'loading'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הבא
          </button>
        ) : (
          <button
            onClick={handleSubmitExam}
            disabled={status === 'loading'}
            className="bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            סיים בחינה
          </button>
        )}
      </div>
    </div>
  );
};

export default Exam;