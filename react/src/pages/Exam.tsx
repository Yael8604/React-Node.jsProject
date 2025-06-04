// import React, { useEffect, useRef, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAppSelector, useAppDispatch } from '../store/hooks';
// import {
//     useStartPsychotechnicalExam,
//     useSubmitSingleAnswer,
//     useEndTestSession,
//     useMoveToNextSection,
//     Question,
//     ExamSection,
// } from '../api/examApi';
// import {
//     setAnswer,
//     nextQuestion,
//     previousQuestion,
//     decrementTime,
//     resetExam,
//     initializeExam,
//     moveToNextSection,
//     setExamStatus,
//     setExamError,
// } from '../store/slices/examSlice';

// const Exam: React.FC = () => {
//     const navigate = useNavigate();
//     const dispatch = useAppDispatch();

//     // React Query Hooks
//     const { data: examData, isLoading: isExamLoading, isError: isExamError, error: examError } = useStartPsychotechnicalExam();
//     const { mutate: submitAnswer, isPending: isSubmittingAnswer } = useSubmitSingleAnswer();
//     const { mutate: endSession, isPending: isEndingSession } = useEndTestSession();
//     const { mutate: goToNextSection, isPending: isMovingToNextSection } = useMoveToNextSection();

//     // Redux State
//     const {
//         sessionId,
//         sections,
//         currentSectionIndex,
//         questions,
//         currentQuestionIndex,
//         userAnswers,
//         timeLeftInSection,
//         totalTimeLeft,
//         examStatus,
//         error: reduxError,
//     } = useAppSelector((state) => state.exam);

//     // Ref לשמירת זמן תחילת השאלה
//     const questionStartTime = useRef<number>(Date.now());

//     // Effect לאתחול הבחינה ברגע שהנתונים מגיעים מ-React Query
//     useEffect(() => {
//         if (examData && examStatus === 'idle') {
//             // Flatten all questions into a single array, preserving order
//             const allQuestions: Question[] = [];
//             examData.sections.forEach(section => {
//                 allQuestions.push(...section.questions);
//             });

//             dispatch(initializeExam({
//                 sessionId: examData.sessionId,
//                 sections: examData.sections,
//                 allQuestions: allQuestions,
//                 currentSectionIndex: examData.currentSectionIndex,
//                 userAnswers: examData.userAnswers, // Include existing answers if resuming
//             }));
//             questionStartTime.current = Date.now(); // אתחל זמן תחילת השאלה
//         }
//     }, [examData, examStatus, dispatch]);

//     // לוגיקה של שעון עצר לחלק הנוכחי
//     useEffect(() => {
//         if (examStatus === 'active' && timeLeftInSection > 0) {
//             const timer = setInterval(() => {
//                 dispatch(decrementTime());
//             }, 1000);
//             return () => clearInterval(timer);
//         } else if (examStatus === 'active' && timeLeftInSection === 0 && sections.length > 0) {
//             // הזמן לחלק הנוכחי אזל
//             if (currentSectionIndex < sections.length - 1) {
//                 // אם יש עוד חלקים, עבור לחלק הבא
//                 console.log(`Time's up for section ${sections[currentSectionIndex].sectionName}. Moving to next section.`);
//                 goToNextSection({ sessionId: sessionId!, nextSectionIndex: currentSectionIndex + 1 });
//                 dispatch(moveToNextSection()); // עדכן את הסטייט של Redux
//             } else {
//                 // אם אין יותר חלקים, סיים את הבחינה
//                 console.log("Time's up for the last section. Ending exam.");
//                 if (sessionId && !isEndingSession) {
//                     endSession(sessionId, {
//                         onSuccess: () => {
//                             dispatch(setExamStatus('completed'));
//                             navigate('/results'); // נווט לעמוד התוצאות
//                         },
//                         onError: (err) => {
//                             dispatch(setExamError(err.message));
//                             console.error("Auto-end session failed:", err);
//                         }
//                     });
//                 }
//             }
//         }
//     }, [timeLeftInSection, examStatus, sections, currentSectionIndex, sessionId, dispatch, goToNextSection, endSession, navigate, isEndingSession]);

