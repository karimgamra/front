import { Form, Link, redirect } from "react-router-dom";
import { FormInput, SubmitBtn } from "../components/index";
import axios from "axios";
import { toast } from "react-toastify";
import { setUser } from "../features/user/UserSlice";

const url = "http://127.0.0.1:8000/login";

type LoginForm = {
  email: string;
  password: string;
  id: string; // User ID
};

type LoginResponse = {
  message: string;
  username: string;
  role: string;
  id: string;
};

export const action =
  (store) =>
  async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const data: LoginForm = Object.fromEntries(formData) as LoginForm;

    try {
      const response = await axios.post<LoginResponse>(url, {
        email: data.email,
        password: data.password,
        id: data.id, // Include user ID
      });

      store.dispatch(
        setUser({
          username: response.data.username,
          email: data.email,
          role: response.data.role,
          id: response.data.id,
        })
      );
      toast.success(response.data.message);
      return redirect("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      toast.error(errorMessage);

      return null;
    }
  };

const Login = () => {
  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="post"
        className="card w-96 p-8 bg-base-100 shadow-lg flex flex-col gap-y-4"
      >
        <h4 className="text-center text-3xl font-bold">Login</h4>
        <FormInput type="email" label="Email" name="email" />
        <FormInput type="password" label="Password" name="password" />
        <FormInput
          type="text"
          label="ID (Student or Teacher ID)"
          name="id"
        />{" "}
        {/* User ID field */}
        <div className="mt-4">
          <SubmitBtn text="Login" />
        </div>
        <p className="capitalize text-md  text-center text-base-content mt-4">
          i dont have account yet?
          <span className="link text-md ml-1 text-primary">
            <Link to="/register">register</Link>
          </span>
        </p>
      </Form>
    </section>
  );
};

export default Login;
