import { FormEvent, Fragment, useId, useMemo, useRef, useState } from "react";
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
  isBefore,
  addDays,
} from "date-fns";
import { Modal, ModalProps } from "./components/Modal";
import { cc } from "./utils/cc";
import { EVENTS_COLORS, useEvents } from "./context/useEvent";
import { Event } from "./context/Events";
import { UnionOmit } from "./utils/types";

export function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const { events } = useEvents();

  const visibleDates = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth)),
        end: endOfWeek(endOfMonth(visibleMonth)),
      }),
    []
  );

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
              events={events.filter((event) => isSameDay(event.date, date))}
            />
          ))}
        </div>
      </div>
    </>
  );
}

type CalendarDaysProps = {
  date: Date;
  visibleMonth: Date;
  events: Event[];
};

function CalendarDay({ date, visibleMonth, events }: CalendarDaysProps) {
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const { addEvent } = useEvents();

  const sortedEvents = useMemo(() => {
    const timeToNumber = (time: string) => parseFloat(time.replace(":", "."));

    return [...events].sort((a, b) => {
      if (a.isAllDay && b.isAllDay) {
        return 0;
      } else if (a.isAllDay) {
        return -1;
      } else if (b.isAllDay) {
        return 1;
      } else {
        return timeToNumber(a.startTime) - timeToNumber(b.startTime);
      }
    });
  }, [events]);

  return (
    <div
      className={cc(
        "day",
        !isSameMonth(date, visibleMonth) && "non-month-day",
        isBefore(date, addDays(new Date(), -1)) && "old-month-day"
      )}
    >
      <div className="day-header">
        {isSameWeek(date, startOfMonth(visibleMonth)) && (
          <div className="week-name">{format(date, "EEE")}</div>
        )}
        <div className={cc("day-number", isToday(date) && "today")}>
          {format(date, "d")}
        </div>
        <button
          className="add-event-btn"
          onClick={() => {
            setAddEventModalOpen(true);
          }}
        >
          +
        </button>
        {events.length > 0 && (
          <div className="events">
            {sortedEvents.map((event) => (
              <CalendarEvents event={event} key={event.id} />
            ))}
          </div>
        )}
      </div>
      {addEventModalOpen && (
        <EventFormModal
          onSubmit={addEvent}
          date={date}
          isOpen={addEventModalOpen}
          onClose={() => setAddEventModalOpen(false)}
        />
      )}
    </div>
  );
}

function CalendarEvents({ event }: { event: Event }) {
  const { editEvent, deleteEvent } = useEvents();
  const [editEventModalOpen, setEditEventModalOpen] = useState<boolean>(false);
  return (
    <>
      <button
        onClick={() => setEditEventModalOpen(true)}
        className={cc(event.color, "event", event.isAllDay && "all-day-event")}
      >
        {event.isAllDay ? (
          <div className="event-name">{event.name}</div>
        ) : (
          <>
            <div className={cc(event.color, "color-dot")}></div>
            <div className="event-time">{event.startTime}</div>
            <div className="event-name">{event.name}</div>
          </>
        )}
      </button>
      <EventFormModal
        onSubmit={(e) => editEvent(e, event.id)}
        onDelete={() => deleteEvent(event.id)}
        event={event}
        isOpen={editEventModalOpen}
        onClose={() => setEditEventModalOpen(false)}
      />
    </>
  );
}

type EventFormModalProps = {
  onSubmit: (event: UnionOmit<Event, "id">) => void;
} & (
  | { onDelete: (id: string) => void; event: Event; date?: never }
  | { onDelete?: never; event?: never; date: Date }
) &
  Omit<ModalProps, "children">;

function EventFormModal({
  onSubmit,
  onDelete,
  event,
  date,
  ...modalProps
}: EventFormModalProps) {
  const name = useRef<HTMLInputElement>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    event?.color || EVENTS_COLORS[0]
  );
  const formId = useId();
  function allDayHandler(checked: boolean) {
    setIsAllDay(checked);
    setStartTime("");
    setEndTime("");
  }

  function submitForm(e: FormEvent) {
    e.preventDefault();
    let newEvent: UnionOmit<Event, "id">;

    if (isAllDay) {
      newEvent = {
        name: name.current!.value,
        date: date || event?.date,
        color: selectedColor,
        isAllDay: true,
      };
    } else {
      if (!startTime || !endTime) {
        return;
      }
      newEvent = {
        name: name.current!.value,
        date: date || event?.date,
        color: selectedColor,
        isAllDay: false,
        startTime,
        endTime,
      };
    }

    onSubmit(newEvent);

    modalProps.onClose();
  }

  return (
    <Modal {...modalProps}>
      <div className="modal-title">
        <div>{!event ? "Add Event" : "Edit Event"}</div>
        <small>{format(date || event.date, "MM/dd/yy")}</small>
        <button className="close-btn" onClick={modalProps.onClose}>
          &times;
        </button>
      </div>
      <form onSubmit={submitForm}>
        <div className="form-group">
          <label htmlFor={`${formId}-name`}>Name</label>
          <input
            type="text"
            name="name"
            id={`${formId}-name`}
            ref={name}
            required
          />
        </div>
        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="all-day"
            id={`${formId}-all-day`}
            checked={isAllDay}
            onChange={(e) => allDayHandler(e.target.checked)}
          />
          <label htmlFor={`${formId}-all-day`}>All Day?</label>
        </div>
        <div className="row">
          <div className="form-group">
            <label htmlFor={`${formId}-start-time`}>Start Time</label>
            <input
              type="time"
              name="start-time"
              id={`${formId}-start-time`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isAllDay}
              required={!isAllDay}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${formId}-end-time`}>End Time</label>
            <input
              type="time"
              name="end-time"
              id={`${formId}-end-time`}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isAllDay}
              required={!isAllDay}
              min={startTime}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="row left">
            {EVENTS_COLORS.map((color) => (
              <Fragment key={color}>
                <input
                  type="radio"
                  name="color"
                  value={color}
                  id={`${formId}-${color}`}
                  checked={color === selectedColor}
                  className="color-radio"
                  onChange={() => setSelectedColor(color)}
                />
                <label htmlFor={`${formId}-${color}`}>
                  <span className="sr-only">{color}</span>
                </label>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="row">
          <button className="btn btn-success" type="submit">
            {!event ? "Add" : "Edit"}
          </button>
          {onDelete && (
            <button
              className="btn btn-delete"
              type="button"
              onClick={() => onDelete(event.id)}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
