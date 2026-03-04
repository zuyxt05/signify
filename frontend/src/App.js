import { BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from "./context/AuthContext.js";
import { ToastProvider } from "./components/Toast/Toast.js";
import AppRoutes from './routes/AppRouter.js';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="App">
                        <AppRoutes />
                    </div>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;

