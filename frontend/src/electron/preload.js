const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveAuthToken: (token) => ipcRenderer.send("save-auth-token", token),
    getAuthToken: () => ipcRenderer.invoke("get-auth-token"),
    logOut: () => ipcRenderer.send('logout'),
});

