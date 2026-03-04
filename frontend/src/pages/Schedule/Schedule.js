"use client"

import classNames from "classnames/bind"
import cn from "classnames";
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "./Schedule.module.scss"
import { FaChevronLeft, FaChevronRight, FaPlus, FaSearch } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { getMeetingByUser, createMeeting as apiCreateMeeting } from "../../utils/api.js"
import { useAuth } from "../../context/AuthContext.js";
import { useToast } from "../../components/Toast/Toast.js";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  subDays,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"

const cx = classNames.bind(styles)

function Schedule() {
  const { user } = useAuth();
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("week") // 'day', 'week', 'month'
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    host: "Duy Mai",
    codeMeeting: "",
    description: "",
  })
  const [selectedMeeting, setSelectedMeeting] = useState(null)

  const [events, setEvents] = useState([
    { id: 1, title: "Team Meeting", date: new Date(2025, 2, 15, 10, 0), duration: 60 },
    { id: 2, title: "Project Review", date: new Date(2025, 2, 18, 14, 0), duration: 90 },
    { id: 3, title: "Client Call", date: new Date(2025, 2, 20, 11, 30), duration: 45 },
  ])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMeetingByUser(user?.id);
        const meetingsData = response.data;
        const newMeetings = meetingsData.map((newMeeting, index) => {
          const [year, month, day] = newMeeting.date.split("-").map(Number);
          const [hours, minutes] = newMeeting.time.split(":").map(Number);
          const startDate = new Date(year, month - 1, day, hours, minutes);
          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + Number.parseInt(newMeeting.duration));
          return {
            id: newMeeting.id,
            title: newMeeting.title,
            date: startDate,
            endDate: endDate,
            status: newMeeting.status,
            codeMeeting: newMeeting.meetingCode,
            description: newMeeting.description,
          };
        });

        setMeetings(newMeetings);

      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu cuộc họp:", err);
      }
    };

    fetchData();
  }, [user?.id]);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Format month and year for header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMeeting({
      ...newMeeting,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const meetingCode = newMeeting.codeMeeting || Math.random().toString(36).substring(2, 10).toUpperCase()
      const meetingData = {
        meetingCode,
        title: newMeeting.title,
        description: newMeeting.description,
        date: newMeeting.date,
        time: newMeeting.time,
        duration: parseInt(newMeeting.duration) || 60,
        host: user?.id,
      }
      const response = await apiCreateMeeting(meetingData)
      const created = response.data

      // Add to local meetings list
      const [year, month, day] = created.date.split("-").map(Number)
      const [hours, minutes] = created.time.split(":").map(Number)
      const startDate = new Date(year, month - 1, day, hours, minutes)
      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + (created.duration || 60))

      setMeetings(prev => [...prev, {
        id: created.id,
        title: created.title,
        date: startDate,
        endDate,
        status: created.status,
        codeMeeting: created.meetingCode,
        description: created.description,
      }])

      setNewMeeting({ title: "", date: "", time: "", duration: 60, host: "", codeMeeting: "", description: "" })
      setShowNewMeetingForm(false)
      toast.success("Meeting created successfully!")
    } catch (err) {
      console.error("Error creating meeting:", err)
      toast.error("Lỗi khi tạo meeting: " + (err.response?.data?.errors?.join(", ") || err.message))
    }
  }

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(
    (meeting) =>
      (meeting.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get days for week view
  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    const day = currentDate.getDay()
    startOfWeek.setDate(currentDate.getDate() - day)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }

    return days
  }

  // Check if meeting is on the given date
  const isMeetingOnDate = (meeting, date) => {
    return (
      meeting.date.getDate() === date.getDate() &&
      meeting.date.getMonth() === date.getMonth() &&
      meeting.date.getFullYear() === date.getFullYear()
    )
  }

  const getEventsForDay = (day) => {
    return meetings.filter((meeting) => isSameDay(day, meeting.date))
  }

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = subDays(monthStart, getDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd))

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <div className={cx("headerLeft")}>
            <h1>Schedule Meetings</h1>
            <div className={cx("viewToggle")}>
              <button className={cx("viewButton", { active: view === "day" })} onClick={() => setView("day")}>
                Day
              </button>
              <button className={cx("viewButton", { active: view === "week" })} onClick={() => setView("week")}>
                Week
              </button>
              <button className={cx("viewButton", { active: view === "month" })} onClick={() => setView("month")}>
                Month
              </button>
            </div>
          </div>
          <div className={cx("headerRight")}>
            <div className={cx("searchBar")}>
              <FaSearch className={cx("searchIcon")} />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={cx("newMeetingButton")} onClick={() => setShowNewMeetingForm(true)}>
              <FaPlus /> New Meeting
            </button>
          </div>
        </div>

        <div className={cx("calendarHeader")}>
          <h2>{formatMonthYear(currentDate)}</h2>
          <div className={cx("calendarNav")}>
            <button onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            <button className={cx("todayButton")} onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button onClick={goToNext}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        {view === "week" && (
          <div className={cx("weekView")}>
            <div className={cx("weekDays")}>
              {getWeekDays().map((day, index) => (
                <div
                  key={index}
                  className={cx("weekDay", {
                    today: day.toDateString() === new Date().toDateString(),
                  })}
                >
                  <div className={cx("dayName")}>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={cx("dayNumber")}>{day.getDate()}</div>
                </div>
              ))}
            </div>
            <div className={cx("weekMeetings")}>
              {getWeekDays().map((day, index) => (
                <div key={index} className={cx("dayMeetings")}>
                  {filteredMeetings
                    .filter((meeting) => isMeetingOnDate(meeting, day))
                    .map((meeting) => (
                      <div key={meeting.id} className={cx("meetingCard")} onClick={() => setSelectedMeeting(meeting)}>
                        <div className={cx("meetingTime")}>
                          {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                        </div>
                        <h3 className={cx("meetingTitle")}>{meeting.title}</h3>
                        <div className={cx("meetingHost")}>status: {meeting.status}</div>
                        <div className={cx("meetingHost")}>code: {meeting.codeMeeting}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className={cx("dayView")}>
            <h3 className={cx("dayViewDate")}>{formatDate(currentDate)}</h3>
            <div className={cx("dayMeetingsList")}>
              {filteredMeetings
                .filter((meeting) => isMeetingOnDate(meeting, currentDate))
                .map((meeting) => (
                  <div key={meeting.id} className={cx("meetingCardFull")} onClick={() => setSelectedMeeting(meeting)}>
                    <div className={cx("meetingCardHeader")}>
                      <h3>{meeting.title}</h3>
                      <div className={cx("meetingTime")}>
                        {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                      </div>
                    </div>
                    <div className={cx("meetingCardBody")}>
                      <p className={cx("meetingDescription")}>{meeting.description}</p>
                      <div className={cx("meetingHost")}>Host: {meeting.host}</div>
                      <div className={cx("meetingCode")}>Meeting Code: {meeting.codeMeeting}</div>
                    </div>
                  </div>
                ))}
              {filteredMeetings.filter((meeting) => isMeetingOnDate(meeting, currentDate)).length === 0 && (
                <div className={cx("noMeetings")}>No meetings scheduled for this day</div>
              )}
            </div>
          </div>
        )}

        {view === "month" && (
          <div className={cx("scheduleContent")}>
            <div className={cx("monthView")}>
              <div className={cx("monthViewHeader")}>
                <div>Sunday</div>
                <div>Monday</div>
                <div>Tuesday</div>
                <div>Wednesday</div>
                <div>Thursday</div>
                <div>Friday</div>
                <div>Saturday</div>
              </div>
              {/* This would be a calendar grid - simplified for this example */}
              <div className={cx("monthGrid")}>
                {generateCalendarDays().map((day, index) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div
                      key={index}
                      className={cn(cx("monthDay"), !isCurrentMonth && cx("otherMonth"), isToday && cx("today"))}
                    >
                      <div className={cx("dayNumber")}>{format(day, "d")}</div>
                      <div className={cx("dayEvents")}>
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className={cx("eventPill")}>
                            {event.title || event.status}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className={cx("moreEvents")}>+{dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        )}

        <div className={cx("upcomingMeetings")}>
          <h3>Upcoming Meetings</h3>
          <div className={cx("upcomingList")}>
            {filteredMeetings
              .filter((meeting) => meeting.date > new Date())
              .sort((a, b) => a.date - b.date)
              .slice(0, 3)
              .map((meeting) => (
                <div key={meeting.id} className={cx("upcomingMeetingCard")} onClick={() => setSelectedMeeting(meeting)}>
                  <div className={cx("upcomingDate")}>{formatDate(meeting.date)}</div>
                  <div className={cx("upcomingDetails")}>
                    <h4>{meeting.title}</h4>
                    <div className={cx("upcomingTime")}>
                      {formatTime(meeting.date)} - {formatTime(meeting.endDate)}
                    </div>
                    <div className={cx("upcomingHost")}>Code: {meeting.codeMeeting}</div>
                  </div>
                </div>
              ))}
            {filteredMeetings.filter((meeting) => meeting.date > new Date()).length === 0 && (
              <div className={cx("noMeetings")}>No upcoming meetings</div>
            )}
          </div>
        </div>
      </div>

      {/* New Meeting Form Modal */}
      {showNewMeetingForm && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <h2>Schedule New Meeting</h2>
              <button className={cx("closeButton")} onClick={() => setShowNewMeetingForm(false)}>
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={cx("newMeetingForm")}>
              <div className={cx("formGroup")}>
                <label htmlFor="title">Meeting Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newMeeting.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter meeting title"
                />
              </div>

              <div className={cx("formRow")}>
                <div className={cx("formGroup")}>
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newMeeting.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newMeeting.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="15"
                    step="15"
                    value={newMeeting.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="host">Host</label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={newMeeting.host}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="codeMeeting">Code Meeting (comma separated)</label>
                <input
                  type="text"
                  id="codeMeeting"
                  name="codeMeeting"
                  value={newMeeting.meetingCode}
                  onChange={handleInputChange}
                  placeholder="Code..."
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newMeeting.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Meeting details..."
                ></textarea>
              </div>

              <div className={cx("formActions")}>
                <button type="button" className={cx("cancelButton")} onClick={() => setShowNewMeetingForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={cx("submitButton")}>
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className={cx("modal")}>
          <div className={cx("modalContent", "meetingDetails")}>
            <div className={cx("modalHeader")}>
              <h2>Meeting Details</h2>
              <button className={cx("closeButton")} onClick={() => setSelectedMeeting(null)}>
                <IoMdClose />
              </button>
            </div>
            <div className={cx("meetingDetailsContent")}>
              <h3>{selectedMeeting.title}</h3>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Date & Time:</div>
                <div className={cx("detailsValue")}>
                  {formatDate(selectedMeeting.date)}, {formatTime(selectedMeeting.date)} -{" "}
                  {formatTime(selectedMeeting.endDate)}
                </div>
              </div>

              <div className={cx("detailsGroup")} style={{ display: "flex" }}>
                <div className={cx("detailsLabel")}>Status:</div>
                <div className={cx("detailsValue")} style={{ marginLeft: "20px" }} >{selectedMeeting.status}</div>
              </div>

              <div className={cx("detailsGroup")}>
                <div className={cx("detailsLabel")}>Description:</div>
                <div className={cx("detailsValue")}>{selectedMeeting.description}</div>
              </div>

              <div className={cx("detailsGroup")} style={{ display: "flex" }}>
                <div className={cx("detailsLabel")}>Meeting Code:</div>
                <div className={cx("detailsValue")} style={{ marginLeft: "20px" }}>
                  {selectedMeeting.codeMeeting}
                </div>
              </div>

              <div className={cx("meetingActions")}>
                <Link to={`/waiting-room/?room=${selectedMeeting.codeMeeting}`} className={cx("actionButton", "joinButton")}>Join Meeting</Link>
                <button className={cx("actionButton", "editButton")}>Edit</button>
                <button className={cx("actionButton", "deleteButton")}>Cancel Meeting</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule

