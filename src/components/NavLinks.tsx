import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const links = [
  { id: 1, url: "/", text: "home" },
  { id: 2, url: "about", text: "about" },
  { id: 3, url: "attendance", text: "attendance" },
  { id: 4, url: "courses", text: "courses" },
];

const NavLinks = () => {
  const role = useSelector((state) => state.user.role);
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if (url === "attendance" && role === "student") return null;
        return (
          <li key={id}>
            <NavLink className="capitalize" to={url}>
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

export default NavLinks;
