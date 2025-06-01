// // src/api/examApi.ts
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// export interface Question {
//   id: string; // מזהה השאלה (MongoDB ObjectId יהיה בדרך כלל _id)
//   text: string;
//   options: string[];
//   // אם יש לך שדות נוספים במודל השאלה ב-MongoDB, הוסף אותם כאן.
//   // לדוגמה: category?: string; difficulty?: 'easy' | 'medium' | 'hard';
// }

// export interface UserAnswers {
//   [questionId: string]: string; // מזהה השאלה: התשובה שבחר המשתמש
// }

// const API_BASE_URL = 'http://localhost:3000/api'; // נקודת הכניסה ל-API בשרת שלך

// // פונקציית אחזור שאלות הבחינה
// const fetchExamQuestionsFn = async (): Promise<Question[]> => {
//   const response = await fetch(`${API_BASE_URL}/questions`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     credentials: 'include', // חשוב לשליחת קוקי אימות
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || 'Failed to fetch questions from server');
//   }

//   const data = await response.json();

//   return data.map((q: any) => ({
//     id: q._id,
//     text: q.text,
//     options: q.options,
//   }));
// };

// // פונקציית שליחת תשובות הבחינה
// const submitExamAnswersFn = async (
//   userAnswers: UserAnswers
// ): Promise<{ score: number; message: string }> => {
//   const response = await fetch(`${API_BASE_URL}/testSessions/submit`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(userAnswers),
//     credentials: 'include', // חשוב לשליחת קוקי אימות
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || 'Failed to submit exam');
//   }

//   const resultData = await response.json();
//   return resultData;
// };

// // Hook לאחזור שאלות הבחינה
// export const useExamQuestions = () => {
//   return useQuery<Question[], Error>({
//     queryKey: ['examQuestions'],
//     queryFn: fetchExamQuestionsFn,
//     staleTime: 1000 * 60 * 5, // 5 דקות
//     retry: 3,
//   });
// };

// // Hook לשליחת תשובות הבחינה
// export const useSubmitExam = () => {
//   const queryClient = useQueryClient();

//   return useMutation<any, Error, UserAnswers>({
//     mutationFn: submitExamAnswersFn,
//     onSuccess: (data) => {
//       console.log('Exam submitted successfully:', data);
//       // לדוגמה, נעדכן cache אם צריך:
//       // queryClient.invalidateQueries(['examQuestions']);
//     },
//     onError: (error) => {
//       console.error('Failed to submit exam:', error);
//     },
//   });
// };

// src/api/examApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Question {
  id: string; // מזהה השאלה (MongoDB ObjectId יהיה בדרך כלל _id)
  text: string;
  options: string[];
  // אם יש לך שדות נוספים במודל השאלה ב-MongoDB, הוסף אותם כאן.
  // לדוגמה: category?: string; difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserAnswers {
  [questionId: string]: string; // מזהה השאלה: התשובה שבחר המשתמש
}

// פונקציית אחזור שאלות הבחינה
const fetchExamQuestionsFn = async (): Promise<Question[]> => {
  const response = await fetch(`${process.env.REACT_APP_API_URL }/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // חשוב לשליחת קוקי אימות
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch questions from server');
  }

  const data = await response.json();

  return data.map((q: any) => ({
    id: q._id,
    text: q.text,
    options: q.options,
  }));
};

// פונקציית שליחת תשובות הבחינה
const submitExamAnswersFn = async (
  userAnswers: UserAnswers
): Promise<{ score: number; message: string }> => {
  const response = await fetch(`${process.env.REACT_APP_API_URL }/testSessions/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userAnswers),
    credentials: 'include', // חשוב לשליחת קוקי אימות
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit exam');
  }

  const resultData = await response.json();
  return resultData;
};

// Hook לאחזור שאלות הבחינה
export const useExamQuestions = () => {
  return useQuery<Question[], Error>({
    queryKey: ['examQuestions'],
    queryFn: fetchExamQuestionsFn,
    staleTime: 1000 * 60 * 5, // 5 דקות
    retry: 3,
  });
};

// Hook לשליחת תשובות הבחינה
export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserAnswers>({
    mutationFn: submitExamAnswersFn,
    onSuccess: (data) => {
      console.log('Exam submitted successfully:', data);
      // לדוגמה, נעדכן cache אם צריך:
      // queryClient.invalidateQueries(['examQuestions']);
    },
    onError: (error) => {
      console.error('Failed to submit exam:', error);
    },
  });
};
