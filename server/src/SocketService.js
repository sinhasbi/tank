const socketIo = require("socket.io");

class SocketService {
  constructor(server, gameManager) {
    this.io = socketIo(server);
    this.gameManager = gameManager;
    this.connectedUsers = new Map(); // 追蹤已連線的用戶
    this.initialize();
    this.startHeartbeat(); // 啟動定時發送
  }

  initialize() {
    this.io.on("connection", (socket) => {
      console.log(`玩家已連線: ${socket.id}`);
      this.connectedUsers.set(socket.id, {
        connectTime: new Date(),
        lastPing: new Date(),
      });

      socket.on("joinGame", ({ roomId, playerName }) => {
        this.gameManager.addPlayer(roomId, socket, playerName);
      });

      socket.on("playerAction", ({ roomId, action }) => {
        this.gameManager.handlePlayerAction(roomId, socket, action);
      });

      socket.on("disconnect", () => {
        this.connectedUsers.delete(socket.id);
        this.gameManager.handleDisconnect(socket);
        console.log(`玩家斷線: ${socket.id}`);
      });
    });
  }

  // 新增：定時發送心跳訊息
  startHeartbeat() {
    setInterval(() => {
      const connectedCount = this.connectedUsers.size; // 取得目前連線數
      this.connectedUsers.forEach((userData, socketId) => {
        this.io.to(socketId).emit("heartbeat", {
          id: socketId,
          connectTime: userData.connectTime,
          currentTime: new Date(),
          message: `您的連線ID是 ${socketId}`,
          connectedCount: connectedCount, // 加入連線數，讓客戶端可以得知目前有多少人連線
        });
      });
      console.log(`目前連線人數: ${connectedCount}`);
    }, 5000); // 每5秒發送一次
  }
}

module.exports = SocketService;
