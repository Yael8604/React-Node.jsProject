// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { loginSchema, LoginFormData } from '../schemas/loginSchema'; // ייבוא הסכמה

// interface LoginModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
//   const navigate = useNavigate();
//   const [showForgotPassword, setShowForgotPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     setError, // נוסף כדי להגדיר שגיאות מהשרת
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       username: '',
//       password: '',
//     },
//   });

//   const onSubmit = async (data: LoginFormData) => {
//     try {
//       const response = await fetch('http://localhost:3000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: "include",
//         body: JSON.stringify(data)
//       });

//       const responseData = await response.json();
//       if (!response.ok) {
//         if (responseData.message) {
//             alert(responseData.message);
//         } else {
//             alert('שם משתמש או סיסמה שגויים');
//         }
//         throw new Error(responseData.message || 'שם משתמש או סיסמה שגויים');
//       }

//       console.log(responseData);
//       navigate("/PersonalProfile");
//       onClose(); // סגירת המודאל לאחר הצלחה
//     } catch (error: any) {
//       if (error.response && error.response.data && error.response.data.field) {
//         setError(error.response.data.field, {
//           type: "server",
//           message: error.response.data.message,
//         });
//       } else {
//         alert(error.message || 'אירעה שגיאה בלתי צפויה.');
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-display font-bold text-gray-800">כניסה למערכת</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="flex justify-center mb-6">
//             <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
//               <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   {...register("username")} // שימוש ב-register
//                   className={`w-full px-4 py-3 pr-10 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
//                   placeholder="הכנס שם משתמש"
//                 />
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                 </div>
//               </div>
//               {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
//               <div className="relative">
//                 <input
//                   type="password"
//                   {...register("password")} // שימוש ב-register
//                   className={`w-full px-4 py-3 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
//                   placeholder="הכנס סיסמה"
//                 />
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 </div>
//               </div>
//               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="flex items-center">
//                 <input type="checkbox" className="text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
//                 <span className="mr-2 text-sm text-gray-600">זכור אותי</span>
//               </label>
//               <button
//                 type="button"
//                 onClick={() => setShowForgotPassword(true)}
//                 className="text-sm text-primary-600 hover:text-primary-700 font-medium"
//               >
//                 שכחתי סיסמה
//               </button>
//             </div>

//             <div className="flex gap-3 pt-4">
//               <button
//                 type="submit"
//                 disabled={isSubmitting} // isSubmitting מ-React Hook Form
//                 className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
//               >
//                 {isSubmitting ? 'מתחבר...' : 'כניסה'}
//               </button>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium transform hover:scale-105"
//               >
//                 ביטול
//               </button>
//             </div>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               אין לך חשבון?{' '}
//               <button
//                 onClick={() => {
//                   onClose();
//                   // Trigger register modal from parent
//                   setTimeout(() => {
//                     const registerBtn = document.querySelector('[data-register-btn]');
//                     if (registerBtn) {
//                       (registerBtn as HTMLButtonElement).click();
//                     }
//                   }, 300);
//                 }}
//                 className="text-primary-600 hover:text-primary-700 font-medium"
//               >
//                 הרשם עכשיו
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Forgot Password Dialog */}
//       {showForgotPassword && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
//           <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
//             <h3 className="text-lg font-display font-bold text-gray-800 mb-4">איפוס סיסמה</h3>
//             <p className="text-gray-600 mb-4">הכנס את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה</p>
//             <input
//               type="email"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
//               placeholder="כתובת אימייל"
//             />
//             <div className="flex gap-3">
//               <button className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600">
//                 שלח קישור
//               </button>
//               <button
//                 onClick={() => setShowForgotPassword(false)}
//                 className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
//               >
//                 ביטול
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginModal;





import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/loginSchema';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
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
        if (responseData.message) {
            alert(responseData.message);
        } else {
            alert('שם משתמש או סיסמה שגויים');
        }
        throw new Error(responseData.message || 'שם משתמש או סיסמה שגויים');
      }

      console.log(responseData);
      navigate("/PersonalProfile");
      onClose();
    } catch (error: any) {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-fade-in border border-gray-100 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.01C14.8 7.01 14.6 7.1 14.5 7.2L13.1 8.6C12.6 9.1 11.9 9.1 11.4 8.6L10 7.2C9.9 7.1 9.7 7.01 9.5 7.01L3 7V9L9.5 9.01L12 11.5L14.5 9.01L21 9Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold">ברוך הבא!</h2>
            <p className="text-white/90 text-sm mt-1">התחבר לחשבון שלך</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">שם משתמש</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${errors.username ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  {...register("username")}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                  placeholder="הכנס שם משתמש"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-up">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">סיסמה</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white focus:outline-none ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                  }`}
                  placeholder="הכנס סיסמה"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-up">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-600 border-2 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 transition-colors"
                />
                <span className="mr-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">זכור אותי</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline"
              >
                שכחתי סיסמה
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    מתחבר...
                  </div>
                ) : 'כניסה'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
              >
                ביטול
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">או</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              אין לך חשבון?{' '}
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const registerBtn = document.querySelector('[data-register-btn]');
                    if (registerBtn) {
                      (registerBtn as HTMLButtonElement).click();
                    }
                  }, 300);
                }}
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline"
              >
                הרשם עכשיו
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in border border-gray-100">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-bold text-gray-800">איפוס סיסמה</h3>
                <p className="text-gray-600 text-sm mt-2">הכנס את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all duration-200"
                  placeholder="כתובת אימייל"
                />
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3 rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-200 font-medium transform hover:scale-[1.02]">
                    שלח קישור
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium transform hover:scale-[1.02]"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;
