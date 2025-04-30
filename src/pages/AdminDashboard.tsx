import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../store";

// Define types for the forms
type StudentForm = {
  id: string;
  username: string;
  email: string;
  password: string;
  niveau: string;
  speciality: string;
};

type TeacherForm = {
  id: string;
  name: string;
  email: string;
  password: string;
  subjects: string[];
  classes: string[];
};

type SubjectForm = {
  name: string;
  teacher_id: string;
  class_name: string;
};

const AdminDashboard = () => {
  const { token, id: adminId } = useSelector((state: RootState) => state.user);
  console.log(adminId);

  const [studentForm, setStudentForm] = useState<StudentForm>({
    id: "",
    username: "",
    email: "",
    password: "",
    niveau: "",
    speciality: "",
  });

  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    id: "",
    name: "",
    email: "",
    password: "",
    subjects: [],
    classes: [],
  });
  console.log(teacherForm);

  const [subjectForm, setSubjectForm] = useState<SubjectForm>({
    name: "",
    teacher_id: "",
    class_name: "",
  });

  const [subjectInput, setSubjectInput] = useState("");
  const [classInput, setClassInput] = useState("");

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/admin/students?id=admin001&role=admin`,
        studentForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Student added successfully");
      setStudentForm({
        id: "",
        username: "",
        email: "",
        password: "",
        niveau: "",
        speciality: "",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail || "Failed to add student";
      toast.error(errorMessage);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending teacherForm:", teacherForm);
    try {
      // Validate non-empty fields
      if (!teacherForm.subjects.length || !teacherForm.classes.length) {
        toast.error("Please add at least one subject and class");
        return;
      }
      if (!teacherForm.password.trim()) {
        toast.error("Please provide a password");
        return;
      }
      // Transform teacherForm to match backend field names
      const payload = {
        id: teacherForm.id,
        name: teacherForm.name,
        email: teacherForm.email,
        password: teacherForm.password,
        subjects: teacherForm.subjects,
        classes: teacherForm.classes,
      };
      console.log("Sending payload:", payload);
      await axios.post(
        `http://127.0.0.1:8000/admin/teachers?id=admin001&role=admin`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Teacher added successfully");
      setTeacherForm({
        id: "",
        name: "",
        email: "",
        password: "",
        subjects: [],
        classes: [],
      });
      setSubjectInput("");
      setClassInput("");
    } catch (error) {
      console.log(error);

      console.error("Error response:", error.response?.data);
      const errorMessage =
        error?.response?.data?.detail || "Failed to add teacher";
      toast.error(errorMessage);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/admin/subjects?id=${adminId}&role=admin`,
        subjectForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Subject added successfully");
      setSubjectForm({ name: "", teacher_id: "", class_name: "" });
    } catch (error) {
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error?.response?.data?.detail || "Failed to add subject";
      toast.error(errorMessage);
    }
  };

  const addSubject = () => {
    if (subjectInput.trim()) {
      setTeacherForm((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subjectInput.trim()],
      }));
      setSubjectInput("");
    }
  };

  const addClass = () => {
    if (classInput.trim()) {
      setTeacherForm((prev) => ({
        ...prev,
        classes: [...prev.classes, classInput.trim()],
      }));
      setClassInput("");
    }
  };

  return (
    <section className="bg-white p-8 rounded-lg shadow-lg max-w-screen-md grid place-items-center mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Admin Dashboard</h1>

      <div className="tabs tabs-boxed mb-8">
        <input
          type="radio"
          name="admin_tabs"
          role="tab"
          className="tab"
          aria-label="Add Student"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Add a Student
          </h2>
          <form onSubmit={handleAddStudent} className="space-y-4">
            {[
              { label: "Student ID", value: studentForm.id, key: "id" },
              {
                label: "Username",
                value: studentForm.username,
                key: "username",
              },
              { label: "Email", value: studentForm.email, key: "email" },
              {
                label: "Password",
                value: studentForm.password,
                key: "password",
                type: "password",
              },
            ].map((field, index) => (
              <div className="form-control" key={index}>
                <label className="label">
                  <span className="label-text">{field.label}</span>
                </label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      [field.key]: e.target.value,
                    })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>
            ))}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Niveau</span>
              </label>
              <select
                value={studentForm.niveau}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, niveau: e.target.value })
                }
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Niveau</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Speciality</span>
              </label>
              <select
                value={studentForm.speciality}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, speciality: e.target.value })
                }
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Speciality</option>
                <option value="SI">SI</option>
                <option value="ISI">ISI</option>
                <option value="TIC">TIC</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full hover:bg-blue-700"
            >
              Add Student
            </button>
          </form>
        </div>

        <input
          type="radio"
          name="admin_tabs"
          role="tab"
          className="tab"
          aria-label="Add Teacher"
        />
        <div role="tabpanel" className="tab-content p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Add a Teacher
          </h2>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Teacher ID</span>
              </label>
              <input
                type="text"
                value={teacherForm.id}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, id: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                value={teacherForm.name}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, name: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={teacherForm.email}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, email: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={teacherForm.password}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, password: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Subjects</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) =>
                    setSubjectInput(e.target.value.toUpperCase())
                  }
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherForm.subjects.map((subj, idx) => (
                  <span key={idx} className="badge badge-info">
                    {subj}
                  </span>
                ))}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Classes</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value.toUpperCase())}
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  onClick={addClass}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherForm.classes.map((cls, idx) => (
                  <span key={idx} className="badge badge-info">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full hover:bg-blue-700"
            >
              Add Teacher
            </button>
          </form>
        </div>

        <input
          type="radio"
          name="admin_tabs"
          role="tab"
          className="tab"
          aria-label="Add Subject"
        />
        <div role="tabpanel" className="tab-content p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Add a Subject
          </h2>
          <form onSubmit={handleAddSubject} className="space-y-4">
            {[
              { label: "Subject Name", value: subjectForm.name, key: "name" },
              {
                label: "Teacher ID",
                value: subjectForm.teacher_id,
                key: "teacher_id",
              },
              {
                label: "Class Name",
                value: subjectForm.class_name,
                key: "class_name",
              },
            ].map((field, index) => (
              <div className="form-control" key={index}>
                <label className="label">
                  <span className="label-text">{field.label}</span>
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      [field.key]: e.target.value,
                    })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-primary w-full hover:bg-blue-700"
            >
              Add Subject
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
