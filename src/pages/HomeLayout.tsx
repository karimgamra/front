import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomeLayout = () => {
  const location = useLocation();
  return (
    <>
      <Header />
      <NavBar />

      <section className="align-element py-20">
        <Outlet />
      </section>
      {location.pathname === "/" && <Footer />}
    </>
  );
};
export default HomeLayout;
