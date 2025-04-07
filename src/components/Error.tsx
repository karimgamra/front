import { useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError();
  return (
    <div className=" grid place-content-center min-h-screen">
      <p className="text-3xl text-base-content capitalize">
        there was an error ...
      </p>
    </div>
  );
};

export default Error;
