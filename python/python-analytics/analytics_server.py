# analytics_server.py
import json
import numpy as np
from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# --- הגדרות MongoDB (עדכן לפי ההגדרות שלך) ---
MONGO_URI = "mongodb+srv://8604yc:ifJ5PM8oU35kMXCm@cluster0.fu8nydp.mongodb.net/projectDB?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client.get_default_database()  # או db = client['your_database_name']

# קולקציות MongoDB
psychotechnical_questions_collection = db['psychotechnicalquestions']  # שם הקולקציה בפועל
user_answers_collection = db['useranswers']  # שם הקולקציה בפועל (userAnswer מודל)

# --- קאש לנתוני שאלות וממוצעי זמני תגובה (לטובת ביצועים) ---
question_metadata_cache = {}
response_time_stats_cache = {}  # { 'question_id': {'mean': X, 'std': Y}, ...}


def load_question_metadata(question_id: str):
    """Loads a single question's metadata from DB or cache."""
    if question_id in question_metadata_cache:
        return question_metadata_cache[question_id]

    question = psychotechnical_questions_collection.find_one(
        {'_id': question_id},
        {'category': 1, 'difficulty': 1}
    )
    if question:
        # Convert ObjectId to string for caching
        question['_id'] = str(question['_id'])
        question_metadata_cache[question_id] = question
        return question
    return None


def calculate_response_time_stats(question_id: str):
    """
    Calculates mean and standard deviation of response times for a given question.
    Consider caching this for performance and updating periodically.
    """
    if question_id in response_time_stats_cache:
        return response_time_stats_cache[question_id]

    # Fetch all *historical* response times for this specific question
    # This might need to be optimized for very large datasets (e.g., aggregate pipeline for means/stddev)
    answers = list(user_answers_collection.find({'questionId': question_id}, {'timeTaken': 1}))
    response_times = [ans['timeTaken'] for ans in answers if 'timeTaken' in ans and ans['timeTaken'] is not None]

    if len(response_times) < 5:  # Need a minimum number of samples for meaningful stats
        return None  # Not enough data yet

    mean_time = np.mean(response_times)
    std_dev_time = np.std(response_times)

    stats = {'mean': float(mean_time), 'std': float(std_dev_time)}
    response_time_stats_cache[question_id] = stats
    return stats


# --- פונקציות ניתוח ---

def analyze_single_response_time(user_id: str, question_id: str, response_time: int, question_type: str):
    """
    Analyzes a single response time and provides a detailed assessment.
    """
    analysis_results = {
        'overall_assessment': 'normal',
        'deviation_score': 0,  # Z-score or similar
        'raw_response_time_ms': response_time,
        'threshold_status': [],  # e.g., 'too_fast', 'too_slow'
        'comparison_to_norm': {},
        'recommendation': 'No specific issues detected.',
        'metadata_used': {}  # To show what data was used for analysis
    }

    # Fetch question metadata
    question_meta = load_question_metadata(question_id)
    if not question_meta:
        analysis_results['recommendation'] = "Could not load question metadata for deeper analysis."
        return analysis_results

    analysis_results['metadata_used']['question'] = question_meta

    # Get historical stats for this question
    stats = calculate_response_time_stats(question_id)
    if not stats:
        analysis_results['recommendation'] = "Not enough historical data for this question to calculate norms."
        return analysis_results

    analysis_results['comparison_to_norm'] = stats

    mean_time = stats['mean']
    std_dev_time = stats['std']

    # 1. Calculate Z-score
    if std_dev_time > 0:
        z_score = (response_time - mean_time) / std_dev_time
        analysis_results['deviation_score'] = float(z_score)  # Ensure it's a standard Python float
    else:
        # If std_dev is 0, all previous times were identical. Check if current time matches.
        z_score = 0 if response_time == mean_time else (
            100 if response_time > mean_time else -100)  # Arbitrary large deviation
        analysis_results['deviation_score'] = float(z_score)

    # 2. Apply Thresholds (based on Z-score or absolute times)
    # These thresholds are examples and should be defined based on domain expertise and data analysis
    TOO_FAST_Z_THRESHOLD = -2.0  # e.g., 2 standard deviations below the mean
    TOO_SLOW_Z_THRESHOLD = 3.0  # e.g., 3 standard deviations above the mean (might be more tolerant for slowness)

    # Absolute minimum/maximum times, regardless of stats (e.g., if a question is trivial)
    # You might want to define these per question category/difficulty in metadata
    MIN_ACCEPTABLE_TIME_MS = 100  # e.g., 100ms is too fast for *any* meaningful thought
    MAX_ACCEPTABLE_TIME_MS = 60000 * 5  # e.g., 5 minutes for a single question is extremely slow

    if response_time < MIN_ACCEPTABLE_TIME_MS:
        analysis_results['threshold_status'].append('too_fast_absolute')
        analysis_results['overall_assessment'] = 'highly_suspicious_fast'
        analysis_results[
            'recommendation'] = "Response time is extremely fast, suggesting a possible random answer or technical issue."
    elif response_time > MAX_ACCEPTABLE_TIME_MS:
        analysis_results['threshold_status'].append('too_slow_absolute')
        analysis_results['overall_assessment'] = 'highly_suspicious_slow'
        analysis_results['recommendation'] = "Response time is extremely slow, suggesting distraction or disengagement."
    elif z_score < TOO_FAST_Z_THRESHOLD:
        analysis_results['threshold_status'].append('too_fast_relative')
        analysis_results['overall_assessment'] = 'suspiciously_fast'
        analysis_results[
            'recommendation'] = "Response time is significantly faster than average for this question, might indicate guessing."
    elif z_score > TOO_SLOW_Z_THRESHOLD:
        analysis_results['threshold_status'].append('too_slow_relative')
        analysis_results['overall_assessment'] = 'suspiciously_slow'
        analysis_results[
            'recommendation'] = "Response time is significantly slower than average for this question, might indicate difficulty or prolonged thought."

    return analysis_results


