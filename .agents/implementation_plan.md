# 📋 Signify - Kế Hoạch Phát Triển

> **Ngày tạo**: 2026-03-03
> **Trạng thái hiện tại**: MVP — Cần fix bugs, hoàn thiện tính năng, chuẩn bị production

---

## Phase 1: ✅ Sửa Bugs & Vấn Đề Nghiêm Trọng — HOÀN THÀNH
> Mục tiêu: Đảm bảo ứng dụng hoạt động ổn định, không lỗi logic

### 1.1 Fix typo `"onging"` → `"ongoing"` trong WebSocket
- **File**: `backend/src/websocket.js` (dòng 84)
- **Vấn đề**: `meetingRecord?.status !== "onging"` → điều kiện luôn true
- **Fix**: Đổi thành `"ongoing"`
- **Độ khó**: ⭐

### 1.2 Fix logic kiểm tra meeting trống
- **File**: `backend/src/websocket.js` (dòng 45)
- **Vấn đề**: `meeting[username] == []` luôn trả về `false`
- **Fix**: Đổi thành `meeting.size === 0` (vì meeting là Map)
- **Độ khó**: ⭐

### 1.3 Xóa thư mục trùng `HistoryMesting`
- **File**: `frontend/src/pages/HistoryMesting/` (thư mục typo)
- **Vấn đề**: Trùng lặp với `HistoryMeeting/`
- **Fix**: Xóa thư mục `HistoryMesting`
- **Độ khó**: ⭐

### 1.4 Fix `syncDB` luôn dùng `alter: true`
- **File**: `backend/src/database/index.js` (dòng 30-36)
- **Vấn đề**: `syncDB()` luôn chạy `alter: true` kể cả production → nguy hiểm
- **Fix**: Chỉ cho phép alter trong development, production dùng migration
- **Độ khó**: ⭐⭐

### 1.5 Fix trùng lặp Token Management
- **Files**: `frontend/src/auth.js`, `frontend/src/token.js`, `frontend/src/utils/authToken.js`
- **Vấn đề**: 3 file cùng chức năng, `auth.js` dùng Electron API, `token.js` và `authToken.js` dùng cookie
- **Fix**: Hợp nhất thành 1 file `utils/authToken.js` với logic tự detect Electron vs Browser
- **Độ khó**: ⭐⭐

### 1.6 Fix Redis cache key collision
- **File**: `backend/src/services/meetingService.js`
- **Vấn đề**: `meeting:${userId}`, `meeting:${meetingCode}`, `meeting:${id}` dùng chung prefix
- **Fix**: Dùng prefix rõ ràng: `meeting:id:`, `meeting:code:`, `meeting:user:`
- **Độ khó**: ⭐⭐

### 1.7 Loại bỏ dependencies không cần thiết ở frontend
- **File**: `frontend/package.json`
- **Vấn đề**: `express`, `pg`, `pg-hstore`, `sequelize`, `cors`, `dotenv`, `ws` không cần trong frontend
- **Fix**: Xóa các package server-side khỏi frontend
- **Độ khó**: ⭐

---

## Phase 2: ✅ Bảo Mật & Validation — HOÀN THÀNH
> Mục tiêu: Bảo vệ ứng dụng khỏi các lỗ hổng bảo mật cơ bản

### 2.1 Thêm Authentication cho User Routes
- **File**: `backend/src/routes/userRoutes.js`
- **Vấn đề**: `/api/users` không có middleware authenticate → ai cũng truy cập được
- **Fix**: Thêm `authenticate` middleware cho GET routes, giữ POST nếu cần public
- **Độ khó**: ⭐

### 2.2 Thêm Authentication cho WebSocket
- **File**: `backend/src/websocket.js`
- **Vấn đề**: Ai cũng có thể kết nối WebSocket và join room
- **Fix**: Yêu cầu gửi JWT token khi kết nối, verify trước khi cho join
- **Độ khó**: ⭐⭐⭐

### 2.3 Input Validation cho API
- **Files**: Tất cả controllers
- **Vấn đề**: Không có validation đầu vào (email format, password strength, etc.)
- **Fix**: Thêm validation middleware (có thể dùng `express-validator` hoặc `joi`)
- **Độ khó**: ⭐⭐⭐

### 2.4 Rate Limiting
- **File**: `backend/src/app.js`
- **Vấn đề**: Không có rate limit → dễ bị brute force/DDoS
- **Fix**: Thêm `express-rate-limit` middleware
- **Độ khó**: ⭐⭐

### 2.5 CORS Configuration linh hoạt
- **File**: `backend/src/app.js`
- **Vấn đề**: CORS chỉ cho 1 origin hardcode từ ngrok
- **Fix**: Hỗ trợ nhiều origin qua env variable (comma-separated) hoặc whitelist
- **Độ khó**: ⭐⭐

