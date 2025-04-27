import { useSelector } from "react-redux";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
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
import Contact from "./components/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import { RootState } from "./store";
import Layout from "./components/Layout";
import Calendar from "./pages/Calendar";
import GetCalender from "./components/GetCalender";
import { loader as colanderLoader } from "./components/GetCalender";
// Router for non-admins (main app structure)
const mainRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "contact",
        element: <Contact />,
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
  {
    path: "contact",
    element: <Contact />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

// Router for admins (admin-specific interface)
const adminRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        index: true,
        element: <Navigate to="/admin" replace />,
      },
      {
        path: "/colander",
        element: <Calendar />,
      },
      {
        path: "GetCalender",
        element: <GetCalender />,
        loader: colanderLoader,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
    action: LoginAction(store),
  },
  {
    path: "*",
    element: <Navigate to="/admin" replace />,
  },
]);
// Component to select router based on role and authentication
const AppRouter = () => {
  const { role, token } = useSelector((state: RootState) => state.user);

  // Use adminRouter if user is authenticated and has admin role
  const selectedRouter = role === "admin" ? adminRouter : mainRouter;

  return <RouterProvider router={selectedRouter} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
};

export default App;
