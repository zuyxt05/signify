"use client"

import classNames from "classnames/bind"
import { useState, useEffect } from "react"
import styles from "./Profile.module.scss"
import { useAuth } from "../../context/AuthContext.js"
import { getMeetingByUser } from "../../utils/api.js"
import { FaUser, FaEnvelope, FaCalendarAlt, FaVideo, FaCheckCircle, FaClock } from "react-icons/fa"
import { BsPersonCircle } from "react-icons/bs"
import { Link } from "react-router-dom"

const cx = classNames.bind(styles)

function Profile() {
    const { user } = useAuth()
    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user?.id) return
            try {
                const response = await getMeetingByUser(user.id)
                setMeetings(response.data || [])
            } catch (err) {
                console.error("Error:", err)
                setMeetings([])
            } finally {
                setLoading(false)
            }
        }
        fetchMeetings()
    }, [user?.id])

    const totalMeetings = meetings.length
    const endedMeetings = meetings.filter(m => m.status === "ended").length
    const scheduledMeetings = meetings.filter(m => m.status === "scheduled").length
    const ongoingMeetings = meetings.filter(m => m.status === "ongoing").length

    return (
        <div className={cx("wrap")}>
            <div className={cx("container")}>
                {/* Profile Card */}
                <div className={cx("profileCard")}>
                    <div className={cx("avatarSection")}>
                        {user?.imgLink ? (
                            <img src={user.imgLink} alt="Avatar" className={cx("avatar")} />
                        ) : (
                            <div className={cx("avatarPlaceholder")}>
                                <BsPersonCircle />
                            </div>
                        )}
                    </div>
                    <div className={cx("userInfo")}>
                        <h1>{user?.name || "User"}</h1>
                        <div className={cx("infoItem")}>
                            <FaEnvelope />
                            <span>{user?.email || "No email"}</span>
                        </div>
                        <div className={cx("infoItem")}>
                            <FaUser />
                            <span>ID: {user?.id?.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={cx("statsGrid")}>
                    <div className={cx("statCard")}>
                        <div className={cx("statIcon", "total")}>
                            <FaVideo />
                        </div>
                        <div className={cx("statInfo")}>
                            <span className={cx("statNumber")}>{loading ? "..." : totalMeetings}</span>
                            <span className={cx("statLabel")}>Total Meetings</span>
                        </div>
                    </div>
                    <div className={cx("statCard")}>
                        <div className={cx("statIcon", "ended")}>
                            <FaCheckCircle />
                        </div>
                        <div className={cx("statInfo")}>
                            <span className={cx("statNumber")}>{loading ? "..." : endedMeetings}</span>
                            <span className={cx("statLabel")}>Completed</span>
                        </div>
                    </div>
                    <div className={cx("statCard")}>
                        <div className={cx("statIcon", "scheduled")}>
                            <FaCalendarAlt />
                        </div>
                        <div className={cx("statInfo")}>
                            <span className={cx("statNumber")}>{loading ? "..." : scheduledMeetings}</span>
                            <span className={cx("statLabel")}>Scheduled</span>
                        </div>
                    </div>
                    <div className={cx("statCard")}>
                        <div className={cx("statIcon", "ongoing")}>
                            <FaClock />
                        </div>
                        <div className={cx("statInfo")}>
                            <span className={cx("statNumber")}>{loading ? "..." : ongoingMeetings}</span>
                            <span className={cx("statLabel")}>Ongoing</span>
                        </div>
                    </div>
                </div>

                {/* Recent Meetings */}
                <div className={cx("recentSection")}>
                    <div className={cx("sectionHeader")}>
                        <h2>Recent Meetings</h2>
                        <Link to="/history-meeting" className={cx("viewAll")}>View All →</Link>
                    </div>
                    <div className={cx("meetingsList")}>
                        {loading ? (
                            <p className={cx("emptyText")}>Loading...</p>
                        ) : meetings.length === 0 ? (
                            <p className={cx("emptyText")}>No meetings yet</p>
                        ) : (
                            meetings.slice(0, 5).map((meeting) => (
                                <div key={meeting.id} className={cx("meetingItem")}>
                                    <div className={cx("meetingLeft")}>
                                        <h3>{meeting.title || "Untitled"}</h3>
                                        <span className={cx("meetingDate")}>{meeting.date} • {meeting.time}</span>
                                    </div>
                                    <span className={cx("meetingStatus", meeting.status)}>
                                        {meeting.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
