import { io, Socket } from "socket.io-client";

class SocketService {
  private static instance: SocketService;
  private socket: Socket;

  private constructor() {
    this.socket = io("http://192.168.1.165:3000", {
      withCredentials: true,
    });

    // 添加更多連線狀態的監聽
    this.socket.on("connect", () => {
      console.log("已連接到伺服器，Socket ID:", this.socket.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("連線錯誤:", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`重連成功! 重試次數: ${attemptNumber}`);
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`嘗試重連... 第 ${attemptNumber} 次`);
    });

    this.socket.on("disconnect", () => {
      console.log("與伺服器連線中斷");
    });

    // 添加系統訊息監聽
    this.socket.on("systemMessage", (message: string) => {
      console.log("系統訊息:", message);
    });

    // 添加玩家更新監聽
    this.socket.on("updatePlayers", (_players: any[]) => {
      // console.log("玩家更新:", players);
    });

    // 添加玩家離開監聽
    this.socket.on("playerDisconnect", (playerId: string) => {
      console.log("玩家離開:", playerId);
    });

    // 錯誤處理
    this.socket.on("error", (error: string) => {
      console.error("Socket 錯誤:", error);
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): Socket {
    return this.socket;
  }

  public joinGame(roomId: string, playerName: string): void {
    console.log(`嘗試加入房間 ${roomId}，玩家名稱: ${playerName}`);
    this.socket.emit("joinGame", { roomId, playerName });
  }

  // 新增：發送位置更新到 server
  public updatePosition(position: { x: number; y: number }) {
    this.socket.emit("updatePosition", position);
  }

  // 新增：發送子彈發射事件
  public fireBullet(bulletData: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    angle: number;
  }) {
    this.socket.emit("fireBullet", bulletData);
  }
}

export default SocketService;
