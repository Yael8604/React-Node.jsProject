import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterModal from '../components/RegisterModal';
import LoginModal from '../components/LoginModal';

const Home = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const Logo = () => (
    // <svg viewBox="0 0 320 90" className="h-24 w-auto">
    //   <defs>
    //     <linearGradient id="geometricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    //       <stop offset="0%" style={{stopColor:'#8b5cf6', stopOpacity:1}} />
    //       <stop offset="50%" style={{stopColor:'#7c3aed', stopOpacity:1}} />
    //       <stop offset="100%" style={{stopColor:'#6d28d9', stopOpacity:1}} />
    //     </linearGradient>
    //     <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    //       <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:1}} />
    //       <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
    //     </linearGradient>
    //     <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    //       <stop offset="0%" style={{stopColor:'#1f2937', stopOpacity:1}} />
    //       <stop offset="100%" style={{stopColor:'#374151', stopOpacity:1}} />
    //     </linearGradient>
    //     <filter id="glow">
    //       <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
    //       <feMerge>
    //         <feMergeNode in="coloredBlur"/>
    //         <feMergeNode in="SourceGraphic"/>
    //       </feMerge>
    //     </filter>
    //   </defs>
      
    //   <g transform="translate(15, 15)">
    //     <g filter="url(#glow)">
    //       <circle cx="30" cy="30" r="25" fill="none" stroke="url(#geometricGradient)" strokeWidth="3"/>
    //       <g transform="translate(30, 30)">
    //         <circle cx="0" cy="-8" r="7" fill="url(#geometricGradient)"/>
    //         <path d="M -10 2 Q -10 -1 -7 -1 L 7 -1 Q 10 -1 10 2 L 10 12 L -10 12 Z" 
    //               fill="url(#geometricGradient)"/>
    //       </g>
    //       <circle cx="22" cy="22" r="3.5" fill="url(#accentGradient)" opacity="0.9"/>
    //       <circle cx="38" cy="22" r="3.5" fill="url(#accentGradient)" opacity="0.9"/>
    //       <circle cx="30" cy="38" r="3.5" fill="url(#accentGradient)" opacity="0.9"/>
    //     </g>
    //   </g>
      
    //   <g transform="translate(80, 38)">
    //     <text fontFamily="Poppins, Arial, sans-serif" fontSize="36" fontWeight="700" letterSpacing="-0.5">
    //       <tspan x="0" y="0" fill="url(#textGradient)">Pro</tspan>
    //       <tspan x="48" y="0" fill="url(#geometricGradient)">Profile</tspan>
    //     </text>
        
    //     <g transform="translate(0, 20)">
    //       <rect x="0" y="-1" width="30" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>
    //       <text x="35" y="1" fontFamily="Inter, Arial, sans-serif" fontSize="11" fontWeight="500" fill="#6b7280">
    //         Personality. Ability. Adaptability
    //       </text>
    //     </g>
    //   </g>
      
    //   <rect x="280" y="30" width="2.5" height="30" rx="1.25" fill="url(#accentGradient)" opacity="0.4"/>
    // </svg>
    <svg viewBox="0 0 320 90" className="h-24 w-auto" fill="none">
    <defs>
      <linearGradient id="geometricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
        <stop offset="50%" stopColor="#7c3aed" stopOpacity="1" />
        <stop offset="100%" stopColor="#6d28d9" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
        <stop offset="100%" stopColor="#059669" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1f2937" stopOpacity="1" />
        <stop offset="100%" stopColor="#374151" stopOpacity="1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g transform="translate(15, 15)">
      <g filter="url(#glow)">
        <circle cx="30" cy="30" r="25" fill="none" stroke="url(#geometricGradient)" strokeWidth="3" />
        <g transform="translate(30, 30)">
          <circle cx="0" cy="-8" r="7" fill="url(#geometricGradient)" />
          <path d="M -10 2 Q -10 -1 -7 -1 L 7 -1 Q 10 -1 10 2 L 10 12 L -10 12 Z" fill="url(#geometricGradient)" />
        </g>
        <circle cx="22" cy="22" r="3.5" fill="url(#accentGradient)" opacity="0.9" />
        <circle cx="38" cy="22" r="3.5" fill="url(#accentGradient)" opacity="0.9" />
        <circle cx="30" cy="38" r="3.5" fill="url(#accentGradient)" opacity="0.9" />
      </g>
    </g>

    <g transform="translate(80, 38)">
      <text fontFamily="Poppins, Arial, sans-serif" fontSize="36" fontWeight="700" letterSpacing="-0.5">
        <tspan x="0" y="0" fill="url(#textGradient)">Pro</tspan>
        <tspan x="48" y="0" fill="url(#geometricGradient)">Profile</tspan>
      </text>
      <g transform="translate(0, 20)">
        <rect x="0" y="-1" width="30" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7" />
        <text x="35" y="1" fontFamily="Inter, Arial, sans-serif" fontSize="11" fontWeight="500" fill="#6b7280">
          Personality. Ability. Adaptability
        </text>
      </g>
    </g>

    <rect x="280" y="30" width="2.5" height="30" rx="1.25" fill="url(#accentGradient)" opacity="0.4" />
  </svg>

  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/40 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-gradient-to-br from-accent-400/20 to-accent-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-br from-secondary-400/20 to-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-primary-300/15 to-secondary-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 py-6 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2.5 text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 rounded-lg hover:bg-white/50"
              >
                כניסה
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 transform hover:scale-105"
              >
                הרשמה
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-white/70 to-primary-50/70 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-2 h-2 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">פלטפורמה מתקדמת להערכת כישורים</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <button
                onClick={() => setShowRegister(true)}
                data-register-btn
                className="group px-10 py-4 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold text-lg rounded-2xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-primary-500/30 relative overflow-hidden"
              >
                <span className="relative z-10">התחל עכשיו</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={() => setShowLogin(true)}
                className="group px-10 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold text-lg rounded-2xl hover:bg-white/90 border border-gray-200/50 hover:border-primary-300/50 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-gray-500/10 relative overflow-hidden"
              >
                <span className="relative z-10">כניסה למערכת</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-gradient-to-br from-white/80 to-primary-50/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">בחינה פסיכוטכנית</h3>
                <p className="text-gray-600 text-center leading-relaxed">מבחנים מתקדמים לבדיקת יכולות קוגניטיביות, חשיבה לוגית ויכולות פתרון בעיות</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white/80 to-accent-50/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-accent-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">מבחן אישיות</h3>
                <p className="text-gray-600 text-center leading-relaxed">הערכה מקיפה של תכונות אישיות, סגנון עבודה והתאמה לתפקידים שונים</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white/80 to-secondary-50/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">דוח מפורט</h3>
                <p className="text-gray-600 text-center leading-relaxed">ניתוח מעמיק של התוצאות עם המלצות קריירה מותאמות אישית</p>
              </div>
            </div>
          </div>

          {/* About Link */}
          <div className="text-center">
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-all duration-300 group hover:bg-indigo-50/50 px-4 py-2 rounded-lg"
            >
              <span>למידע נוסף אודות המערכת</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Home;