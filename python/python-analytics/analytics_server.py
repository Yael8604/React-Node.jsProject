from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

# נתוני זמן תגובה ממוצעים (לצורך הדגמה בלבד - בעתיד נרצה לאסוף אותם מנתונים אמיתיים)
# המפתח הוא questionId
mock_average_response_times = {
    "q1": {"avg_time": 5000, "std_dev": 1000},  # 5 שניות
    "q2": {"avg_time": 7000, "std_dev": 1500},  # 7 שניות
    "q3": {"avg_time": 3000, "std_dev": 500},   # 3 שניות
    # ... כאן תוכלי להוסיף עוד שאלות
}

@app.route('/analyze_response_time', methods=['POST'])
def analyze_response_time():
    """
    מקבל נתוני תגובה (כולל זמן תגובה), מנתח אותם ומחזיר סטטוס ניתוח.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    user_id = data.get('userId')
    question_id = data.get('questionId')
    response_time = data.get('responseTime') # במילישניות
    answer = data.get('answer') # תשובת המשתמש

    if not all([user_id, question_id, response_time is not None]):
        return jsonify({"error": "Missing required fields: userId, questionId, responseTime"}), 400

    print(f"Received data for User: {user_id}, Question: {question_id}, Response Time: {response_time}ms, Answer: {answer}")

    # --- לוגיקת ניתוח זמן תגובה ---
    analysis_result = {
        "userId": user_id,
        "questionId": question_id,
        "responseTime": response_time,
        "analysisStatus": "OK",
        "feedback": "No specific feedback yet."
    }

    # דוגמה לניתוח פשוט: השוואה לממוצע ידוע
    if question_id in mock_average_response_times:
        avg_time_info = mock_average_response_times[question_id]
        avg_time = avg_time_info['avg_time']
        std_dev = avg_time_info['std_dev']

        # חישוב ציון Z (כמה סטיות תקן המשתמש רחוק מהממוצע)
        z_score = (response_time - avg_time) / std_dev if std_dev else 0

        analysis_result['averageTime'] = avg_time
        analysis_result['stdDev'] = std_dev
        analysis_result['zScore'] = round(z_score, 2) # עיגול לשתי ספרות אחרי הנקודה

        if z_score > 2: # איטי משמעותית
            analysis_result['analysisStatus'] = "Slow"
            analysis_result['feedback'] = "Response was significantly slower than average. Might indicate hesitation or deep thought."
        elif z_score < -1.5: # מהיר משמעותית (ייתכן ניחוש או ידע אינטואיטיבי חזק)
            analysis_result['analysisStatus'] = "Fast"
            analysis_result['feedback'] = "Response was significantly faster than average. Could indicate quick intuition or guessing."
        else:
            analysis_result['feedback'] = "Response time is within expected range."
    else:
        analysis_result['analysisStatus'] = "No Reference Data"
        analysis_result['feedback'] = "No average response time data available for this question."

    # כאן תוכלי להוסיף לוגיקה מורכבת יותר, למשל:
    # - בדיקה אם זמן התגובה נמוך מסף מסוים (למשל, 500ms) - אולי קליק אקראי?
    # - בדיקה אם זמן התגובה גבוה מסף מסוים (למשל, 30 שניות) - אולי התנתק?

    return jsonify(analysis_result), 200

if __name__ == '__main__':
    # הפעלת השרת על פורט 5000 (פורט נפוץ ל-Flask)
    # שימי לב: debug=True נועד לפיתוח בלבד! ב-production יש להשתמש בשרת WSGI כמו Gunicorn.
    app.run(debug=True, port=5000)