### 2.6 Ẩn thông tin nhạy cảm
- **Files**: `.env` files, `.gitignore`
- **Vấn đề**: `.env` chứa password, JWT secret có thể bị commit
- **Fix**: Đảm bảo `.gitignore` có `.env`, thêm `.env.example` với placeholder
- **Độ khó**: ⭐

---

## Phase 3: ✅ Hoàn Thiện Tính Năng — HOÀN THÀNH
> Mục tiêu: Đưa các tính năng từ mock data sang hoạt động thực tế

### 3.1 Dashboard hiển thị data thực
- **File**: `frontend/src/pages/DashBoard/DashBoard.js`
- **Hiện trạng**: Meetings hardcoded "Hoc Tap Truc Tuyen"
- **Fix**: Fetch meetings hôm nay từ API `getMeetingByUser` và hiển thị
- **Độ khó**: ⭐⭐

### 3.2 History Meeting từ API
- **File**: `frontend/src/pages/HistoryMeeting/HistoryMeeting.js`
- **Hiện trạng**: 100% mock data (4 meetings hardcoded)
- **Fix**: Fetch lịch sử meetings từ API, hiển thị messages thực từ `/api/messages/meeting/:id`
- **Cần thêm**: API endpoint lấy meetings đã kết thúc (status = "ended")
- **Độ khó**: ⭐⭐⭐

### 3.3 Thêm Update & Delete Meeting API
- **Backend files**:
  - `backend/src/services/meetingService.js` — thêm `updateMeeting`, `deleteMeeting`
  - `backend/src/controllers/meetingController.js` — thêm controller functions
  - `backend/src/routes/meetingRoutes.js` — thêm PUT, DELETE routes
- **Hiện trạng**: Frontend gọi `updateMeeting()`, `deleteMeeting()` nhưng backend chưa có
- **Độ khó**: ⭐⭐

### 3.4 Schedule page — Form tạo meeting thực sự hoạt động
- **File**: `frontend/src/pages/Schedule/Schedule.js`
- **Hiện trạng**: Form "New Meeting" trong modal chỉ đóng modal, không gọi API
- **Fix**: Gọi `apiCreateMeeting()` khi submit, refresh danh sách meetings
- **Độ khó**: ⭐⭐

### 3.5 Error Handling Global
- **Backend**: Uncomment và hoàn thiện `errorMiddleware.js`
- **Frontend**: Thêm Error Boundary component, toast notifications cho errors
- **Fix**: Thêm `react-toastify` hoặc dùng `antd` message/notification
- **Độ khó**: ⭐⭐⭐

### 3.6 Loading States
- **Tất cả pages**
- **Hiện trạng**: Không có loading indicator khi fetch data
- **Fix**: Thêm skeleton/spinner loading state cho mỗi page
- **Độ khó**: ⭐⭐

### 3.7 Logout functionality
- **Frontend**: Thêm nút Logout trên Header/Layout
- **Backend**: Thêm endpoint `/api/auth/logout` để blacklist token trong Redis
- **Độ khó**: ⭐⭐

---

## Phase 4: 🔵 Nâng Cấp UI/UX (Ưu tiên TRUNG BÌNH)
> Mục tiêu: Cải thiện trải nghiệm người dùng

### 4.1 Responsive Design
- **Tất cả SCSS files**
- **Hiện trạng**: Chưa có media queries, UI chỉ tốt trên desktop
- **Fix**: Thêm responsive breakpoints (mobile, tablet, desktop)
- **Độ khó**: ⭐⭐⭐

### 4.2 Cải thiện Video Grid Layout
- **File**: `frontend/src/pages/Meeting/Meeting.js` & `frontend/src/components/VideoGrid/`
- **Hiện trạng**: Remote videos được tạo bằng DOM manipulation trực tiếp
- **Fix**: Refactor thành React component với grid layout tự động điều chỉnh theo số người
- **Độ khó**: ⭐⭐⭐⭐

### 4.3 Dark/Light Theme Toggle
- **Files**: CSS variables, Layout component
- **Fix**: Thêm theme toggle với CSS custom properties
- **Độ khó**: ⭐⭐⭐

### 4.4 Notification System
- **Frontend**: Toast notifications cho events (user joined, new message, etc.)
- **Độ khó**: ⭐⭐

### 4.5 Profile Page
- **Cần tạo mới**: Trang profile để xem/sửa thông tin cá nhân, đổi avatar
- **Backend**: Thêm API update user profile, upload avatar
- **Độ khó**: ⭐⭐⭐

### 4.6 Home page cải thiện
- **File**: `frontend/src/pages/Home/Home.js`
- **Hiện trạng**: Quá đơn giản (logo + 2 button)
- **Fix**: Thêm hero section, feature highlights, testimonials
- **Độ khó**: ⭐⭐⭐

