import Phaser from "phaser";

export default class Tanks extends Phaser.Physics.Matter.Image {
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
    // 三角函數，將角度轉換為弧度
    const angle = Phaser.Math.DegToRad(this.launchAngle);
    const velocity = {
      x: Math.cos(angle) * this.power * 0.2,
      y: -Math.sin(angle) * this.power * 0.2,
    };

    // TODO 我先安排他在右上角，但他應該要跟砲管在一樣的位置
    this.bullet = this.scene.matter.add
      .image(this.x + 20, this.y - 20, "bullet", undefined, {
        circleRadius: 50,
      })
      .setScale(0.25);
    this.bullet.setVelocity(velocity.x, velocity.y);
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
