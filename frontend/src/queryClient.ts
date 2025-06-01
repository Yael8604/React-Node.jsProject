// src/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// הגדרת ברירות מחדל עבור ה-QueryClient
// לדוגמה: כמה זמן נתונים יישארו ב-cache, כמה זמן הם ייחשבו 'fresh'
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // נתונים ייחשבו 'stale' (דורשים רענון) לאחר 5 דקות
            refetchOnWindowFocus: false, // אל תרענן נתונים אוטומטית בחזרה ללשונית/חלון
            retry: 1, // נסה שוב פעם אחת במקרה של כשל בקריאה
        },
        mutations: {
            // הגדרות ברירת מחדל למוטציות (POST, PUT, DELETE)
        }
    },
});

export default queryClient;