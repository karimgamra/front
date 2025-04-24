import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/user/UserSlice";
import { toast } from "react-toastify";
import { LogOut, Calendar, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="bg-blue-800 text-white p-4 flex justify-between md:hidden">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white p-6 shadow-lg transition-all`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-3xl font-bold mb-8 tracking-wide hidden md:block">
              Admin Panel
            </h2>
            <nav>
              <ul className="space-y-3">
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 font-semibold shadow-md"
                          : "hover:bg-blue-700"
                      }`
                    }
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </NavLink>
                </li>
                {/* Add more links if needed */}
              </ul>
            </nav>
          </div>

          <div className="space-y-4 mt-10">
            <Link
              to="/colander"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all w-full text-center"
            >
              <Calendar size={18} />
              Set Calendar
            </Link>
            <Link
              to="/GetCalender"
              className="flex items-center justify-center gap-2 p-2 bg-blue-700 rounded-lg text-white"
            >
              check calender
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 w-full rounded-lg transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-white shadow-inner rounded-t-3xl md:rounded-l-3xl overflow-auto w-full">
        <div className="max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
