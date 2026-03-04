import axios from "axios";
import { getAuthToken, removeAuthToken } from "./authToken.js";

const API = axios.create({
  // baseURL: "http://localhost:4000/api",
  baseURL: process.env.REACT_APP_SERVER_URL,
  mode: "cors",
  method: "GET",
  headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
});

API.interceptors.request.use(async (config) => {
  const tokenData = await getAuthToken();
  if (tokenData) {
    try {
      const parsed = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
      const token = parsed?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("❌ Lỗi parse token:", e);
    }
  }
  return config;
});

// Response error interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid — clear token and redirect to login
        removeAuthToken();
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
          window.location.href = "/login";
        }
      }

      if (status === 429) {
        console.warn("⚠️ Rate limited:", data.error || data.message);
      }

      console.error(`API Error [${status}]:`, data.message || data.error || "Unknown error");
    } else if (error.request) {
      console.error("❌ Network Error: Server không phản hồi");
    }
    return Promise.reject(error);
  }
);

// API Người dùng
export const getUsers = () => API.get("/users");
export const createUser = (userData) => API.post("/users", userData);

// API Họp (Meetings)
export const getMeetings = () => API.get("/meetings");
export const createMeeting = (meetingData) => API.post("/meetings", meetingData);
export const updateMeeting = (id, meetingData) => API.put(`/meetings/${id}`, meetingData);
export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);
export const getMeetingByCodeMeeting = (meetingCode) => API.get(`/meetings/${meetingCode}`)
export const getMeetingByUser = (userId) => API.get(`/meetings/user/${userId}`)

// API Tin nhắn (Messages)
export const getMessagesByMeeting = (meetingId) => API.get(`/messages/meeting/${meetingId}`);
export const sendMessage = (messageData) => API.post("/messages", messageData);

// API Xác thực (Auth)
export const signup = (userData) => API.post("/auth/signup", userData);
export const login = (credentials) => API.post("/auth/login", credentials);
export const logout = () => API.post("/auth/logout");

export default API;
