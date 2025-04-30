import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearUser } from "../features/user/UserSlice";

const BASE_URL: string = "http://127.0.0.1:8000";

type AbsenceSummary = {
  subject_id: string;
  subject_name: string;
  absence_count: number;
};

const StudentAbsences: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, role, token } = useSelector((state: any) => state.user);

  const [absences, setAbsences] = useState<AbsenceSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not a student or missing credentials
  useEffect(() => {
    if (role !== "student") {
      navigate("/");
      toast.warning("Only students can access this page");
      return;
    }
    if (!id || !token) {
      setError("User ID or token is missing. Please log in again.");
      dispatch(clearUser());
      navigate("/login");
      return;
    }
  }, [id, role, token, navigate, dispatch]);

  // Fetch absence data
  const fetchAbsences = async () => {
    if (!id || !token) {
      setError("Cannot fetch absences: Missing user ID or token");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/student/absences`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: AbsenceSummary[] = response.data;
      setAbsences(data);
      if (data.length === 0) {
        setError("No absences recorded.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to fetch absences";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.status === 403) {
        errorMessage = "Access denied. Students only.";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setAbsences([]);
      console.error("Error fetching absences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch absences on component mount
  useEffect(() => {
    if (id && token) {
      fetchAbsences();
    }
  }, [id, token]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">My Absences</h2>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {absences.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-left">Subject</th>
                <th className="border px-4 py-2 text-left">
                  Number of Absences
                </th>
              </tr>
            </thead>
            <tbody>
              {absences.map((absence) => (
                <tr key={absence.subject_id}>
                  <td className="border px-4 py-2">{absence.subject_name}</td>
                  <td className="border px-4 py-2">{absence.absence_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAbsences;
