import http from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket.js";
import { initDB,syncDB } from "./database/index.js";
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
    try {
        console.log("🔄 Initializing database...");
        await initDB();
        await syncDB();
        console.log("✅ Database initialized successfully.");
        const server = http.createServer(app);

        server.listen(PORT, HOST, () => {
            console.log(`Server running on port ${PORT}`);
        });

        initWebSocket(server);
        
        server.on("error", (error) => {
            console.error("Server error:", error); 
            process.exit(1); 
        });

    } catch (error) {
        console.error("Fatal error during startup:", error);
        process.exit(1);
    }
};

startServer();