// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // כלי פיתוח של React Query
import { Provider } from 'react-redux'; // Redux Provider
import store from './store/store';

// 1. צור QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // נתונים נחשבים טריים ל-5 דקות
      gcTime: 1000 * 60 * 10, // נתונים בקאש נשמרים ל-10 דקות גם אם לא בשימוש
      retry: 3, // ינסה לבצע את הבקשה 3 פעמים במקרה של כשל
    },
  },
});

// 2. צור את ה-root של React 18, עם אופרטור אי-null
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. עטוף בפרובידרי הקשר הרלוונטיים, בסדר הגיוני */}
    <Provider store={store}> {/* Redux Provider */}
      <QueryClientProvider client={queryClient}> {/* React Query Provider */}
          <App />
        {/* 5. כלי פיתוח של React Query - רק במצב פיתוח */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);

// 6. אם רוצה למדוד ביצועים (אופציונלי)
// import reportWebVitals from './reportWebVitals';
// reportWebVitals(console.log);