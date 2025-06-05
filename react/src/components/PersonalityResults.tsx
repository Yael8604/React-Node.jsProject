import React from 'react'

interface PersonalityProps {
  data: {
    openness: { score: number; description: string };
    conscientiousness: { score: number; description: string };
    extraversion: { score: number; description: string };
    agreeableness: { score: number; description: string };
    neuroticism: { score: number; description: string };
    overallPersonalitySummary: string;
  };
}

const PersonalityResults :React.FC<PersonalityProps> = ({ data }) => {
  return (
    <div>
      <h2>תוצאות פסיכוטכניות</h2>
      <p>ציון כולל: {data.overallPersonalitySummary}</p>
      {/* המשך הצגת הנתונים */}
    </div>
  );
};

export default PersonalityResults
