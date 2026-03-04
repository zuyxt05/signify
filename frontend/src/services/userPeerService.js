// src/services/userPeerService.js
import { useState, useRef, useEffect } from "react";

const ICE_SERVERS = {
    iceServers: [
        {
          urls: [
            'stun:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp'
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
};

const usePeerService = (
    localVideoRef, 
    remoteVideoRef, 
    sendMessage, 
    username,
    setCallStatus
) => {
    const [localStream, setLocalStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    
    // Refs for managing connections
    const peerConnections = useRef(new Map());
    const pendingCandidates = useRef(new Map());

    // Media handling
    const getMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true, 
                audio: true
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error("❌ Lỗi lấy video từ camera:", error);
            setCallStatus("Không thể truy cập camera");
            throw error;
        }
    };

    // Khởi tạo kết nối với một người tham gia mới
    const initializeConnection = async (targetUsername, initiator = false) => {
        try {
            console.log(`🔄 Khởi tạo kết nối với ${targetUsername}`);
            const pc = new RTCPeerConnection(ICE_SERVERS);
            
            // Xử lý ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("📤 Gửi ICE candidate");
                    sendMessage({
                        type: "ice-candidate",
                        candidate: event.candidate,
                        target: targetUsername
                    });
                } else {
                    console.log("khong co candidate");
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log(`ICE state với ${targetUsername}:`, pc.iceConnectionState);
                switch (pc.iceConnectionState) {
                    case "connected":
                        setCallStatus("Đã kết nối");
                        setIsConnected(true);
                        break;
                    case "disconnected":
                        setCallStatus("Mất kết nối");
                        break;
                    case "failed":
                        setCallStatus("Kết nối thất bại");
                        break;
                    default:
                        setCallStatus(pc.iceConnectionState);
                        break;
                }
            };

            // Xử lý remote stream
            pc.ontrack = (event) => {
                const videoGrid = remoteVideoRef.current;
                let container = document.getElementById(`container-${targetUsername}`);
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'video-container';
                    container.id = `container-${targetUsername}`;

                    const videoElement = document.createElement('video');
                    videoElement.id = `video-${targetUsername}`;
                    videoElement.autoplay = true;
                    videoElement.playsInline = true;
                    videoElement.srcObject = event.streams[0];

                    container.appendChild(videoElement);
                    videoGrid.appendChild(container);
                } else {
                    const videoElement = container.querySelector('video');
                    if (videoElement) {
                        videoElement.srcObject = event.streams[0];
                    }
                }
            };

            // Thêm local tracks
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                });
            }

            peerConnections.current.set(targetUsername, pc);

            // Nếu là người khởi tạo, tạo và gửi offer
            if (initiator) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log(`📤 Gửi offer tới ${targetUsername}`);
                sendMessage({
                    type: "offer",
                    offer,
                    target: targetUsername
                });
            }

            return pc;
        } catch (error) {
            console.error("❌ Lỗi khởi tạo kết nối:", error);
            throw error;
        }
    };

    // Xử lý tin nhắn WebSocket
    const handleSocketMessage = async (data) => {
        try {
            switch (data.type) {
                case "user-joined":
                    console.log(`👋 ${data.username} đã tham gia`);
                    if (data.username !== username) {
                        await initializeConnection(data.username, true);
                    }
                    break;

                case "user-left":
                    console.log(`👋 ${data.username} đã rời đi`);
                    handleParticipantLeave(data.username);
                    break;

                case "offer":
                    console.log(`📥 Nhận offer từ ${data.from}`);
                    const pc = await initializeConnection(data.from, false);
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    
                    console.log(`📤 Gửi answer tới ${data.from}`);
                    sendMessage({
                        type: "answer",
                        answer,
                        target: data.from
                    });
                    break;

                case "answer":
                    console.log(`📥 Nhận answer từ ${data.from}`);
                    const answerPc = peerConnections.current.get(data.from);
                    if (answerPc) {
                        await answerPc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        
                        // Xử lý các candidate đang chờ
                        const candidates = pendingCandidates.current.get(data.from) || [];
                        for (const candidate of candidates) {
                            await answerPc.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                        pendingCandidates.current.delete(data.from);
                    }
                    break;

                case "ice-candidate":
                    const candidatePc = peerConnections.current.get(data.from);
                    if (candidatePc) {
                        if (candidatePc.remoteDescription && candidatePc.remoteDescription.type) {
                            await candidatePc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } else {
                            if (!pendingCandidates.current.has(data.from)) {
                                pendingCandidates.current.set(data.from, []);
                            }
                            pendingCandidates.current.get(data.from).push(data.candidate);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error("❌ Lỗi xử lý tin nhắn:", error);
            setCallStatus("Lỗi kết nối");
        }
    };

    // Xử lý khi người tham gia rời đi
    const handleParticipantLeave = (participantId) => {
        const pc = peerConnections.current.get(participantId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(participantId);
        }

        const container = document.getElementById(`container-${participantId}`);
        if (container) {
            container.remove();
        }

        pendingCandidates.current.delete(participantId);
    };

    // Kết thúc tất cả cuộc gọi
    const endCall = () => {
        try {
            for (const [participantId, pc] of peerConnections.current.entries()) {
                pc.close();
                const container = document.getElementById(`container-${participantId}`);
                if (container) {
                    container.remove();
                }
            }
            peerConnections.current.clear();
            pendingCandidates.current.clear();

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream.getTracks().forEach(track => localStream.removeTrack(track));
                setLocalStream(null);
            }

            setIsConnected(false);
            setCallStatus("Đã kết thúc cuộc gọi");
        } catch (error) {
            console.error("❌ Lỗi kết thúc cuộc gọi:", error);
            setCallStatus("Lỗi khi kết thúc cuộc gọi");
        }
    };

    // Media control functions
    const toggleCamera = async () => {
        if (!localStream) {
            await getMedia();
            setIsVideoEnabled(true);
            return;
        }

        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
        }
    };

    const toggleMicrophone = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const shareScreen = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: true 
            });
            
            const screenTrack = screenStream.getVideoTracks()[0];

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            // Thay thế video track trong tất cả peer connections
            for (const pc of peerConnections.current.values()) {
                const sender = pc.getSenders().find(s => s.track?.kind === "video");
                if (sender) {
                    await sender.replaceTrack(screenTrack);
                }
            }

            screenTrack.onended = () => {
                revertToCamera();
            };
        } catch (error) {
            console.error("❌ Lỗi chia sẻ màn hình:", error);
            setCallStatus("Không thể chia sẻ màn hình");
        }
    };

    const revertToCamera = async () => {
        try {
            const cameraStream = await getMedia();
            const cameraTrack = cameraStream.getVideoTracks()[0];

            for (const pc of peerConnections.current.values()) {
                const sender = pc.getSenders().find(s => s.track?.kind === "video");
                if (sender) {
                    await sender.replaceTrack(cameraTrack);
                }
            }
        } catch (error) {
            console.error("❌ Lỗi chuyển về camera:", error);
        }
    };


    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            endCall();
        };
    }, []);

    // Khởi tạo media khi component mount
    useEffect(() => {
        if (!localStream) {
            getMedia().catch(console.error);
        }
    }, []);
    

    return {
        localStream,
        isConnected,
        isMuted,
        isVideoEnabled,
        toggleCamera,
        toggleMicrophone,
        shareScreen,
        endCall,
        handleSocketMessage
    };
};

export default usePeerService;
