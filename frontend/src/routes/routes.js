import Home from '../pages/Home/Home.js';
import Meeting from '../pages/Meeting/Meeting.js';
import SignUp from '../pages/SignUp/SignUp.js';
import LogIn from '../pages/LogIn/LogIn.js';
import WaitingRoom from '../pages/WaitingRoom/WaitingRoom.js';
import DashBoard from '../pages/DashBoard/DashBoard.js';
import HistoryMesting from '../pages/HistoryMeeting/HistoryMeeting.js';
import Schedule from '../pages/Schedule/Schedule.js';
import NewMeeting from '../pages/NewMeeting/NewMeeting.js';
import Profile from '../pages/Profile/Profile.js';

export const publicRoutes = [
    { path: '/', component: Home },
    { path: '/signup', component: SignUp },
    { path: '/login', component: LogIn },
];

export const privateRoutes = [
    { path: '/meeting', component: Meeting },
    { path: '/waiting-room', component: WaitingRoom },
    { path: '/dashboard', component: DashBoard },
    { path: '/history-meeting', component: HistoryMesting },
    { path: '/schedule', component: Schedule },
    { path: '/new-meeting', component: NewMeeting },
    { path: '/profile', component: Profile },
];