---

## Phase 5: 🟣 Tính Năng Nâng Cao (Ưu tiên THẤP - Tương Lai)
> Mục tiêu: Nâng cấp sản phẩm lên mức chuyên nghiệp

### 5.1 AI Meeting Summary thực sự
- **Tích hợp**: OpenAI/Gemini API
- **Flow**: Sau khi meeting kết thúc → lấy tất cả messages → gửi đến AI → lưu summary
- **Cần thêm**: `aiSummary` field trong Meeting model
- **Độ khó**: ⭐⭐⭐⭐

### 5.2 Meeting Recording
- **Tích hợp**: MediaRecorder API
- **Flow**: Record local stream + remote streams → upload lên storage
- **Cần**: Cloud storage (S3/GCS) cho video files
- **Độ khó**: ⭐⭐⭐⭐⭐

### 5.3 File Sharing trong Meeting
- **Cần**: File upload API + storage
- **WebSocket**: Thêm message type `file-share`
- **Độ khó**: ⭐⭐⭐⭐

### 5.4 Email Notifications
- **Tích hợp**: Nodemailer / SendGrid
- **Use cases**: Invite tham gia meeting, nhắc nhở meeting sắp tới
- **Độ khó**: ⭐⭐⭐

### 5.5 Virtual Background
- **Tích hợp**: TensorFlow.js Body Segmentation
- **Độ khó**: ⭐⭐⭐⭐⭐

### 5.6 Breakout Rooms
- **Chia nhỏ meeting thành sub-rooms**
- **Độ khó**: ⭐⭐⭐⭐⭐

### 5.7 Testing Suite
- **Unit tests**: Jest cho backend services
- **Integration tests**: Supertest cho API endpoints
- **E2E tests**: Cypress/Playwright cho frontend flows
- **Độ khó**: ⭐⭐⭐⭐

### 5.8 CI/CD & Deployment
- **Docker**: Dockerfile cho backend + frontend
- **CI/CD**: GitHub Actions pipeline
- **Hosting**: Deploy lên VPS/Cloud (Render, Railway, Vercel)
- **Độ khó**: ⭐⭐⭐⭐

---

## 📅 Timeline Đề Xuất

| Phase | Thời gian | Số tasks |
|-------|-----------|----------|
| **Phase 1**: Fix Bugs | 1-2 ngày | 7 tasks |
| **Phase 2**: Bảo Mật | 2-3 ngày | 6 tasks |
| **Phase 3**: Hoàn Thiện | 4-5 ngày | 7 tasks |
| **Phase 4**: UI/UX | 5-7 ngày | 6 tasks |
| **Phase 5**: Nâng Cao | 2-4 tuần | 8 tasks |

---

## 🎯 Thứ Tự Thực Hiện Đề Xuất (Sprint)

### Sprint 1 (2-3 ngày): Foundation Fix
- [x] Task 1.1: Fix typo "onging"
- [x] Task 1.2: Fix logic meeting trống
- [x] Task 1.3: Xóa thư mục trùng
- [x] Task 1.5: Hợp nhất token management
- [x] Task 1.6: Fix Redis cache keys
- [x] Task 1.7: Clean frontend dependencies
- [x] Task 2.6: Ẩn thông tin nhạy cảm

### Sprint 2 (3-4 ngày): Security + Core Features
- [x] Task 1.4: Fix syncDB
- [x] Task 2.1: Auth cho User Routes
- [x] Task 2.2: Auth cho WebSocket
- [x] Task 2.3: Input Validation
- [x] Task 2.4: Rate Limiting
- [x] Task 2.5: CORS flexible
- [x] Task 2.6: Ẩn thông tin nhạy cảm
- [x] Task 3.7: Logout functionality
- [x] Task 3.3: Update/Delete Meeting API

### Sprint 3 (4-5 ngày): Feature Completion
- [x] Task 3.1: Dashboard real data
- [x] Task 3.2: History Meeting real data
- [x] Task 3.4: Schedule form hoạt động
- [x] Task 3.5: Error Handling
- [x] Task 3.6: Loading States
- [x] Task 2.3: Input Validation

### Sprint 4 (5-7 ngày): Polish — HOÀN THÀNH
- [x] Task 4.1: Responsive Design (already had responsive, verified)
- [x] Task 4.2: Video Grid (already well-structured with CSS Grid)
- [x] Task 4.4: Toast Notification System
- [x] Task 4.5: Profile Page
- [x] Task 4.6: Home page redesign (premium landing page)

### Sprint 5+ (ongoing): Advanced Features
- [ ] Tasks 5.1 - 5.8 theo nhu cầu
