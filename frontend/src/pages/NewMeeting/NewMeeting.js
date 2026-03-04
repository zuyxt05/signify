"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import classNames from "classnames/bind"
import { FaCalendarAlt, FaClock, FaUserFriends, FaLock, FaLockOpen, FaChevronRight } from "react-icons/fa"
import { IoMdTime } from "react-icons/io"
import { MdTitle, MdDescription, MdContentCopy } from "react-icons/md"

import styles from "./NewMeeting.module.scss"
import { useAuth } from "../../context/AuthContext.js"
import { createMeeting as apiCreateMeeting } from "../../utils/api.js"

const cx = classNames.bind(styles)

// Function to generate a secure random meeting code
const generateMeetingCode = () => {
  // Create a random string of characters that's easy to read
  // Avoid similar looking characters like 0/O, 1/I/l, etc.
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const length = 10 // Length of the code
  let result = ""

  // Use crypto API for better randomness if available
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length)
    window.crypto.getRandomValues(values)
    for (let i = 0; i < length; i++) {
      result += characters[values[i] % characters.length]
    }
  } else {
    // Fallback to Math.random if crypto API is not available
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  }

  // Format the code with hyphens for readability: XXXX-XXXX-XX
  return `${result.substring(0, 4)}-${result.substring(4, 8)}-${result.substring(8, 10)}`
}

const NewMeeting = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], 
    time: new Date().toTimeString().substring(0, 5), 
    duration: 60,
    isPrivate: true,
    meetingCode: generateMeetingCode(),
    host:user?.id
  })
  const [showCodeCopied, setShowCodeCopied] = useState(false)
  const codeRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiCreateMeeting(formData)
    navigate(`/waiting-room?room=${formData.meetingCode}`)
  }

  const handleGenerateNewCode = () => {
    setFormData({
      ...formData,
      meetingCode: generateMeetingCode(),
    })
  }

  const copyCodeToClipboard = () => {
    if (codeRef.current) {
      navigator.clipboard
        .writeText(formData.meetingCode)
        .then(() => {
          setShowCodeCopied(true)
          setTimeout(() => setShowCodeCopied(false), 2000)
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }

  return (
    <div className={cx("container")}>
      <div className={cx("content")}>
        <div className={cx("header")}>
          <h1>Schedule New Meeting</h1>
          <p>Fill in the details below to create a new meeting</p>
        </div>

        <form onSubmit={handleSubmit} className={cx("meetingForm")}>
          <div className={cx("formGrid")}>
            <div className={cx("formGroup")}>
              <label htmlFor="title">
                <MdTitle />
                Meeting Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className={cx("formGroup")}>
              <label htmlFor="description">
                <MdDescription />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What's this meeting about?"
                rows="3"
              />
            </div>

            <div className={cx("formRow")}>
              <div className={cx("formGroup")}>
                <label htmlFor="date">
                  <FaCalendarAlt />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="time">
                  <FaClock />
                  Time
                </label>
                <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} required />
              </div>
            </div>

            <div className={cx("formGroup")}>
              <label htmlFor="duration">
                <IoMdTime />
                Duration (minutes)
              </label>
              <select id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>

            <div className={cx("formGroup")}>
              <label className={cx("checkboxLabel")}>
                <div className={cx("labelText")}>
                  {formData.isPrivate ? <FaLock /> : <FaLockOpen />}
                  Private Meeting
                </div>
                <div className={cx("toggle")}>
                  <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handleInputChange} />
                  <span className={cx("slider")}></span>
                </div>
              </label>
              <p className={cx("helpText")}>
                {formData.isPrivate
                  ? "Only people with the meeting code can join"
                  : "Anyone with the meeting link can join"}
              </p>
            </div>

            <div className={cx("meetingCodeSection")}>
              <div className={cx("sectionHeader")}>
                <h3>
                  <FaUserFriends />
                  Meeting Code
                </h3>
                <button type="button" className={cx("refreshButton")} onClick={handleGenerateNewCode}>
                  Generate New Code
                </button>
              </div>
              <div className={cx("codeDisplay")}>
                <span ref={codeRef} className={cx("code")}>
                  {formData.meetingCode}
                </span>
                <button type="button" className={cx("copyButton")} onClick={copyCodeToClipboard}>
                  <MdContentCopy />
                  {showCodeCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className={cx("helpText")}>Share this code with participants to allow them to join your meeting</p>
            </div>
          </div>

          <div className={cx("formActions")}>
            <button type="button" className={cx("cancelButton")} onClick={() => navigate("/")}>
              Cancel
            </button>
            <button type="submit" className={cx("createButton")}>
              Create Meeting
              <FaChevronRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewMeeting
