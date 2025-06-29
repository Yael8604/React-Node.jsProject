import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../schemas/registerSchema'; // ייבוא הסכמה

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError, // נוסף כדי להגדיר שגיאות מהשרת
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      phone: '',
      birthDate: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          name: data.name,
          email: data.email,
          phone: data.phone,
          // שימו לב: אם השרת מצפה לפורמט תאריך ספציפי, ייתכן שיהיה צורך בפורמט לפני השליחה.
          birthDate: data.birthDate,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        // טיפול בשגיאות מהשרת ועדכון השגיאות בטופס
        if (responseData.message) {
            // אם יש הודעה ספציפית מהשרת, נציג אותה
            alert(responseData.message);
        } else {
            // אחרת, שגיאה כללית
            alert('שגיאה בהרשמה');
        }
        throw new Error(responseData.message || 'שגיאה בהרשמה');
      }
      
      console.log(responseData);
      navigate("/PersonalProfile");
      onClose(); // סגירת המודאל לאחר הצלחה
    } catch (error: any) {
      // אם יש צורך להציג שגיאות שדה ספציפיות מהשרת
      // לדוגמה, אם השרת מחזיר { field: "username", message: "שם משתמש תפוס" }
      if (error.response && error.response.data && error.response.data.field) {
        setError(error.response.data.field, {
          type: "server",
          message: error.response.data.message,
        });
      } else {
        alert(error.message || 'אירעה שגיאה בלתי צפויה.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-800">הרשמה למערכת</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש *</label>
              <input
                type="text"
                {...register("username")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="הכנס שם משתמש"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
              <input
                type="text"
                {...register("name")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="הכנס שם מלא"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה *</label>
              <input
                type="password"
                {...register("password")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="הכנס סיסמה"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה *</label>
              <input
                type="password"
                {...register("confirmPassword")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="הכנס סיסמה שוב"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כתובת אימייל</label>
              <input
                type="email"
                {...register("email")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="הכנס אימייל"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון</label>
              <input
                type="tel"
                {...register("phone")} // שימוש ב-register
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="הכנס מספר טלפון"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך לידה *</label>
              <input
                type="date"
                {...register("birthDate")} // שימוש ב-register
                className={`w-full px-4 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting} // isSubmitting מ-React Hook Form
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'נרשם...' : 'הרשמה'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
