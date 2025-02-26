import Phaser from "phaser";
import Tank from "../game/Tank";
import SocketService from "../services/SocketService";

export default class Game extends Phaser.Scene {
  private ground!: MatterJS.Body;
  private tank!: Phaser.Physics.Matter.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private socketService: SocketService;
  private otherPlayers: Map<string, Tank> = new Map(); // 儲存其他玩家 Tank 物件
  private latestPlayers: any[] = []; // 儲存最新的玩家資訊
  private lastPosition = { x: 0, y: 0 }; // 記錄上一次的位置
  private bullets: Phaser.Physics.Matter.Image[] = []; // 儲存所有子彈

  constructor() {
    super("Tank");
    this.socketService = SocketService.getInstance();
  }

  init() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    // 加入遊戲房間
    this.socketService.joinGame(
      "room1",
      "Player_" + Math.floor(Math.random() * 1000)
    );

    // 監聽 server 傳來的更新玩家資訊，並存進 latestPlayers 中
    this.socketService.getSocket().on("updatePlayers", (players) => {
      // console.log("收到更新的玩家資訊:", players);
      this.latestPlayers = players;
    });

    // 添加子彈事件監聽
    this.socketService.getSocket().on("bulletEvent", (bulletData) => {
      // 確保不重複創建本地玩家發射的子彈
      if (bulletData.playerId !== this.socketService.getSocket().id) {
        this.createBullet(bulletData.position, bulletData.velocity);
      }
    });

    // 監聽玩家斷線事件
    this.socketService
      .getSocket()
      .on("playerDisconnect", (disconnectedPlayerId) => {
        console.log("玩家離線:", disconnectedPlayerId);
        this.removePlayer(disconnectedPlayerId);
      });

    // 監聽系統訊息
    this.socketService.getSocket().on("systemMessage", (message) => {
      console.log("系統訊息:", message);
    });
  }

  create() {
    this.ground = this.matter.add.image(400, 600, "ground", undefined, {
      isStatic: true,
    });
    // 初始位置先隨便設定，後續依據 server 返回資訊同步
    this.tank = new Tank(this.matter.world, 400, 300, "tank");
    // 初始化最後位置
    this.lastPosition = { x: this.tank.x, y: this.tank.y };
  }

  update() {
    // 先讓本地坦克依照鍵盤輸入移動
    this.tank.update(this.cursors);

    // 檢查位置是否有變化
    if (
      this.tank.x !== this.lastPosition.x ||
      this.tank.y !== this.lastPosition.y
    ) {
      // 位置有變化時，發送更新到 server
      this.socketService.updatePosition({
        x: this.tank.x,
        y: this.tank.y,
      });
      // 更新最後位置記錄
      this.lastPosition = { x: this.tank.x, y: this.tank.y };
    }

    if (this.ground) {
    }

    // 若有最新的玩家資訊，每一個更新循環都根據最新的資料同步所有 Tank 的位置
    if (this.latestPlayers && this.latestPlayers.length > 0) {
      this.latestPlayers.forEach((player) => {
        // 本地玩家處理：當使用者正在輸入時，先不以 server 的位置覆蓋本地移動
        if (player.id === this.socketService.getSocket().id) {
          if (
            !(
              this.cursors.left?.isDown ||
              this.cursors.right?.isDown ||
              this.cursors.up?.isDown ||
              this.cursors.down?.isDown
            )
          ) {
            // 當使用者沒有操作鍵盤時，校正位置
            this.tank.setPosition(player.position.x, player.position.y);
          }
        } else {
          // 遠端玩家
          if (!this.otherPlayers.has(player.id)) {
            // 若遠端玩家尚未建立，則根據 server 傳來的初始位置建立新 Tank
            const remoteTank = new Tank(
              this.matter.world,
              player.position.x,
              player.position.y,
              "tank"
            );
            this.otherPlayers.set(player.id, remoteTank);
          } else {
            // 更新遠端玩家位置
            const remoteTank = this.otherPlayers.get(player.id);
            remoteTank?.setPosition(player.position.x, player.position.y);
          }
        }
      });
    }

    // 更新子彈位置（如果需要額外的物理效果）
    // this.bullets.forEach(bullet => {
    //   // 可以在這裡添加額外的子彈更新邏輯
    // });
  }

  private removePlayer(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  // 新增：創建子彈的方法
  createBullet(
    position: { x: number; y: number },
    velocity: { x: number; y: number }
  ) {
    const bullet = this.matter.add
      .image(position.x, position.y, "bullet", undefined, {
        circleRadius: 50,
      })
      .setScale(0.25);

    bullet.setVelocity(velocity.x, velocity.y);

    // 將子彈加入陣列中追蹤
    this.bullets.push(bullet);

    // 設定子彈在 3 秒後消失
    // this.time.delayedCall(3000, () => {
    //   const index = this.bullets.indexOf(bullet);
    //   if (index > -1) {
    //     this.bullets.splice(index, 1);
    //     bullet.destroy();
    //   }
    // });
  }
}
