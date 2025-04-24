import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const About = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const { id } = useSelector((state) => state.user);

  useEffect(() => {
    if (id === null) {
      navigate("/");
      toast.warning("You Don't have access to this page !!! Go To Register");
    }
  }, [navigate]);

  return (
    <div className="p-6 max-w-4xl mx-auto  ">
      <p className="text-lg text-base-content leading-8">
        Our goal is to help teachers save time, stay organized, and focus on
        what they do best – teaching. With this app, educators can foster a more
        interactive and collaborative learning environment, both in the
        classroom and online. We’re always working to improve and add new
        features based on feedback from teachers like you. We believe in making
        education more accessible and effective for everyone involved. Thank you
        for using our app!
      </p>
    </div>
  );
};

export default About;
