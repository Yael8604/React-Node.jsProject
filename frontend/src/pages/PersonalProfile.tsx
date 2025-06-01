// src/pages/PersonalProfile.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PersonalProfile: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h3 className="text-3xl font-bold mb-6">ברוך הבא לפרופיל האישי שלך!</h3>
      <p className="text-lg text-gray-700 mb-8">
        כאן תוכל לנהל את פרטיך האישיים ולגשת לבחינות ההערכה.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h4 className="text-xl font-semibold mb-4">בחינות זמינות</h4>
        <p className="text-gray-600 mb-4">
          מוכן לאתגר? התחל את הבחינה הפסיכוטכנית כדי להעריך את היכולות שלך.
        </p>
        <Link
          to="/exam-instructions"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-primary-700 transition-colors duration-300"
        >
          התחל בחינה פסיכוטכנית
        </Link>
      </div>

      {/* כאן ניתן להוסיף רכיבים נוספים לפרופיל כמו:
        - הצגת פרטי משתמש
        - היסטוריית בחינות
        - אפשרות לעדכון פרטים
      */}
    </div>
  );
}

export default PersonalProfile;