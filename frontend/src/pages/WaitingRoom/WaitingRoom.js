"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import classNames from "classnames/bind"
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaLink,
  FaChevronRight,
  FaArrowLeft,
} from "react-icons/fa"
import { MdContentCopy, MdSettings } from "react-icons/md"
import { IoMdClose } from "react-icons/io"

import styles from "./WaitingRoom.module.scss"
import { useAuth } from "../../context/AuthContext.js"
import { getMeetingByCodeMeeting as getMeetingByCodeMeetingAPI } from "../../utils/api.js"

const cx = classNames.bind(styles)

const WaitingRoom = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get("room") || ""
  const { user } = useAuth()

  // State for device settings
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [stream, setStream] = useState(null)
  const [audioDevices, setAudioDevices] = useState([])
  const [videoDevices, setVideoDevices] = useState([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const videoRef = useRef(null)
  const meetingLinkRef = useRef(null)

  // Initialize media devices
  useEffect(() => {
    const initDevices = async () => {
      try {
        // Request permissions for camera and microphone
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })

        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }

        // Get available audio and video devices
        const devices = await navigator.mediaDevices.enumerateDevices()

        const audioInputs = devices.filter((device) => device.kind === "audioinput")
        const videoInputs = devices.filter((device) => device.kind === "videoinput")

        setAudioDevices(audioInputs)
        setVideoDevices(videoInputs)

        if (audioInputs.length > 0) {
          setSelectedAudioDevice(audioInputs[0].deviceId)
        }

        if (videoInputs.length > 0) {
          setSelectedVideoDevice(videoInputs[0].deviceId)
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        // Handle permission denied or devices not available
        if (error.name === "NotAllowedError") {
          alert("Camera and microphone access is required for meetings")
        } else {
          alert("Error accessing media devices. Please check your hardware.")
        }
      }
    }
    if (roomId) {
      initDevices()
    }

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  // Handle device change
  const changeAudioDevice = async (deviceId) => {
    if (!stream) return

    try {
      // Stop current audio tracks
      stream.getAudioTracks().forEach((track) => track.stop())

      // Get new audio track
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      })

      // Add new audio track to existing stream
      const audioTrack = newStream.getAudioTracks()[0]

      if (audioTrack) {
        const existingStream = videoRef.current.srcObject
        existingStream.removeTrack(existingStream.getAudioTracks()[0])
        existingStream.addTrack(audioTrack)

        setSelectedAudioDevice(deviceId)
      }
    } catch (error) {
      console.error("Error changing audio device:", error)
    }
  }

  const changeVideoDevice = async (deviceId) => {
    if (!stream) return

    try {
      // Stop current video tracks
      stream.getVideoTracks().forEach((track) => track.stop())

      // Get new video track
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      })

      // Add new video track to existing stream
      const videoTrack = newStream.getVideoTracks()[0]

      if (videoTrack) {
        const existingStream = videoRef.current.srcObject
        existingStream.removeTrack(existingStream.getVideoTracks()[0])
        existingStream.addTrack(videoTrack)

        setSelectedVideoDevice(deviceId)
      }
    } catch (error) {
      console.error("Error changing video device:", error)
    }
  }

  // Toggle microphone
  const toggleMicrophone = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicEnabled
      })
      setIsMicEnabled(!isMicEnabled)
    }
  }

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraEnabled
      })
      setIsCameraEnabled(!isCameraEnabled)
    }
  }

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    const baseUrl = window.location.origin
    const meetingLink = `${baseUrl}/meeting?room=${roomId}`

    navigator.clipboard
      .writeText(meetingLink)
      .then(() => {
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  // Join meeting
  const joinMeeting = () => {

    setIsJoining(true)

    // Stop all tracks before navigating
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    // Navigate to meeting room with the room ID
    navigate(`/meeting?room=${roomId || joinCode}`)
  }

  // Join with code
  const joinWithCode = async () => {
    try {
      if (!joinCode.trim()) {
        alert("Please enter a meeting code")
        return
      }
      const response = await getMeetingByCodeMeetingAPI(joinCode.trim());
      if (!response) {
        alert("Please enter a valid meeting code.")
        return;
      } else {

        navigate(`/waiting-room?room=${joinCode}`)
      }

    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Invalid meeting code. Please check again.");
      } else {
        alert("An error occurred while joining the meeting. Please try again.");
      }
    }

  }
  return (
    <div className={cx("container")}>
      <div className={cx("content")}>
        <div className={cx("header")}>
          <button className={cx("backButton")} onClick={() => navigate("/")}>
            <FaArrowLeft />
            Back
          </button>
          <h1>{roomId ? "Ready to Join?" : "Join a Meeting"}</h1>
        </div>

        <div className={cx("mainContent")}>

          {roomId ? (
            // Host view with preview
            <div className={cx("previewSection")}>
              <div className={cx("videoPreview")}>
                <div className={cx("videoContainer", { cameraOff: !isCameraEnabled })}>
                  {!isCameraEnabled && (
                    <div className={cx("cameraOffIndicator")}>
                      <FaVideoSlash />
                      <span>Camera is off</span>
                    </div>
                  )}
                  <video ref={videoRef} autoPlay playsInline muted className={cx("video")} />
                  <div className={cx("videoOverlay")}>
                    <span className={cx("userName")}>{user?.name || "You"}</span>
                    {isMicEnabled ? (
                      <FaMicrophone className={cx("micIcon")} />
                    ) : (
                      <FaMicrophoneSlash className={cx("micIcon", "muted")} />
                    )}
                  </div>
                </div>

                <div className={cx("deviceControls")}>
                  <button className={cx("controlButton", { disabled: !isMicEnabled })} onClick={toggleMicrophone}>
                    {isMicEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    <span>{isMicEnabled ? "Mute" : "Unmute"}</span>
                  </button>
                  <button className={cx("controlButton", { disabled: !isCameraEnabled })} onClick={toggleCamera}>
                    {isCameraEnabled ? <FaVideo /> : <FaVideoSlash />}
                    <span>{isCameraEnabled ? "Stop Video" : "Start Video"}</span>
                  </button>
                  <button className={cx("controlButton")} onClick={() => setShowSettings(!showSettings)}>
                    <MdSettings />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              <div className={cx("meetingInfo")}>
                <h2>Meeting Information</h2>
                <div className={cx("meetingLink")}>
                  <div className={cx("linkLabel")}>
                    <FaLink />
                    <span>Meeting Link</span>
                  </div>
                  <div className={cx("linkValue")}>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/meeting?room=${roomId}`}
                      ref={meetingLinkRef}
                    />
                    <button className={cx("copyButton")} onClick={copyMeetingLink}>
                      <MdContentCopy />
                      {showCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className={cx("meetingCode")}>
                  <div className={cx("codeLabel")}>
                    <span>Meeting Code</span>
                  </div>
                  <div className={cx("codeValue")}>{roomId}</div>
                </div>

                <button className={cx("joinButton")} onClick={joinMeeting} disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join Meeting"}
                  <FaChevronRight />
                </button>
              </div>
            </div>
          ) : (
            // Join view with code input
            <div className={cx("joinSection")}>
              <div className={cx("joinForm")}>
                <h2>Enter a meeting code to join</h2>
                <div className={cx("codeInput")}>
                  <input
                    type="text"
                    placeholder="Enter meeting code (e.g. ABCD-EFGH-IJ)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <button className={cx("joinCodeButton")} onClick={joinWithCode} disabled={!joinCode.trim()}>
                    Join
                    <FaChevronRight />
                  </button>
                </div>
                <p className={cx("joinHelp")}>Ask the meeting host for the code</p>
              </div>

              <div className={cx("divider")}>
                <span>OR</span>
              </div>

              <div className={cx("createMeetingPrompt")}>
                <h2>Start your own meeting</h2>
                <button className={cx("createButton")} onClick={() => navigate("/new-meeting")}>
                  Create New Meeting
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className={cx("settingsModal")}>
            <div className={cx("modalContent")}>
              <div className={cx("modalHeader")}>
                <h2>Device Settings</h2>
                <button className={cx("closeButton")} onClick={() => setShowSettings(false)}>
                  <IoMdClose />
                </button>
              </div>

              <div className={cx("modalBody")}>
                <div className={cx("settingsGroup")}>
                  <label>Microphone</label>
                  <select value={selectedAudioDevice} onChange={(e) => changeAudioDevice(e.target.value)}>
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                    {audioDevices.length === 0 && <option value="">No microphones found</option>}
                  </select>
                </div>

                <div className={cx("settingsGroup")}>
                  <label>Camera</label>
                  <select value={selectedVideoDevice} onChange={(e) => changeVideoDevice(e.target.value)}>
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                    {videoDevices.length === 0 && <option value="">No cameras found</option>}
                  </select>
                </div>

                <div className={cx("audioTest")}>
                  <h3>Test your microphone</h3>
                  <div className={cx("audioMeter")}>
                    <div className={cx("audioLevel")} style={{ width: isMicEnabled ? "60%" : "0%" }}></div>
                  </div>
                  <p>Speak into your microphone to test the audio level</p>
                </div>
              </div>

              <div className={cx("modalFooter")}>
                <button className={cx("saveButton")} onClick={() => setShowSettings(false)}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaitingRoom
