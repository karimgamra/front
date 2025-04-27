import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../features/user/UserSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { GiTeacher } from "react-icons/gi";
import { FaUser, FaEnvelope, FaShieldAlt, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const { username, role, email, id } = useSelector((state) => state.user);
  console.log(username);

  const dispatch = useDispatch();
  const url = "http://127.0.0.1:8000/logout";

  const handleLogout = async () => {
    try {
      const response = await axios.post(url, { user_id: id });

      if (response.data.message) {
        toast.success(response.data.message);
        dispatch(logout());
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error logging out");
    }
  };

  return (
    <div className="bg-slate-900 py-3 shadow-md">
      <div className="flex justify-between items-center mx-12">
        {id ? (
          <div className="flex items-center gap-6">
            <div className="dropdown relative rounded-xl">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-circle bg-gray-800 hover:bg-gray-700 text-white"
              >
                <p className="font-bold text-lg">{username.charAt(0)}</p>
              </div>
              <ul className="dropdown-content bg-white rounded-lg z-10 w-64 p-4 shadow-lg border border-gray-200">
                <li className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-200 p-1 rounded-md">
                  {role === "student" ? (
                    <FaUser className="text-gray-700 w-6 h-6 font-extrabold" />
                  ) : (
                    <GiTeacher className="text-gray-700 w-6 h-6 font-extrabold" />
                  )}
                  <span className="font-bold text-lg text-gray-900">
                    {username}
                  </span>
                </li>
                <li className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-200 p-1 rounded-md">
                  <FaEnvelope className="text-green-500 w-5 h-5" />
                  <span className="text-sm text-gray-800">{email}</span>
                </li>
                <li className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-200 p-1 rounded-md">
                  <FaShieldAlt className="text-red-500 w-5 h-5" />
                  <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-md text-sm font-semibold">
                    {role}
                  </span>
                </li>
                <li className="pt-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-red-600 font-semibold py-2 w-full bg-gray-100 hover:bg-gray-200 rounded-md transition-all"
                  >
                    <FaSignOutAlt className="w-5 h-5 text-red-600" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
            <p className="text-white text-lg font-semibold">
              Hello, {`${role === "student" ? "" : "Mr"} ${username}`}
            </p>
          </div>
        ) : (
          <div className="w-full flex gap-x-4 justify-end">
            <Link
              to="/register"
              className="text-white text-lg cursor-pointer link"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="text-white text-lg cursor-pointer link"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
