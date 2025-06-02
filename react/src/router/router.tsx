import { createBrowserRouter } from "react-router";
import AppLayout from "../components/AppLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import PersonalProfile from "../pages/PersonalProfile";
import ExamInstructions from "../pages/ExamInstructions";
import Exam from "../pages/Exam";
import Results from "../pages/Results";

const router = createBrowserRouter([
    {
        element:<AppLayout/>,
        children:[
            {
                path:"/",
                element:<Home/>
            },
            {
                path: "about",
                element: <About/> 
            },
            {
                path: "PersonalProfile",
                element: <PersonalProfile />,
            },
            {
                path: "exam-instructions",
                element: <ExamInstructions />,
            },
            {
                path: "exam",
                element: <Exam />,
            },
            {
                path: "results/:examId?", // נתיב עבור תוצאות הבחינה (אופציונלי: פרמטר ID לבחינה ספציפית)
                element: <Results />,
            },

        ]
    }
])
export default router



// // src/router/router.tsx
// import { createBrowserRouter } from "react-router-dom"; // השתמש ב-react-router-dom
// import AppLayout from "../components/AppLayout";
// import Home from "../pages/Home";
// import About from "../pages/About";
// import PersonalProfile from "../pages/PersonalProfile";
// import ExamInstructions from "../pages/ExamInstructions"; // ייבוא חדש
// import Exam from "../pages/Exam"; // ייבוא חדש
// import Results from "../pages/Results"; // ייבוא חדש

// const router = createBrowserRouter([
//     {
//         element: <AppLayout />,
//         children: [
//             {
//                 path: "/",
//                 element: <Home />
//             },
//             {
//                 path: "about",
//                 element: <About />
//             },
//             {
//                 path: "PersonalProfile",
//                 element: <PersonalProfile />,
//             },
//             {
//                 path: "exam-instructions", // נתיב חדש להוראות
//                 element: <ExamInstructions />
//             },
//             {
//                 path: "exam/:sessionId", // נתיב חדש למבחן עצמו
//                 element: <Exam />
//             },
//             {
//                 path: "results/:sessionId", // נתיב חדש לתוצאות
//                 element: <Results />
//             }
//         ]
//     }
// ]);

// export default router;