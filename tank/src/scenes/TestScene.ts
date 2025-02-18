import Phaser from "phaser";

export default class TestScene extends Phaser.Scene {
  constructor() {
    super("TestScene");
  }
  
  preload() {
    // 請確保圖片路徑正確
    this.load.image("tank", "/assets/tank.png");
  }
  
  create() {
    // 呈現圖片
    this.add.image(400, 300, "tank").setScale(0.5);
  }
}