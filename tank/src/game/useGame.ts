import Phaser from "phaser";
import Game from "../scenes/Game";
import Preloader from "../scenes/Preloader";

export function useGame() {
  const config = {
    // 自動選擇渲染器
    type: Phaser.AUTO,
    parent: "game",
    width: 1200,
    height: 800,
    physics: {
      default: "matter",
      matter: {
        debug: {
          boundsColor: 0xff0000,
          lineColor: 0xff0000,
          staticLineColor: 0xff0000,
        },
        gravity: { x: 0, y: 1 },
        setBounds: {
          left: true,
          right: true,
          top: true,
          bottom: true,
        },
      },
    },
    scene: [Preloader, Game],
  };

  return new Phaser.Game(config);
}
