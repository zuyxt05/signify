// Unified Auth Token Management
// Automatically detects Electron vs Browser environment

const isElectron = () => {
    return typeof window !== "undefined" && !!window.electronAPI;
};

// Save auth token
export const saveAuthToken = (token) => {
    if (isElectron()) {
        window.electronAPI.saveAuthToken(token);
    } else {
        document.cookie = `authToken=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Strict`;
    }
};

// Get auth token
export const getAuthToken = () => {
    if (isElectron()) {
        return window.electronAPI.getAuthToken();
    } else {
        try {
            const cookies = document.cookie.split("; ");
            for (let cookie of cookies) {
                let [name, ...rest] = cookie.split("=");
                if (name === "authToken") {
                    return decodeURIComponent(rest.join("="));
                }
            }
            return null;
        } catch (error) {
            console.error("❌ Lỗi khi lấy token:", error);
            return null;
        }
    }
};

// Remove auth token
export const removeAuthToken = () => {
    if (isElectron()) {
        window.electronAPI.logOut();
    } else {
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    }
};
