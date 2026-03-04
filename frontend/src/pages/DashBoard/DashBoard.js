"use client"

import classNames from "classnames/bind"
import { useEffect, useState } from "react"
import styles from "./DashBoard.module.scss"
import { Link } from "react-router-dom"
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa"
import { CiCalendar } from "react-icons/ci"
import { IoVideocamOutline } from "react-icons/io5"
import { MdOutlineJoinFull } from "react-icons/md"
import { BsCalendarPlus } from "react-icons/bs"
import { MdHistory } from 'react-icons/md'
import { useAuth } from "../../context/AuthContext.js"
import { getMeetingByUser } from "../../utils/api.js"

const cx = classNames.bind(styles)

function DashBoard() {
  const [time, setTime] = useState(new Date())
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const response = await getMeetingByUser(user.id)
        setMeetings(response.data || [])
      } catch (err) {
        console.error("Error fetching meetings:", err)
        setMeetings([])
      } finally {
        setLoading(false)
      }
    }
    fetchMeetings()
  }, [user?.id])

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatMeetingTime = (timeStr) => {
    if (!timeStr) return ""
    const [h, m] = timeStr.split(":")
    const date = new Date()
    date.setHours(parseInt(h), parseInt(m))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  // Filter meetings for today
  const today = new Date().toISOString().split("T")[0]
  const todayMeetings = meetings.filter((m) => m.date === today)

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("containLeft")}>
          <h2 className={cx("sectionTitle")}>Quick Actions</h2>
          <div className={cx("containFunction")}>
            <Link to="/new-meeting" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "newMeeting")}>
                  <IoVideocamOutline className={cx("functionIcon")} />
                </div>
                <p>New meeting</p>
              </div>
            </Link>
            <Link to="/waiting-room" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "join")}>
                  <MdOutlineJoinFull className={cx("functionIcon")} />
                </div>
                <p>Join</p>
              </div>
            </Link>
            <Link to="/schedule" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "schedule")}>
                  <BsCalendarPlus className={cx("functionIcon")} />
                </div>
                <p>Schedule</p>
              </div>
            </Link>

            <Link to="/history-meeting" className={cx("functionLink")}>
              <div className={cx("functionItem")}>
                <div className={cx("iconWrapper", "shareScreen")}>
                  <MdHistory className={cx("functionIcon")} />
                </div>
                <p>History Meeting</p>
              </div>
            </Link>
          </div>
        </div>

        <div className={cx("containRight")}>
          <div className={cx("timeCard")}>
            <h2>{formatTime(time)}</h2>
            <p>{formatDate(time)}</p>
          </div>

          <div className={cx("meetingsSection")}>
            <div className={cx("containRightHeader")}>
              <div className={cx("headerLeft")}>
                <h3>
                  Today <FaChevronDown className={cx("dropdownIcon")} />
                </h3>
              </div>
              <div className={cx("headerRight")}>
                <button className={cx("calendarButton")}>
                  <FaChevronLeft />
                </button>
                <button className={cx("calendarButton")}>
                  <CiCalendar />
                </button>
                <button className={cx("calendarButton")}>
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className={cx("containRightHistory")}>
              {loading ? (
                <div className={cx("containRightHistoryItem")}>
                  <p>Loading meetings...</p>
                </div>
              ) : todayMeetings.length === 0 ? (
                <div className={cx("containRightHistoryItem")}>
                  <h4>No meetings today</h4>
                  <div className={cx("meetingDetails")}>
                    <p>Create a new meeting or check your schedule</p>
                  </div>
                </div>
              ) : (
                todayMeetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    to={`/waiting-room?room=${meeting.meetingCode}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className={cx("containRightHistoryItem")}>
                      <h4>{meeting.title || "Untitled Meeting"}</h4>
                      <div className={cx("meetingDetails")}>
                        <p>{formatMeetingTime(meeting.time)}</p>
                        <p>Status: {meeting.status}</p>
                        <p>Code: {meeting.meetingCode}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard
