import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { useState } from "react";

// URL for fetching calendar data
const url = "http://127.0.0.1:8000/admin/calendar?id=admin001&role=admin";

// Loader function to fetch calendar data
export const loader = async () => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return [];
  }
};

// Generate time slots for the full 24-hour range (00:00-24:00)
const allTimeSlots = Array.from({ length: 24 }, (_, i) => {
  const startHour = i.toString().padStart(2, "0");
  const endHour = ((i + 1) % 24).toString().padStart(2, "0");
  return `${startHour}:00-${endHour}:00`;
});

// Default visible time slots (08:00-17:00)
const defaultTimeSlots = allTimeSlots.slice(8, 17);

// Days of the week (Monday to Friday)
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Helper function to normalize time to HH:MM format
const normalizeTime = (time) => {
  const [hours, minutes] = time.split(":");
  const normalizedHours = parseInt(hours, 10).toString().padStart(2, "0");
  const normalizedMinutes = minutes ? minutes.padStart(2, "0") : "00";
  return `${normalizedHours}:${normalizedMinutes}`;
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const GetCalender = () => {
  const initialCalendarData = useLoaderData();
  const [calendar, setCalendar] = useState(initialCalendarData);
  const [showAllHours, setShowAllHours] = useState(false); // Toggle for showing all hours

  // Function to handle deletion of a calendar entry
  const handleDelete = async (entryId) => {
    if (
      window.confirm("Are you sure you want to delete this calendar entry?")
    ) {
      try {
        await axios.delete(
          `http://127.0.0.1:8000/admin/calendar/${entryId}?id=admin001&role=admin`
        );
        setCalendar(calendar.filter((entry) => entry.entry_id !== entryId));
        alert("Calendar entry deleted successfully");
      } catch (error) {
        console.error("Error deleting calendar entry:", error);
        alert("Failed to delete calendar entry");
      }
    }
  };

  // Function to refresh calendar data
  const refreshCalendar = async () => {
    try {
      const response = await axios.get(url);
      setCalendar(response.data);
    } catch (error) {
      console.error("Error refreshing calendar:", error);
      alert("Failed to refresh calendar");
    }
  };

  // Toggle between showing default hours (08:00-17:00) and all hours (00:00-24:00)
  const toggleHours = () => {
    setShowAllHours(!showAllHours);
  };

  // Determine which time slots to display
  const displayedTimeSlots = showAllHours ? allTimeSlots : defaultTimeSlots;

  // Create a map of schedules by day and time slot
  const scheduleMap = {};
  days.forEach((day) => {
    scheduleMap[day] = {};
    allTimeSlots.forEach((slot) => {
      scheduleMap[day][slot] = { schedules: [], entry_id: null };
    });
  });

  // Populate scheduleMap with calendar data
  calendar.forEach((entry) => {
    const day = capitalizeFirstLetter(entry.day_of_week);
    const startTime = normalizeTime(entry.start_time);
    const endTime = normalizeTime(entry.end_time);
    const slot = `${startTime}-${endTime}`;

    console.log(
      `Mapping entry: Day=${day}, Slot=${slot}, Schedules=`,
      entry.schedules
    );

    if (days.includes(day) && allTimeSlots.includes(slot)) {
      scheduleMap[day][slot] = {
        schedules: entry.schedules,
        entry_id: entry.entry_id,
      };
    } else {
      console.warn(`Entry not mapped: Day=${day}, Slot=${slot}`);
    }
  });

  // Check if a time slot is outside the default range (08:00-17:00)
  const isOutsideDefaultRange = (slot) => {
    const startHour = parseInt(slot.split("-")[0].split(":")[0], 10);
    return startHour < 8 || startHour >= 17;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-base-content capitalize">
          Calendar of the Year
        </h2>
        <div className="flex space-x-2">
          <button onClick={toggleHours} className="btn btn-secondary">
            {showAllHours
              ? "Show Default Hours (08:00-17:00)"
              : "Show All Hours (00:00-24:00)"}
          </button>
          <button
            onClick={refreshCalendar}
            className="btn bg-blue-600 text-white hover:bg-blue-700 border-none"
          >
            Refresh Calendar
          </button>
        </div>
      </div>
      {calendar.length === 0 ? (
        <div className="alert alert-info">
          <span>No calendar entries found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="table w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left border-b border-gray-200">Time</th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-4 text-left border-b border-gray-200"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedTimeSlots.map((slot) => (
                <tr
                  key={slot}
                  className={`hover:bg-gray-50 ${
                    isOutsideDefaultRange(slot) ? "bg-yellow-100" : ""
                  }`}
                >
                  <td className="p-4 font-medium border-r border-b border-gray-200">
                    {slot}
                    {isOutsideDefaultRange(slot) && (
                      <span className="ml-2 text-xs text-yellow-600 font-semibold">
                        (Outside Normal Hours)
                      </span>
                    )}
                  </td>
                  {days.map((day) => {
                    const { schedules, entry_id } = scheduleMap[day][slot];
                    return (
                      <td
                        key={`${day}-${slot}`}
                        className="p-4 border-r border-b border-gray-200"
                      >
                        {schedules.length > 0 ? (
                          <div>
                            {schedules.map((schedule, index) => (
                              <div key={index} className="mb-3">
                                <p className="font-semibold text-blue-600">
                                  {schedule.subject_name || "Unknown Subject"}
                                </p>
                                <p>
                                  Class:{" "}
                                  {schedule.class_name || "Unknown Class"}
                                </p>
                                <p>
                                  Teacher:{" "}
                                  {schedule.teacher_name || "Unknown Teacher"}
                                </p>
                              </div>
                            ))}
                            <button
                              onClick={() => handleDelete(entry_id)}
                              className="btn bg-red-500 text-white hover:bg-red-600 border-none btn-sm mt-2"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No Program</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetCalender;
