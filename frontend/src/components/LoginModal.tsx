// src/components/LoginModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthForm from '../hooks/useAuthForm'; // ייבוא ה-hook

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
  [key: string]: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // פונקציית ולידציה ספציפית לטופס ההתחברות
  const validateLoginForm = (data: LoginFormData) => {
    const newErrors: Partial<LoginFormData> = {};
    if (!data.username) {
      newErrors.username = 'שם משתמש הוא שדה חובה';
    }
    if (!data.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    }
    return newErrors;
  };

  // פונקציית שליחת נתונים לשרת ספציפית להתחברות
  const submitLogin = async (data: LoginFormData) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'שם משתמש או סיסמה שגויים');
    }
    return responseData;
  };

  // שימוש ב-Custom Hook
  const { formData, errors, isLoading, handleChange, handleSubmit } = useAuthForm<LoginFormData>({
    initialData: { username: '', password: '' },
    validator: validateLoginForm,
    submitHandler: submitLogin,
    onSuccess: (data) => {
      console.log(data);
      navigate("/PersonalProfile");
      onClose(); // סגירת המודאל לאחר הצלחה
    },
    onFailure: (message) => {
      alert(message);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-800">כניסה למערכת</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  placeholder="הכנס שם משתמש"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  placeholder="הכנס סיסמה"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span className="mr-2 text-sm text-gray-600">זכור אותי</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                שכחתי סיסמה
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? 'מתחבר...' : 'כניסה'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium transform hover:scale-105"
              >
                ביטול
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              אין לך חשבון?{' '}
              <button
                onClick={() => {
                  onClose();
                  // Trigger register modal from parent
                  setTimeout(() => {
                    const registerBtn = document.querySelector('[data-register-btn]');
                    if (registerBtn) {
                      (registerBtn as HTMLButtonElement).click();
                    }
                  }, 300);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                הרשם עכשיו
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-display font-bold text-gray-800 mb-4">איפוס סיסמה</h3>
            <p className="text-gray-600 mb-4">הכנס את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה</p>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
              placeholder="כתובת אימייל"
            />
            <div className="flex gap-3">
              <button className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600">
                שלח קישור
              </button>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;