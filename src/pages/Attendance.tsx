import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearUser } from "../features/user/UserSlice";

const BASE_URL: string = "http://127.0.0.1:8000";

type Student = {
  id: string;
  username: string;
  email: string;
  speciality: string;
};

type Subject = {
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  class_name: string;
};

type Schedule = {
  class_name: string;
  subject_name: string;
  subject_id: string;
  teacher_id: string;
  teacher_name: string;
};

type CalendarEntry = {
  entry_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  schedules: Schedule[];
  recurrence_end: string | null;
  created_by: string;
  created_at: string;
};

type AttendanceStatus = "Present" | "Absent" | "Late";
type AttendanceRecord = Record<string, AttendanceStatus | undefined>;
type AttendanceData = {
  _id: string;
  student_id: string;
  subject_id: string;
  status: string;
  date: string;
};

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, role, token } = useSelector((state: any) => state.user);

  // Redirect if not a teacher or missing credentials
  useEffect(() => {
    if (role !== "teacher") {
      navigate("/");
      toast.warning("Only teachers can access this page");
      return;
    }
    if (!id || !token) {
      setError("User ID or token is missing. Please log in again.");
      dispatch(clearUser());
      navigate("/login");
      return;
    }
  }, [id, role, token, navigate, dispatch]);

  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjectsWithIds, setSubjectsWithIds] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [hasScheduledClass, setHasScheduledClass] = useState<boolean>(false);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);

  // Fetch teacher data (classes only)
  const fetchTeacherData = async () => {
    if (!id || !token) {
      setError("Cannot fetch teacher data: Missing user ID or token");
      navigate("/login");
      return;
    }

    try {
      const teacherId = String(id);
      const response = await axios.get(`${BASE_URL}/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Teacher data response:", response.data);

      const { classes } = response.data;
      setClasses(classes || []);

      if (!classes || classes.length === 0) {
        setError("No classes found for this teacher.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to fetch teacher data";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setClasses([]);
      setSubjectsWithIds([]);
    }
  };

  // Fetch subjects from calendar entries
  const fetchSubjectsFromCalendar = async () => {
    if (!id || !token) {
      setError("Cannot fetch calendar data: Missing user ID or token");
      navigate("/login");
      return;
    }

    try {
      const calendarResponse = await axios.get(
        `${BASE_URL}/admin/calendar?id=admin001&role=admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Calendar data for subjects:", calendarResponse.data);

      const entries: CalendarEntry[] = calendarResponse.data || [];
      const subjectsMap: { [key: string]: Subject } = {};

      // Extract unique subjects from calendar entries
      entries.forEach((entry) => {
        entry.schedules.forEach((schedule) => {
          if (schedule.teacher_id === id) {
            subjectsMap[schedule.subject_id] = {
              subject_id: schedule.subject_id,
              subject_name: schedule.subject_name,
              teacher_id: schedule.teacher_id,
              class_name: schedule.class_name,
            };
          }
        });
      });

      const subjects = Object.values(subjectsMap);
      setSubjectsWithIds(subjects);
      console.log("Extracted subjects from calendar:", subjects);

      if (!subjects || subjects.length === 0) {
        setError("No subjects found for this teacher in the calendar.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to fetch calendar data for subjects";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setSubjectsWithIds([]);
    }
  };

  // Fetch students based on selected specialty
  const fetchStudents = async () => {
    if (!selectedSpeciality) {
      setStudents([]);
      setAttendance({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BASE_URL}/admin/students?speciality=${selectedSpeciality}&id=admin001&role=admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data: Student[] = response.data.students;
      setStudents(data);
      setAttendance({});
    } catch (err: any) {
      let errorMessage = "Failed to fetch students";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher's calendar and determine if there's a scheduled class
  const fetchCalendarAndEvents = async () => {
    if (!selectedDate || !selectedSubjectId || !selectedSpeciality) {
      setCalendarEntries([]);
      setHasScheduledClass(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Step 1: Fetch calendar entries
      const calendarResponse = await axios.get(
        `${BASE_URL}/admin/calendar?id=admin001&role=admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Calendar data:", calendarResponse.data);

      const entries: CalendarEntry[] = calendarResponse.data || [];
      setCalendarEntries(entries);

      // Step 2: Get current date and time in UTC
      const date = new Date();
      const dateUTC = new Date(date.toISOString()); // Ensure UTC
      const day = dateUTC.getUTCDay();
      const month = dateUTC.getUTCMonth();
      const year = dateUTC.getUTCFullYear();
      const dateOfMonth = dateUTC.getUTCDate();
      const hour = dateUTC.getUTCHours();
      const minute = dateUTC.getUTCMinutes();

      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDayOfWeek = daysOfWeek[day];
      console.log(
        `Current date (UTC): ${year}-${
          month + 1
        }-${dateOfMonth}, Day of week: ${currentDayOfWeek}, Time: ${hour}:${minute}`
      );
      console.log("Selected date:", selectedDate);

      // Step 3: Loop through calendar entries to find a match
      let matchingSchedule: Schedule | null = null;
      let matchingEntry: CalendarEntry | null = null;
      for (const entry of entries) {
        if (
          entry.day_of_week.toLowerCase() !== currentDayOfWeek.toLowerCase()
        ) {
          continue;
        }
        for (const schedule of entry.schedules) {
          console.log("Checking schedule:", {
            scheduleSubjectId: schedule.subject_id,
            selectedSubjectId,
            scheduleClassName: schedule.class_name,
            selectedSpeciality,
            scheduleTeacherId: schedule.teacher_id,
            teacherId: id,
          });
          if (
            schedule.subject_id === selectedSubjectId &&
            schedule.class_name === selectedSpeciality &&
            schedule.teacher_id === id
          ) {
            matchingSchedule = schedule;
            matchingEntry = entry;
            break;
          }
        }
        if (matchingSchedule) break;
      }

      if (!matchingSchedule || !matchingEntry) {
        setError(
          "No scheduled class found for the current day, subject, and class."
        );
        setHasScheduledClass(false);
        setLoading(false);
        return;
      }
      console.log("Matching schedule found:", matchingSchedule);
      console.log("Matching entry:", matchingEntry);

      // Step 4: Check if current time is within the calendar entry's time slot
      const [startHours, startMinutes] = matchingEntry.start_time
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = matchingEntry.end_time
        .split(":")
        .map(Number);

      const currentTimeInMinutes = hour * 60 + minute;
      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      console.log(
        `Checking time: Current: ${currentTimeInMinutes} minutes, Start: ${startTimeInMinutes} minutes, End: ${endTimeInMinutes} minutes`
      );

      if (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      ) {
        setHasScheduledClass(true);
        setError(null);
        console.log("Time matches, class is active.");
      } else {
        setError("Current time is outside the scheduled class time slot.");
        setHasScheduledClass(false);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      let errorMessage = "Failed to fetch calendar data";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((d: any) => d.msg).join(", ")
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setCalendarEntries([]);
      setHasScheduledClass(false);
      console.error("Error fetching calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data for the selected subject and students
  const fetchAttendanceData = async () => {
    if (
      !selectedSubjectId ||
      !selectedSpeciality ||
      students.length === 0 ||
      !hasScheduledClass
    ) {
      setAttendanceData([]);
      setAttendance({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching attendance with subject_id:", selectedSubjectId);
      const attendancePromises = students.map((student) =>
        axios.get(`${BASE_URL}/attendance`, {
          params: {
            student_id: student.id,
            subject_id: selectedSubjectId,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const responses = await Promise.all(attendancePromises);
      const allAttendance = responses.flatMap((response) => response.data);
      console.log("Attendance data:", allAttendance);

      // Filter attendance records for the selected date
      const filteredAttendance = allAttendance.filter(
        (record: AttendanceData) =>
          new Date(record.date).toISOString().split("T")[0] === selectedDate
      );
      setAttendanceData(filteredAttendance);

      const initialAttendance: AttendanceRecord = {};
      filteredAttendance.forEach((record: AttendanceData) => {
        initialAttendance[record.student_id] =
          record.status as AttendanceStatus;
      });
      setAttendance(initialAttendance);
    } catch (err: any) {
      let errorMessage = "Failed to fetch attendance data";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.status === 404) {
        errorMessage =
          "No attendance records found or endpoint issue. Please check the backend.";
      } else if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((d: any) => d.msg).join(", ")
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save attendance for all students
  const handleSaveAttendance = async () => {
    if (!selectedSpeciality) {
      toast.warning("Please select a speciality.");
      return;
    }
    if (!selectedSubjectId) {
      toast.warning("Please select a subject.");
      return;
    }
    if (!hasScheduledClass) {
      toast.warning("No active class at this time. Cannot save attendance.");
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
            status: attendance[student.id] || "Absent",
            date: new Date(`${selectedDate}T09:30:00Z`).toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      toast.success("Attendance saved successfully!");
      await fetchAttendanceData();
    } catch (err: any) {
      let errorMessage = "Failed to save attendance";
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        dispatch(clearUser());
        navigate("/login");
        return;
      }
      if (err.response?.status === 404) {
        errorMessage =
          "Subject or student not found. Please check the backend.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.detail || "Invalid attendance data.";
      } else if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((d: any) => d.msg).join(", ")
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error saving attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher data and subjects on component mount
  useEffect(() => {
    if (id && token) {
      const fetchData = async () => {
        await fetchTeacherData();
        await fetchSubjectsFromCalendar();
      };
      fetchData();
    }
  }, [id, token]);

  // Fetch students when specialty changes
  useEffect(() => {
    fetchStudents();
  }, [selectedSpeciality]);

  // Fetch calendar and events when date or subject changes
  useEffect(() => {
    console.log("Selected subject_id on change:", selectedSubjectId);
    fetchCalendarAndEvents();
  }, [selectedSubjectId, selectedDate, selectedSpeciality]);

  // Fetch attendance data when subject, specialty, students, or date changes
  useEffect(() => {
    if (hasScheduledClass) {
      fetchAttendanceData();
    }
  }, [
    selectedSubjectId,
    selectedSpeciality,
    students,
    selectedDate,
    hasScheduledClass,
  ]);

  // Calculate absence count for a student
  const getAbsenceCount = (studentId: string) => {
    return attendanceData.filter(
      (record) => record.student_id === studentId && record.status === "Absent"
    ).length;
  };

  // Calculate total absences for the subject
  const totalAbsences = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;

  // Handle attendance status change for a student
  const handleAttendanceChange = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  // Debug log for button state
  useEffect(() => {
    console.log("Button state:", {
      loading,
      hasScheduledClass,
    });
  }, [loading, hasScheduledClass]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Student Attendance</h2>

      <label className="block mb-2 font-medium">Select Date:</label>
      <input
        type="date"
        className="border p-2 rounded mb-4 w-full"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        disabled={loading}
      />

      <label className="block mb-2 font-medium">Select Speciality:</label>
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedSpeciality || ""}
        onChange={(e) => {
          setSelectedSpeciality(e.target.value || null);
          setStudents([]);
          setAttendance({});
          setSelectedSubjectId(null);
          setCalendarEntries([]);
          setHasScheduledClass(false);
        }}
        disabled={loading}
      >
        <option value="" disabled>
          {classes.length === 0
            ? "No specialties available"
            : "Pick a specialty"}
        </option>
        {classes.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Subject:</label>
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedSubjectId || ""}
        onChange={(e) => {
          setSelectedSubjectId(e.target.value || null);
          setCalendarEntries([]);
          setHasScheduledClass(false);
        }}
        disabled={loading || !selectedSpeciality}
      >
        <option value="" disabled>
          {subjectsWithIds.length === 0 || !selectedSpeciality
            ? "No subjects available"
            : "Pick a subject"}
        </option>
        {subjectsWithIds
          .filter((subject) => subject.class_name === selectedSpeciality)
          .map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
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
                      disabled={loading || !hasScheduledClass}
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
          loading || !hasScheduledClass
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-600"
        }`}
        onClick={handleSaveAttendance}
        disabled={loading || !hasScheduledClass}
      >
        {loading ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
};

export default AttendancePage;
