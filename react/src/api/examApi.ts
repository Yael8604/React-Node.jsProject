import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Question {

    _id: string;

    text: string;

    options: string[];

    category: string; // חדש

}

// מבנה נתונים עבור חלק בבחינה

export interface ExamSection {

    sectionName: string;

    questionIds: string[];

    questions: Question[]; // השאלות המלאות עבור הפרונטאנד

    timeLimitSeconds: number;

}



// תגובה מהשרת להתחלת בחינה

export interface StartExamResponse {

    message: string;

    sessionId: string;

    sections: ExamSection[];

    currentSectionIndex: number;

    // [שינוי] עדכון המבנה של userAnswers כך שיכלול גם את sectionIndex

    userAnswers: { [questionId: string]: { answer: string; timeTaken: number; sectionIndex?: number } }; // [שינוי] sectionIndex אופציונלי אם השרת לא תמיד מחזיר

}



// מבנה נתונים עבור תשובה של משתמש בודד (לשליחה לשרת)

export interface UserAnswerSubmission {

    sessionId: string;

    questionId: string;

    answer: string;

    timeTaken: number;

    currentSectionIndex: number; // חדש: אינדקס החלק הנוכחי

}



// פונקציה להתחלת בחינה פסיכוטכנית

const startPsychotechnicalExamFn = async (): Promise<StartExamResponse> => {

    const response = await fetch(`${process.env.REACT_APP_API_URL}testSession/start-psychotechnical`, {

        method: 'GET',

        headers: {

            'Content-Type': 'application/json',

        },

        credentials: 'include',

    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to start exam session');

    }

    return response.json();

};



// פונקציה לשליחת תשובה בודדת

const submitSingleAnswerFn = async (answerSubmission: UserAnswerSubmission): Promise<{ message: string, userAnswerId: string, isCorrect: boolean, score: number }> => {

    const response = await fetch(`${process.env.REACT_APP_API_URL}testSession/submit-answer`, {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json',

        },

        credentials: 'include',

        body: JSON.stringify(answerSubmission),

    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to submit answer');

    }

    return response.json();

};



// פונקציה לסיום סשן בחינה

const endTestSessionFn = async (sessionId: string): Promise<{ message: string, sessionId: string }> => {

    const response = await fetch(`${process.env.REACT_APP_API_URL}testSession/end-session`, {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json',

        },

        body: JSON.stringify({ sessionId }),

        credentials: 'include',

    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to end exam session');

    }

    return response.json();

};



// פונקציה למעבר לחלק הבא

const moveToNextSectionFn = async (sessionId: string, nextSectionIndex: number): Promise<{ message: string, newSectionIndex: number }> => {

    const response = await fetch(`${process.env.REACT_APP_API_URL}testSession/next-section`, {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json',

        },

        body: JSON.stringify({ sessionId, nextSectionIndex }),

        credentials: 'include',

    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to move to next section');

    }

    return response.json();

};

// Hook להתחלת בחינה פסיכוטכנית

export const useStartPsychotechnicalExam = () => {

    return useQuery<StartExamResponse, Error>({

        queryKey: ['psychotechnicalExam'],

        queryFn: startPsychotechnicalExamFn,

        staleTime: Infinity, // נתוני בחינה אלו לא משתנים בזמן הבחינה

        refetchOnWindowFocus: false, // לא לטעון מחדש ברענון חלון

        refetchOnMount: false, // לא לטעון מחדש בטעינת קומפוננטה

        retry: false, // בחינה מיוחדת, לא לנסות שוב אוטומטית

    });

};



// Hook לשליחת תשובה בודדת

export const useSubmitSingleAnswer = () => {

    const queryClient = useQueryClient();

    return useMutation<any, Error, UserAnswerSubmission>({

        mutationFn: submitSingleAnswerFn,

        onSuccess: (data) => {

            console.log('Single answer submitted successfully:', data);

            // ניתן לעדכן את הקאש של React Query כאן אם רלוונטי

        },

        onError: (error) => {

            console.error('Failed to submit single answer:', error);

        },

    });

};



// Hook לסיום סשן בחינה

export const useEndTestSession = () => {

    const queryClient = useQueryClient();

    return useMutation<any, Error, string>({

        mutationFn: endTestSessionFn,

        onSuccess: (data) => {

            console.log('Test session ended successfully:', data);

            queryClient.invalidateQueries({ queryKey: ['psychotechnicalExam'] }); // נבטל את הקאש של הבחינה הקודמת

        },

        onError: (error) => {

            console.error('Failed to end test session:', error);

        },

    });

};



// Hook למעבר לחלק הבא

export const useMoveToNextSection = () => {

    const queryClient = useQueryClient();

    return useMutation<any, Error, { sessionId: string, nextSectionIndex: number }>({

        mutationFn: ({ sessionId, nextSectionIndex }) => moveToNextSectionFn(sessionId, nextSectionIndex),

        onSuccess: (data) => {

            console.log('Moved to next section successfully:', data);

            // כאן אפשר לעדכן את ה-currentSectionIndex בקאש של React Query אם הבחינה נשמרת שם

            queryClient.invalidateQueries({ queryKey: ['psychotechnicalExam'] });

        },

        onError: (error) => {

            console.error('Failed to move to next section:', error);

        },

    });

};