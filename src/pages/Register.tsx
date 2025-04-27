import { Form, Link, redirect } from "react-router-dom";
import { FormInput, SubmitBtn } from "../components/index";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { setUser } from "../features/user/UserSlice";
import {
  EnhancedStore,
  UnknownAction,
  Tuple,
  StoreEnhancer,
  ThunkDispatch,
} from "@reduxjs/toolkit";
// const API_BASE_URL = "https://fastapi-tcs4.onrender.com";
const url = "http://127.0.0.1:8000/admin/register"; // Updated to the new endpoint

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  id: string;
  role: string; // Add role field
};

type RegisterResponse = {
  message: string;
  username: string;
  email: string;
  role: string;
  id: string;
};

export const action =
  (
    store: EnhancedStore<
      {
        user: {
          username: string | null;
          email: string | null;
          role: string | null;
          id: string | null;
        };
      },
      UnknownAction,
      Tuple<
        [
          StoreEnhancer<{
            dispatch: ThunkDispatch<
              {
                user: {
                  username: string | null;
                  email: string | null;
                  role: string | null;
                  id: string | null;
                };
              },
              undefined,
              UnknownAction
            >;
          }>,
          StoreEnhancer
        ]
      >
    >
  ) =>
  async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const data: RegisterForm = Object.fromEntries(formData) as RegisterForm;

    try {
      const response = await axios.post<RegisterResponse>(
        url,
        {
          username: data.username,
          email: data.email,
          password: data.password,
          id: data.id,
          role: data.role, // Pass the role to the backend
        },
        {
          params: {
            id: "admin001", // Admin credentials for authentication
            role: "admin",
          },
        }
      );

      store.dispatch(
        setUser({
          username: response.data.username,
          email: response.data.email,
          role: response.data.role,
          id: response.data.id,
        })
      );

      toast.success("Registration successful");
      return redirect("/login");
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError?.response?.data as unknown)?.detail ||
        "Please double-check your credentials";
      toast.error(errorMessage);
      return null;
    }
  };

const Register = () => {
  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="post"
        className="card w-96 p-8 bg-base-100 shadow-lg flex flex-col gap-y-4"
      >
        <h4 className="text-center text-3xl font-bold">Register</h4>
        <FormInput type="text" label="username" name="username" />
        <FormInput type="email" label="email" name="email" />
        <FormInput type="password" label="password" name="password" />
        <FormInput
          type="text"
          label="ID (Admin/Student/Teacher ID)"
          name="id"
        />
        {/* Add a dropdown for role */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Role</span>
          </label>
          <select name="role" className="select select-bordered w-full">
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div className="mt-4">
          <SubmitBtn text="Register" />
        </div>
        <p className="text-center">
          Already a member?{" "}
          <Link
            to="/login"
            className="ml-2 link link-hover link-primary capitalize"
          >
            Login
          </Link>
        </p>
      </Form>
    </section>
  );
};

export default Register;
