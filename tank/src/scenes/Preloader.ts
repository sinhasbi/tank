import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }
  preload() {
    this.load.image(
      "ground",
      "https://labs.phaser.io/assets/sprites/platform.png"
    );

    this.load.image("tank", "/assets/tank.png");
    this.load.image("bullet", "/assets/bullet.png");
  }

  create() {
    this.scene.start("Tank");
  }
}