//     // עדכן זמן תחילת השאלה בכל פעם שהשאלה הנוכחית או החלק משתנים
//     useEffect(() => {
//         questionStartTime.current = Date.now();
//     }, [currentQuestionIndex, currentSectionIndex]);

//     // // פונקציה לטיפול בשינוי תשובה
//     // const handleAnswerChange = (questionId: string, answer: string) => {
//     //     if (!sessionId) {
//     //         console.error("Session ID is missing, cannot submit answer.");
//     //         return;
//     //     }

//     //     const timeTaken = Date.now() - questionStartTime.current; // זמן שלקח לענות במילישניות

//     //     // שלח את התשובה לשרת
//     //     submitAnswer({
//     //         sessionId: sessionId,
//     //         questionId: questionId,
//     //         answer: answer,
//     //         timeTaken: timeTaken,
//     //         currentSectionIndex: currentSectionIndex,
//     //     }, {
//     //         onSuccess: () => {
//     //             // אם השליחה לשרת הצליחה, עדכן את ה-Redux state
//     //             dispatch(setAnswer({ questionId, answer, timeTaken }));
//     //             console.log(`Answer for ${questionId} submitted and saved locally.`);
//     //         },
//     //         onError: (err) => {
//     //             console.error("Failed to submit answer:", err);
//     //             alert(`שגיאה בשליחת תשובה: ${err.message}`);
//     //             // אל תעדכן את ה-Redux state אם השליחה נכשלה, או טפל בזה אחרת
//     //         }
//     //     });
//     // };

//     // פונקציה לטיפול בשינוי תשובה
// const handleAnswerChange = (questionId: string, answer: string) => {
//     // שלב 1: בדיקה ראשונית ל-sessionId
//     if (!sessionId) {
//         console.error("Session ID is missing, cannot submit answer.");
//         return;
//     }

//     // שלב 2: חישוב timeTaken
//     const timeTaken = Date.now() - questionStartTime.current; // זמן שלקח לענות במילישניות

//     // שלב 3: יצירת אובייקט הנתונים לשליחה
//     // אנו יוצרים כאן משתנה 'submissionData' כדי להקל על הצגת הלוגים
//     const submissionData = {
//         sessionId: sessionId,
//         questionId: questionId,
//         answer: answer,
//         timeTaken: timeTaken,
//         currentSectionIndex: currentSectionIndex,
//     };

//     // --- הוסף את הלוגים כאן, לפני קריאת ה-submitAnswer ---
//     console.log("-----------------------------------------");
//     console.log("נתוני שליחת תשובה לפני בקשת השרת:");
//     console.log("sessionId:", submissionData.sessionId);
//     console.log("questionId:", submissionData.questionId);
//     console.log("answer:", submissionData.answer);
//     console.log("timeTaken:", submissionData.timeTaken);
//     console.log("currentSectionIndex:", submissionData.currentSectionIndex);
//     console.log("-----------------------------------------");
//     // --- סוף הוספת הלוגים ---

//     // שלח את התשובה לשרת
//     submitAnswer(submissionData, { // עכשיו אנו מעבירים את המשתנה 'submissionData'
//         onSuccess: () => {
//             // אם השליחה לשרת הצליחה, עדכן את ה-Redux state
//             dispatch(setAnswer({ questionId, answer, timeTaken }));
//             console.log(`Answer for ${questionId} submitted and saved locally.`);
//         },
//         onError: (err) => {
//             console.error("Failed to submit answer:", err);
//             alert(`שגיאה בשליחת תשובה: ${err.message}`);
//             // אל תעדכן את ה-Redux state אם השליחה נכשלה, או טפל בזה אחרת
//         }
//     });
// };



//     const handleNext = () => {
//         dispatch(nextQuestion());
//     };

//     const handlePrevious = () => {
//         dispatch(previousQuestion());
//     };