# --- Flask Endpoint ---
@app.route('/analyze_response_time', methods=['POST'])
def handle_analyze_response_time():
    data = request.get_json()
    user_id = data.get('userId')
    question_id = data.get('questionId')
    answer = data.get('answer')  # You might not need 'answer' for time analysis, but good to have
    response_time = data.get('responseTime')  # This is the time taken in ms

    # You'll need to pass questionType from Node.js or infer it from question_id
    # For now, let's assume it's always psychotechnical for this endpoint.
    # In a real scenario, you'd fetch question_type from question_metadata_cache/DB
    question_type = 'psychotechnical'  # Placeholder

    if not all([user_id, question_id, response_time is not None]):
        return jsonify({"message": "Missing required data"}), 400

    analysis_result = analyze_single_response_time(user_id, question_id, response_time, question_type)

    return jsonify(analysis_result)


if __name__ == '__main__':
    # Initialize cache with some data if available or desirable
    # Example: Pre-load some question metadata at startup
    # all_questions = list(psychotechnical_questions_collection.find({}, {'category': 1, 'difficulty': 1}))
    # for q in all_questions:
    #     question_metadata_cache[str(q['_id'])] = {
    #         '_id': str(q['_id']),
    #         'category': q.get('category'),
    #         'difficulty': q.get('difficulty')
    #     }
    print("Flask server starting...")
    # You might want to run this with gunicorn or waitress in production
    app.run(host='0.0.0.0', port=5000, debug=True)


# from flask import Flask, request, jsonify
# import numpy as np
#
# app = Flask(__name__)
#
# # נתוני זמן תגובה ממוצעים (לצורך הדגמה בלבד - בעתיד נרצה לאסוף אותם מנתונים אמיתיים)
# # המפתח הוא questionId
# mock_average_response_times = {
#     "q1": {"avg_time": 5000, "std_dev": 1000},  # 5 שניות
#     "q2": {"avg_time": 7000, "std_dev": 1500},  # 7 שניות
#     "q3": {"avg_time": 3000, "std_dev": 500},   # 3 שניות
#     # ... כאן תוכלי להוסיף עוד שאלות
# }
#
# @app.route('/analyze_response_time', methods=['POST'])
# def analyze_response_time():
#     """
#     מקבל נתוני תגובה (כולל זמן תגובה), מנתח אותם ומחזיר סטטוס ניתוח.
#     """
#     data = request.get_json()
#
#     if not data:
#         return jsonify({"error": "Invalid JSON data"}), 400
#
#     user_id = data.get('userId')
#     question_id = data.get('questionId')
#     response_time = data.get('responseTime') # במילישניות
#     answer = data.get('answer') # תשובת המשתמש
#
#     if not all([user_id, question_id, response_time is not None]):
#         return jsonify({"error": "Missing required fields: userId, questionId, responseTime"}), 400
#
#     print(f"Received data for User: {user_id}, Question: {question_id}, Response Time: {response_time}ms, Answer: {answer}")
#
#     # --- לוגיקת ניתוח זמן תגובה ---
#     analysis_result = {
#         "userId": user_id,
#         "questionId": question_id,
#         "responseTime": response_time,
#         "analysisStatus": "OK",
#         "feedback": "No specific feedback yet."
#     }
#
#     # דוגמה לניתוח פשוט: השוואה לממוצע ידוע
#     if question_id in mock_average_response_times:
#         avg_time_info = mock_average_response_times[question_id]
#         avg_time = avg_time_info['avg_time']
#         std_dev = avg_time_info['std_dev']
#
#         # חישוב ציון Z (כמה סטיות תקן המשתמש רחוק מהממוצע)
#         z_score = (response_time - avg_time) / std_dev if std_dev else 0
#
#         analysis_result['averageTime'] = avg_time
#         analysis_result['stdDev'] = std_dev
#         analysis_result['zScore'] = round(z_score, 2) # עיגול לשתי ספרות אחרי הנקודה
#
#         if z_score > 2: # איטי משמעותית
#             analysis_result['analysisStatus'] = "Slow"
#             analysis_result['feedback'] = "Response was significantly slower than average. Might indicate hesitation or deep thought."
#         elif z_score < -1.5: # מהיר משמעותית (ייתכן ניחוש או ידע אינטואיטיבי חזק)
#             analysis_result['analysisStatus'] = "Fast"
#             analysis_result['feedback'] = "Response was significantly faster than average. Could indicate quick intuition or guessing."
#         else:
#             analysis_result['feedback'] = "Response time is within expected range."
#     else:
#         analysis_result['analysisStatus'] = "No Reference Data"
#         analysis_result['feedback'] = "No average response time data available for this question."
#
#     # כאן תוכלי להוסיף לוגיקה מורכבת יותר, למשל:
#     # - בדיקה אם זמן התגובה נמוך מסף מסוים (למשל, 500ms) - אולי קליק אקראי?
#     # - בדיקה אם זמן התגובה גבוה מסף מסוים (למשל, 30 שניות) - אולי התנתק?
#
#     return jsonify(analysis_result), 200
#
# if __name__ == '__main__':
#     # הפעלת השרת על פורט 5000 (פורט נפוץ ל-Flask)
#     # שימי לב: debug=True נועד לפיתוח בלבד! ב-production יש להשתמש בשרת WSGI כמו Gunicorn.
#     app.run(debug=True, port=5000)