const socketIo = require("socket.io");

class SocketService {
  constructor(io, gameManager) {
    this.io = io;
    this.gameManager = gameManager;
    this.connectedUsers = new Map();
    this.initialize();
  }

  initialize() {
    console.log("Socket 服務初始化中...");
    // io connection : 連線後做的動作
    this.io.on("connection", (socket) => {
      console.log(`新玩家已連線: ${socket.id}`);

      // 連線的話紀錄連線時間等等
      this.connectedUsers.set(socket.id, {
        connectTime: new Date(),
        lastPing: new Date(),
      });

      // 定期輸出目前連線數
      console.log(`目前連線人數: ${this.connectedUsers.size}`);

      socket.on("joinGame", ({ roomId, playerName }) => {
        console.log(`玩家 ${playerName} (${socket.id}) 嘗試加入房間 ${roomId}`);
        this.gameManager.addPlayer(roomId, socket, playerName);
      });

      socket.on("error", (error) => {
        console.error(`Socket 錯誤 (${socket.id}):`, error);
      });

      socket.on("disconnect", (reason) => {
        console.log(`玩家斷線 ${socket.id}, 原因: ${reason}`);
        this.connectedUsers.delete(socket.id);
        this.gameManager.handleDisconnect(socket);
        console.log(`目前剩餘連線人數: ${this.connectedUsers.size}`);
      });

      // 新增：處理位置更新
      socket.on("updatePosition", (position) => {
        // 找到對應的房間和玩家
        for (const roomId in this.gameManager.rooms) {
          const room = this.gameManager.rooms[roomId];
          const player = room.players.find((p) => p.id === socket.id);

          if (player) {
            // 更新玩家位置
            player.position = position;
            // 廣播更新給房間內所有玩家
            this.io.to(roomId).emit("updatePlayers", room.players);
            break;
          }
        }
      });
    });

    // 定期輸出伺服器狀態
    setInterval(() => {
      console.log(`伺服器狀態報告:`);
      console.log(`- 連線人數: ${this.connectedUsers.size}`);
      console.log(
        `- 活躍房間數: ${Object.keys(this.gameManager.rooms).length}`
      );
    }, 10000); // 每 10 秒輸出一次
  }
}

module.exports = SocketService;
