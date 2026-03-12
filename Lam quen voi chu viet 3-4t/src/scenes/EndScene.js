import Phaser from "phaser";

export default class EndScene extends Phaser.Scene {

    constructor() {
        super("EndScene")
    }

    preload() {

        this.load.image("bg3", "/assets/bg3_main.jpg")
        this.load.image("banner_congrat", "/assets/banner_congrat.webp")
        this.load.image("reset", "/assets/btn_reset.webp")
        this.load.image("exit", "/assets/btn_exit.webp")

        this.load.audio("vic_sound", "/assets/audio/vic_sound.mp3")
        this.load.audio("fireworks", "/assets/audio/fireworks.mp3")

    }

    create() {

        const w = this.scale.width
        const h = this.scale.height

        /* BACKGROUND */

        const bg = this.add.image(w / 2, h / 2, "bg3")

        const scale = Math.max(
            w / bg.width,
            h / bg.height
        )

        bg.setScale(scale)

        /* SOUND */

        this.time.delayedCall(500, () => {
            this.sound.play("vic_sound")
        })

        this.fireworksSound = this.sound.add("fireworks", { loop: true, volume: 0.7 })

        this.time.delayedCall(2000, () => {
            this.fireworksSound.play()
        })

        /* PANEL */

        const panel = this.add.container(0, 0)

        /* BANNER */

        const banner = this.add.image(
            w / 2,
            h / 2 - 130,
            "banner_congrat"
        ).setScale(0.8)

        /* BUTTONS */

        const resetBtn = this.add.image(
            876,
            430,
            "reset"
        )
            .setScale(0)
            .setInteractive()
        resetBtn.on("pointerdown", () => {

            this.stopSounds()

            this.cameras.main.fadeOut(300)

            this.time.delayedCall(300, () => {
                this.scene.start("IntroScene")
            })

        })

        const exitBtn = this.add.image(
            653,
            430,
            "exit"
        )
            .setScale(0)
            .setInteractive()
        exitBtn.on("pointerdown", () => {

            this.stopSounds()

            this.cameras.main.fadeOut(300)

            this.time.delayedCall(300, () => {
                this.scene.start("MenuScene")
            })

        })

        panel.add([banner, resetBtn, exitBtn])

        /* BUTTON IDLE FLOAT */

        this.tweens.add({
            targets: [resetBtn, exitBtn],
            y: "-=10",
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })

        /* PANEL DROP */

        panel.y = -500

        this.tweens.add({
            targets: panel,
            y: 0,
            duration: 900,
            ease: "Bounce.easeOut"
        })

        /* BANNER FLOAT */

        this.tweens.add({
            targets: banner,
            y: banner.y - 10,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })

        /* BUTTON POP ANIMATION */

        this.tweens.add({
            targets: resetBtn,
            scale: 0.45,
            delay: 500,
            duration: 300,
            ease: "Back.easeOut"
        })

        this.tweens.add({
            targets: exitBtn,
            scale: 0.45,
            delay: 650,
            duration: 300,
            ease: "Back.easeOut"
        })


        /* RESET BUTTON ACTION */

        resetBtn.on("pointerup", () => {

            this.stopSounds()

            this.cameras.main.fadeOut(300)

            this.time.delayedCall(300, () => {
                this.scene.start("IntroScene")
            })

        })

        /* EXIT BUTTON ACTION */

        exitBtn.on("pointerup", () => {

            this.stopSounds()

            this.cameras.main.fadeOut(300)

            this.time.delayedCall(300, () => {
                this.scene.start("MenuScene")
            })

        })

        /* CONFETTI */

        this.createConfettiEffect()

    }

    /* STOP SOUND */

    stopSounds() {

        if (this.fireworksSound) {
            this.fireworksSound.stop()
        }

        this.sound.stopByKey("vic_sound")

    }

    /* CONFETTI */

    createConfettiEffect() {

        const width = this.cameras.main.width

        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da]

        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {

                for (let i = 0; i < 3; i++) {

                    const x = Phaser.Math.Between(0, width)
                    const color = Phaser.Utils.Array.GetRandom(colors)

                    const confetti = this.add.circle(x, -20, 6, color).setDepth(999)

                    const duration = Phaser.Math.Between(3000, 5000)

                    this.tweens.add({
                        targets: confetti,
                        y: this.cameras.main.height + 20,
                        x: x + Phaser.Math.Between(-100, 100),
                        rotation: Phaser.Math.Between(2, 4),
                        duration: duration,
                        onComplete: () => confetti.destroy()
                    })

                }

            }
        })

    }

}