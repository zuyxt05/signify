"use client"

import { useState, useEffect } from "react"
import classNames from "classnames/bind"
import styles from "./HistoryMeeting.module.scss"
import { FaSearch, FaCalendarAlt, FaChevronDown, FaChevronUp, FaDownload, FaShare } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { CiClock1 } from "react-icons/ci"
import { BsPersonCircle, BsThreeDotsVertical } from "react-icons/bs"
import { SiOpenai } from 'react-icons/si'
import { useAuth } from "../../context/AuthContext.js"
import { getMeetingByUser, getMessagesByMeeting } from "../../utils/api.js"

const cx = classNames.bind(styles)

function HistoryMeeting() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [expandedMeetings, setExpandedMeetings] = useState({})
  const [meetingMessages, setMeetingMessages] = useState({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const response = await getMeetingByUser(user.id)
        const allMeetings = response.data || []
        // Sort by date descending (most recent first)
        allMeetings.sort((a, b) => new Date(b.date) - new Date(a.date))
        setMeetings(allMeetings)
      } catch (err) {
        console.error("Error fetching meetings:", err)
        setMeetings([])
      } finally {
        setLoading(false)
      }
    }
    fetchMeetings()
  }, [user?.id])

  const fetchMessages = async (meetingId) => {
    if (meetingMessages[meetingId]) return // Already cached
    try {
      setLoadingMessages(true)
      const response = await getMessagesByMeeting(meetingId)
      setMeetingMessages(prev => ({
        ...prev,
        [meetingId]: response.data || []
      }))
    } catch (err) {
      console.error("Error fetching messages:", err)
      setMeetingMessages(prev => ({
        ...prev,
        [meetingId]: []
      }))
    } finally {
      setLoadingMessages(false)
    }
  }

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date"
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Format time for display
  const formatMeetingTime = (timeStr) => {
    if (!timeStr) return ""
    const [h, m] = timeStr.split(":")
    const date = new Date()
    date.setHours(parseInt(h), parseInt(m))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return ""
    const date = new Date(createdAt)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  // Toggle meeting expansion
  const toggleMeetingExpansion = (meetingId) => {
    setExpandedMeetings({
      ...expandedMeetings,
      [meetingId]: !expandedMeetings[meetingId],
    })
  }

  // Get status color
  const getStatusClass = (status) => {
    switch (status) {
      case "ended": return "statusEnded"
      case "ongoing": return "statusOngoing"
      case "scheduled": return "statusScheduled"
      default: return ""
    }
  }

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(
    (meeting) =>
      (meeting.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.meetingCode || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewConversation = async (meeting) => {
    await fetchMessages(meeting.id)
    setSelectedMeeting({ ...meeting, viewSummary: false })
  }

  const handleViewSummary = (meeting) => {
    setSelectedMeeting({ ...meeting, viewSummary: true })
  }

  return (
    <div className={cx("wrap")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <h1>Meeting History</h1>
          <div className={cx("searchBar")}>
            <FaSearch className={cx("searchIcon")} />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={cx("meetingsList")}>
          {loading ? (
            <div className={cx("noMeetings")}>
              <p>Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className={cx("noMeetings")}>
              <p>No meetings found</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className={cx("meetingCard")}>
                <div className={cx("meetingHeader")} onClick={() => toggleMeetingExpansion(meeting.id)}>
                  <div className={cx("meetingInfo")}>
                    <h2>{meeting.title || "Untitled Meeting"}</h2>
                    <div className={cx("meetingMeta")}>
                      <div className={cx("metaItem")}>
                        <FaCalendarAlt />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className={cx("metaItem")}>
                        <CiClock1 />
                        <span>
                          {formatMeetingTime(meeting.time)}
                          {meeting.duration ? ` (${meeting.duration} min)` : ""}
                        </span>
                      </div>
                      <div className={cx("metaItem", getStatusClass(meeting.status))}>
                        <span>{meeting.status || "unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cx("meetingActions")}>
                    <button className={cx("expandButton")}>
                      {expandedMeetings[meeting.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedMeetings[meeting.id] && (
                  <div className={cx("meetingContent")}>
                    <div className={cx("meetingDescription")}>
                      <p>{meeting.description || "No description"}</p>
                      <div className={cx("participantsInfo")}>
                        <strong>Meeting Code:</strong> {meeting.meetingCode}
                      </div>
                    </div>

                    <div className={cx("meetingTabs")}>
                      <button className={cx("tabButton", "primary")} onClick={() => handleViewConversation(meeting)}>
                        View Conversation
                      </button>
                      <button
                        className={cx("tabButton")}
                        onClick={() => handleViewSummary(meeting)}
                      >
                        View AI Summary
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Meeting Conversation Modal */}
      {selectedMeeting && !selectedMeeting.viewSummary && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <div>
                <h2>{selectedMeeting.title || "Untitled Meeting"}</h2>
                <p className={cx("modalSubtitle")}>
                  {formatDate(selectedMeeting.date)} • {formatMeetingTime(selectedMeeting.time)}
                </p>
              </div>
              <div className={cx("modalActions")}>
                <button className={cx("modalActionButton")}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")}>
                  <FaShare />
                </button>
                <button className={cx("modalActionButton")} onClick={() => setSelectedMeeting(null)}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className={cx("modalBody")}>
              <div className={cx("conversationContainer")}>
                {loadingMessages ? (
                  <div className={cx("messageItem")}>
                    <p>Loading messages...</p>
                  </div>
                ) : (meetingMessages[selectedMeeting.id] || []).length === 0 ? (
                  <div className={cx("messageItem")}>
                    <p>No messages in this meeting</p>
                  </div>
                ) : (
                  (meetingMessages[selectedMeeting.id] || []).map((message) => (
                    <div key={message.id} className={cx("messageItem")}>
                      <div className={cx("messageSender")}>
                        <div className={cx("senderAvatar")}>
                          <BsPersonCircle />
                        </div>
                        <div className={cx("senderInfo")}>
                          <div className={cx("senderName")}>{message.senderName || "Unknown"}</div>
                          <div className={cx("messageTime")}>{formatMessageTime(message.createdAt)}</div>
                        </div>
                        <div className={cx("messageActions")}>
                          <BsThreeDotsVertical />
                        </div>
                      </div>
                      <div className={cx("messageContent")}>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={cx("modalFooter")}>
              <button
                className={cx("viewSummaryButton")}
                onClick={() => setSelectedMeeting({ ...selectedMeeting, viewSummary: true })}
              >
                <SiOpenai />
                View AI Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Summary Modal */}
      {selectedMeeting && selectedMeeting.viewSummary && (
        <div className={cx("modal")}>
          <div className={cx("modalContent")}>
            <div className={cx("modalHeader")}>
              <div>
                <h2>AI Summary: {selectedMeeting.title || "Untitled Meeting"}</h2>
                <p className={cx("modalSubtitle")}>
                  {formatDate(selectedMeeting.date)} • {formatMeetingTime(selectedMeeting.time)}
                </p>
              </div>
              <div className={cx("modalActions")}>
                <button className={cx("modalActionButton")}>
                  <FaDownload />
                </button>
                <button className={cx("modalActionButton")}>
                  <FaShare />
                </button>
                <button className={cx("modalActionButton")} onClick={() => setSelectedMeeting(null)}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className={cx("modalBody")}>
              <div className={cx("summaryContainer")}>
                <div className={cx("summaryHeader")}>
                  <SiOpenai className={cx("aiIcon")} />
                  <h3>Meeting Summary</h3>
                </div>
                <div className={cx("summaryContent")}>
                  <p>{selectedMeeting.aiSummary || "AI Summary is not available for this meeting yet. This feature will be available in a future update."}</p>
                </div>
              </div>
            </div>
            <div className={cx("modalFooter")}>
              <button
                className={cx("viewConversationButton")}
                onClick={() => setSelectedMeeting({ ...selectedMeeting, viewSummary: false })}
              >
                View Full Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryMeeting
