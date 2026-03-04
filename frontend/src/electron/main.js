const { app, BrowserWindow, ipcMain } = require('electron');
let store; // Định nghĩa biến store ở phạm vi toàn cục

import('electron-store').then((module) => {
  const Store = module.default;
  store = new Store(); // Gán store để có thể sử dụng sau này

  store.set('key', 'value');
  console.log(store.get('key')); 
}).catch(err => {
  console.error('Lỗi khi import electron-store:', err);
});

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 880,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload.js' 
        }
    });
    mainWindow.loadURL('http://localhost:3000');
});

// Nhận token từ frontend và lưu vào Electron Store
ipcMain.on('save-auth-token', (event, token) => {
    if (store) {
        store.set('authToken', token);
    } else {
        console.error("Lỗi: store chưa được khởi tạo.");
    }
});

// Gửi token cho frontend khi khởi động app
ipcMain.handle('get-auth-token', () => {
    return store ? store.get('authToken') : null;
});


ipcMain.on('logout', (event) => {
    store.delete('authToken');
});

