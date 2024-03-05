import { FormEvent, Fragment, useRef, useState } from "react";
import {
  format,
  addMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameWeek,
  isToday,
  isSameDay,
} from "date-fns";
import { Modal } from "./components/Modal";
import { Colors } from "./consts/Color";
import { IEvent } from "./models/Event";

export function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<IEvent[]>([]);

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
    <>
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
            <CalendarDay
              date={date}
              visibleMonth={visibleMonth}
              key={date.getTime()}
              setAddEventModalOpen={setAddEventModalOpen}
              setSelectedDate={setSelectedDate}
              events={events.filter((event) => isSameDay(event.date, date))}
            />
          ))}
        </div>
      </div>
      {addEventModalOpen && (
        <AddEventModal
          setAddEventModalOpen={setAddEventModalOpen}
          selectedDate={selectedDate}
          setEvents={setEvents}
        />
      )}
    </>
  );
}

type CalendarDaysProps = {
  date: Date;
  events: IEvent[];
  visibleMonth: Date;
  setAddEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
};

function CalendarDay({
  date,
  visibleMonth,
  events,
  setAddEventModalOpen,
  setSelectedDate,
}: CalendarDaysProps) {
  return (
    <div
      className={`day ${
        !isSameMonth(date, visibleMonth) ? "non-month-day" : ""
      } ${!isSameMonth(date, visibleMonth) ? "old-month-day" : ""}`}
    >
      <div className="day-header">
        {isSameWeek(date, startOfMonth(visibleMonth)) && (
          <div className="week-name">{format(date, "EEE")}</div>
        )}
        <div className={`day-number ${isToday(date) ? "today" : ""}`}>
          {format(date, "d")}
        </div>
        <button
          className="add-event-btn"
          onClick={() => {
            setAddEventModalOpen(true);
            setSelectedDate(date);
          }}
        >
          +
        </button>
        <div className="events">
          {events.map((event) => (
            <button
              className={`${event.isAllDay ? "all-day-event" : ""} ${
                event.color
              } event`}
              key={`${event.date.toString()}-${event.name.toString()}`}
            >
              <div className="event-name">{event.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type AddEventModalProps = {
  setAddEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDate: Date;
  setEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
};

function AddEventModal({
  setAddEventModalOpen,
  selectedDate,
  setEvents,
}: AddEventModalProps) {
  const name = useRef<HTMLInputElement>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedColor, setSelectedColor] = useState(Colors[0]);

  function allDayHandler(e: HTMLInputElement) {
    setIsAllDay(e.checked);
    setStartTime("");
    setEndTime("");
  }

  function startTimeHandler(e: HTMLInputElement) {
    setStartTime(e.value);
  }

  function endTimeHandler(e: HTMLInputElement) {
    setEndTime(e.value);
  }

  function submitForm(e: FormEvent) {
    e.preventDefault();
    console.log(selectedColor, isAllDay, startTime, endTime);

    const newEvent: IEvent = {
      name: name.current!.value,
      date: selectedDate,
      isAllDay,
      color: selectedColor,
    };
    setEvents((currentEvents) => [...currentEvents, newEvent]);
  }

  function colorHandler(e: HTMLInputElement) {
    setSelectedColor(e.value);
  }

  return (
    <Modal>
      <div className="modal-title">
        <div>Add Event</div>
        <small>{format(selectedDate, "MM/dd/yy")}</small>
        <button
          className="close-btn"
          onClick={() => setAddEventModalOpen(false)}
        >
          &times;
        </button>
      </div>
      <form onSubmit={submitForm}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" ref={name} required />
        </div>
        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="all-day"
            id="all-day"
            checked={isAllDay}
            onChange={(e) => allDayHandler(e.target as HTMLInputElement)}
          />
          <label htmlFor="all-day">All Day?</label>
        </div>
        <div className="row">
          <div className="form-group">
            <label htmlFor="start-time">Start Time</label>
            <input
              type="time"
              name="start-time"
              id="start-time"
              value={startTime}
              onChange={(e) => startTimeHandler(e.target as HTMLInputElement)}
              disabled={isAllDay}
              required={!isAllDay}
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-time">End Time</label>
            <input
              type="time"
              name="end-time"
              id="end-time"
              value={endTime}
              onChange={(e) => endTimeHandler(e.target as HTMLInputElement)}
              disabled={isAllDay}
              required={!isAllDay}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="row left">
            {Colors.map((color) => (
              <Fragment key={color}>
                <input
                  type="radio"
                  name="color"
                  value={color}
                  id={color}
                  checked={color === selectedColor}
                  className="color-radio"
                  onChange={(e) => colorHandler(e.target as HTMLInputElement)}
                />
                <label htmlFor={color}>
                  <span className="sr-only">{color}</span>
                </label>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="row">
          <button className="btn btn-success" type="submit">
            Add
          </button>
          <button className="btn btn-delete" type="button">
            Delete
          </button>
        </div>
      </form>
    </Modal>
  );
}
