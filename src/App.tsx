import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Landing } from "./pages";
import Error from "./components/Error";
import { action as LoginAction } from "./pages/Login";
import { action as RegisterAction } from "./pages/Register";
import { store } from "./store";
import Attendance from "./pages/Attendance";
import Courses from "./pages/Courses";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "about",
        element: <About />,
      },
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "courses",
        element: <Courses />,
      },
    ],
  },

  {
    path: "login",
    element: <Login />,
    action: LoginAction(store),
  },
  {
    path: "register",
    element: <Register />,
    action: RegisterAction(store),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
