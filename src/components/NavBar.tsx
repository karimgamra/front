import React, { useState, useEffect } from "react";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { Link, NavLink } from "react-router-dom";
import NavLinks from "./NavLinks";

const themes = {
  winter: "light",
  dracula: "dracula",
};

const getThemeFromLocalStorage = () => {
  return localStorage.getItem("theme") || themes.winter;
};

const setThemeToLocalStorage = (theme: string) => {
  localStorage.setItem("theme", theme);
};

const Navbar: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(getThemeFromLocalStorage);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const handleTheme = () => {
    const newTheme =
      currentTheme === themes.winter ? themes.dracula : themes.winter;
    setCurrentTheme(newTheme);
    setThemeToLocalStorage(newTheme);
  };

  return (
    <div className="bg-base-300">
      <div className="navbar bg-base-300 shadow-sm lg:px-20">
        <div className="navbar-start">
          <div className="dropdown lg:hidden ">
            {/* Dropdown Button */}
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>

            {/* Dropdown Menu */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-300 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <NavLinks />
            </ul>
          </div>

          <div className="hidden md:block">
            <NavLink
              to="/"
              className="hidden lg:flex btn btn-primary text-3xl items-center"
            >
              C
            </NavLink>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <NavLinks />
          </ul>
        </div>
        <div className="navbar-end flex gap-5">
          <label className="swap swap-rotate">
            {/* Sun Icon */}
            <label className="swap swap-rotate">
              <input type="checkbox" onChange={handleTheme} />
              {/* sun icon*/}
              <BsSunFill className="swap-on h-4 w-4" />
              {/* moon icon*/}
              <BsMoonFill className="swap-off h-4 w-4" />
            </label>
          </label>
          <div>
            <button className="btn btn-ghost border-base-content transition-all duration-300 hover:btn-primary rounded-2xl">
              Try Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
