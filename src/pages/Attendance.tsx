import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_URL: string = "http://127.0.0.1:8000";

type Student = {
  id: string;
  username: string;
  speciality: string;
};

type Subject = {
  _id: string;
  name: string;
  teacher_id: string;
  class_name: string;
};

type Event = {
  _id: string;
  title: string;
  start_time: string;
  end_time: string;
  class_name: string;
};

type AttendanceStatus = "Present" | "Absent" | "Late";
type AttendanceRecord = Record<string, AttendanceStatus | undefined>;
type AttendanceData = {
  _id: string;
  student_id: string;
  subject_id: string;
  event_id: string;
  status: string;
  date: string;
};

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { id, role, token } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (role !== "teacher") {
      navigate("/");
      toast.warning("Only teachers can access this page");
    }
  }, [id, role, navigate]);

  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjectsWithIds, setSubjectsWithIds] = useState<Subject[]>([]);

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const fetchTeacherData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);

      const { classes, subjects } = response.data;

      setClasses(classes);

      const subjectsResponse = await axios.get(`${BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teacherSubjects = subjectsResponse.data.filter(
        (subject: Subject) =>
          subject.teacher_id === id && subjects.includes(subject.name)
      );
      setSubjectsWithIds(teacherSubjects);
    } catch (err: any) {
      console.error("Error fetching teacher data:", err);
      setError(err.response?.data?.detail || "Failed to fetch teacher data");
    }
  };

  const fetchStudents = async () => {
    if (!selectedSpeciality) {
      setStudents([]);
      setAttendance({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Student[] = response.data.students.filter(
        (student: Student) => student.speciality === selectedSpeciality
      );
      setStudents(data);
      setAttendance({});
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.detail || "Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!selectedSubjectId) {
      setEvents([]);
      setSelectedEventId(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date(today).toISOString();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      const response = await axios.get(`${BASE_URL}/events`, {
        params: {
          start_date: startDate,
          end_date: endDate.toISOString(),
          user_id: id,
          role: "teacher",
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredEvents = response.data.filter(
        (event: Event) => event.subject_id === selectedSubjectId
      );
      setEvents(filteredEvents);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.detail || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedSubjectId || !selectedSpeciality) {
      setAttendanceData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const promises = students.map((student) =>
        axios.get(`${BASE_URL}/attendance`, {
          params: { student_id: student.id, subject_id: selectedSubjectId },
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const responses = await Promise.all(promises);
      const records = responses.flatMap((res) => res.data);
      setAttendanceData(records);
    } catch (err: any) {
      console.error("Error fetching attendance data:", err);
      setError(err.response?.data?.detail || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [id, token]);

  useEffect(() => {
    fetchStudents();
  }, [selectedSpeciality]);

  useEffect(() => {
    fetchEvents();
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedSubjectId, selectedSpeciality, students]);

  const getAbsenceCount = (studentId: string) => {
    return attendanceData.filter(
      (record) => record.student_id === studentId && record.status === "Absent"
    ).length;
  };

  const totalAbsences = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;

  const handleAttendanceChange = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSpeciality) {
      toast.warning("Please select a speciality.");
      return;
    }
    if (!selectedSubjectId) {
      toast.warning("Please select a subject.");
      return;
    }
    if (!selectedEventId) {
      toast.warning("Please select an event.");
      return;
    }
    if (students.length === 0) {
      toast.error("No students available to mark attendance for.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const promises = students.map((student) =>
        axios.post(
          `${BASE_URL}/attendance`,
          {
            student_id: student.id,
            subject_id: selectedSubjectId,
            event_id: selectedEventId,
            status: attendance[student.id] || "Absent",
            date: new Date().toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      toast.success("Attendance saved successfully!");
      setAttendance({});
      await fetchAttendanceData();
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError(err.response?.data?.detail || "Failed to save attendance");
      toast.error(err.response?.data?.detail || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Student Attendance</h2>

      <label className="block mb-2 font-medium">Select Date:</label>
      <input
        type="text"
        className="border p-2 rounded mb-4 w-full"
        value={today}
        disabled
      />

      <label className="block mb-2 font-medium">Select Subject:</label>
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedSubjectId || ""}
        onChange={(e) => setSelectedSubjectId(e.target.value || null)}
        disabled={loading}
      >
        <option value="" disabled>
          Pick a subject
        </option>
        {subjectsWithIds.map((subject) => (
          <option key={subject._id} value={subject._id}>
            {subject.name}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Event:</label>
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedEventId || ""}
        onChange={(e) => setSelectedEventId(e.target.value || null)}
        disabled={loading || !selectedSubjectId}
      >
        <option value="" disabled>
          Pick an event
        </option>
        {events.map((event) => (
          <option key={event._id} value={event._id}>
            {event.title} ({new Date(event.start_time).toLocaleTimeString()} -{" "}
            {new Date(event.end_time).toLocaleTimeString()})
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Speciality:</label>
      <select
        className="border p-2 rounded mb-5 w-full"
        value={selectedSpeciality || ""}
        onChange={(e) => setSelectedSpeciality(e.target.value || null)}
        disabled={loading}
      >
        <option value="" disabled>
          Pick a specialty
        </option>
        {classes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {selectedSubjectId && (
        <p className="text-gray-700 mb-4">
          Total Absences for this Subject:{" "}
          <span className="font-bold">{totalAbsences}</span>
        </p>
      )}

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {students.length > 0 ? (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <span className="text-lg">{student.username}</span>
                {selectedSubjectId && (
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
            {selectedSpeciality
              ? "No students found for this speciality."
              : "Please select a speciality to view students."}
          </p>
        )}
      </div>

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
