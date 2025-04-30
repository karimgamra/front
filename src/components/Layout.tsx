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
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center md:hidden">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-gray-800 text-white p-6 shadow-lg transition-transform duration-300 ease-in-out z-50 md:z-0`}
      >
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-semibold mb-8 hidden md:block">
            Admin Panel
          </h2>
          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>
              </li>
              {/* Add more links as needed */}
            </ul>
          </nav>

          <div className="mt-auto space-y-2">
            <Link
              to="/colander"
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full"
            >
              <Calendar size={18} />
              Set Calendar
            </Link>
            <Link
              to="/GetCalender"
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full"
            >
              <Calendar size={18} />
              Check Calendar
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 bg-white rounded-xl shadow-md overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
