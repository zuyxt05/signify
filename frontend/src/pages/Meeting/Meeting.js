"use client"

import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useSearchParams } from "react-router-dom"
import classNames from "classnames/bind"
import { IoIosInformationCircleOutline, IoIosSend } from "react-icons/io"
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa"
import { TbScreenShare } from "react-icons/tb"
import { FiMessageCircle } from "react-icons/fi"
import { IoClose } from "react-icons/io5"
import { MdWallpaper } from "react-icons/md"

import styles from "./Meeting.module.scss"
import useWebSocketService from "../../services/useWebSocketService.js"
import usePeerService from "../../services/userPeerService.js"
import { useAuth } from "../../context/AuthContext.js"
import useVirtualBackground from "../../services/useVirtualBackground.js"
import VirtualBackground from "../../components/VirtualBackground/VirtualBackground.js"

const cx = classNames.bind(styles)

const Meeting = () => {
  // State management
  const [activeTab, setActiveTab] = useState("people")
  const [showSidebar, setShowSidebar] = useState(false)
  const [messages, setMessages] = useState([])
  const [callStatus, setCallStatus] = useState("")
  const [participants, setParticipants] = useState([])
  const [showBgPanel, setShowBgPanel] = useState(false)

  // Refs
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const messageInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // URL params and auth
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get("room") || "default-room"
  const { user } = useAuth()

  // services
  const {
    socket,
    error: webSocketError,
    sendMessage,
  } = useWebSocketService(roomId, user?.name)

  const {
    isMuted,
    isVideoEnabled,
    toggleCamera,
    toggleMicrophone,
    shareScreen,
    handleSocketMessage,
  } = usePeerService(localVideoRef, remoteVideoRef, sendMessage, user?.name, setCallStatus)

  const {
    isEnabled: isBgEnabled,
    isLoading: isBgLoading,
    backgroundType,
    backgroundImage,
    toggleVirtualBackground,
    setBlurBackground,
    setImageBackground,
    removeBackground,
    startProcessing,
  } = useVirtualBackground()

  // Handle virtual background toggle
  const handleToggleBg = async () => {
    const videoEl = localVideoRef.current
    if (!videoEl) return
    await toggleVirtualBackground(videoEl)
  }

  // Handle enabling VB when selecting a background option
  const handleEnableBg = async () => {
    if (!isBgEnabled) {
      const videoEl = localVideoRef.current
      if (!videoEl) return
      await startProcessing(videoEl)
    }
  }

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle chat messages
  const handleSendMessage = () => {
    const messageText = messageInputRef.current?.value.trim()
    if (!messageText) return

    sendMessage({
      type: "chat-message",
      message: messageText,
    })

    messageInputRef.current.value = ""
  }

  // Render helpers
  const renderMessage = (message) => {
    const isCurrentUser = message.from === user?.name
    return (
      <li
        key={message.timestamp}
        className={cx("messageItem", {
          userMessage: isCurrentUser,
        })}
      >
        <div className={cx("messageBubble")}>
          <div className={cx("messageHeader")}>
            <span className={cx("messageSender")}>{isCurrentUser ? "You" : message.from}</span>
            <span className={cx("messageTime")}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className={cx("messageText")}>{message.message}</p>
        </div>
      </li>
    )
  }

  const renderParticipant = (participantName) => {
    const isCurrentUser = participantName === user?.name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random`
    return (
      <li key={participantName} className={cx("participantItem")}>
        <div className={cx("participantAvatar")}>
          <img src={avatarUrl || "/placeholder.svg"} alt={participantName} />
          <div className={cx("statusIndicator", "active")}></div>
        </div>
        <div className={cx("participantInfo")}>
          <p className={cx("participantName")}>
            {participantName}
            {isCurrentUser && <span className={cx("currentUser")}>You</span>}
          </p>
        </div>
      </li>
    )
  }

  useEffect(() => {
    if (!socket) return

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case "error":
            setCallStatus(data.message)
            break

          case "chat-message":
            setMessages((prev) => [...prev, data])
            break
          default:
            if (data?.participants) {
              setParticipants(data.participants)
            }
            handleSocketMessage(data)
        }
      } catch (error) {
        console.error("❌ Error processing message:", error)
      }
    }
  }, [socket, handleSocketMessage])

  return (
    <div className={cx("meetingContainer")}>
      {/* Header */}
      <div className={cx("meetingHeader")}>
        <h1 className={cx("meetingTitle")}>Video Meeting</h1>
        <div className={cx("meetingInfo")}>
          <IoIosInformationCircleOutline />
          <span>Meeting Details</span>
        </div>
      </div>

      {/* Main content */}
      <div className={cx("meetingContent")}>
        {/* Video container */}
        <div className={cx("videoContainer", { withSidebar: showSidebar })}>
          <div ref={remoteVideoRef} className={cx("remoteVideos")} />
          <div className={cx("localVideoWrapper")}>
            <video ref={localVideoRef} autoPlay playsInline muted className={cx("localVideo")} />
            <div className={cx("localVideoOverlay")}>
              <span className={cx("userName")}>{user?.name || "You"}</span>
              {isMuted && <FaMicrophoneSlash className={cx("statusIcon", "muted")} />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className={cx("sidebar")}>
            <div className={cx("sidebarHeader")}>
              <div className={cx("tabButtons")}>
                <button
                  onClick={() => setActiveTab("people")}
                  className={cx("tabButton", { active: activeTab === "people" })}
                >
                  People ({participants.length})
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cx("tabButton", { active: activeTab === "chat" })}
                >
                  Chat
                </button>
              </div>
              <button className={cx("closeSidebarButton")} onClick={() => setShowSidebar(false)}>
                <IoClose />
              </button>
            </div>

            <div className={cx("sidebarContent")}>
              {/* People list */}
              {activeTab === "people" && (
                <div className={cx("participantsList")}>
                  <h3 className={cx("sectionTitle")}>In this meeting</h3>
                  <ul>{participants.map(renderParticipant)}</ul>
                </div>
              )}

              {/* Chat */}
              {activeTab === "chat" && (
                <div className={cx("chatContainer")}>
                  <div className={cx("messagesContainer")}>
                    {messages.length === 0 ? (
                      <div className={cx("emptyMessages")}>
                        <p>No messages yet</p>
                        <span>Be the first to send a message!</span>
                      </div>
                    ) : (
                      <ul className={cx("messagesList")}>
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </ul>
                    )}
                  </div>
                  <div className={cx("messageInput")}>
                    <input
                      ref={messageInputRef}
                      type="text"
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button className={cx("sendButton")} onClick={handleSendMessage}>
                      <IoIosSend />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={cx("meetingControls")}>
        <div className={cx("controlsGroup")}>
          <button
            onClick={toggleMicrophone}
            className={cx("controlButton", { disabled: isMuted })}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            onClick={toggleCamera}
            className={cx("controlButton", { disabled: !isVideoEnabled })}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button onClick={shareScreen} className={cx("controlButton")} title="Share screen">
            <TbScreenShare />
          </button>
          <button
            onClick={() => setShowBgPanel(!showBgPanel)}
            className={cx("controlButton", { active: isBgEnabled })}
            title="Virtual Background"
          >
            <MdWallpaper />
          </button>
          <Link to="/waiting-room" className={cx("endCallButton")} title="End call">
            <FaPhoneSlash />
          </Link>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={cx("controlButton", { active: showSidebar })}
            title={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            <FiMessageCircle />
          </button>
        </div>
      </div>

      {/* Status messages */}
      {(webSocketError || callStatus) && (
        <div className={cx("statusOverlay")}>
          <div className={cx("statusMessage")}>{webSocketError || callStatus}</div>
        </div>
      )}

      {/* Virtual Background Panel */}
      <VirtualBackground
        isOpen={showBgPanel}
        onClose={() => setShowBgPanel(false)}
        backgroundType={backgroundType}
        backgroundImage={backgroundImage}
        isLoading={isBgLoading}
        onSelectNone={() => {
          removeBackground();
          if (isBgEnabled) handleToggleBg();
        }}
        onSelectBlur={async () => {
          setBlurBackground();
          await handleEnableBg();
        }}
        onSelectImage={async (url) => {
          setImageBackground(url);
          await handleEnableBg();
        }}
      />
    </div>
  )
}

export default Meeting

