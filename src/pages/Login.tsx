import { Form, Link, redirect } from "react-router-dom";
import { FormInput, SubmitBtn } from "../components/index";
import axios from "axios";
import { toast } from "react-toastify";
import { setUser } from "../features/user/UserSlice";

const url = "http://127.0.0.1:8000/login";

type LoginForm = {
  id: string;
  password: string;
  role: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  username: string;
  role: string;
  id: string;
  email: string;
};

export const action =
  (store) =>
  async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const data: LoginForm = Object.fromEntries(formData) as LoginForm;

    if (!data.id || !data.password || !data.role) {
      toast.error("All fields are required");
      return null;
    }

    if (!["admin", "student", "teacher"].includes(data.role)) {
      toast.error("Invalid role selected");
      return null;
    }

    console.log("Sending login request with data:", data);

    try {
      const response = await axios.post<LoginResponse>(url, {
        id: data.id,
        password: data.password,
        role: data.role,
      });

      console.log("Login response:", response.data);

      store.dispatch(
        setUser({
          username: response.data.username || "Unknown", // Fallback if username is empty
          email: response.data.email,
          role: response.data.role,
          id: response.data.id,
          token: response.data.access_token, // Include token
        })
      );

      toast.success("Login successful");
      return redirect(data.role === "teacher" ? "/attendance" : "/");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
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
        <FormInput
          type="text"
          label="ID (Admin/Student/Teacher ID)"
          name="id"
          defaultValue="772"
        />
        <FormInput
          type="password"
          label="Password"
          name="password"
          defaultValue="teacherpass"
        />
        <div className="form-control">
          <label className="label">
            <span className="label-text">Role</span>
          </label>
          <select
            name="role"
            className="select select-bordered w-full"
            defaultValue="teacher"
          >
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div className="mt-4">
          <SubmitBtn text="Login" />
        </div>
        <p className="capitalize text-md text-center text-base-content mt-4">
          I don't have an account yet?
          <span className="link text-md ml-1 text-primary">
            <Link to="/register">register</Link>
          </span>
        </p>
      </Form>
    </section>
  );
};

export default Login;
