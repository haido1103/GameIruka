import Phaser from "phaser"

import enableDevTools from "../dev/DevTool"



export default class TraceTrangBa extends Phaser.Scene {



    constructor() {

        super("TraceTrangBa")

    }



    preload() {



        this.load.image("bg3", "src/assets/bg3_main.jpg")

        this.load.image("panel4", "src/assets/panel4_ui.png")

        this.load.image("ellipse10", "src/assets/Ellipse 10.png")

        this.load.image("ellipse11", "src/assets/Ellipse 11.png")



        this.load.image("color1", "src/assets/Ellipse 3.png")

        this.load.image("color2", "src/assets/Ellipse 4.png")

        this.load.image("color3", "src/assets/Ellipse 5.png")

        this.load.image("color4", "src/assets/Ellipse 6.png")

        this.load.image("color5", "src/assets/Ellipse 7.png")

        this.load.image("color6", "src/assets/Ellipse 8.png")

        this.load.image("color7", "src/assets/Ellipse 9.png")



        this.load.image("eraser", "src/assets/eraser.png")

        this.load.image("replay", "src/assets/replay.png")

        this.load.audio("tracecaio", "src/assets/audio/trace-caio.mp3")

        this.load.audio("success_audio", "src/assets/audio/totlam.mp3")



    }



    create() {



        const screenWidth = this.scale.width

        const screenHeight = this.scale.height



        enableDevTools(this)



        /* BACKGROUND */



        const bg = this.add.image(screenWidth / 2, screenHeight / 2, "bg3")



        const scale = Math.max(

            screenWidth / bg.width,

            screenHeight / bg.height

        )



        bg.setScale(scale)



        const bgHeight = bg.displayHeight

        const bgTop = bg.y - bgHeight / 2



        /* UI */



        const DESIGN_WIDTH = 1920

        const DESIGN_HEIGHT = 1080



        const uiScale = Math.min(

            screenWidth / DESIGN_WIDTH,

            screenHeight / DESIGN_HEIGHT

        ) * 0.69



        const ui = this.add.container(screenWidth / 2, -500)

        ui.setScale(uiScale)



        const panel = this.add.image(0, 0, "panel4")

        ui.add(panel)



        /* REPLAY */



        const replay = this.add.image(836, -680, "replay")

        replay.setInteractive()

        ui.add(replay)



        replay.on("pointerdown", () => {

            this.scene.restart()

        })



        /* CIRCLES */



        this.circle1 = this.add.image(23, -277, "ellipse10")

        this.circle2 = this.add.image(-446, -101, "ellipse11")



        ui.add(this.circle1)

        ui.add(this.circle2)



        /* DRAW LAYER */



        this.drawLayer = this.add.renderTexture(0, 0, screenWidth, screenHeight)

        this.drawLayer.setOrigin(0, 0)



        /* BRUSH */



        this.brushRadius = 14

        this.brush = this.add.circle(0, 0, this.brushRadius, 0xffffff)

        this.brush.setVisible(false)



        /* ERASER */



        this.eraserBrush = this.add.circle(0, 0, 16, 0xffffff)

        this.eraserBrush.setVisible(false)



        this.eraserCursor = this.add.image(0, 0, "eraser")

        this.eraserCursor.setScale(0.35)

        this.eraserCursor.setVisible(false)



        /* STATE */



        this.currentColor = null

        this.isErasing = false



        this.lastX = null

        this.lastY = null



        /* PAINT PROGRESS */



        this.circle1Pixels = new Set()

        this.circle2Pixels = new Set()



        this.circleThreshold = 400

        this.finished = false



        /* COLORS */

        this.colorButtons = []

        this.createColor(ui, -767, 649, "color1", 0xff5b5b)

        this.createColor(ui, -546, 649, "color2", 0xffd700)

        this.createColor(ui, -322, 649, "color3", 0x7aa37a)

        this.createColor(ui, -99, 649, "color4", 0x4a90e2)

        this.createColor(ui, 126, 649, "color5", 0xff7a00)

        this.createColor(ui, 350, 649, "color6", 0xe0668b)

        this.createColor(ui, 574, 649, "color7", 0x006400)



        /* ERASER */



        const eraser = this.add.image(786, 649, "eraser")

        eraser.setInteractive()



        eraser.on("pointerdown", () => {

            this.isErasing = true

            this.currentColor = null

            this.eraserCursor.setVisible(true)

        })



        ui.add(eraser)



        /* PANEL ANIMATION */



        this.tweens.add({

            targets: ui,

            y: screenHeight / 2,

            duration: 900,

            ease: "Bounce.easeOut",

            onComplete: () => {



                // Tự động phát âm thanh khi vào màn hình

                if (this.sound && this.cache.audio.exists("tracecaio")) {

                    this.sound.play("tracecaio")

                }



            }

        })



        /* INPUT */



        this.input.on("pointermove", this.draw, this)



    }



    /* COLOR */



    createColor(ui, x, y, key, color) {



        const c = this.add.image(x, y, key)



        c.setInteractive()



        this.colorButtons.push(c)



        c.on("pointerdown", () => {



            this.currentColor = color

            this.isErasing = false

            this.eraserCursor.setVisible(false)



            /* reset scale tất cả màu */



            this.colorButtons.forEach(btn => {

                btn.setScale(1)

            })



            /* scale màu được chọn */



            this.tweens.add({

                targets: c,

                scale: 1.25,

                duration: 150,

                ease: "Back.easeOut"

            })



        })



        ui.add(c)



    }



    /* CHECK ELLIPSE */



    insideCircle(pointer, circle) {



        const world = circle.getWorldTransformMatrix()



        const cx = world.tx

        const cy = world.ty



        const rx = circle.displayWidth / 2 - this.brushRadius

        const ry = circle.displayHeight / 2 - this.brushRadius



        const dx = pointer.x - cx

        const dy = pointer.y - cy



        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1



    }



    /* DRAW */



    draw(pointer) {



        if (this.finished) return



        if (this.isErasing) {

            this.eraserCursor.setPosition(pointer.x, pointer.y)

        }



        if (!pointer.isDown) {



            this.lastX = null

            this.lastY = null

            return



        }



        const inside1 = this.insideCircle(pointer, this.circle1)

        const inside2 = this.insideCircle(pointer, this.circle2)



        if (!inside1 && !inside2) return



        if (this.isErasing) {



            this.eraserBrush.setPosition(pointer.x, pointer.y)

            this.drawLayer.erase(this.eraserBrush)

            return



        }



        if (this.currentColor === null) return



        if (this.lastX !== null) {



            const dist = Phaser.Math.Distance.Between(

                this.lastX,

                this.lastY,

                pointer.x,

                pointer.y

            )



            const steps = Math.min(6, Math.ceil(dist / 25))



            for (let i = 0; i < steps; i++) {



                const x = Phaser.Math.Interpolation.Linear([this.lastX, pointer.x], i / steps)

                const y = Phaser.Math.Interpolation.Linear([this.lastY, pointer.y], i / steps)



                this.brush.fillColor = this.currentColor

                this.brush.setPosition(x, y)



                this.drawLayer.draw(this.brush)



                const key = Math.floor(x / 6) + "_" + Math.floor(y / 6)



                const p = { x: x, y: y }



                if (this.insideCircle(p, this.circle1)) {

                    this.circle1Pixels.add(key)

                }



                if (this.insideCircle(p, this.circle2)) {

                    this.circle2Pixels.add(key)

                }



            }



        } else {



            this.brush.fillColor = this.currentColor

            this.brush.setPosition(pointer.x, pointer.y)



            this.drawLayer.draw(this.brush)



            const key = Math.floor(pointer.x / 6) + "_" + Math.floor(pointer.y / 6)



            if (this.insideCircle(pointer, this.circle1)) {

                this.circle1Pixels.add(key)

            }



            if (this.insideCircle(pointer, this.circle2)) {

                this.circle2Pixels.add(key)

            }



        }



        this.lastX = pointer.x

        this.lastY = pointer.y



        /* COMPLETE */



        if (

            this.circle1Pixels.size > this.circleThreshold &&

            this.circle2Pixels.size > this.circleThreshold &&

            !this.finished

        ) {



            this.finished = true



            this.sound.play("success_audio")



            this.time.delayedCall(730, () => {



                this.cameras.main.fadeOut(350, 0, 0, 0)



                this.cameras.main.once("camerafadeoutcomplete", () => {

                    this.scene.start("CongratsScene", {

                        nextScene: "EndScene"

                    })

                })



            })



        }



    }



}