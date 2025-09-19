import React, { useState } from "react";

// Helper to get days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get the weekday of the first day of the month (0=Sunday)
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar grid
  const calendarRows = [];
  let cells = [];

  // Fill empty cells before the first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<td key={`empty-start-${i}`}></td>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    const isSelected =
      selectedDate &&
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear();

    cells.push(
      <td key={day} className="py-2 px-3 text-center">
        <button
          className={`w-9 h-9 rounded-full transition
            ${isToday ? "bg-blue-500 text-white font-bold" : ""}
            ${isSelected ? "ring-2 ring-blue-400" : ""}
            hover:bg-blue-100`}
          onClick={() =>
            setSelectedDate(new Date(currentYear, currentMonth, day))
          }
        >
          {day}
        </button>
      </td>
    );
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <div className="bg-white rounded shadow p-6">
        {/* Month/Year Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            aria-label="Previous Month"
          >
            &lt;
          </button>
          <div className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            aria-label="Next Month"
          >
            &gt;
          </button>
        </div>
        {/* Calendar Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-gray-500">
              <th className="py-2">Sun</th>
              <th className="py-2">Mon</th>
              <th className="py-2">Tue</th>
              <th className="py-2">Wed</th>
              <th className="py-2">Thu</th>
              <th className="py-2">Fri</th>
              <th className="py-2">Sat</th>
            </tr>
          </thead>
          <tbody>{calendarRows}</tbody>
        </table>
        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6 text-center">
            <div className="text-blue-600 font-medium">
              Selected Date:{" "}
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              (No events for this date yet.)
            </div>
          </div>
        )}
        {!selectedDate && (
          <div className="mt-6 text-center text-gray-500">
            Click a date to select.
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
