import Phaser from "phaser";
import Tanks from "../game/Tanks";

export default class Tank extends Phaser.Scene {
  private ground!: MatterJS.Body;
  private tank!: Phaser.Physics.Matter.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("Tank");
  }

  init() {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  create() {
    this.ground = this.matter.add.image(400, 600, "ground", undefined, {
      isStatic: true,
    });

    this.tank = new Tanks(this.matter.world, 400, 300, "tank");
  }

  update() {
    this.tank.update(this.cursors);

    if (this.ground) {
      // 這裡可以進行一些操作，例如檢查位置或狀態
      // 例如：console.log(this.ground.position);
    }
  }
}
