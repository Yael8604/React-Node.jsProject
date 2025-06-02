// src/pages/ExamInstructions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExamInstructions: React.FC = () => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    // כאן ניתן להוסיף לוגיקה נוספת לפני התחלת הבחינה, למשל:
    // - קריאה לשרת כדי ליצור מופע חדש של בחינה עבור המשתמש
    // - אולי טעינת שאלות ראשונית

    navigate('/exam'); // נווט לעמוד הבחינה בפועל
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-xl mt-10">
      <h3 className="text-4xl font-bold text-gray-800 mb-6 text-center">הוראות לבחינה הפסיכוטכנית</h3>
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        קרא בעיון את ההוראות הבאות לפני תחילת הבחינה. הבנה טובה של הכללים תסייע לך למצות את הפוטנציאל המלא שלך.
      </p>

      <div className="space-y-4 mb-8 text-gray-800">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primary-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>
            <span className="font-semibold">משך הבחינה:</span> הבחינה מוגבלת בזמן. שעון עצר יופיע במהלך הבחינה ויתריע על הזמן שנותר.
          </p>
        </div>
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primary-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M.5 4.5h23v15h-23z" /></svg>
          <p>
            <span className="font-semibold">פורמט השאלות:</span> הבחינה מורכבת משאלות רב-ברירה (אמריקאיות). יש לבחור את התשובה הנכונה ביותר מבין האפשרויות המוצעות.
          </p>
        </div>
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primary-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <p>
            <span className="font-semibold">ניווט:</span> ניתן לעבור בין שאלות קדימה ואחורה, אך זכור כי שעון העצר ממשיך לרוץ.
          </p>
        </div>
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primary-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <p>
            <span className="font-semibold">סיום בחינה:</span> בסיום הבחינה תתבקש לאשר את שליחת התשובות. לאחר שליחה, לא תוכל לחזור ולשנות.
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleStartExam}
          className="bg-accent-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-accent-600 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          התחל בחינה
        </button>
      </div>
    </div>
  );
};

export default ExamInstructions;
