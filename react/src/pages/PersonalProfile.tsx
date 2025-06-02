import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

// טיפוס חדש לפרטי משתמש בלי phone
interface UserProfile {
  name: string;
  email: string;
}

const mockTestHistory = [
  { id: 1, type: 'פסיכוטכנית', date: '2025-05-01', score: 85 },
  { id: 2, type: 'אישיות', date: '2025-04-10', score: null },
];

const PersonalProfile: React.FC = () => {
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const [user, setUser] = useState<UserProfile>({ name: '', email: '' });
  const [displayUser, setDisplayUser] = useState<UserProfile>({ name: '', email: '' });
  const [testHistory, setTestHistory] = useState(mockTestHistory);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name,
        email: currentUser.email,
      });
      setDisplayUser({
        name: currentUser.name,
        email: currentUser.email,
      });
      setIsConfirmed(true);
    }
  }, [currentUser]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('נכשלה עדכון הפרטים');
      }

      const updatedUser = await response.json();
      setDisplayUser(updatedUser);
      setIsConfirmed(true);
    } catch (err) {
      console.error('שגיאה בעדכון המשתמש:', err);
      alert('אירעה שגיאה בעת שמירת הפרטים. נסה שוב מאוחר יותר.');
    }
    finally {
      setIsSaving(false)
    }
  };


  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h3 className="text-3xl font-bold mb-6 text-primary-700">ברוך הבא לפרופיל האישי שלך!</h3>
      <p className="text-lg text-gray-700 mb-8">
        כאן תוכל לנהל את פרטיך האישיים ולגשת לבחינות ההערכה.
      </p>

      {/* בחינות זמינות */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h4 className="text-xl font-semibold mb-4 text-primary-600">בחינות זמינות</h4>
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

      {/* פרטי משתמש */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h4 className="text-xl font-semibold mb-4 text-primary-600">פרטי משתמש</h4>
        <div className="text-gray-800 space-y-2">
          {isLoading ? (
            <p>טוען...</p>
          ) : error ? (
            <p>שגיאה בטעינה</p>
          ) : isConfirmed ? (
            <>
              <p><span className="font-semibold">שם:</span> {displayUser.name}</p>
              <p><span className="font-semibold">מייל:</span> {displayUser.email}</p>
            </>
          ) : (
            <p>אנא עדכן את פרטיך ולחץ על "עדכן פרטים".</p>
          )}
        </div>
      </div>

      {/* היסטוריית בחינות */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h4 className="text-xl font-semibold mb-4 text-primary-600">היסטוריית בחינות</h4>
        {testHistory.length === 0 ? (
          <p className="text-gray-600">אין היסטוריית בחינות להצגה</p>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 px-4 text-gray-700">סוג הבחינה</th>
                <th className="py-2 px-4 text-gray-700">תאריך</th>
                <th className="py-2 px-4 text-gray-700">ציון</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map(test => (
                <tr key={test.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4">{test.type}</td>
                  <td className="py-2 px-4">{test.date}</td>
                  <td className="py-2 px-4">{test.score !== null ? test.score : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* עדכון פרטים אישיים */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-xl font-semibold mb-4 text-primary-600">עדכון פרטים אישיים</h4>
        <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700">שם מלא</label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              value={user.name}
              onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">מייל</label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              value={user.email}
              onChange={e => setUser(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'שומר...' : 'עדכן פרטים'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default PersonalProfile;


