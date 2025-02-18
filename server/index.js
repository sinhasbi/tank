const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const GameManager = require("./src/GameManager");
const SocketService = require("./src/SocketService");

const app = express();
const server = http.createServer(app);

// 建立 Socket.IO 實例並設定 CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite 開發伺服器的位址
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 使用 Express 服務前端打包後的靜態資源
app.use(express.static(path.join(__dirname, "../tank/dist")));

// 前端路由導向 index.html（符合 SPA 設計）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../tank/dist/index.html"));
});

// 初始化遊戲管理器與 Socket 連線服務，實踐依賴反轉
const gameManager = new GameManager(io);
const socketService = new SocketService(io, gameManager);

server.listen(3000, "0.0.0.0", () => {
  console.log("伺服器運行於 http://0.0.0.0:3000");
});
