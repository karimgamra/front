import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Courses = () => {
  const navigate = useNavigate();
  const { id } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (id === null) {
      navigate("/");
      toast.warning("You Don't have access to this page !!! Go To Register");
    }
  }, [navigate]);

  return <div>Courses</div>;
};

export default Courses;