//     const handleSubmitExam = async () => {
//         if (!sessionId) {
//             console.error("Session ID is missing, cannot end exam.");
//             return;
//         }
//         if (window.confirm('האם אתה בטוח שברצונך לסיים את הבחינה? לא תוכל לחזור ולשנות תשובות.')) {
//             endSession(sessionId, {
//                 onSuccess: () => {
//                     dispatch(setExamStatus('completed'));
//                     dispatch(resetExam());
//                     navigate('/results');
//                 },
//                 onError: (err) => {
//                     dispatch(setExamError(err.message));
//                     console.error("Manual submit failed:", err);
//                 }
//             });
//         }
//     };

//     // מצבי טעינה ושגיאה
//     if (isExamLoading || examStatus === 'idle') {
//         return (
//             <div className="flex justify-center items-center h-screen text-2xl font-semibold text-gray-700">
//                 טוען בחינה...
//             </div>
//         );
//     }

//     if (isExamError) {
//         return (
//             <div className="flex justify-center items-center h-screen text-xl text-red-600">
//                 שגיאה בטעינת הבחינה: {examError?.message}
//             </div>
//         );
//     }

//     if (reduxError) {
//         return (
//             <div className="flex justify-center items-center h-screen text-xl text-red-600">
//                 שגיאה במצב הבחינה: {reduxError}
//             </div>
//         );
//     }

//     if (examStatus === 'completed') {
//         return (
//             <div className="flex justify-center items-center h-screen text-xl text-green-600">
//                 הבחינה הסתיימה בהצלחה! מנווט לדף התוצאות...
//             </div>
//         );
//     }

//     if (!sessionId || sections.length === 0 || questions.length === 0) {
//         return (
//             <div className="flex justify-center items-center h-screen text-xl text-gray-600">
//                 לא נמצאו שאלות לבחינה או שהבחינה לא אותחלה כהלכה.
//             </div>
//         );
//     }

//     const currentSection = sections[currentSectionIndex];
//     if (!currentSection || currentQuestionIndex >= questions.length) {
//         // מצב שגיאה או סוף בחינה בלתי צפוי
//         return (
//             <div className="flex justify-center items-center h-screen text-xl text-red-600">
//                 שגיאה: שאלה או חלק לא חוקיים.
//             </div>
//         );
//     }
//     const currentQuestion = questions[currentQuestionIndex];

//     const minutes = Math.floor(timeLeftInSection / 60);
//     const seconds = timeLeftInSection % 60;

//     // חישוב אינדקס השאלה בתוך החלק הנוכחי
//     const sectionStartQuestionIndex = questions.findIndex(q => q._id === currentSection.questions[0]._id);
//     const questionIndexInSection = currentQuestionIndex - sectionStartQuestionIndex;


//     return (
//         <div className="container mx-auto p-8 max-w-xl bg-white rounded-lg shadow-xl mt-10">
//             <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">בחינה פסיכוטכנית</h3>
//             <div className="text-right mb-4">
//                 <p className="text-lg font-medium text-gray-600">
//                     חלק: {currentSection.sectionName} (שאלה {questionIndexInSection + 1} מתוך {currentSection.questions.length})
//                 </p>
//                 <p className={`text-sm font-bold ${timeLeftInSection <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
//                     זמן שנותר לחלק: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                     סה"כ זמן שנותר בבחינה: {Math.floor(totalTimeLeft / 60).toString().padStart(2, '0')}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
//                 </p>
//             </div>
//             <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
//                 <p className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion?.text}</p>
//                 <div className="space-y-3">
//                     {currentQuestion?.options.map((option: string, index: number) => (
//                         <label key={index} className="flex items-center text-lg cursor-pointer">
//                             <input
//                                 type="radio"
//                                 name={currentQuestion._id}
//                                 value={option}
//                                 checked={userAnswers[currentQuestion._id]?.answer === option}
//                                 onChange={() => handleAnswerChange(currentQuestion._id, option)}
//                                 className="form-radio h-5 w-5 text-primary-600 transition-colors duration-200"
//                                 disabled={timeLeftInSection === 0 || isSubmittingAnswer || isEndingSession || isMovingToNextSection}
//                             />
//                             <span className="mr-3 text-gray-700">{option}</span>
//                         </label>
//                     ))}
//                 </div>
//             </div>
//             <div className="flex justify-between mt-8">
//                 <button
//                     onClick={handlePrevious}
//                     // ניתן ללכת אחורה רק בתוך אותו חלק
//                     disabled={
//                         questionIndexInSection === 0 || // אם זו השאלה הראשונה בחלק
//                         isSubmittingAnswer || isEndingSession || isMovingToNextSection
//                     }
//                     className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     הקודם
//                 </button>
//                 {questionIndexInSection < currentSection.questions.length - 1 ? (
//                     <button
//                         onClick={handleNext}
//                         disabled={
//                             isSubmittingAnswer || isEndingSession || isMovingToNextSection
//                         }
//                         className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         הבא
//                     </button>
//                 ) : (
//                     // כפתור סיום חלק או סיום בחינה
//                     <button
//                         onClick={
//                             currentSectionIndex < sections.length - 1 ?
//                                 () => {
//                                     if (sessionId) {
//                                         goToNextSection({ sessionId, nextSectionIndex: currentSectionIndex + 1 });
//                                         dispatch(moveToNextSection());
//                                     }
//                                 } :
//                                 handleSubmitExam
//                         }
//                         disabled={
//                             isSubmittingAnswer || isEndingSession || isMovingToNextSection
//                         }
//                         className="bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {currentSectionIndex < sections.length - 1 ? 'סיים חלק ועבור הלאה' : 'סיים בחינה'}
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Exam;



