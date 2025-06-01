import { createBrowserRouter } from "react-router";
import AppLayout from "../components/AppLayout";
import Home from "../pages/Home";
import About from "../pages/About";

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
            }

        ]
    }
])
export default router