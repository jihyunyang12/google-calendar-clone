import { useState } from "react";
import {
  format,
  addMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from "date-fns";

export function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(visibleMonth)),
    end: endOfWeek(endOfMonth(visibleMonth)),
  });

  function showPreviousMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, -1));
  }

  function showNextMonth() {
    setVisibleMonth((currentMonth) => addMonths(currentMonth, 1));
  }

  function showToday() {
    setVisibleMonth(new Date());
  }

  return (
    <div className="calendar">
      <div className="header">
        <button className="btn" onClick={showToday}>
          Today
        </button>
        <div>
          <button className="month-change-btn" onClick={showPreviousMonth}>
            &lt;
          </button>
          <button className="month-change-btn" onClick={showNextMonth}>
            &gt;
          </button>
        </div>
        <span className="month-title">{format(visibleMonth, "MMMM y")}</span>
      </div>
      <div className="days">
        {visibleDates.map((date) => (
          <div
            className={`day ${
              !isSameMonth(date, visibleMonth) ? "non-month-day" : ""
            } ${!isSameMonth(date, visibleMonth) ? "old-month-day" : ""}`}
          >
            <div className="day-header">
              <div className="week-name">{format(date, "EEE")}</div>
              <div className="day-number">{format(date, "d")}</div>
              <button className="add-event-btn">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
