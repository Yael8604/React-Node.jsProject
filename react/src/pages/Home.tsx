// import React from 'react'

// const Home : React.FC = () => {
//   return (
//     <div>
//        <h3>Home</h3>
//     </div>
//   )
// }

// export default Home


// Home.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';

const Home: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-5xl font-display font-bold text-primary-700 mb-4">
              מערכת בחינת יכולות וכישורים
            </h1>
            <p className="text-xl text-gray-600 font-body">
              גלה את היכולות והחוזקות שלך ומצא את הכיוון המקצועי המתאים לך
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">בחינה פסיכוטכנית</h3>
              <p className="text-gray-600">מבחנים מקיפים לבדיקת יכולות קוגניטיביות וחשיבה</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">מבחן אישיות</h3>
              <p className="text-gray-600">הערכת תכונות אישיות ומאפיינים פסיכולוגיים</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">תוצאות מפורטות</h3>
              <p className="text-gray-600">ניתוח מעמיק והמלצות מקצועיות מותאמות אישית</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => setShowRegister(true)}
              data-register-btn
              className="px-8 py-4 bg-primary-500 text-white font-body text-lg rounded-lg hover:bg-primary-600 transform transition-all hover:scale-105 shadow-lg"
            >
              הרשמה למערכת
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 bg-secondary-500 text-white font-body text-lg rounded-lg hover:bg-secondary-600 transform transition-all hover:scale-105 shadow-lg"
            >
              כניסה למערכת
            </button>
          </div>

          {/* About Link */}
          <Link
            to="/about"
            className="text-primary-600 hover:text-primary-700 font-body underline decoration-dotted underline-offset-4"
          >
            למידע נוסף אודות המערכת
          </Link>
        </div>
      </div>

      {/* Modals */}
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Home;