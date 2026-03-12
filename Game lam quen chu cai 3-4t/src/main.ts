import Phaser from "phaser"
import { game } from "@iruka-edu/mini-game-sdk"
import { installIrukaE2E } from "./e2e/installIrukaE2E"

import IntroScene from "./scenes/IntroScene"
import CongratsScene from "./scenes/CongratsScene"
import TraceBallScene from "./scenes/TraceBallScene"
import TrangBaScene from "./scenes/TrangBaScene"
import TraceTrangBa from "./scenes/TraceTrangBa"
import EndScene from "./scenes/EndScene"

/* ================= PHASER GAME ================= */

const config: Phaser.Types.Core.GameConfig = {

  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    IntroScene,
    CongratsScene,
    TraceBallScene,
    TrangBaScene,
    TraceTrangBa,
    EndScene
    
  ]

}

const gamePhaser = new Phaser.Game(config)

/* ================= HUB HELPERS ================= */

function applyResize(width: number, height: number) {

  const gameDiv = document.getElementById("game-container")

  if (gameDiv) {
    gameDiv.style.width = `${width}px`
    gameDiv.style.height = `${height}px`
  }

  gamePhaser.scale.resize(width, height)

}

function broadcastSetState(payload: any) {

  const scene = gamePhaser.scene.getScenes(true)[0] as any

  scene?.applyHubState?.(payload)

}

function getHubOrigin(): string {

  const qs = new URLSearchParams(window.location.search)

  const o = qs.get("hubOrigin")

  if (o) return o

  try {

    const ref = document.referrer

    if (ref) return new URL(ref).origin

  } catch {}

  return "*"

}

/* ================= SDK ================= */

export const sdk = game.createGameSdk({

  hubOrigin: getHubOrigin(),

  onInit() {

    sdk.ready({

      capabilities: [
        "resize",
        "score",
        "complete",
        "save_load",
        "set_state",
        "stats",
        "hint",
        "trace"
      ]

    })

  },

  onStart() {

    gamePhaser.scene.resume("IntroScene")

  },

  onPause() {

    gamePhaser.scene.pause("IntroScene")

  },

  onResume() {

    gamePhaser.scene.resume("IntroScene")

  },

  onResize(size) {

    applyResize(size.width, size.height)

  },

  onSetState(state) {

    broadcastSetState(state)

  },

  onQuit() {

    game.finalizeAttempt("quit")

    sdk.complete({

      timeMs:
        Date.now() -
        ((window as any).irukaGameState?.startTime ?? Date.now()),

      extras: {
        reason: "hub_quit",
        stats: game.prepareSubmitData()
      }

    })

  }

})

/* ================= E2E TEST ================= */

installIrukaE2E(sdk)