const socketIo = require("socket.io");

class SocketService {
  constructor(server, gameManager) {
    this.io = socketIo(server);
    this.gameManager = gameManager;
    this.connectedUsers = new Map(); // 追蹤已連線的用戶
    this.initialize();
    // this.startHeartbeat();  啟動定時發送
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
}

module.exports = SocketService;
