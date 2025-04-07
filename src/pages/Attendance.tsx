import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

type Student = {
  id: string;
  name: string;
  niveau: string;
};

type Subject = {
  _id: string;
  name: string;
  teacher_id: string;
};

type AttendanceStatus = "Present" | "Absent" | "Late";
type AttendanceRecord = Record<string, AttendanceStatus | undefined>;
type AttendanceData = {
  student_id: string;
  subject_id: string;
  status: string;
  date: string;
};

const AttendancePage: React.FC = () => {
  const location = useLocation();
  const role = useSelector((state: any) => state.user.role);
  const navigate = useNavigate();

  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect students away from this page
  useEffect(() => {
    if (location.pathname === "/attendance" && role === "student") {
      navigate("/");
    }
  }, [location.pathname, role, navigate]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/subjects", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data: Subject[] = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch students when niveau changes
  useEffect(() => {
    if (!selectedNiveau) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/students?niveau=${selectedNiveau}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch students");
        }
        const data: Student[] = await response.json();
        setStudents(data);
        setAttendance({});
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message || "An error occurred while fetching students.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedNiveau]);

  // Fetch attendance data when subject or niveau changes
  useEffect(() => {
    if (!selectedSubject || !selectedNiveau) {
      setAttendanceData([]);
      return;
    }

    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/attendance/subject/${selectedSubject}?niveau=${selectedNiveau}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Failed to fetch attendance data"
          );
        }
        const data = await response.json();
        setAttendanceData(data.records);
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError(
          err.message || "An error occurred while fetching attendance data."
        );
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedSubject, selectedNiveau]);

  // Calculate absences per student and total
  const getAbsenceCount = (studentId: string) => {
    return attendanceData.filter(
      (record) => record.student_id === studentId && record.status === "Absent"
    ).length;
  };

  const totalAbsences = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;

  // Handle attendance status change
  const handleAttendanceChange = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  // Save attendance records
  const handleSaveAttendance = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
    if (!selectedNiveau) {
      alert("Please select a niveau.");
      return;
    }
    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }
    if (students.length === 0) {
      alert("No students available to mark attendance for.");
      return;
    }

    const attendanceRecords = students.map((student) => ({
      student_id: student.id,
      subject_id: selectedSubject,
      status: attendance[student.id] || "Absent",
      date: selectedDate,
    }));

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: attendanceRecords }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save attendance");
      }

      alert("Attendance saved successfully!");
      setAttendance({});

      // Refresh attendance data after saving
      const refreshResponse = await fetch(
        `http://127.0.0.1:8000/attendance/subject/${selectedSubject}?niveau=${selectedNiveau}`,
        { credentials: "include" }
      );
      const refreshedData = await refreshResponse.json();
      setAttendanceData(refreshedData.records);
    } catch (err) {
      console.error("Error saving attendance:", err);
      setError(err.message || "An error occurred while saving attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Student Attendance</h2>

      {/* Date Picker */}
      <label className="block mb-2 font-medium">Select Date:</label>
      <input
        type="date"
        className="border p-2 rounded mb-4 w-full"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        disabled={loading}
      />

      {/* Subject Dropdown */}
      <label className="block mb-2 font-medium">Select Subject:</label>
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedSubject || ""}
        onChange={(e) => setSelectedSubject(e.target.value || null)}
        disabled={loading}
      >
        <option value="" disabled>
          Pick a subject
        </option>
        {subjects.map((subject) => (
          <option key={subject._id} value={subject._id}>
            {subject.name}
          </option>
        ))}
      </select>

      {/* Niveau Dropdown */}
      <label className="block mb-2 font-medium">Select Niveau:</label>
      <select
        className="border p-2 rounded mb-5 w-full"
        value={selectedNiveau || ""}
        onChange={(e) => setSelectedNiveau(e.target.value || null)}
        disabled={loading}
      >
        <option value="" disabled>
          Pick a niveau
        </option>
        <option value="1ere">1ere</option>
        <option value="2eme">2eme</option>
        <option value="3eme">3eme</option>
      </select>

      {/* Total Absences */}
      {selectedSubject && (
        <p className="text-gray-700 mb-4">
          Total Absences for this Subject:{" "}
          <span className="font-bold">{totalAbsences}</span>
        </p>
      )}

      {/* Loading and Error States */}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Student List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {students.length > 0 ? (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <span className="text-lg">{student.name}</span>
                {selectedSubject && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Absences: {getAbsenceCount(student.id)})
                  </span>
                )}
              </div>
              <div className="space-x-2">
                {(["Present", "Absent", "Late"] as AttendanceStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      className={`px-3 py-1 rounded text-sm ${
                        attendance[student.id] === status
                          ? status === "Present"
                            ? "bg-green-500 text-white"
                            : status === "Absent"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => handleAttendanceChange(student.id, status)}
                      disabled={loading}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            {selectedNiveau
              ? "No students found for this niveau."
              : "Please select a niveau to view students."}
          </p>
        )}
      </div>

      {/* Save Button */}
      <button
        className={`mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        onClick={handleSaveAttendance}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
};

export default AttendancePage;