import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
    useStartPsychotechnicalExam,
    useSubmitSingleAnswer,
    useEndTestSession,
    useMoveToNextSection,
    Question,
    ExamSection,
} from '../api/examApi';
import {
    setAnswer,
    nextQuestion,
    previousQuestion,
    decrementTime,
    resetExam,
    initializeExam,
    moveToNextSection as reduxMoveToNextSection,
    setExamStatus,
    setExamError,
} from '../store/slices/examSlice';

const Exam: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { data: examData, isLoading: isExamLoading, isError: isExamError, error: examError } = useStartPsychotechnicalExam();
    const { mutate: submitAnswer, isPending: isSubmittingAnswer } = useSubmitSingleAnswer();
    const { mutate: endSession, isPending: isEndingSession } = useEndTestSession();
    const { mutate: goToNextSection, isPending: isMovingToNextSection } = useMoveToNextSection();

    const {
        sessionId,
        sections,
        currentSectionIndex,
        questions,
        currentQuestionIndex,
        userAnswers,
        timeLeftInSection,
        totalTimeLeft,
        examStatus,
        error: reduxError,
    } = useAppSelector((state) => state.exam);

    const questionStartTime = useRef<number>(Date.now());

    useEffect(() => {
        if (examData && examStatus === 'idle') {
            const allQuestions: Question[] = [];
            examData.sections.forEach(section => {
                allQuestions.push(...section.questions);
            });
            const serverCurrentSection = examData.sections[examData.currentSectionIndex];
            let initialQuestionIndex = 0;
            if (serverCurrentSection && serverCurrentSection.questions.length > 0) {
                initialQuestionIndex = allQuestions.findIndex(q => q._id === serverCurrentSection.questions[0]._id);
            }

            let actualCurrentQuestionIndex = initialQuestionIndex;
            if (examData.userAnswers && Object.keys(examData.userAnswers).length > 0) {
                const answeredQuestionIdsInSection = serverCurrentSection.questions
                    .filter(q => examData.userAnswers[q._id])
                    .map(q => q._id);

                if (answeredQuestionIdsInSection.length > 0) {
                    const lastAnsweredQuestionId = answeredQuestionIdsInSection[answeredQuestionIdsInSection.length - 1];
                    const lastAnsweredGlobalIndex = allQuestions.findIndex(q => q._id === lastAnsweredQuestionId);
                    if (lastAnsweredGlobalIndex !== -1) {
                        if (lastAnsweredGlobalIndex + 1 < allQuestions.length &&
                            allQuestions[lastAnsweredGlobalIndex + 1].category === serverCurrentSection.sectionName) {
                            actualCurrentQuestionIndex = lastAnsweredGlobalIndex + 1;
                        } else {
                            actualCurrentQuestionIndex = lastAnsweredGlobalIndex;
                        }
                    }
                }
            }

            dispatch(initializeExam({
                sessionId: examData.sessionId,
                sections: examData.sections,
                allQuestions: allQuestions,
                currentSectionIndex: examData.currentSectionIndex,
                currentQuestionIndex: actualCurrentQuestionIndex,
                userAnswers: examData.userAnswers || {},
                timeLeftInSection: examData.sections[examData.currentSectionIndex]?.timeLimitSeconds || 0,
            }));
            questionStartTime.current = Date.now();
        }
    }, [examData, examStatus, dispatch]);

    useEffect(() => {
        if (examStatus === 'active' && timeLeftInSection > 0) {
            const timer = setInterval(() => {
                dispatch(decrementTime());
            }, 1000);
            return () => clearInterval(timer);
        } else if (examStatus === 'active' && timeLeftInSection === 0 && sections.length > 0) {
            if (currentSectionIndex < sections.length - 1) {
                console.log(`Time's up for section ${sections[currentSectionIndex].sectionName}. Moving to next section.`);
                goToNextSection({ sessionId: sessionId!, nextSectionIndex: currentSectionIndex + 1 }, {
                    onSuccess: () => {
                        dispatch(reduxMoveToNextSection());
                    },
                    onError: (err: any) => {
                        console.error("Failed to move to next section due to timeout:", err);
                        dispatch(setExamError(err.message || 'Failed to move to next section on timeout'));
                    }
                });
            } else {
                console.log("Time's up for the last section. Ending exam.");
                if (sessionId && !isEndingSession) {
                    endSession(sessionId, {
                        onSuccess: () => {
                            dispatch(setExamStatus('completed'));
                            navigate('/results');
                        },
                        onError: (err) => {
                            dispatch(setExamError(err.message));
                            console.error("Auto-end session failed:", err);
                        }
                    });
                }
            }
        }
    }, [timeLeftInSection, examStatus, sections, currentSectionIndex, sessionId, dispatch, goToNextSection, endSession, navigate, isEndingSession]);

    useEffect(() => {
        questionStartTime.current = Date.now();
    }, [currentQuestionIndex, currentSectionIndex]);

    const handleAnswerChange = (questionId: string, answer: string) => {
        if (!sessionId) {
            console.error("Session ID is missing, cannot submit answer.");
            return;
        }
        const timeTaken = Date.now() - questionStartTime.current;
        const submissionData = {
            sessionId: sessionId,
            questionId: questionId,
            answer: answer,
            timeTaken: timeTaken,
            currentSectionIndex: currentSectionIndex,
        };
        console.log("-----------------------------------------");
        console.log("נתוני שליחת תשובה לפני בקשת השרת:");
        console.log("sessionId:", submissionData.sessionId);
        console.log("questionId:", submissionData.questionId);
        console.log("answer:", submissionData.answer);
        console.log("timeTaken:", submissionData.timeTaken);
        console.log("currentSectionIndex:", submissionData.currentSectionIndex);
        console.log("-----------------------------------------");
        submitAnswer(submissionData, {
            onSuccess: () => {
                dispatch(setAnswer({ questionId, answer, timeTaken }));
                console.log(`Answer for ${questionId} submitted and saved locally.`);
            },
            onError: (err: any) => {
                console.error("Failed to submit answer:", err);
                alert(`שגיאה בשליחת תשובה: ${err.message || 'שגיאה לא ידועה'}`);
            }
        });
    };

    const handleNext = () => {
        dispatch(nextQuestion());
    };

    const handlePrevious = () => {
        dispatch(previousQuestion());
    };

    const handleSubmitExam = async () => {
        if (!sessionId) {
            console.error("Session ID is missing, cannot end exam.");
            return;
        }
        if (window.confirm('האם אתה בטוח שברצונך לסיים את הבחינה? לא תוכל לחזור ולשנות תשובות.')) {
            endSession(sessionId, {
                onSuccess: () => {
                    dispatch(setExamStatus('completed'));
                    dispatch(resetExam());
                    navigate('/results');
                },
                onError: (err) => {
                    dispatch(setExamError(err.message));
                    console.error("Manual submit failed:", err);
                }
            });
        }
    };

    if (isExamLoading || examStatus === 'idle') {
        return (
            <div className="flex justify-center items-center h-screen text-2xl font-semibold text-gray-700">
                טוען בחינה...
            </div>
        );
    }

    if (isExamError) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                שגיאה בטעינת הבחינה: {examError?.message}
            </div>
        );
    }

    if (reduxError) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                שגיאה במצב הבחינה: {reduxError}
            </div>
        );
    }

    if (examStatus === 'completed') {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-green-600">
                הבחינה הסתיימה בהצלחה! מנווט לדף התוצאות...
            </div>
        );
    }

    if (!sessionId || sections.length === 0 || questions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-600">
                לא נמצאו שאלות לבחינה או שהבחינה לא אותחלה כהלכה.
            </div>
        );
    }

    const currentSection = sections[currentSectionIndex];
    if (!currentSection || currentQuestionIndex >= questions.length) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                שגיאה: שאלה או חלק לא חוקיים.
            </div>
        );
    }
    const currentQuestion = questions[currentQuestionIndex];

    const minutes = Math.floor(timeLeftInSection / 60);
    const seconds = timeLeftInSection % 60;

    const sectionStartQuestionIndex = questions.findIndex(q => q._id === currentSection.questions[0]._id);
    const questionIndexInSection = currentQuestionIndex - sectionStartQuestionIndex;

    return (
        <div className="container mx-auto p-8 max-w-xl bg-white rounded-lg shadow-xl mt-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">בחינה פסיכוטכנית</h3>
            <div className="text-right mb-4">
                <p className="text-lg font-medium text-gray-600">
                    חלק: {currentSection.sectionName} (שאלה {questionIndexInSection + 1} מתוך {currentSection.questions.length})
                </p>
                <p className={`text-sm font-bold ${timeLeftInSection <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                    זמן שנותר לחלק: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    סה"כ זמן שנותר בבחינה: {Math.floor(totalTimeLeft / 60).toString().padStart(2, '0')}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                <p className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion?.text}</p>
                <div className="space-y-3">
                    {currentQuestion?.options.map((option: string, index: number) => (
                        <label key={index} className="flex items-center text-lg cursor-pointer">
                            <input
                                type="radio"
                                name={currentQuestion._id}
                                value={option}
                                checked={userAnswers[currentQuestion._id]?.answer === option}
                                onChange={() => handleAnswerChange(currentQuestion._id, option)}
                                className="form-radio h-5 w-5 text-primary-600 transition-colors duration-200"
                                disabled={timeLeftInSection === 0 || isSubmittingAnswer || isEndingSession || isMovingToNextSection}
                            />
                            <span className="mr-3 text-gray-700">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <button
                    onClick={handlePrevious}
                    disabled={
                        questionIndexInSection === 0 ||
                        isSubmittingAnswer || isEndingSession || isMovingToNextSection
                    }
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    הקודם
                </button>
                {questionIndexInSection < currentSection.questions.length - 1 ? (
                    <button
                        onClick={handleNext}
                        disabled={
                            isSubmittingAnswer || isEndingSession || isMovingToNextSection
                        }
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        הבא
                    </button>
                ) : (
                    <button
                        onClick={
                            currentSectionIndex < sections.length - 1 ?
                                () => {
                                    if (sessionId) {
                                        goToNextSection({ sessionId, nextSectionIndex: currentSectionIndex + 1 }, {
                                            onSuccess: () => {
                                                dispatch(reduxMoveToNextSection());
                                            },
                                            onError: (err: any) => {
                                                console.error("Failed to move to next section via button:", err);
                                                alert(`שגיאה במעבר לחלק הבא: ${err.message || 'שגיאה לא ידועה'}`);
                                            }
                                        });
                                    }
                                } :
                                handleSubmitExam
                        }
                        disabled={
                            isSubmittingAnswer || isEndingSession || isMovingToNextSection
                        }
                        className="bg-accent-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentSectionIndex < sections.length - 1 ? 'סיים חלק ועבור הלאה' : 'סיים בחינה'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Exam;