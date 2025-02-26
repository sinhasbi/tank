import Phaser from "phaser";
import Game from "../scenes/Game";
import SocketService from "../services/SocketService";

export default class Tank extends Phaser.Physics.Matter.Image {
  private bullet?: Phaser.Physics.Matter.Image;

  private launchAngle: number = 45;
  private angleChangeTimeout: any = null;
  private angleText?: Phaser.GameObjects.Text;

  private power: number = 0;
  private powerText?: Phaser.GameObjects.Text;

  private readonly maxPower: number = 100;
  private readonly speed = 2;

  private graphics?: Phaser.GameObjects.Graphics;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    config?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, undefined, config);

    world.scene.add.existing(this);

    // 添加力度和角度的文字顯示
    this.powerText = world.scene.add.text(10, 10, "", { color: "#ffffff" });
    this.angleText = world.scene.add.text(10, 30, "", { color: "#ffffff" });

    // 繪製準心
    this.graphics = world.scene.add.graphics();
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (cursors.left?.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right?.isDown) {
      this.setVelocityX(this.speed);
    }

    if (cursors.up?.isDown && this.angleChangeTimeout === null) {
      this.angleChangeTimeout = setTimeout(() => {
        this.launchAngle = Math.min(180, this.launchAngle + 1);
        this.angleChangeTimeout = null;
      }, 50);
    } else if (cursors.down?.isDown && this.angleChangeTimeout === null) {
      this.angleChangeTimeout = setTimeout(() => {
        this.launchAngle = Math.max(0, this.launchAngle - 1);
        this.angleChangeTimeout = null;
      }, 50);
    }

    // 調整角度
    if (cursors.space?.isDown) {
      this.power = Math.min(this.maxPower, this.power + 2);
    } else if (cursors.space?.isUp && this.power > 0) {
      this.fireBullet();
      this.power = 0;
    }

    // 更新顯示文字
    this.updateText();

    // 繪製準心
    this.drawCrosshair();
  }

  private fireBullet() {
    const angle = Phaser.Math.DegToRad(this.launchAngle);
    const velocity = {
      x: Math.cos(angle) * this.power * 0.2,
      y: -Math.sin(angle) * this.power * 0.2,
    };

    const position = {
      x: this.x + 20,
      y: this.y - 20,
    };

    // 發送子彈事件到服務器
    const socketService = SocketService.getInstance();
    socketService.fireBullet({
      position: position,
      velocity: velocity,
    });

    // 使用場景的 createBullet 方法
    (this.scene as Game).createBullet(position, velocity);
  }

  private updateText() {
    if (this.powerText && this.angleText) {
      this.powerText.setText(`力度: ${this.power}`);
      this.angleText.setText(`角度: ${this.launchAngle}°`);
    }
  }

  private drawCrosshair() {
    if (this.graphics) {
      this.graphics.clear(); // 清除之前的繪製
      const angle = Phaser.Math.DegToRad(this.launchAngle);
      const crosshairLength = 50; // 準心的長度

      // 計算準心的端點
      const x1 = this.x + Math.cos(angle) * crosshairLength;
      const y1 = this.y - Math.sin(angle) * crosshairLength;

      // 繪製準心
      this.graphics.lineStyle(2, 0xff0000, 1); // 設定線條樣式
      this.graphics.lineBetween(this.x, this.y, x1, y1); // 繪製準心的線

      this.graphics.fillStyle(0xff0000, 1);
      this.graphics.fillCircle(x1, y1, 5);
    }
  }
}
