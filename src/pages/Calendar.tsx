import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// Define types for the form data, matching backend CalendarEntry model
type ClassSchedule = {
  class_name: string;
  subject_name: string;
  teacher_id: string;
};

type CalendarForm = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  schedules: ClassSchedule[];
  recurrence_end: string;
};

const Calendar: React.FC = () => {
  const { id, role } = useSelector((state) => state.user);
  console.log(role, id);

  const [formData, setFormData] = useState<CalendarForm>({
    day_of_week: "Monday",
    start_time: "",
    end_time: "",
    schedules: [],
    recurrence_end: "",
  });

  const [scheduleInput, setScheduleInput] = useState<ClassSchedule>({
    class_name: "",
    subject_name: "",
    teacher_id: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setScheduleInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSchedule = () => {
    if (
      !scheduleInput.class_name ||
      !scheduleInput.subject_name ||
      !scheduleInput.teacher_id
    ) {
      toast.error("Please fill all schedule fields");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { ...scheduleInput }],
    }));
    setScheduleInput({ class_name: "", subject_name: "", teacher_id: "" });
    toast.success("Schedule added to list");
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
    toast.success("Schedule removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate schedules
    if (formData.schedules.length === 0) {
      toast.error("Please add at least one schedule");
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start_time)) {
      toast.error("Start time must be in HH:MM format (e.g., 08:00)");
      return;
    }
    if (!timeRegex.test(formData.end_time)) {
      toast.error("End time must be in HH:MM format (e.g., 10:00)");
      return;
    }

    // Validate start_time < end_time
    const startTime = new Date(`1970-01-01T${formData.start_time}:00`);
    const endTime = new Date(`1970-01-01T${formData.end_time}:00`);
    if (startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in as admin");
      return;
    }

    // Format recurrence_end
    let recurrenceEnd = null;
    if (formData.recurrence_end) {
      const date = new Date(formData.recurrence_end);
      date.setHours(23, 59, 59, 999);
      recurrenceEnd = date.toISOString();
    }

    // Format payload for backend
    const payload = {
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      schedules: formData.schedules,
      recurrence_end: recurrenceEnd,
    };

    try {
      console.log(token);

      const response = await axios.post(
        `http://127.0.0.1:8000/admin/calendar?id=admin001&role=admin`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      toast.success(response.data.message || "Calendar created successfully");
      // Reset form
      setFormData({
        day_of_week: "Monday",
        start_time: "",
        end_time: "",
        schedules: [],
        recurrence_end: "",
      });
    } catch (error: any) {
      console.log(error);

      const errorMessage =
        error.response?.data?.detail || "Failed to create calendar";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Calendar Schedule</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Day of Week */}
        <div>
          <label className="block text-sm font-medium">Day of Week</label>
          <select
            name="day_of_week"
            value={formData.day_of_week}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
          >
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              )
            )}
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium">
            Start Time (HH:MM)
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium">End Time (HH:MM)</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        {/* Recurrence End */}
        <div>
          <label className="block text-sm font-medium">
            Recurrence End (Optional, YYYY-MM-DD)
          </label>
          <input
            type="date"
            name="recurrence_end"
            value={formData.recurrence_end}
            onChange={handleInputChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        {/* Schedule Inputs */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Add Schedule</h3>
          <div className="space-y-2">
            <input
              type="text"
              name="class_name"
              value={scheduleInput.class_name}
              onChange={handleScheduleInputChange}
              placeholder="Class Name (e.g., EEA)"
              className="block w-full border rounded p-2"
            />
            <input
              type="text"
              name="subject_name"
              value={scheduleInput.subject_name}
              onChange={handleScheduleInputChange}
              placeholder="Subject Name (e.g., python)"
              className="block w-full border rounded p-2"
            />
            <input
              type="text"
              name="teacher_id"
              value={scheduleInput.teacher_id}
              onChange={handleScheduleInputChange}
              placeholder="Teacher ID (e.g., 78780)"
              className="block w-full border rounded p-2"
            />
            <button
              type="button"
              onClick={handleAddSchedule}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Schedule
            </button>
          </div>
        </div>

        {/* Display Added Schedules */}
        {formData.schedules.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Schedules</h3>
            <ul className="space-y-2">
              {formData.schedules.map((schedule, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {schedule.class_name} - {schedule.subject_name} (Teacher:{" "}
                    {schedule.teacher_id})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Calendar
        </button>
      </form>
    </div>
  );
};

export default Calendar;
