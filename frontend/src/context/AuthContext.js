import { createContext, useContext, useState, useEffect } from "react";
import { saveAuthToken, getAuthToken, removeAuthToken } from "../utils/authToken.js";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            try {
                const userData = JSON.parse(token);
                setUser(userData);
            } catch (error) {
                console.error("Invalid token:", error);
                removeAuthToken();
                setUser(null);
            }
        }
    }, []);

    const login = (userData) => {
        saveAuthToken(JSON.stringify(userData));
        setUser(userData); 
    };

    const logout = () => {
        removeAuthToken();
        setUser(null); 

    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
